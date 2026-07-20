import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitions = JSON.parse(await fs.readFile(path.join(workspace, "data", "rider_role_definitions.json"), "utf8"));
const names = new Set(definitions.map((role) => role.name));
const errors = [];

if (definitions.length !== 28) errors.push(`役割数: ${definitions.length}（28必須）`);
if (names.size !== definitions.length) errors.push("役割名またはIDが重複しています");
if (new Set(definitions.map((role) => role.id)).size !== definitions.length) errors.push("役割IDが重複しています");
for (const role of definitions) {
  for (const key of ["id", "category", "name", "raceMeaning", "gameEffect", "term"]) if (!role[key]) errors.push(`${role.name || role.id}: ${key} が空です`);
  if (!Array.isArray(role.abilities) || !role.abilities.length) errors.push(`${role.name}: abilities が空です`);
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

const csvDir = path.join(workspace, "選手スプレッドシート");
const csvFiles = ["01_現役選手300名.csv", "02_引退選手.csv", "03_区分保留.csv"];
let checkedRiders = 0;
for (const file of csvFiles) {
  const rows = parseCsv(await fs.readFile(path.join(csvDir, file), "utf8"));
  if (!rows.length || !("preferred_roles" in rows[0])) continue;
  for (const rider of rows) {
    checkedRiders += 1;
    const assigned = String(rider.preferred_roles || "").split(" / ").filter(Boolean);
    if (assigned.length !== 3) errors.push(`${file}:${rider.name}: 役割が3件ではありません`);
    if (new Set(assigned).size !== assigned.length) errors.push(`${file}:${rider.name}: 役割が重複しています`);
    const aceRoles = assigned.filter((role) => role.endsWith("エース") && role !== "サブエース");
    if (aceRoles.length > 1 || (aceRoles.length && assigned.includes("サブエース"))) errors.push(`${file}:${rider.name}: エース役割が重複しています`);
    for (const role of assigned) if (!names.has(role)) errors.push(`${file}:${rider.name}: 未定義の役割 ${role}`);
    if (String(rider.specialist_role || "").trim()) errors.push(`${file}:${rider.name}: specialist_role が空欄ではありません`);
  }
}

for (const relativePath of ["docs/rider_role_taxonomy.md", "docs/rider_parameters_300.md", "docs/rider_motif_database_plan.md"]) {
  const source = await fs.readFile(path.join(workspace, relativePath), "utf8");
  for (const name of names) if (!source.includes(name)) errors.push(`${relativePath}: ${name} がありません`);
}

const generator = await fs.readFile(path.join(workspace, "outputs", "019f7863-1000-7941-8be7-a93707fedcde", "build_rider_parameters_300.mjs"), "utf8");
for (const token of ["roleDefinitionPath", 'worksheets.add("役割定義")', '"役割・戦術特性", "旧専門役割"']) {
  if (!generator.includes(token)) errors.push(`ワークブック生成器に ${token} がありません`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ roleDefinitions: definitions.length, csvFiles: csvFiles.length, checkedRiders, status: "ok" }, null, 2));
}
