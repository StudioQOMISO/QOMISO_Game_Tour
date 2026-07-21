import fs from "node:fs/promises";

const CARD_FILES = [
  "data/basic_card_templates.json",
  "data/specialty_card_templates.json",
  "data/assist_card_role_templates.json",
  "data/generic_decisive_card_templates.json",
  "data/ace_signature_cards.json",
  "data/elite_assist_cards.json",
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value, digits = 3) => Number(value.toFixed(digits));

export async function loadCardPerformanceContext(baseDir = ".") {
  const rules = JSON.parse(await fs.readFile(`${baseDir}/data/card_performance_rules.json`, "utf8"));
  const payloads = await Promise.all(CARD_FILES.map(async (file) => ({
    file,
    entries: JSON.parse(await fs.readFile(`${baseDir}/${file}`, "utf8")),
  })));
  const byId = new Map();
  const byName = new Map();
  const byIdSlot = new Map();
  const byNameSlot = new Map();
  const register = (card, sourceFile) => {
    if (!card?.name) return;
    const normalized = { ...card, sourceFile };
    if (card.id) {
      byId.set(card.id, normalized);
      if (card.slot) byIdSlot.set(`${card.id}:${card.slot}`, normalized);
    }
    if (!byName.has(card.name)) byName.set(card.name, normalized);
    if (card.slot && !byNameSlot.has(`${card.name}:${card.slot}`)) byNameSlot.set(`${card.name}:${card.slot}`, normalized);
  };
  for (const { file, entries } of payloads) {
    if (file.endsWith("elite_assist_cards.json")) {
      for (const entry of entries) for (const card of entry.cards || []) register(card, file);
    } else {
      for (const entry of entries) register(entry, file);
    }
  }
  return { rules, byId, byName, byIdSlot, byNameSlot };
}

export function resolveAssignedCard(card, context, assignment) {
  const assignedSlot = Number(card.cost) === 1 ? "basic" : Number(card.cost) === 2 ? "specialty" : "decisive";
  const definition = (card.id && context.byIdSlot.get(`${card.id}:${assignedSlot}`))
    || context.byNameSlot.get(`${card.name}:${assignedSlot}`)
    || (card.id && context.byId.get(card.id))
    || context.byName.get(card.name)
    || {};
  const fallbackAbilities = context.rules.archetypeFallbackAbilities[assignment.primaryArchetype] || ["stamina", "teamwork"];
  return {
    ...definition,
    ...card,
    slot: assignedSlot,
    cost: Number(card.cost || definition.cost || 1),
    target: card.target || definition.target || (assignment.roleType === "assist" ? "味方エース" : "本人"),
    abilities: definition.abilities?.length ? definition.abilities : fallbackAbilities,
    description: definition.description || card.description || card.name,
    terrainId: definition.terrainId || null,
  };
}

function abilityFields(ability, rules) {
  return rules.abilityAliases[ability] || [ability];
}

function abilityValue(rider, abilities, rules) {
  return mean(abilities.flatMap((ability) => abilityFields(ability, rules)).map((field) => Number(rider[field] || 0)).filter((value) => value > 0));
}

function profileRelevance(abilities, profile, rules) {
  const weights = abilities.flatMap((ability) => abilityFields(ability, rules)).map((field) => profile.weights[field] || 0);
  return clamp(mean(weights) * 8.5, 0.58, 1.28);
}

function terrainMultiplier(card, profileKey, rules) {
  if (!card.terrainId) return rules.terrainMultiplier.neutral;
  if (card.terrainId === profileKey) return rules.terrainMultiplier.exact;
  if (profileKey === "tt" && card.terrainId === "flat") return rules.terrainMultiplier.ttUsesFlat;
  return rules.terrainMultiplier.mismatch;
}

function keywordBonus(card, phase, rules) {
  const rule = rules.keywordBonuses[phase.id];
  if (!rule) return 0;
  const text = `${card.name} ${card.description}`;
  return rule.keywords.some((keyword) => text.includes(keyword)) ? rule.bonus : 0;
}

