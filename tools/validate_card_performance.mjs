import fs from "node:fs/promises";

const rules = JSON.parse(await fs.readFile("data/card_performance_rules.json", "utf8"));
const systemRules = JSON.parse(await fs.readFile("data/card_system_rules.json", "utf8"));
const assignments = JSON.parse(await fs.readFile("data/rider_card_assignments.json", "utf8"));
const simulation = JSON.parse(await fs.readFile("outputs/team_simulation_20x8_40000/simulation_results.json", "utf8"));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(rules.turnBudget === systemRules.turnBudget, `turnBudget mismatch: ${rules.turnBudget}/${systemRules.turnBudget}`);
assert(rules.maxIndividualCardsPerRiderPerTurn === systemRules.maxIndividualCardsPerRiderPerTurn, "per-rider limit mismatch");
assert(assignments.length === 510, `assignment count: ${assignments.length}`);
assert(simulation.diagnostics.cardAssignments === 300, `active assignment count: ${simulation.diagnostics.cardAssignments}`);
assert(simulation.diagnostics.missingCardAssignments.length === 0, `missing assignments: ${simulation.diagnostics.missingCardAssignments.join(", ")}`);

let queues = 0;
let decisiveQueues = 0;
let decisiveCards = 0;
const slotCounts = { basic: 0, specialty: 0, decisive: 0 };
const effects = [];
const riderLoads = [];

for (const team of simulation.teams) {
  for (const [profile, cardPackage] of Object.entries(team.cardPackages)) {
    effects.push(cardPackage.totalEffect);
    riderLoads.push(...Object.values(cardPackage.riderLoads || {}));
    assert(Number.isFinite(cardPackage.totalEffect) && cardPackage.totalEffect > 0, `${team.name}/${profile}: invalid card effect`);
    assert(cardPackage.phases.length === rules.phases.length, `${team.name}/${profile}: phase count`);
    for (const phase of cardPackage.phases) {
      queues += 1;
      assert(phase.cost <= rules.turnBudget, `${team.name}/${profile}/${phase.id}: cost ${phase.cost}`);
      const riders = phase.cards.map((card) => card.rider);
      assert(new Set(riders).size === riders.length, `${team.name}/${profile}/${phase.id}: rider used twice`);
      for (const card of phase.cards) {
        const expectedCost = { basic: 1, specialty: 2, decisive: 3 }[card.slot];
        assert(card.cost === expectedCost, `${team.name}/${profile}/${phase.id}/${card.card}: ${card.slot} cost ${card.cost}/${expectedCost}`);
        assert(Number.isFinite(card.power) && card.power > 0, `${team.name}/${profile}/${phase.id}/${card.card}: invalid power`);
        assert(slotCounts[card.slot] !== undefined, `${team.name}/${profile}: unknown slot ${card.slot}`);
        if (slotCounts[card.slot] !== undefined) slotCounts[card.slot] += 1;
      }
      if (phase.id === "decisive") {
        decisiveQueues += 1;
        const count = phase.cards.filter((card) => card.slot === "decisive").length;
        decisiveCards += count;
        assert(count <= 1, `${team.name}/${profile}: multiple decisive cards`);
      }
    }
  }
}

assert(decisiveCards / decisiveQueues >= 0.7, `decisive card adoption too low: ${decisiveCards}/${decisiveQueues}`);
assert(Math.min(...effects) >= 3, `minimum package effect too low: ${Math.min(...effects)}`);
assert(Math.max(...effects) <= 25, `maximum package effect too high: ${Math.max(...effects)}`);
assert(simulation.simulation.winningCardUsage.length > 0, "winning card usage missing");
assert(riderLoads.length > 0 && Math.min(...riderLoads) > 0, "rider load tracking missing");
assert(Math.max(...riderLoads) <= 4.5, `rider load too high: ${Math.max(...riderLoads)}`);

const report = {
  valid: errors.length === 0,
  assignments: assignments.length,
  activeAssignments: simulation.diagnostics.cardAssignments,
  queues,
  decisiveQueues,
  decisiveCards,
  decisiveAdoptionPercent: Number((decisiveCards / decisiveQueues * 100).toFixed(1)),
  slotCounts,
  cardEffect: {
    min: Math.min(...effects),
    average: Number((effects.reduce((sum, value) => sum + value, 0) / effects.length).toFixed(3)),
    max: Math.max(...effects),
  },
  riderLoad: {
    min: Math.min(...riderLoads),
    average: Number((riderLoads.reduce((sum, value) => sum + value, 0) / riderLoads.length).toFixed(3)),
    max: Math.max(...riderLoads),
  },
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
