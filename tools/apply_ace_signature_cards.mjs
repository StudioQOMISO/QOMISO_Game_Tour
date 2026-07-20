import fs from "node:fs/promises";

const rosterFiles = [
  "選手スプレッドシート/01_現役選手300名.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300.csv",
];
const outputPath = "data/ace_signature_cards.json";

const aceSpecs = {
  "Tadej Pogacar": ["新時代の皇帝", "皇帝のカウンター"],
  "Mathieu van der Poel": ["虹色の暴君", "暴君の射程"],
  "Paul Seixas": ["三色の新星", "新星の飛躍"],
  "Isaac del Toro": ["メキシコの火花", "火花の噴出"],
  "Jonas Vingegaard": ["北海の山岳王", "山岳王の封鎖"],
  "Wout van Aert": ["万能の銀弾", "銀弾の献身"],
  "Remco Evenepoel": ["弾丸の天才", "弾丸の独走"],
  "Primoz Roglic": ["不屈の跳躍者", "跳躍者の逆転"],
  "Julian Alaphilippe": ["虹色の踊り子", "踊り子の一撃"],
  "Jasper Philipsen": ["低地の快速王", "快速王の進路"],
  "Filippo Ganna": ["蒼きトップギア", "トップギアの巡航"],
  "Egan Bernal": ["アンデスの若き王", "若き王の帰還"],
  "Jonathan Milan": ["アドリアの大砲", "大砲の直線"],
  "Biniam Girmay": ["アフリカの疾風", "疾風の突破"],
  "Arnaud De Lie": ["ワロンの猛牛", "猛牛の突進"],
  "Juan Ayuso": ["イベリアの野心家", "野心家の主導権"],
  "Olav Kooij": ["低地の若き矢", "若き矢の最短路"],
  "Alberto Bettiol": ["トスカーナの剛脚", "剛脚の突破口"],
  "Tim Wellens": ["雨天の狩人", "狩人の勝負勘"],
  "Mattias Skjelmose": ["北欧の鋭刃", "鋭刃の勾配"],
  "Kaden Groves": ["豪州の快速車", "快速車の巡航"],
  "Fabio Jakobsen": ["不屈の疾走者", "疾走者の復活"],
  "Tom Pidcock": ["英国の曲芸師", "曲芸師の悪路"],
  "Jasper Stuyven": ["ルーヴェンの石畳槍", "石畳槍の射程"],
  "Warren Barguil": ["ブルターニュの山猫", "山猫の頂上"],
  "Maxim Van Gils": ["低地のパンチ砲", "パンチ砲の一閃"],
  "Pascal Ackermann": ["ドイツの急行", "急行の最終便"],
  "Giulio Ciccone": ["青き山岳狩人", "山岳狩人の牙"],
  "Jai Hindley": ["豪州の山岳航海士", "航海士の登坂路"],
  "Matej Mohoric": ["下りの異端児", "異端児の下降線"],
  "David Gaudu": ["ブルターニュの山岳剣", "山岳剣の頂上戦"],
  "Tiesj Benoot": ["石畳の闘犬", "闘犬の追走"],
  "Valentin Madouas": ["丘陵の青い閃光", "閃光の残像"],
  "Florian Lipowitz": ["ドイツの山岳新星", "新星の登攀"],
  "Pello Bilbao": ["バスクの急降下", "急降下の勝負線"],
  "Romain Gregoire": ["フランスの若き拳", "若き拳の連打"],
  "Juan Sebastian Molano": ["コロンビアの快速弾", "快速弾の発射"],
  "Jhonatan Narvaez": ["アンデスのパンチ砲", "パンチ砲の連撃"],
  "Felix Gall": ["アルプスの登坂者", "登坂者の耐久戦"],
  "Jordi Meeus": ["低地の突風", "突風の直線"],
  "Tim Merlier": ["石畳の快速王", "石畳王の号砲"],
  "Antonio Tiberi": ["ローマの計算者", "計算者の方程式"],
  "Oscar Onley": ["英国の山岳拳", "山岳拳の一撃"],
  "Benoit Cosnefroy": ["ノルマンディーの速射砲", "速射砲の連射"],
  "Guillaume Martin": ["哲学する山岳者", "哲学者の選択"],
  "Giulio Pellizzari": ["アペニンの新星", "新星の上昇"],
  "Enric Mas": ["静かなる山岳騎士", "山岳騎士の圧力"],
  "John Degenkolb": ["石畳の重戦車", "重戦車の粉砕"],
  "Richard Carapaz": ["アンデスの機関車", "機関車の奇襲"],
  "Nairo Quintana": ["アンデスの鷹", "鷹の飛翔"],
};

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
      if (row.some((value) => value !== "")) raw.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]))) };
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
};
const serializeCsv = (headers, rows) =>
  [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((cells) => cells.map(csvCell).join(",")).join("\n") + "\n";

const isPrimaryAce = (row) => /(?:総合|スプリント|丘陵|山岳)エース/.test(row.preferred_roles);
const roleDescription = (roles) => {
  if (roles.includes("スプリントエース")) return "フィニッシュで固有の加速を発動し、最高速と加速力を勝敗へ変える。";
  if (roles.includes("丘陵エース")) return "丘陵やクラシックの勝負所で固有の攻撃を行い、先頭集団を絞り込む。";
  if (roles.includes("山岳エース")) return "登りの勝負所で固有の攻撃を行い、追走選手とのタイム差を広げる。";
  return "総合争いの勝負所で固有の攻撃を行い、ライバルからタイムを奪う。";
};

let canonicalRows;
let fixedRows;
for (const file of rosterFiles) {
  const parsed = parseCsv(await fs.readFile(file, "utf8"));
  const isCanonical = file.startsWith("選手スプレッドシート/");
  const aceRows = isCanonical
    ? parsed.rows.filter(isPrimaryAce)
    : parsed.rows.filter((row) => aceSpecs[row.name]);
  const missing = aceRows.filter((row) => !aceSpecs[row.name]).map((row) => row.name);
  if (missing.length || aceRows.length !== 50) throw new Error(file + ": ace mapping mismatch " + missing.join(" / "));
  for (const row of aceRows) {
    const [title, decisive] = aceSpecs[row.name];
    row.rider_title = title;
    if ("rider_title_eligibility" in row) row.rider_title_eligibility = "エース固有枠";
    if ("rider_title_basis" in row) {
      const aceRole = canonicalRows?.find((item) => item.name === row.name)?.preferred_roles.split(" / ").find((role) => /(?:総合|スプリント|丘陵|山岳)エース/.test(role)) || "エース";
      row.rider_title_basis = aceRole + "／エース適性" + row.ace_aptitude + "／固有勝負手「" + decisive + "」";
    }
  }
  if (isCanonical) canonicalRows = aceRows;
  if (file === "data/rider_parameters_300_fixed.csv") fixedRows = parsed.rows;
  await fs.writeFile(file, serializeCsv(parsed.headers, parsed.rows), "utf8");
}

const cards = canonicalRows.map((row) => {
  const [riderTitle, name] = aceSpecs[row.name];
  const aceRole = row.preferred_roles.split(" / ").find((role) => /(?:総合|スプリント|丘陵|山岳)エース/.test(role));
  return {
    riderNo: Number(row.no),
    riderName: row.name,
    riderTitle,
    eligibility: aceRole,
    slot: "decisive",
    cost: 3,
    usageLimit: 1,
    name,
    description: roleDescription(row.preferred_roles),
    primaryArchetype: row.primary_archetype,
    secondaryArchetype: row.secondary_archetype,
    basedOn: [aceRole, row.aptitude_tags].filter(Boolean),
  };
});

const duplicateValues = (values) => values.filter((value, index) => values.indexOf(value) !== index);
const duplicateTitles = duplicateValues(cards.map((card) => card.riderTitle));
const duplicateCards = duplicateValues(cards.map((card) => card.name));
if (cards.length !== 50 || duplicateTitles.length || duplicateCards.length) {
  throw new Error("signature validation failed: titles=" + duplicateTitles.join("/") + " cards=" + duplicateCards.join("/"));
}
await fs.writeFile(outputPath, JSON.stringify(cards, null, 2) + "\n", "utf8");

const titledRows = fixedRows.filter((row) => row.rider_title).sort((a, b) => Number(a.no) - Number(b.no));
const titleSection = [
  "## ゲーム内二つ名",
  "",
  "- 主役割が総合・スプリント・丘陵・山岳エースの現役50名には、原則として二つ名と固有勝負手を付与する。",
  "- それ以外はCredit・主要実績・個別選定により付与する。史実上の正式な異名ではなくゲーム内演出名とする。",
  "",
  "| No. | 選手名 | 二つ名 | 付与区分 | 根拠 |",
  "|---:|---|---|---|---|",
  ...titledRows.map((row) => "| " + row.no + " | " + row.name + " | " + row.rider_title + " | " + row.rider_title_eligibility + " | " + row.rider_title_basis + " |"),
].join("\n");
const docPath = "docs/rider_parameters_300.md";
const doc = await fs.readFile(docPath, "utf8");
const updatedDoc = doc.replace(/## ゲーム内二つ名[\s\S]*?(?=\n## 勝負・走行能力)/, titleSection + "\n");
if (updatedDoc === doc) throw new Error("title section was not regenerated");
await fs.writeFile(docPath, updatedDoc, "utf8");
console.log(JSON.stringify({ primaryAces: cards.length, titles: cards.length, signatureCards: cards.length, outputPath }, null, 2));