export function scoreCardPlay({ rider, assignment, card, profileKey, profile, phase, context, riderLoad = 0 }) {
  const { rules } = context;
  const resolved = resolveAssignedCard(card, context, assignment);
  const rawAbility = abilityValue(rider, resolved.abilities, rules) || rider.allRoundScore || 65;
  const abilityMultiplier = clamp(0.78 + (rawAbility - 50) / 120, 0.78, 1.18);
  const assignmentMultiplier = clamp(0.9 + (Number(card.score || 70) - 70) / 300, 0.86, 1.13);
  const aptitudeMultiplier = assignment.roleType === "assist"
    ? clamp(0.82 + Number(rider.support_aptitude || 0) / 500, 0.9, 1.06)
    : clamp(0.9 + Number(rider.ace_aptitude || 0) / 1000, 0.94, 1.02);
  const loadMultiplier = clamp(1 - riderLoad * rules.loadPenaltyPerPoint, rules.minimumLoadMultiplier, 1);
  const power = rules.slotBasePower[resolved.slot]
    * abilityMultiplier
    * assignmentMultiplier
    * aptitudeMultiplier
    * terrainMultiplier(resolved, profileKey, rules)
    * profileRelevance(resolved.abilities, profile, rules)
    * (rules.targetMultiplier[resolved.target] || rules.targetMultiplier.default)
    * (rules.roleTypeMultiplier[assignment.roleType] || 1)
    * loadMultiplier
    + keywordBonus(resolved, phase, rules);
  return {
    rider: rider.name,
    riderRoleType: assignment.roleType,
    card: resolved.name,
    slot: resolved.slot,
    cost: resolved.cost,
    target: resolved.target,
    power: round(power),
    terrain: resolved.terrainId,
    abilities: resolved.abilities,
    riderLoadBefore: round(riderLoad),
    loadMultiplier: round(loadMultiplier),
  };
}

function bestQueueForPhase({ team, assignmentByName, profileKey, profile, phase, context, riderLoads }) {
  const budget = context.rules.turnBudget;
  let states = new Map([[0, { power: 0, cards: [] }]]);
  for (const rider of team.riders) {
    const assignment = assignmentByName.get(rider.name);
    if (!assignment) continue;
    const cards = [...assignment.basicCards, ...assignment.specialtyCards, assignment.decisiveCard]
      .filter(Boolean)
      .map((card) => scoreCardPlay({ rider, assignment, card, profileKey, profile, phase, context, riderLoad: riderLoads.get(rider.name) || 0 }))
      .filter((card) => phase.allowedSlots.includes(card.slot));
    const next = new Map(states);
    for (const [spent, state] of states) {
      for (const card of cards) {
        const newCost = spent + card.cost;
        if (newCost > budget) continue;
        const candidate = { power: state.power + card.power, cards: [...state.cards, card] };
        const current = next.get(newCost);
        if (!current || candidate.power > current.power) next.set(newCost, candidate);
      }
    }
    states = next;
  }
  return [...states.entries()]
    .map(([cost, state]) => ({ cost, ...state }))
    .sort((a, b) => b.power - a.power || b.cost - a.cost)[0];
}

export function evaluateTeamCardPackage({ team, assignmentByName, profileKey, profile, context }) {
  const riderLoads = new Map();
  const phases = [];
  for (const phase of context.rules.phases) {
    const queue = bestQueueForPhase({ team, assignmentByName, profileKey, profile, phase, context, riderLoads });
    phases.push({ id: phase.id, label: phase.label, weight: phase.weight, ...queue });
    for (const card of queue.cards) {
      riderLoads.set(card.rider, (riderLoads.get(card.rider) || 0) + context.rules.riderLoadBySlot[card.slot]);
    }
  }
  return {
    totalEffect: round(phases.reduce((sum, phase) => sum + phase.power * phase.weight, 0)),
    phases,
    riderLoads: Object.fromEntries([...riderLoads.entries()].map(([name, load]) => [name, round(load)])),
  };
}
