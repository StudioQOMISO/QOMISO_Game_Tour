import fs from "node:fs/promises";

const rosterFiles = [
  "選手スプレッドシート/01_現役選手300名.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300.csv",
];
const outputPath = "data/ace_signature_cards.json";

const signatureEffectOverrides = new Map([
  ["Tadej Pogacar", "カウンター型：ライバルの仕掛け直後に追撃し、丘陵から登りへ勢いを持ち越す。"],
  ["Mathieu van der Poel", "ロングアタック型：悪路や丘陵の遠い位置から加速し、単独先頭のまま押し切りを狙う。"],
  ["Paul Seixas", "成長連鎖型：最初の登坂で先頭に残ると、次の勝負所でもう一段強い加速を使える。"],
  ["Isaac del Toro", "反復加速型：短い加速を連続して繰り出し、追走側の脚を先に削る。"],
  ["Jonas Vingegaard", "山岳封鎖型：長い登りで一定の高出力を維持し、後方からの再加速を封じる。"],
  ["Wout van Aert", "献身転換型：自分の巡航力を味方の位置上げへ変え、最後に残った脚で追撃する。"],
  ["Remco Evenepoel", "独走型：平坦または緩斜面で単独走へ移行し、追走が整う前に差を固定する。"],
  ["Primoz Roglic", "逆転型：終盤まで脚を温存し、先行勢が鈍った瞬間に一気に差を取り返す。"],
  ["Julian Alaphilippe", "短坂急襲型：急勾配の入口で先手を取り、頂上までの短時間に勝負を決める。"],
  ["Jasper Philipsen", "進路確保型：混戦で有利な車輪と走路を確保し、最短距離から最高速へ移る。"],
  ["Filippo Ganna", "巡航圧力型：高い巡航速度を長く保ち、追走するほど相手が消耗する展開を作る。"],
  ["Egan Bernal", "復活型：厳しい登坂を耐えた後に再加速し、遅れかけた位置から先頭へ戻る。"],
  ["Jonathan Milan", "長距離スプリント型：通常より早くスプリントを開始し、高出力を保ったまま押し切る。"],
  ["Biniam Girmay", "混戦突破型：位置取りが乱れた集団でも進路を切り替え、空いたラインから加速する。"],
  ["Arnaud De Lie", "パワースプリント型：丘陵後の重い脚でも速度を落とさず、力勝負の加速へ持ち込む。"],
  ["Juan Ayuso", "主導権型：ライバルより先にペースを上げ、相手に反応を強制して展開を支配する。"],
  ["Olav Kooij", "最短加速型：ゴール直前まで車輪を使い、短い加速時間で最高速へ到達する。"],
  ["Alberto Bettiol", "悪路突破型：荒れた路面で失速せずに加速し、ライン選択の差で集団を割る。"],
  ["Tim Wellens", "状況適応型：雨や消耗戦で他選手の反応が遅れた瞬間を捉え、単独で抜け出す。"],
  ["Mattias Skjelmose", "勾配変化型：斜度が切り替わる地点で加速し、一定ペースの追走を崩す。"],
  ["Kaden Groves", "持続スプリント型：早めに速度を上げ、後続に並ばせないまま長く加速を維持する。"],
  ["Fabio Jakobsen", "再加速型：一度減速する混戦を耐え、進路が開いた瞬間に最高速へ戻る。"],
  ["Tom Pidcock", "下り技術型：高速コーナーで減速を抑え、安全なラインから後続との差を広げる。"],
  ["Jasper Stuyven", "石畳射程型：パヴェ区間の遠い位置から仕掛け、追走がまとまる前に差を作る。"],
  ["Warren Barguil", "山頂奇襲型：山頂直前まで追走に徹し、最後の急勾配だけで順位を入れ替える。"],
  ["Maxim Van Gils", "一撃パンチ型：短い丘の最急勾配へ全出力を集中し、一度の加速で間隔を開ける。"],
  ["Pascal Ackermann", "遅仕掛け型：先行スプリンターの速度低下を待ち、最後の直線だけで差し切る。"],
  ["Giulio Ciccone", "山頂先行型：登坂後半から速度を上げ、山頂通過時点で追走との差を確保する。"],
  ["Jai Hindley", "長坂耐久型：長い登りで出力を落とさず、加速ではなく持続力で人数を削る。"],
  ["Matej Mohoric", "下り奇襲型：山頂通過直後に仕掛け、下りのライン取りで追走を引き離す。"],
  ["David Gaudu", "急勾配切替型：緩斜面では脚を残し、斜度が上がった瞬間に登坂出力を解放する。"],
  ["Tiesj Benoot", "追走反撃型：先行者との差を悪路で縮め、合流直後の再アタックで主導権を奪う。"],
  ["Valentin Madouas", "連続丘陵型：一つ目の丘で人数を絞り、次の丘でも速度を落とさず攻撃を続ける。"],
  ["Florian Lipowitz", "漸増登坂型：登りが進むほどペースを上げ、終盤に追走不能な速度へ到達する。"],
  ["Pello Bilbao", "頂上下り連結型：山頂前の加速を下りへつなぎ、二つの区間を一続きの攻撃にする。"],
  ["Romain Gregoire", "連打型：短いアタックを間隔を空けずに重ね、反応できない瞬間を作る。"],
  ["Juan Sebastian Molano", "発射型：リードアウトの速度を失わずに離れ、直線入口から一気に加速する。"],
  ["Jhonatan Narvaez", "二段加速型：丘の中腹で一度集団を絞り、頂上前の二度目の加速で抜け出す。"],
  ["Felix Gall", "消耗登坂型：一定の高い登坂出力を維持し、回復できない相手から順に脱落させる。"],
  ["Jordi Meeus", "直線一気型：最後の直線へ入るまで脚を隠し、進路が開いた瞬間だけ全開にする。"],
  ["Tim Merlier", "最終200m型：残り200mで爆発的な最終加速を発動し、最高速をフィニッシュへ直結させる。"],
  ["Antonio Tiberi", "計算ペース型：残り距離に合わせて出力を配分し、最後の登坂だけ余力を残す。"],
  ["Oscar Onley", "登坂スプリント型：急坂を先頭で耐え、頂上付近の短い直線でスプリントする。"],
  ["Benoit Cosnefroy", "速射型：短い加速を何度も放ち、相手が反応を止めた一回を決定打にする。"],
  ["Mads Pedersen", "登れるスプリンター型：登りを先頭集団で耐え、フィニッシュで残した脚を使ってスプリントする。"],
  ["Guillaume Martin", "自律ペース型：他者のアタックには反応せず、自分の登坂速度を最後まで維持する。"],
  ["Giulio Pellizzari", "後半上昇型：登坂前半を抑え、後半の急勾配から段階的に順位を上げる。"],
  ["Enric Mas", "圧力型：先頭付近で一定の圧力をかけ続け、ライバルの攻撃回数を減らす。"],
  ["John Degenkolb", "石畳粉砕型：重いギアでパヴェを押し切り、振動で速度を失う相手を置き去りにする。"],
  ["Richard Carapaz", "奇襲型：集団が牽制した瞬間に単独で飛び出し、反応が揃う前に差を広げる。"],
  ["Nairo Quintana", "高地飛翔型：標高が上がるほど登坂ペースを強め、山頂近くで単独先頭へ移る。"],
]);
const riderProfileOverrides = new Map([
  ["Tim Merlier", { primary_archetype: "スプリンター", secondary_archetype: "クラシック型", ace_aptitude: "89", support_aptitude: "70", preferred_roles: "スプリントエース / ステージハンター / 最終発射台", aptitude_tags: "最高速 / 加速力 / 最終加速", credit_salary: "9000", rating_status: "手動バランス調整済", sprint: "85", acceleration: "85", punch: "69", cruise: "73", climb: "58", stamina: "66", resistance: "66", technique: "72", bikeControl: "73", pave: "69", recovery: "69", dailyRecovery: "69", teamwork: "64", ego: "82", fighting: "68" }],
]);

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
  "Tom Pidcock": ["英国の曲芸師", "曲芸師の急降下"],
  "Mads Pedersen": ["北欧の暴風", "暴風の登坂スプリント"],
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
const roleDescription = (roles, riderName) => {
  if (signatureEffectOverrides.has(riderName)) return signatureEffectOverrides.get(riderName);
  if (riderName === "Tom Pidcock") return "下り区間で固有の加速を発動し、落車リスクを抑えながら後続とのタイム差を広げる。";
  if (riderName === "Mads Pedersen") return "登りを先頭集団で耐え、フィニッシュで残した脚を使ってスプリントする。";
  if (riderName === "Tim Merlier") return "残り200mで爆発的な最終加速を発動し、最高速をフィニッシュへ直結させる。";
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
  if (missing.length || aceRows.length !== 51) throw new Error(file + ": ace mapping mismatch " + missing.join(" / "));
  for (const row of aceRows) {
    Object.assign(row, riderProfileOverrides.get(row.name) ?? {});
    if (row.name === "Tim Merlier" && !row.rating_basis.includes("Tim Merlier手動調整:")) row.rating_basis += " Tim Merlier手動調整: Jasper Philipsen同格帯として最高速85・加速85・エース適性89へ再編。本人対象の高速巡航と、残り200mの最終加速型固有カードを採用。";
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
    description: roleDescription(row.preferred_roles, row.name),
    primaryArchetype: row.primary_archetype,
    secondaryArchetype: row.secondary_archetype,
    basedOn: [row.name === "Tom Pidcock" ? "下り" : row.name === "Mads Pedersen" ? "登れるスプリンター" : aceRole, row.aptitude_tags].filter(Boolean),
  };
});

const duplicateValues = (values) => values.filter((value, index) => values.indexOf(value) !== index);
const duplicateTitles = duplicateValues(cards.map((card) => card.riderTitle));
const duplicateCards = duplicateValues(cards.map((card) => card.name));
if (cards.length !== 51 || duplicateTitles.length || duplicateCards.length) {
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
if (updatedDoc !== doc) await fs.writeFile(docPath, updatedDoc, "utf8");
console.log(JSON.stringify({ primaryAces: cards.length, titles: cards.length, signatureCards: cards.length, outputPath }, null, 2));
