import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const monumentPath = path.join(workspace, "data", "monument_achievements_300.json");
const rondeSource = "https://www.rondevanvlaanderen.be/en/race/men-elite/history";

function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ""; }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((value) => value !== ""));
}
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const rondeFloor = (wins) => wins >= 3 ? 80 : wins === 2 ? 78 : wins === 1 ? 76 : 50;
const rondeBonus = (wins) => Math.min(3, Math.max(0, wins));
function parisRoubaixBase(row) {
  const current = Number(row.pave);
  if (!/最低値\d+適用/.test(String(row.pave_basis || ""))) return current;
  const wins = Number(row.pave_wins || 0);
  const best = Number(row.pave_best_result || 0);
  const top10s = Number(row.pave_top10s || 0);
  const finishes = Number(row.pave_finishes || 0);
  let value = wins >= 4 ? 85 : wins === 3 ? 84 : wins === 2 ? 83 : wins === 1 ? 82 : best > 0 && best <= 3 ? 80 : best > 0 && best <= 5 ? 78 : best > 0 && best <= 10 ? 76 : best > 0 && best <= 20 ? 73 : best > 0 && best <= 50 ? 69 : finishes > 0 ? 64 : 50;
  if (!wins && finishes > 0) value = Math.min(82, value + Math.min(2, Math.max(0, top10s - 1) + (finishes >= 5 ? 1 : 0)));
  return value;
}

const parsed = parseCsv(await fs.readFile(csvPath, "utf8"));
const headers = parsed.shift();
const rows = parsed.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
const byName = new Map(rows.map((row) => [row.name, row]));
const monuments = JSON.parse(await fs.readFile(monumentPath, "utf8"));
const changed = [];

for (const achievement of monuments.riders) {
  const row = byName.get(achievement.name);
  if (!row) throw new Error(`固定正本に選手が見つかりません: ${achievement.name}`);
  const wins = Number(achievement.flanders || 0);
  const floor = rondeFloor(wins);
  const bonus = rondeBonus(wins);
  const before = Number(row.pave);
  const prBase = parisRoubaixBase(row);
  const after = Math.min(85, Math.max(prBase + bonus, floor));
  row.pave = String(after);
  row.rating_basis = String(row.rating_basis || "")
    .replace(/パヴェはパリ〜ルーベ主基準・ロンド優勝実績を副基準/g, "パヴェはパリ〜ルーベ主基準・ロンド優勝を加点＋最低保証")
    .replace(/パヴェはパリ〜ルーベ主基準・ロンド優勝副基準/g, "パヴェはパリ〜ルーベ主基準・ロンド優勝を加点＋最低保証");
  row.pave_basis = String(row.pave_basis || "").replace(new RegExp(" / ロンド優勝\\d+回[^/]*$"), "");
  if (wins > 0) {
    row.pave_basis += ` / ロンド優勝${wins}回・加点+${bonus}・最低保証${floor}`;
    row.pave_source_url = after > prBase ? rondeSource : row.pave_source_url;
  }
  if (after !== before) changed.push({ name: row.name, rondeWins: wins, prBase, before, after });
}
await fs.writeFile(csvPath, [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))].map((cells) => cells.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ rule: "全300名再計算: PR基準値＋ロンド1勝+1／2勝+2／3勝以上+3、最低保証76／78／80", changed }, null, 2));
