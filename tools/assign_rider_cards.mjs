import fs from "node:fs/promises";

const rosterFiles = ["選手スプレッドシート/01_現役選手300名.csv", "選手スプレッドシート/02_引退選手.csv", "選手スプレッドシート/03_区分保留.csv"];
const outputPath = "data/rider_card_assignments.json";
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const basicTemplates = await readJson("data/basic_card_templates.json");
const specialtyTemplates = await readJson("data/specialty_card_templates.json");
const roleTemplates = await readJson("data/assist_card_role_templates.json");
const decisiveTemplates = await readJson("data/generic_decisive_card_templates.json");
const signatures = await readJson("data/ace_signature_cards.json");
const eliteAssists = await readJson("data/elite_assist_cards.json");

const signatureByName = new Map(signatures.map((entry) => [entry.riderName, entry]));
const eliteAssistByName = new Map(eliteAssists.map((entry) => [entry.riderName, entry]));
const riderProfileOverrides = new Map([
  ["Mads Pedersen", { primary_archetype: "スプリンター", secondary_archetype: "パンチャー", ace_aptitude: "93", support_aptitude: "81", aptitude_tags: "最高速 / パンチ力 / 登坂力 / 耐久力", credit_salary: "10800", sprint: "84", acceleration: "82", punch: "82", cruise: "82", climb: "76", stamina: "84", resistance: "85", technique: "82", bikeControl: "82", pave: "83", recovery: "76", dailyRecovery: "77", teamwork: "78", ego: "82", fighting: "84" }],
  ["Tim Merlier", { primary_archetype: "スプリンター", secondary_archetype: "クラシック型", ace_aptitude: "89", support_aptitude: "70", aptitude_tags: "最高速 / 加速力 / 最終加速", credit_salary: "9000", rating_status: "手動バランス調整済", sprint: "85", acceleration: "85", punch: "69", cruise: "73", climb: "58", stamina: "66", resistance: "66", technique: "72", bikeControl: "73", pave: "69", recovery: "69", dailyRecovery: "69", teamwork: "64", ego: "82", fighting: "68" }],
]);
const riderRoleOverrides = new Map([
  ["Tadej Pogacar", ["総合エース", "山岳賞ハンター", "ステージハンター"]],
  ["Mads Pedersen", ["スプリントエース", "横風要員", "ステージハンター"]],
  ["Tim Merlier", ["スプリントエース", "ステージハンター", "最終発射台"]],
]);
const freeRideDecisiveRiders = new Set([
  "Jonas Abrahamsen",
  "Filippo Conca",
  "Magnus Cort",
  "Itamar Einhorn",
  "Axel Zingle",
  "Ethan Vernon",
]);
const primaryAceRoles = new Set(["総合エース", "スプリントエース", "丘陵エース", "山岳エース"]);
const abilityAliases = { positioning: ["technique", "acceleration"], bike_control: ["bikeControl"], climbing: ["climb"], cobble: ["pave"], endurance: ["resistance"], ace_aptitude: ["ace_aptitude"] };
const terrainAbilities = { flat: ["cruise", "stamina", "sprint"], hill: ["punch", "acceleration", "fighting"], mountain: ["climb", "stamina", "recovery"], pave: ["pave", "bikeControl", "resistance"] };
const archetypeTerrains = { 総合型: ["mountain", "flat"], スプリンター: ["flat", "hill"], パンチャー: ["hill", "flat"], クラシック型: ["pave", "hill"], クライマー: ["mountain", "hill"], "TT・ルーラー型": ["flat", "pave"] };
const decisiveRoleHints = {
  総合エース: ["山岳エース", "平坦エース"], スプリントエース: ["スプリントエース", "平坦エース"], 丘陵エース: ["丘陵エース", "パヴェエース"], 山岳エース: ["山岳エース"],
  サブエース: ["山岳エース", "丘陵エース", "平坦エース"], ステージハンター: ["逃げエース", "丘陵エース"], 山岳賞ハンター: ["山岳エース", "逃げエース"], TTスペシャリスト: ["平坦エース"], 逃げ屋: ["逃げエース"],
  下り牽引: ["下りエース", "下りアシスト"], リードアウト: ["リードアウト"], 最終発射台: ["リードアウト"], スプリントトレイン: ["リードアウト", "平坦・TTアシスト"], ロードキャプテン: ["ロードキャプテン", "プロトンコントロール"],
  "スーパー・ドメスティーク": ["山岳アシスト", "平坦・TTアシスト"], 平坦アシスト: ["平坦・TTアシスト"], 平坦ペースメーカー: ["平坦・TTアシスト", "プロトンコントロール"], 山岳アシスト: ["山岳アシスト"],
  山岳番手: ["山岳アシスト"], 山岳ペースメーカー: ["山岳アシスト"], TT牽引: ["平坦・TTアシスト"], 石畳護衛: ["パヴェアシスト"], 集団コントローラー: ["プロトンコントロール"],
  ブレイクアウェイキラー: ["プロトンコントロール"], 横風要員: ["横風アシスト"], トラブル復帰牽引: ["復帰アシスト"], サテライトライダー: ["サテライトアシスト"],
};

