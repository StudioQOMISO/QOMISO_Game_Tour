import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(workspace, "data");
const overrides = new Map([
  ["Primoz Roglic", 92],
  ["Nairo Quintana", 77],
  ["Biniam Girmay", 88],
  ["John Degenkolb", 80],
]);

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

const files = (await fs.readdir(dataDir))
  .filter((name) => /^rider_parameters.*\.csv$/i.test(name))
  .map((name) => path.join(dataDir, name));
const summary = {};

for (const filePath of files) {
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  if (!parsed.headers.includes("name") || !parsed.headers.includes("ace_aptitude")) continue;
  const changed = [];
  for (const row of parsed.rows) {
    const value = overrides.get(row.name);
    if (value === undefined) continue;
    row.ace_aptitude = String(value);
    if (parsed.headers.includes("rating_status")) row.rating_status = "手動バランス調整済";
    if (parsed.headers.includes("rating_basis")) {
      const note = `手動調整: ${row.name}のエース適性を${value}に設定`;
      if (!String(row.rating_basis || "").includes(note)) {
        row.rating_basis = `${String(row.rating_basis || "").replace(/[。\s]+$/, "")}。${note}`;
      }
    }
    changed.push({ name: row.name, ace_aptitude: value });
  }
  if (!changed.length) continue;
  await fs.writeFile(filePath, serializeCsv(parsed.headers, parsed.rows), "utf8");
  summary[path.relative(workspace, filePath)] = changed;
}

for (const [name, value] of overrides) {
  const occurrences = Object.values(summary).flat().filter((entry) => entry.name === name && entry.ace_aptitude === value).length;
  if (!occurrences) throw new Error(`${name}が対象CSVに見つかりません`);
}

console.log(JSON.stringify(summary, null, 2));
