import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const aceSignaturePath = path.join(workspace, "data", "ace_signature_cards.json");

const titles = new Map(Object.entries({
  "Jan Ullrich": "ドイツの巨砲",
  "Jonas Vingegaard": "北海の山岳王",
  "Stuart O'Grady": "豪州の石畳魂",
  "Mark Cavendish": "最速の島風",
  "Mario Cipollini": "伊達男の獅子",
  "Michael Rogers": "三冠のクロノマン",
  "Mathew Hayman": "石畳の伏兵",
  "Alessandro Petacchi": "アドリアの超特急",
  "Alessandro Ballan": "虹を掴んだ石畳屋",
  "Marco Pantani": "山岳の海賊",
  "Greg Van Avermaet": "黄金のクラシックハンター",
  "Wout van Aert": "万能の銀弾",
  "Vasil Kiryienka": "鉄壁のクロノ職人",
  "Tobias Foss": "北欧のクロノ王",
  "Primoz Roglic": "不屈の跳躍者",
  "Simon Yates": "赤き山岳の切り札",
  "Tom Dumoulin": "低地のクロノバタフライ",
  "Ivan Basso": "静かなる山岳貴公子",
  "Denis Menchov": "沈黙の総合屋",
  "Roberto Heras": "赤き山岳王",
  "Alex Zulle": "スイスのクロノ砲",
  "Gilberto Simoni": "ジロの山鷲",
  "Cadel Evans": "豪州の不屈王",
  "Oscar Freire": "虹のスナイパー",
  "Thor Hushovd": "北欧の雷神",
  "Philippe Gilbert": "アルデンヌの王",
  "Alejandro Valverde": "不沈の緑弾",
  "Niki Terpstra": "北海の逃亡者",
  "Sonny Colbrelli": "泥雨の王",
  "Peter Van Petegem": "フランドルの黒豹",
  "Andrei Tchmil": "北方の鉄人",
  "Andrea Tafi": "石畳の剣闘士",
  "Franco Ballerini": "ルーベの紳士",
  "Paolo Bettini": "黄金のコオロギ",
  "Magnus Backstedt": "北欧の巨人",
  "Servais Knaven": "ルーベの脱走者",
  "Johan Vansummeren": "石畳の長槍",
  "Julian Alaphilippe": "虹色の踊り子",
  "Rui Costa": "雨中の世界王者",
  "Michele Bartoli": "トスカーナの獅子",
  "Miguel Indurain": "静かなる大機関",
  "Maurizio Fondriest": "虹の伊達男",
  "Erik Zabel": "ベルリンの鷹",
  "Peter Sagan": "虹のショーマン",
  "Johan Museeuw": "フランドルの獅子",
  "Tom Boonen": "石畳の竜巻",
  "John Degenkolb": "石畳の重戦車",
  "Mathieu van der Poel": "虹色の暴君",
  "Fabian Cancellara": "クロノの剣闘士",
  "Egan Bernal": "アンデスの若き王",
  "Laurent Jalabert": "変幻のクラシック王",
  "Bradley Wiggins": "英国のクロノ騎士",
  "Tony Martin": "クロノの装甲車",
  "Filippo Ganna": "蒼きトップギア",
  "Chris Boardman": "クロノの教授",
  "Rohan Dennis": "豪州の時計砕き",
  "Remco Evenepoel": "弾丸の天才",
  "Michal Kwiatkowski": "ポーランドの虹",
  "Alberto Contador": "山岳の射手",
  "Chris Froome": "高地の計算王",
  "Vincenzo Nibali": "海峡の鮫",
  "Mads Pedersen": "北欧の暴風",
  "Tadej Pogacar": "新時代の皇帝",
  "Nairo Quintana": "アンデスの鷹",
}));

const aceSignatures = JSON.parse(await fs.readFile(aceSignaturePath, "utf8"));
const aceSignatureByName = new Map(aceSignatures.map((entry) => [entry.riderName, entry]));
for (const entry of aceSignatures) titles.set(entry.riderName, entry.riderTitle);

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
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
  return rows.filter((r) => r.some((v) => v !== ""));
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const parsed = parseCsv(await fs.readFile(csvPath, "utf8"));
const inputHeaders = parsed.shift();
const rows = parsed.map((cells) => Object.fromEntries(inputHeaders.map((header, index) => [header, cells[index] ?? ""])));
const titleFields = ["rider_title", "rider_title_eligibility", "rider_title_basis"];
const headers = inputHeaders.filter((header) => !titleFields.includes(header));
headers.splice(headers.indexOf("name") + 1, 0, ...titleFields);

for (const row of rows) {
  const famousAchievement = Number(row.world_road_gold) + Number(row.world_itt_gold) + Number(row.pave_wins) > 0;
  const signature = aceSignatureByName.get(row.name);
  const eligible = titles.has(row.name);
  row.rider_title = titles.get(row.name) || "";
  row.rider_title_eligibility = signature
    ? "エース固有枠"
    : Number(row.credit_salary) >= 10000 ? "Credit 10,000以上"
    : famousAchievement ? "著名実績枠"
    : eligible ? "二つ名選定枠" : "対象外";
  const achievements = [];
  if (Number(row.world_road_gold)) achievements.push(`世界ロード金${row.world_road_gold}`);
  if (Number(row.world_itt_gold)) achievements.push(`世界ITT金${row.world_itt_gold}`);
  if (Number(row.pave_wins)) achievements.push(`パリ〜ルーベ優勝${row.pave_wins}`);
  row.rider_title_basis = signature
    ? signature.eligibility + "／エース適性" + row.ace_aptitude + "／固有勝負手「" + signature.name + "」"
    : eligible
    ? [`Credit ${Number(row.credit_salary).toLocaleString("en-US")}`, row.primary_archetype, row.secondary_archetype, ...achievements].filter(Boolean).join("／")
    : "";
  if (eligible !== titles.has(row.name)) throw new Error(`二つ名対象との不一致: ${row.name}`);
}

const duplicateTitles = [...titles.values()].filter((title, index, all) => all.indexOf(title) !== index);
if (titles.size !== 103 || aceSignatures.length !== 50 || duplicateTitles.length) throw new Error(`二つ名検証失敗: count=${titles.size}, ace=${aceSignatures.length}, duplicates=${duplicateTitles.join(" / ")}`);

await fs.writeFile(csvPath, [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
  .map((cells) => cells.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ riders: rows.length, titled: titles.size, output: csvPath }, null, 2));
