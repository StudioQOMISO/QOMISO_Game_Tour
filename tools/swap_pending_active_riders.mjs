import fs from "node:fs/promises";

const activePath = "data/rider_parameters_active_300.csv";
const pendingPath = "data/rider_parameters_status_pending.csv";
const incoming = new Map([
  ["Julian Alaphilippe", { team: "Tudor Pro Cycling Team", source: "https://www.letour.fr/en/riders" }],
  ["Tom Pidcock", { team: "Pinarello–Q36.5 Pro Cycling Team", source: "https://www.letour.fr/en/riders" }],
]);
const outgoing = new Set(["Asbjørn Hellemose", "Alexy Faure Prost"]);
const statKeys = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "pave", "recovery", "dailyRecovery", "teamwork", "ego", "fighting"];

function parseCsv(text) {
  const raw = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some(v => v !== "")) raw.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map(cells => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]))) };
}

const cell = value => /[",\r\n]/.test(String(value ?? ""))
  ? `"${String(value ?? "").replace(/"/g, '""')}"`
  : String(value ?? "");
const serialize = ({ headers, rows }) => [
  headers.map(cell).join(","),
  ...rows.map(row => headers.map(header => cell(row[header] ?? "")).join(",")),
].join("\n") + "\n";
const average = row => statKeys.reduce((sum, key) => sum + Number(row[key] || 0), 0) / statKeys.length;
const rank = rows => rows
  .sort((a, b) => Number(b.ace_aptitude) - Number(a.ace_aptitude)
    || Number(b.credit_salary) - Number(a.credit_salary)
    || average(b) - average(a)
    || a.name.localeCompare(b.name, "en"))
  .map((row, index) => ({ ...row, no: String(index + 1) }));

const active = parseCsv(await fs.readFile(activePath, "utf8"));
const pending = parseCsv(await fs.readFile(pendingPath, "utf8"));
const promoted = pending.rows.filter(row => incoming.has(row.name));
const held = active.rows.filter(row => outgoing.has(row.name));
if (promoted.length !== incoming.size) throw new Error(`promoted riders found: ${promoted.length}/${incoming.size}`);
if (held.length !== outgoing.size) throw new Error(`outgoing riders found: ${held.length}/${outgoing.size}`);

for (const row of promoted) {
  const update = incoming.get(row.name);
  row.era = "現役";
  row.current_team = update.team;
  row.active_status = "現役確認済";
  row.selection_basis = "2026ツール・ド・フランス公式出場者一覧で現役確認";
  row.active_source_url = update.source;
  row.rating_status = "2026現役確認・評価済";
}
for (const row of held) {
  row.era = "現代";
  row.active_status = "区分保留";
  row.selection_basis = "現役300名枠の脚質別入替（現役状態は維持）";
}

active.rows = rank([
  ...active.rows.filter(row => !outgoing.has(row.name)),
  ...promoted,
]);
pending.rows = rank([
  ...pending.rows.filter(row => !incoming.has(row.name)),
  ...held,
]);
if (active.rows.length !== 300 || pending.rows.length !== 40) throw new Error(`unexpected counts: active=${active.rows.length}, pending=${pending.rows.length}`);
if (new Set(active.rows.map(row => row.name)).size !== active.rows.length) throw new Error("duplicate active rider names");

await fs.writeFile(activePath, serialize(active), "utf8");
await fs.writeFile(pendingPath, serialize(pending), "utf8");
const typeCounts = Object.fromEntries([...new Set(active.rows.map(row => row.primary_archetype))].sort().map(type => [type, active.rows.filter(row => row.primary_archetype === type).length]));
console.log(JSON.stringify({
  promoted: promoted.map(row => ({ no: active.rows.find(r => r.name === row.name).no, name: row.name, type: row.primary_archetype, ace: Number(row.ace_aptitude) })),
  movedToPending: held.map(row => ({ no: pending.rows.find(r => r.name === row.name).no, name: row.name, type: row.primary_archetype, ace: Number(row.ace_aptitude) })),
  active: active.rows.length,
  pending: pending.rows.length,
  typeCounts,
}, null, 2));
