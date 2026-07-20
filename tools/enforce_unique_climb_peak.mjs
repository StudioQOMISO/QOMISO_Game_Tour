import fs from "node:fs/promises";

const files = [
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
  "data/rider_parameters_300.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300_pre_rebalance.csv",
];
const note = "登坂力はTadej Pogacarの特別枠88を除き、Jonas Vingegaardのみ85、その他は84以下";

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
      if (row.some(value => value !== "")) raw.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map(cells => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}
const csvCell = value => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
const serialize = parsed => [parsed.headers.map(csvCell).join(","), ...parsed.rows.map(row => parsed.headers.map(header => csvCell(row[header] ?? "")).join(","))].join("\n") + "\n";

const result = {};
for (const file of files) {
  try { await fs.access(file); } catch { continue; }
  const parsed = parseCsv(await fs.readFile(file, "utf8"));
  let changed = 0;
  for (const row of parsed.rows) {
    const before = Number(row.climb || 0);
    const after = row.name === "Tadej Pogacar" ? 88 : row.name === "Jonas Vingegaard" ? 85 : Math.min(before, 84);
    if (after !== before) { row.climb = String(after); changed += 1; }
    if ("rating_basis" in row && !String(row.rating_basis || "").includes(note)) {
      row.rating_basis = `${String(row.rating_basis || "").replace(/[。\s]+$/, "")}。${note}`;
    }
  }
  await fs.writeFile(file, serialize(parsed), "utf8");
  result[file] = { rows: parsed.rows.length, changed };
}
console.log(JSON.stringify(result, null, 2));
