import fs from "node:fs/promises";
import path from "node:path";

const workspace = path.resolve(new URL("..", import.meta.url).pathname.slice(1));
const baselinePath = path.join(workspace, "data", "rider_parameters_300_pre_rebalance.csv");
const outputPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const worldPath = path.join(workspace, "data", "world_championship_achievements_300.json");
const statKeys = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "pave", "recovery", "dailyRecovery", "teamwork", "ego", "fighting"];
const related = {
  sprint: ["acceleration", "punch"], acceleration: ["sprint", "punch"], punch: ["acceleration", "climb"], cruise: ["stamina", "technique"],
  climb: ["stamina", "recovery"], stamina: ["resistance", "dailyRecovery"], resistance: ["stamina", "fighting"], technique: ["bikeControl", "teamwork"],
  bikeControl: ["technique", "resistance"], recovery: ["dailyRecovery", "resistance"], dailyRecovery: ["recovery", "stamina"], teamwork: ["technique", "support_aptitude"],
  ego: ["ace_aptitude", "fighting"], fighting: ["resistance", "punch"],
};
const rankCaps = [[2,85],[6,84],[15,83],[30,82],[54,81],[84,80],[120,79],[162,78],[210,77],[252,76],[276,75],[288,74],[294,73],[297,72],[299,71],[300,70]];

function parseCsvLine(line) {
  const cells = []; let cell = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell); return cells;
}
const csvCell = (value) => /[",\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
const lines = (await fs.readFile(baselinePath, "utf8")).trim().split(/\r?\n/);
const headers = parseCsvLine(lines.shift());
const rows = lines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])); });
if (rows.length !== 300 || new Set(rows.map((row) => row.name)).size !== 300) throw new Error("基準データは300名・重複なしである必要があります");
const worldData = JSON.parse(await fs.readFile(worldPath, "utf8"));
const worldByName = new Map(worldData.riders.map((row) => [row.name, row]));
const worldFields = ["world_road_gold", "world_road_silver", "world_road_bronze", "world_itt_gold", "world_itt_silver", "world_itt_bronze", "world_championship_basis", "world_championship_source_url"];
for (const field of worldFields) if (!headers.includes(field)) headers.push(field);

const medalScore = (record) => Number(record.gold || 0) * 3 + Number(record.silver || 0) * 2 + Number(record.bronze || 0);
const medalTier = (record) => {
  const score = medalScore(record);
  return score >= 9 ? 3 : score >= 4 ? 2 : score >= 1 ? 1 : 0;
};
for (const row of rows) {
  const world = worldByName.get(row.name) || { road: {}, itt: {} };
  const road = world.road || {}; const itt = world.itt || {};
  const roadTier = medalTier(road); const ittTier = medalTier(itt);
  const roadMedals = Number(road.gold || 0) + Number(road.silver || 0) + Number(road.bronze || 0);
  const ittMedals = Number(itt.gold || 0) + Number(itt.silver || 0) + Number(itt.bronze || 0);
  const add = (key, value) => { row[key] = String(Math.min(85, Number(row[key]) + value)); };
  if (roadTier) {
    add("stamina", roadTier); add("fighting", roadTier); add("resistance", Math.min(2, roadTier)); add("technique", roadMedals >= 3 ? 2 : 1);
  }
  if (ittTier) {
    add("cruise", ittTier); add("technique", Math.min(2, ittTier)); add("stamina", Math.min(2, ittTier)); add("resistance", ittMedals >= 3 ? 1 : 0);
  }
  row.world_road_gold = String(Number(road.gold || 0)); row.world_road_silver = String(Number(road.silver || 0)); row.world_road_bronze = String(Number(road.bronze || 0));
  row.world_itt_gold = String(Number(itt.gold || 0)); row.world_itt_silver = String(Number(itt.silver || 0)); row.world_itt_bronze = String(Number(itt.bronze || 0));
  row.world_championship_basis = `ロード 金${row.world_road_gold}/銀${row.world_road_silver}/銅${row.world_road_bronze}、ITT 金${row.world_itt_gold}/銀${row.world_itt_silver}/銅${row.world_itt_bronze}`;
  row.world_championship_source_url = roadMedals || ittMedals ? worldData.sources.official : "";
}

const rankings = new Map();
for (const stat of statKeys.filter((key) => key !== "pave")) {
  const [related1, related2] = related[stat];
  const ranked = [...rows].sort((a, b) =>
    Number(b[stat]) - Number(a[stat]) || Number(b[related1]) - Number(a[related1]) || Number(b[related2]) - Number(a[related2]) ||
    Number(b.credit_salary) - Number(a.credit_salary) || Number(a.no) - Number(b.no));
  rankings.set(stat, ranked);
}

const selected85 = new Map(statKeys.map((key) => [key, new Set()]));
const rider85Count = new Map(rows.map((row) => [row.name, Number(row.pave) === 85 ? 1 : 0]));
for (const row of rows) if (Number(row.pave) === 85) selected85.get("pave").add(row.name);
const statOrder = ["sprint", "climb", "cruise", "punch", "acceleration", "bikeControl", "technique", "stamina", "resistance", "recovery", "dailyRecovery", "teamwork", "fighting"];
for (const stat of statOrder) {
  for (const row of rankings.get(stat)) {
    if (selected85.get(stat).size >= 2) break;
    if (Number(row[stat]) !== 85 || rider85Count.get(row.name) >= 2) continue;
    selected85.get(stat).add(row.name);
    rider85Count.set(row.name, rider85Count.get(row.name) + 1);
  }
}

for (const stat of statKeys.filter((key) => key !== "pave")) {
  const ranked = rankings.get(stat);
  ranked.forEach((row, index) => {
    const rank = index + 1;
    let cap = rankCaps.find(([end]) => rank <= end)[1];
    if (cap === 85) cap = 84;
    if (selected85.get(stat).has(row.name)) cap = 85;
    row[stat] = String(Math.min(Number(row[stat]), cap));
  });
}
for (const row of rows) {
  row.rating_status = "世界選手権反映・300名再編成済";
  row.rating_basis = "世界選手権ロード・個人TT表彰台実績を補正後、能力別順位上限を適用（85は各能力最大2名・1選手最大2項目）。パヴェはパリ〜ルーベ絶対評価";
}
await fs.writeFile(outputPath, [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))].map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

const total85 = rows.reduce((sum, row) => sum + statKeys.filter((key) => Number(row[key]) === 85).length, 0);
const ridersWith85 = rows.filter((row) => statKeys.some((key) => Number(row[key]) === 85)).length;
const byStat = Object.fromEntries(statKeys.map((key) => [key, rows.filter((row) => Number(row[key]) === 85).length]));
console.log(JSON.stringify({ rows: rows.length, total85, ridersWith85, byStat }, null, 2));