function parseCsv(text) {
  const raw = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i + 1] === "\n") i += 1; row.push(cell); if (row.some((value) => value !== "")) raw.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]))) };
}

const csvCell = (value) => { const text = String(value ?? ""); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const serializeCsv = (headers, rows) => [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\r\n") + "\r\n";
const number = (value) => Number(value) || 0;
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value) => Math.round(value * 10) / 10;
const abilityValue = (rider, ability) => mean((abilityAliases[ability] ?? [ability]).map((field) => number(rider[field])));
const abilityScore = (rider, abilities = []) => mean(abilities.map((ability) => abilityValue(rider, ability)));
const roleTypeFor = (rider, roles) => roles.some((role) => primaryAceRoles.has(role)) || number(rider.ace_aptitude) >= number(rider.support_aptitude) + 10 ? "ace" : "assist";
const preferredTerrains = (rider) => [...new Set([...(archetypeTerrains[rider.primary_archetype] ?? ["flat"]), ...(archetypeTerrains[rider.secondary_archetype] ?? [])])];
const terrainBonus = (rider, terrainId) => { const index = preferredTerrains(rider).indexOf(terrainId); return (index === 0 ? 9 : index > 0 ? 5 : 0) + abilityScore(rider, terrainAbilities[terrainId] ?? []) * 0.08; };
const ranked = (cards, score) => cards.map((card) => ({ card, score: round(score(card)) })).sort((a, b) => b.score - a.score || a.card.name.localeCompare(b.card.name, "ja"));

function chooseCards(rider, roles, roleType, slot, count) {
  const terrainCards = (slot === "basic" ? basicTemplates : specialtyTemplates).filter((entry) => entry.roleType === roleType);
  const matchedRoleCards = roleTemplates.filter((entry) => entry.slot === slot && roles.includes(entry.role));
  const result = [], usedNames = new Set();
  for (const item of ranked([...terrainCards, ...matchedRoleCards], (card) => abilityScore(rider, card.abilities) + (card.terrainId ? terrainBonus(rider, card.terrainId) : 0) + (roles.includes(card.role) ? (slot === "basic" ? 14 : 16) : 0))) {
    if (usedNames.has(item.card.name)) continue;
    result.push({ ...item.card, score: item.score, source: item.card.terrainId ? "地形共通" : "役割共通" }); usedNames.add(item.card.name);
    if (result.length === count) break;
  }
  return result;
}

function chooseDecisive(rider, roles, roleType, specialties, rosterFile) {
  const signature = rosterFile.includes("01_") || rider.name === "Mads Pedersen" ? signatureByName.get(rider.name) : null;
  if (signature) return { ...signature, source: "エース固有", score: 100 };
  const eliteAssist = rosterFile.includes("01_") ? eliteAssistByName.get(rider.name) : null;
  if (eliteAssist) return { ...eliteAssist.cards[0], source: "高適性アシスト固有", score: 100 };
  const freeRide = rosterFile.includes("01_") && freeRideDecisiveRiders.has(rider.name)
    ? decisiveTemplates.find((entry) => entry.id === "ace_wheel_sucker") : null;
  if (freeRide) return { ...freeRide, source: "戦術勝負手", score: 100 };
  const roleHints = new Set(roles.flatMap((role) => decisiveRoleHints[role] ?? []));
  const selectedSpecialties = new Set(specialties.map((entry) => entry.name));
  const [best] = ranked(decisiveTemplates.filter((entry) => entry.roleType === roleType), (card) => abilityScore(rider, card.abilities) + (roleHints.has(card.role) ? 18 : 0) + card.baseSpecialties.filter((name) => selectedSpecialties.has(name)).length * 12);
  return { ...best.card, source: "汎用勝負手", score: best.score };
}

const publicCard = (card) => ({ id: card.id ?? null, name: card.name, source: card.source, score: card.score, cost: card.cost, target: card.target ?? (card.source === "エース固有" ? "本人" : null) });
const assignments = [];
for (const rosterFile of rosterFiles) {
  const parsed = parseCsv(await fs.readFile(rosterFile, "utf8"));
  for (const field of ["basic_cards", "specialty_cards", "decisive_card", "card_assignment_basis"]) if (!parsed.headers.includes(field)) parsed.headers.push(field);
  for (const rider of parsed.rows) {
    Object.assign(rider, riderProfileOverrides.get(rider.name) ?? {});
    if (rider.name === "Tim Merlier" && !rider.rating_basis.includes("Tim Merlier手動調整:")) rider.rating_basis += " Tim Merlier手動調整: Jasper Philipsen同格帯として最高速85・加速85・エース適性89へ再編。本人対象の高速巡航と、残り200mの最終加速型固有カードを採用。";
    const roles = riderRoleOverrides.get(rider.name) ?? rider.preferred_roles.split(" / ").map((role) => role.trim()).filter(Boolean);
    const roleType = roleTypeFor(rider, roles);
    let basics = chooseCards(rider, roles, roleType, "basic", 3);
    let specialties = chooseCards(rider, roles, roleType, "specialty", 2);
    if (rider.name === "Mads Pedersen") {
      basics = ["車輪キープ", "仕掛け待ち", "登坂リズム"].map((name) => basicTemplates.find((card) => card.name === name)).map((card) => ({ ...card, score: round(abilityScore(rider, card.abilities) + terrainBonus(rider, card.terrainId)), source: "地形共通" }));
      specialties = ["丘陵加速", "高速巡航"].map((name) => specialtyTemplates.find((card) => card.name === name)).map((card) => ({ ...card, score: round(abilityScore(rider, card.abilities) + terrainBonus(rider, card.terrainId)), source: "地形共通" }));
    }
    if (rider.name === "Tim Merlier") {
      specialties = ["高速巡航", "平坦カウンター"].map((name) => specialtyTemplates.find((card) => card.name === name)).map((card) => ({ ...card, score: round(abilityScore(rider, card.abilities) + terrainBonus(rider, card.terrainId)), source: "地形共通" }));
    }
    if (rider.name === "Tadej Pogacar") {
      const hillCard = specialtyTemplates.find((entry) => entry.name === "丘陵加速");
      if (!hillCard) throw new Error("Tadej Pogacar: missing 丘陵加速 template");
      specialties[1] = { ...hillCard, score: round(abilityScore(rider, hillCard.abilities) + terrainBonus(rider, hillCard.terrainId)), source: "地形共通" };
    }
    const decisive = chooseDecisive(rider, roles, roleType, specialties, rosterFile);
    if (basics.length !== 3 || specialties.length !== 2 || !decisive) throw new Error(`${rider.name}: incomplete card assignment`);
    rider.preferred_roles = roles.join(" / ");
    rider.basic_cards = basics.map((card) => card.name).join(" / ");
    rider.specialty_cards = specialties.map((card) => card.name).join(" / ");
    rider.decisive_card = decisive.name;
    rider.card_assignment_basis = `${roleType === "ace" ? "エース型" : "アシスト型"}／${rider.primary_archetype}・${rider.secondary_archetype}／${roles.join("・")}`;
    assignments.push({ rosterFile, riderNo: number(rider.no), riderName: rider.name, status: rider.active_status, primaryArchetype: rider.primary_archetype, secondaryArchetype: rider.secondary_archetype, roleType, roles, basicCards: basics.map(publicCard), specialtyCards: specialties.map(publicCard), decisiveCard: publicCard(decisive), assignmentBasis: rider.card_assignment_basis });
  }
  await fs.writeFile(rosterFile, serializeCsv(parsed.headers, parsed.rows), "utf8");
}

const names = new Set(assignments.map((entry) => `${entry.rosterFile}\u0000${entry.riderName}`));
if (assignments.length !== 510 || names.size !== assignments.length) throw new Error(`assignment count mismatch: ${assignments.length}/${names.size}`);
if (assignments.some((entry) => entry.basicCards.length !== 3 || entry.specialtyCards.length !== 2 || !entry.decisiveCard.name)) throw new Error("card slot count mismatch");
if (assignments.filter((entry) => entry.decisiveCard.source === "エース固有").length !== 52) throw new Error("signature assignment count mismatch");
if (assignments.filter((entry) => entry.decisiveCard.source === "高適性アシスト固有").length !== 12) throw new Error("elite assist assignment count mismatch");
await fs.writeFile(outputPath, JSON.stringify(assignments, null, 2) + "\n", "utf8");
if (assignments.filter((entry) => entry.decisiveCard.source === "戦術勝負手" && entry.decisiveCard.name === "無賃乗車").length !== freeRideDecisiveRiders.size) throw new Error("free-ride decisive assignment count mismatch");
console.log(JSON.stringify({ riders: assignments.length, active: assignments.filter((entry) => entry.rosterFile.includes("01_")).length, retired: assignments.filter((entry) => entry.rosterFile.includes("02_")).length, pending: assignments.filter((entry) => entry.rosterFile.includes("03_")).length, aceType: assignments.filter((entry) => entry.roleType === "ace").length, assistType: assignments.filter((entry) => entry.roleType === "assist").length, signatureDecisive: assignments.filter((entry) => entry.decisiveCard.source === "エース固有").length, eliteAssistDecisive: assignments.filter((entry) => entry.decisiveCard.source === "高適性アシスト固有").length }, null, 2));
