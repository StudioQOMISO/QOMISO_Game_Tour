import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(workspace, "data");
const targetName = "Tadej Pogacar";
const overrides = {
  ace_aptitude: 100,
  credit_salary: 20000,
  sprint: 66,
  acceleration: 80,
  punch: 85,
  cruise: 82,
  climb: 88,
  stamina: 88,
  resistance: 86,
  technique: 84,
  bikeControl: 83,
  pave: 82,
  recovery: 88,
  dailyRecovery: 88,
  teamwork: 75,
  ego: 79,
  fighting: 87,
};
const specialTierNote = "特別Tier: Tadej Pogacarのみ通常上限85を超える能力上限88・エース適性100・Credit 20,000を適用";

function parseCsv(text) {
  const rawRows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rawRows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rawRows.push(row); }
  const headers = rawRows.shift();
  return { headers, rows: rawRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}

const csvCell = (value) => /[",\r\n]/.test(String(value ?? ""))
  ? `"${String(value ?? "").replace(/"/g, '""')}"`
  : String(value ?? "");
const serializeCsv = (headers, rows) =>
  [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\n") + "\n";
const appendBasis = (value, note) => String(value || "").includes(note)
  ? String(value || "")
  : `${String(value || "").replace(/[。\s]+$/, "")}。${note}`;

const files = (await fs.readdir(dataDir))
  .filter((name) => /^rider_parameters.*\.csv$/i.test(name))
  .map((name) => path.join(dataDir, name));
const summary = {};

for (const filePath of files) {
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  const rider = parsed.rows.find((row) => row.name === targetName);
  if (!rider) continue;
  for (const [key, value] of Object.entries(overrides)) {
    if (parsed.headers.includes(key)) rider[key] = String(value);
  }
  if (parsed.headers.includes("rider_title_basis")) {
    rider.rider_title_basis = String(rider.rider_title_basis || "").replace(/Credit 15,000/g, "Credit 20,000");
  }
  if (parsed.headers.includes("rating_status")) rider.rating_status = "手動バランス調整済";
  if (parsed.headers.includes("rating_basis")) rider.rating_basis = appendBasis(rider.rating_basis, specialTierNote);
  await fs.writeFile(filePath, serializeCsv(parsed.headers, parsed.rows), "utf8");
  summary[path.relative(workspace, filePath)] = Object.fromEntries(Object.entries(overrides));
}

if (!Object.keys(summary).length) throw new Error(`${targetName}が対象CSVに見つかりません`);
console.log(JSON.stringify(summary, null, 2));
