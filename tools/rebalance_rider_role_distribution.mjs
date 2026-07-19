import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "data/rider_parameters_300.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_active_300.csv",
  "data/rider_parameters_retired.csv",
  "data/rider_parameters_status_pending.csv",
];
const roleOrder = JSON.parse(await fs.readFile(path.join(workspace, "data", "rider_role_definitions.json"), "utf8")).map((role) => role.name);
const controlledRoles = ["TTスペシャリスト", "TT牽引", "平坦アシスト", "横風要員", "逃げ屋"];
const activeTargets = new Map([
  ["TTスペシャリスト", 20],
  ["TT牽引", 45],
  ["平坦アシスト", 60],
  ["横風要員", 35],
  ["逃げ屋", 50],
]);
const fallbackByArchetype = {
  "総合型": "山岳アシスト",
  "スプリンター": "スプリントトレイン",
  "クライマー": "山岳アシスト",
  "パンチャー": "ステージハンター",
  "クラシック型": "石畳護衛",
  "TT・ルーラー型": "平坦ペースメーカー",
};

function parseCsv(text) {
  const rawRows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rawRows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rawRows.push(row); }
  const headers = rawRows.shift();
  return { headers, rows: rawRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}

const csvCell = (value) => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
const serializeCsv = (headers, rows) => [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\n") + "\n";
const n = (row, key) => Number(row[key] || 0);
const rolesOf = (row) => String(row.preferred_roles || "").split(" / ").map((role) => role.trim()).filter(Boolean);
const hasType = (row, type) => row.primary_archetype === type || row.secondary_archetype === type;
const medals = (row) => n(row, "world_itt_gold") * 15 + n(row, "world_itt_silver") * 8 + n(row, "world_itt_bronze") * 5;
const tagged = (row, word) => String(row.aptitude_tags || "").includes(word) ? 1 : 0;
const stableHash = (value) => { let hash = 2166136261; for (const char of String(value)) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 16777619); } return hash >>> 0; };

const scores = {
  "TTスペシャリスト": (r) => n(r, "cruise") * .32 + n(r, "technique") * .18 + n(r, "stamina") * .16 + n(r, "resistance") * .10 + medals(r) + (r.primary_archetype === "TT・ルーラー型" ? 8 : hasType(r, "TT・ルーラー型") ? 4 : 0) + tagged(r, "TT適性") * 4,
  "TT牽引": (r) => n(r, "cruise") * .30 + n(r, "stamina") * .20 + n(r, "technique") * .15 + n(r, "teamwork") * .20 + n(r, "support_aptitude") * .15 + (r.primary_archetype === "TT・ルーラー型" ? 6 : hasType(r, "TT・ルーラー型") ? 3 : 0) + tagged(r, "巡航力") * 3 - (n(r, "ace_aptitude") >= 95 ? 4 : 0),
  "平坦アシスト": (r) => n(r, "cruise") * .22 + n(r, "stamina") * .18 + n(r, "teamwork") * .28 + n(r, "support_aptitude") * .22 + n(r, "resistance") * .10 + (n(r, "ace_aptitude") < 85 ? 2 : 0),
  "横風要員": (r) => n(r, "cruise") * .20 + n(r, "technique") * .20 + n(r, "teamwork") * .20 + n(r, "fighting") * .20 + n(r, "bikeControl") * .20 + (hasType(r, "クラシック型") ? 5 : hasType(r, "TT・ルーラー型") ? 3 : 0) + (n(r, "pave") >= 78 ? 3 : 0),
  "逃げ屋": (r) => n(r, "stamina") * .25 + n(r, "fighting") * .25 + n(r, "cruise") * .20 + n(r, "recovery") * .15 + n(r, "punch") * .10 + n(r, "ego") * .05 + (hasType(r, "パンチャー") || hasType(r, "クラシック型") ? 4 : 0) - (n(r, "ace_aptitude") >= 95 ? 8 : 0),
};

function targetFor(role, rowCount) {
  return Math.max(1, Math.round((activeTargets.get(role) / 300) * rowCount));
}

function rebalance(rows) {
  const selected = new Map();
  for (const role of controlledRoles) {
    const ranked = [...rows].sort((a, b) => scores[role](b) - scores[role](a) || stableHash(`${a.name}|${role}`) - stableHash(`${b.name}|${role}`));
    if (role === "TT牽引") {
      const ttSpecialists = selected.get("TTスペシャリスト") || new Set();
      ranked.sort((a, b) => Number(ttSpecialists.has(a.name)) - Number(ttSpecialists.has(b.name)) || scores[role](b) - scores[role](a));
    }
    selected.set(role, new Set(ranked.slice(0, targetFor(role, rows.length)).map((row) => row.name)));
  }

  for (const row of rows) {
    const roles = rolesOf(row).filter((role) => !controlledRoles.includes(role));
    for (const role of controlledRoles) if (selected.get(role).has(row.name)) roles.push(role);
    if (!roles.length) roles.push(fallbackByArchetype[row.primary_archetype] || "平坦アシスト");
    roles.sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
    row.preferred_roles = [...new Set(roles)].slice(0, 7).join(" / ");
    if ("rating_basis" in row) {
      const note = "役割人数を300名内順位で制御（TTスペシャリスト20、TT牽引45、平坦アシスト60、横風要員35、逃げ屋50）";
      if (!String(row.rating_basis || "").includes(note)) row.rating_basis = `${String(row.rating_basis || "").replace(/[。\s]+$/, "")}。${note}`;
    }
  }
  return Object.fromEntries(controlledRoles.map((role) => [role, rows.filter((row) => rolesOf(row).includes(role)).length]));
}

const result = {};
for (const relativePath of files) {
  const filePath = path.join(workspace, relativePath);
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  const counts = rebalance(parsed.rows);
  await fs.writeFile(filePath, serializeCsv(parsed.headers, parsed.rows), "utf8");
  result[relativePath] = { riders: parsed.rows.length, controlledRoleCounts: counts, blankRoles: parsed.rows.filter((row) => !row.preferred_roles).length };
}

console.log(JSON.stringify(result, null, 2));
