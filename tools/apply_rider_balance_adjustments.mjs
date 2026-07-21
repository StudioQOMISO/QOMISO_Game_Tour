import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const adjustmentPath = path.join(root, "data", "rider_balance_adjustments.json");
const targetPaths = [
  path.join(root, "data", "rider_parameters_300.csv"),
  path.join(root, "data", "rider_parameters_300_fixed.csv"),
  path.join(root, "選手スプレッドシート", "01_現役選手300名.csv"),
];

function parseRow(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(cell);
      cell = "";
    } else cell += char;
  }
  cells.push(cell);
  return cells;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const config = JSON.parse(await fs.readFile(adjustmentPath, "utf8"));
for (const targetPath of targetPaths) {
  const text = await fs.readFile(targetPath, "utf8");
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const headers = parseRow(lines[0]);
  const indices = new Map(headers.map((header, index) => [header, index]));
  const found = new Set();
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    if (!lines[lineIndex]) continue;
    const cells = parseRow(lines[lineIndex]);
    const name = cells[indices.get("name")];
    const adjustment = config.adjustments[name];
    if (!adjustment) continue;
    for (const [key, value] of Object.entries(adjustment)) cells[indices.get(key)] = String(value);
    lines[lineIndex] = cells.map(csvCell).join(",");
    found.add(name);
  }
  for (const name of Object.keys(config.adjustments)) {
    if (!found.has(name)) throw new Error(`${name} not found in ${targetPath}`);
  }
  await fs.writeFile(targetPath, lines.join(newline), "utf8");
  console.log(`Updated ${path.relative(root, targetPath)}: ${[...found].join(", ")}`);
}
