import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["data/rider_parameters_active_300.csv", "data/rider_parameters_300.csv", "data/rider_parameters_300_fixed.csv"];
const specialists = new Set([
  "Remco Evenepoel", "Wout van Aert", "Filippo Ganna", "Joshua Tarling", "Stefan Bissegger",
  "Victor Campenaerts", "Tobias Foss", "Edoardo Affini", "Brandon McNulty", "Jay Vine",
  "Thymen Arensman", "Magnus Sheffield", "Alec Segaert", "Daan Hoole", "Mikkel Bjerg",
  "Bruno Armirail", "Luke Plapp", "Remi Cavagna", "Luke Durbridge", "Kasper Asgreen",
]);

function parseCsv(text) {
  const raw = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i + 1] === "\n") i += 1; row.push(cell); if (row.some(Boolean)) raw.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}
const csvCell = (value) => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
const serialize = (headers, rows) => [headers.join(","), ...rows.map((row) => headers.map((h) => csvCell(row[h] ?? "")).join(","))].join("\n") + "\n";

for (const relativePath of files) {
  const filePath = path.join(workspace, relativePath);
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  const present = new Set(parsed.rows.map((row) => row.name));
  const missing = [...specialists].filter((name) => !present.has(name));
  if (missing.length) throw new Error(`${relativePath}: TT候補不足 ${missing.join(" / ")}`);
  for (const row of parsed.rows) {
    let roles = String(row.preferred_roles || "").split(" / ").filter((role) => role && role !== "TTスペシャリスト");
    if (specialists.has(row.name)) {
      if (roles.length >= 7) {
        const removable = ["逃げ屋", "横風要員", "平坦アシスト", "TT牽引"].find((role) => roles.includes(role));
        if (removable) roles = roles.filter((role) => role !== removable);
        else roles = roles.slice(0, 6);
      }
      const leaderCount = roles.filter((role) => role === "エース" || role === "サブエース").length;
      roles.splice(leaderCount, 0, "TTスペシャリスト");
    }
    row.preferred_roles = [...new Set(roles)].slice(0, 7).join(" / ");
  }
  await fs.writeFile(filePath, serialize(parsed.headers, parsed.rows), "utf8");
}

console.log(JSON.stringify({ specialists: specialists.size, names: [...specialists] }, null, 2));
