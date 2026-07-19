import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const mdPath = path.join(workspace, "docs", "rider_parameters_300.md");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const csv = parseCsv(await fs.readFile(csvPath, "utf8"));
const headers = csv.shift();
const nameIndex = headers.indexOf("name"), noIndex = headers.indexOf("no");
const noByName = new Map(csv.map((row) => [row[nameIndex], Number(row[noIndex])]));
const lines = (await fs.readFile(mdPath, "utf8")).split(/\r?\n/);

for (let i = 0; i < lines.length; i += 1) {
  const match = lines[i].match(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|/);
  if (!match) continue;
  const no = noByName.get(match[1].trim());
  if (no) lines[i] = lines[i].replace(/^\|\s*\d+\s*\|/, `| ${no} |`);
}

for (let i = 0; i < lines.length - 2; i += 1) {
  if (!/^\|\s*No\.?(?:\s*\||\s*\|)/.test(lines[i])) continue;
  if (!/^\|[-:|\s]+\|/.test(lines[i + 1])) continue;
  let end = i + 2;
  while (end < lines.length && /^\|/.test(lines[end])) end += 1;
  const data = lines.slice(i + 2, end);
  data.sort((a, b) => Number(a.match(/^\|\s*(\d+)/)?.[1] || 9999) - Number(b.match(/^\|\s*(\d+)/)?.[1] || 9999));
  lines.splice(i + 2, data.length, ...data);
  i = end;
}

await fs.writeFile(mdPath, lines.join("\n"), "utf8");
console.log(JSON.stringify({ file: path.relative(workspace, mdPath), riders: noByName.size }, null, 2));
