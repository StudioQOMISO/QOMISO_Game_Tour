import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("./", import.meta.url).pathname.slice(1);
const workspace = outputDir.split("/outputs/")[0];
const sourceWorkbookPath = outputDir + "QOMISO_Game_Tour_実在選手モチーフ200名_仮Credit.xlsx";
const workbookPath = outputDir + "QOMISO_Game_Tour_実在選手モチーフ300名_仮Credit.xlsx";
const original = await SpreadsheetFile.importXlsx(await FileBlob.load(sourceWorkbookPath));
const expansionRows = JSON.parse(await fs.readFile(workspace + "/data/rider_expansion_100.json", "utf8"));
const gtAchievementData = JSON.parse(await fs.readFile(workspace + "/data/grand_tour_achievements_300.json", "utf8"));
const monumentAchievementData = JSON.parse(await fs.readFile(workspace + "/data/monument_achievements_300.json", "utf8"));
const sourceSheet = original.worksheets.getItem("選手一覧");
const sourceHeader = sourceSheet.getRange("A4:N4").values[0];
const sourceIsTwoAxis = sourceHeader[4] === "主脚質";
const sourceHasAptitudeTags = sourceHeader.includes("適性タグ");
const sourceRows = sourceSheet.getRange(sourceIsTwoAxis ? (sourceHasAptitudeTags ? "A5:N204" : "A5:M204") : "A5:J204").values;
const legacySourceSheet = original.worksheets.getItem("レジェンド別枠");
const legacyHeader = legacySourceSheet.getRange("A4:K4").values[0];
const legacyIsTwoAxis = legacyHeader[4] === "主脚質";
const legacyHasAptitudeTags = legacyHeader.includes("適性タグ");
const legacyRows = legacySourceSheet.getRange(legacyIsTwoAxis ? (legacyHasAptitudeTags ? "A5:K15" : "A5:J15") : "A5:H15").values;

const archetypes = ["総合型", "スプリンター", "クライマー", "パンチャー", "クラシック型", "TT・ルーラー型"];
const stageHunters = new Set(["Thomas De Gendt", "Claudio Chiappucci", "Richard Carapaz", "Richard Virenque", "Thibaut Pinot", "Romain Bardet", "Julian Alaphilippe", "Simon Gerrans", "Peter Sagan", "Rohan Dennis"]);
const breakawayRiders = new Set(["Jens Voigt", "Jack Bauer", "Eros Poli", "Sylvain Chavanel", "Taco van der Hoorn", "Bob Jungels", "Pierre Rolland", "Jan Tratnik", "Lawson Craddock", "Dries Devenyns"]);
const specialPrimary = new Map([
  ["Richard Virenque", "クライマー"],
  ["Thomas De Gendt", "TT・ルーラー型"],
  ["Claudio Chiappucci", "クライマー"],
  ["Richard Carapaz", "総合型"],
]);
const specialSecondary = new Map([
  ["Tadej Pogacar", "パンチャー"], ["Primoz Roglic", "パンチャー"], ["Remco Evenepoel", "TT・ルーラー型"],
  ["Peter Sagan", "スプリンター"], ["Fabian Cancellara", "TT・ルーラー型"], ["Bradley Wiggins", "総合型"],
  ["Rohan Dennis", "総合型"], ["Fumiyuki Beppu", "TT・ルーラー型"], ["Yukiya Arashiro", "パンチャー"],
]);

function primaryFromRole(name, role) {
  if (specialPrimary.has(name)) return specialPrimary.get(name);
  if (role === "総合エース") return "総合型";
  if (role === "スプリンター" || role === "リードアウト") return "スプリンター";
  if (role === "クライマー" || role === "山岳アシスト") return "クライマー";
  if (role === "パンチャー") return "パンチャー";
  if (role === "クラシックエース" || role === "ロードキャプテン" || role === "石畳ガード") return "クラシック型";
  return "TT・ルーラー型";
}

function secondaryFrom(primary, name, oldRole) {
  if (specialSecondary.has(name)) return specialSecondary.get(name);
  const byPrimary = {
    "総合型": "クライマー",
    "スプリンター": oldRole === "リードアウト" ? "TT・ルーラー型" : "クラシック型",
    "クライマー": oldRole === "山岳アシスト" ? "総合型" : "パンチャー",
    "パンチャー": "クライマー",
    "クラシック型": oldRole === "ロードキャプテン" ? "TT・ルーラー型" : "パンチャー",
    "TT・ルーラー型": oldRole === "TTT・万能アシスト" ? "総合型" : "クラシック型",
  };
  return byPrimary[primary];
}

function aptitudes(no, oldClass, oldRole, oldTag, credit) {
  const wobble = (Number(no) % 5) - 2;
  if (oldClass === "勝利担当") {
    const base = {
      "総合エース": [96, 69], "スプリンター": [95, 58], "クライマー": [92, 66],
      "パンチャー": [91, 64], "クラシックエース": [91, 72], "TTエース": [88, 79], "ステージハンター": [85, 72],
    }[oldRole] || [86, 70];
    return [Math.min(99, base[0] + wobble), Math.min(95, base[1] - wobble)];
  }
  const base = {
    "山岳アシスト": [oldTag.includes("緊急エース可") ? 76 : 59, 91],
    "平坦・横風ルーラー": [55, 94], "ロードキャプテン": [50, 97], "リードアウト": [58, 95],
    "石畳ガード": [61, 93], "TTT・万能アシスト": [58, 94],
  }[oldRole] || [55, 90];
  const creditBoost = Number(credit) >= 6500 ? 3 : Number(credit) <= 3800 ? -2 : 0;
  return [Math.max(35, Math.min(85, base[0] + wobble + creditBoost)), Math.max(75, Math.min(99, base[1] - wobble))];
}

function preferredRoles(oldClass, oldRole, oldTag, name) {
  const roles = [];
  if (oldClass === "勝利担当") roles.push("当日エース", "副エース");
  if (oldRole === "山岳アシスト" || oldRole === "平坦・横風ルーラー" || oldRole === "石畳ガード" || oldRole === "TTT・万能アシスト") roles.push("アシスト");
  if (oldRole === "山岳アシスト" && oldTag.includes("緊急エース可")) roles.push("副エース");
  if (oldRole === "ロードキャプテン") roles.push("ロードキャプテン", "アシスト");
  if (oldRole === "リードアウト") roles.push("リードアウト", "アシスト");
  if (oldRole === "石畳ガード" || oldRole === "TTT・万能アシスト") roles.push("ロードキャプテン");
  if (stageHunters.has(name)) roles.push("ステージハンター");
  if (breakawayRiders.has(name)) roles.push("逃げ屋");
  return [...new Set(roles)].join(" / ");
}

const specialAptitudeTags = new Map([
  ["Tadej Pogacar", ["パンチ力", "TT適性", "日別回復"]],
  ["Peter Sagan", ["パンチ力", "ステージハンター", "逃げ屋"]],
  ["Wout van Aert", ["最高速", "TT適性", "ステージハンター"]],
  ["Mads Pedersen", ["最高速", "石畳", "ステージハンター"]],
  ["Jasper Philipsen", ["最高速", "位置取り", "クラシックスプリント"]],
  ["Biniam Girmay", ["最高速", "パンチ力", "石畳"]],
  ["Tom Pidcock", ["パンチ力", "バイクコントロール", "下り"]],
  ["Joao Almeida", ["日別回復", "TT適性", "登坂力"]],
  ["Juan Ayuso", ["登坂力", "パンチ力", "ステージハンター"]],
  ["Carlos Rodriguez", ["登坂力", "下り", "日別回復"]],
  ["Jonathan Milan", ["最高速", "リードアウト", "TT適性"]],
  ["Olav Kooij", ["最高速", "位置取り", "集団スプリント"]],
  ["Arnaud De Lie", ["パンチ力", "最高速", "悪路耐性"]],
]);

function aptitudeTagsFor(rider) {
  if (specialAptitudeTags.has(rider.name)) return specialAptitudeTags.get(rider.name);
  const primaryTag = { "総合型": "日別回復", "スプリンター": "最高速", "クライマー": "山岳耐久", "パンチャー": "パンチ力", "クラシック型": "バイクコントロール", "TT・ルーラー型": "巡航力" }[rider.primary];
  const secondaryTag = { "総合型": "総合安定", "スプリンター": "スプリント", "クライマー": "登坂力", "パンチャー": "反復加速", "クラシック型": "悪路耐性", "TT・ルーラー型": "TT適性" }[rider.secondary];
  const tags = [primaryTag, secondaryTag];
  if (stageHunters.has(rider.name)) tags.push("ステージハンター");
  if (breakawayRiders.has(rider.name)) tags.push("逃げ屋");
  return [...new Set(tags.filter(Boolean))].slice(0, 3);
}

const riders = sourceRows.map((row) => {
  if (sourceIsTwoAxis) {
    if (sourceHasAptitudeTags) {
      const [no, name, country, era, primary, secondary, aceAptitude, supportAptitude, preferred, specialistRole, aptitudeTags, credit, motif, url] = row;
      return { no, name, country, era, primary, secondary, aceAptitude, supportAptitude, preferred, specialistRole, aptitudeTags: String(aptitudeTags || "").split(" / ").filter(Boolean), credit, motif, url };
    }
    const [no, name, country, era, primary, secondary, aceAptitude, supportAptitude, preferred, specialistRole, credit, motif, url] = row;
    return { no, name, country, era, primary, secondary, aceAptitude, supportAptitude, preferred, specialistRole, credit, motif, url };
  }
  const [no, name, country, era, oldClass, oldRole, credit, motif, oldTag, url] = row;
  const primary = primaryFromRole(name, oldRole);
  const secondary = secondaryFrom(primary, name, oldRole);
  const [aceAptitude, supportAptitude] = aptitudes(no, oldClass, oldRole, String(oldTag || ""), credit);
  return { no, name, country, era, primary, secondary, aceAptitude, supportAptitude, preferred: preferredRoles(oldClass, oldRole, String(oldTag || ""), name), credit, motif, url };
});

const replacementSpecs = new Map([
  [86, { name: "Mads Pedersen", country: "デンマーク", era: "現代", primary: "クラシック型", secondary: "スプリンター", aceAptitude: 94, supportAptitude: 85, preferred: "当日エース / 副エース", specialistRole: "", credit: 10000, motif: "石畳、最高速、長距離耐久、反復スプリント", url: "https://en.wikipedia.org/wiki/Special:Search?search=Mads%20Pedersen%20cyclist" }],
  [89, { name: "Jasper Philipsen", country: "ベルギー", era: "現代", primary: "スプリンター", secondary: "クラシック型", aceAptitude: 96, supportAptitude: 68, preferred: "当日エース / 副エース", specialistRole: "", credit: 9800, motif: "最高速、位置取り、クラシックスプリント", url: "https://en.wikipedia.org/wiki/Special:Search?search=Jasper%20Philipsen%20cyclist" }],
  [104, { name: "Biniam Girmay", country: "エリトリア", era: "現代", primary: "スプリンター", secondary: "パンチャー", aceAptitude: 93, supportAptitude: 80, preferred: "当日エース / 副エース", specialistRole: "", credit: 9000, motif: "登りスプリント、石畳、位置取り、勝負強さ", url: "https://en.wikipedia.org/wiki/Special:Search?search=Biniam%20Girmay%20cyclist" }],
  [105, { name: "Tom Pidcock", country: "イギリス", era: "現代", primary: "クラシック型", secondary: "パンチャー", aceAptitude: 91, supportAptitude: 78, preferred: "当日エース / 副エース", specialistRole: "", credit: 9000, motif: "パンチ力、下り、バイクコントロール、複合競技", url: "https://en.wikipedia.org/wiki/Special:Search?search=Tom%20Pidcock%20cyclist" }],
  [106, { name: "Joao Almeida", country: "ポルトガル", era: "現代", primary: "総合型", secondary: "TT・ルーラー型", aceAptitude: 93, supportAptitude: 82, preferred: "当日エース / 副エース", specialistRole: "", credit: 9500, motif: "粘る登坂、TT、長期総合、日ごとの回復", url: "https://en.wikipedia.org/wiki/Special:Search?search=Joao%20Almeida%20cyclist" }],
  [111, { name: "Juan Ayuso", country: "スペイン", era: "現代", primary: "総合型", secondary: "パンチャー", aceAptitude: 92, supportAptitude: 75, preferred: "当日エース / 副エース", specialistRole: "", credit: 9000, motif: "若手総合、登坂、TT、加速力", url: "https://en.wikipedia.org/wiki/Special:Search?search=Juan%20Ayuso%20cyclist" }],
  [136, { name: "Carlos Rodriguez", country: "スペイン", era: "現代", primary: "総合型", secondary: "クライマー", aceAptitude: 90, supportAptitude: 80, preferred: "当日エース / 副エース", specialistRole: "", credit: 8500, motif: "総合安定、登坂、下り、若手エース", url: "https://en.wikipedia.org/wiki/Special:Search?search=Carlos%20Rodriguez%20cyclist" }],
  [137, { name: "Jonathan Milan", country: "イタリア", era: "現代", primary: "スプリンター", secondary: "TT・ルーラー型", aceAptitude: 94, supportAptitude: 78, preferred: "当日エース / リードアウト", specialistRole: "", credit: 8800, motif: "大出力スプリント、巡航、トラック由来の速度", url: "https://en.wikipedia.org/wiki/Special:Search?search=Jonathan%20Milan%20cyclist" }],
  [138, { name: "Olav Kooij", country: "オランダ", era: "現代", primary: "スプリンター", secondary: "TT・ルーラー型", aceAptitude: 93, supportAptitude: 77, preferred: "当日エース / リードアウト", specialistRole: "", credit: 8200, motif: "最高速、位置取り、若さ、集団スプリント", url: "https://en.wikipedia.org/wiki/Special:Search?search=Olav%20Kooij%20cyclist" }],
  [183, { name: "Arnaud De Lie", country: "ベルギー", era: "現代", primary: "パンチャー", secondary: "スプリンター", aceAptitude: 91, supportAptitude: 78, preferred: "当日エース / 副エース", specialistRole: "", credit: 8200, motif: "登りスプリント、悪路、爆発力、力強い加速", url: "https://en.wikipedia.org/wiki/Special:Search?search=Arnaud%20De%20Lie%20cyclist" }],
]);
for (const rider of riders) {
  if (replacementSpecs.has(Number(rider.no))) Object.assign(rider, replacementSpecs.get(Number(rider.no)));
  if (rider.name === "Tadej Pogacar") Object.assign(rider, { aceAptitude: 99, supportAptitude: 84, preferred: "当日エース / 副エース", credit: 15000, motif: "別格総合、登坂、TT、パンチ、回復" });
  if (rider.name === "Wout van Aert") Object.assign(rider, { aceAptitude: 92, supportAptitude: 94, preferred: "当日エース / 副エース / アシスト", credit: 9800 });
}

riders.push(...expansionRows.map((rider) => ({
  ...rider,
  aptitudeTags: Array.isArray(rider.aptitudeTags) ? rider.aptitudeTags : String(rider.aptitudeTags || "").split(" / ").filter(Boolean),
})));

const gtAchievementByName = new Map(gtAchievementData.riders.map((row) => [row.name, row]));
const monumentAchievementByName = new Map(monumentAchievementData.riders.map((row) => [row.name, row]));
const grandTourWinBreakdown = new Map(
  gtAchievementData.riders
    .filter((row) => row.tour.gc + row.giro.gc + row.vuelta.gc > 1)
    .map((row) => [row.name, { tour: row.tour.gc, giro: row.giro.gc, vuelta: row.vuelta.gc }]),
);
const multiGrandTourWins = new Map([...grandTourWinBreakdown].map(([name, wins]) => [name, wins.tour + wins.giro + wins.vuelta]));
const grandTourStars = (count) => (count ? "★".repeat(count) : "—");
function achievementCreditFloor(gt, monument) {
  const gc = gt.tour.gc + gt.giro.gc + gt.vuelta.gc;
  const stages = gt.tour.stages + gt.giro.stages + gt.vuelta.stages;
  const jerseys = gt.tour.points + gt.tour.mountains + gt.tour.young
    + gt.giro.points + gt.giro.mountains + gt.giro.young
    + gt.vuelta.points + gt.vuelta.mountains + gt.vuelta.young;
  const monuments = monument.msr + monument.flanders + monument.roubaix + monument.liege + monument.lombardia;
  let floor = gc === 1 ? 8500 : 0;
  if (monuments >= 8) floor = Math.max(floor, 13000);
  else if (monuments === 7) floor = Math.max(floor, 12000);
  else if (monuments === 6) floor = Math.max(floor, 11500);
  else if (monuments === 5) floor = Math.max(floor, 11000);
  else if (monuments === 4) floor = Math.max(floor, 10500);
  else if (monuments === 3) floor = Math.max(floor, 9500);
  else if (monuments === 2) floor = Math.max(floor, 8500);
  if (stages >= 50) floor = Math.max(floor, 11000);
  else if (stages >= 35) floor = Math.max(floor, 10500);
  else if (stages >= 25) floor = Math.max(floor, 10000);
  else if (stages >= 15) floor = Math.max(floor, 9000);
  else if (stages >= 10) floor = Math.max(floor, 8200);
  if (jerseys >= 8) floor = Math.max(floor, 10500);
  else if (jerseys >= 5) floor = Math.max(floor, 9500);
  else if (jerseys >= 3) floor = Math.max(floor, 8500);
  return floor;
}
function multiGrandTourFloor(wins) {
  if (wins >= 7) return { aceAptitude: 98, credit: 13000 };
  if (wins >= 5) return { aceAptitude: 98, credit: 12500 };
  if (wins >= 4) return { aceAptitude: 98, credit: 12000 };
  return { aceAptitude: 96, credit: 10800 };
}
for (const rider of riders) {
  const wins = multiGrandTourWins.get(rider.name);
  if (!wins || wins < 2) continue;
  const floor = multiGrandTourFloor(wins);
  rider.aceAptitude = Math.max(Number(rider.aceAptitude), floor.aceAptitude);
  rider.credit = Math.max(Number(rider.credit), floor.credit);
  if (!String(rider.motif).includes("GT総合")) rider.motif = `GT総合${wins}勝、${rider.motif}`;
}

const creditBeforeAchievementFloor = new Map(riders.map((rider) => [rider.name, Number(rider.credit)]));
for (const rider of riders) {
  const floor = achievementCreditFloor(gtAchievementByName.get(rider.name), monumentAchievementByName.get(rider.name));
  rider.credit = Math.max(Number(rider.credit), floor);
}
const achievementCreditChanges = riders.flatMap((rider) => {
  const oldCredit = creditBeforeAchievementFloor.get(rider.name);
  if (Number(rider.credit) === oldCredit) return [];
  const gt = gtAchievementByName.get(rider.name);
  const monument = monumentAchievementByName.get(rider.name);
  return [{
    no: rider.no, name: rider.name, oldCredit, newCredit: Number(rider.credit),
    gtGc: gt.tour.gc + gt.giro.gc + gt.vuelta.gc,
    gtStages: gt.tour.stages + gt.giro.stages + gt.vuelta.stages,
    gtJerseys: gt.tour.points + gt.tour.mountains + gt.tour.young + gt.giro.points + gt.giro.mountains + gt.giro.young + gt.vuelta.points + gt.vuelta.mountains + gt.vuelta.young,
    monuments: monument.msr + monument.flanders + monument.roubaix + monument.liege + monument.lombardia,
  }];
});
riders.forEach((rider) => {
  if (rider.specialistRole && !rider.preferred.includes(rider.specialistRole)) rider.preferred = `${rider.preferred} / ${rider.specialistRole}`;
  rider.aptitudeTags = rider.aptitudeTags?.length ? rider.aptitudeTags : aptitudeTagsFor(rider);
});

if (riders.length !== 300 || new Set(riders.map((r) => r.name)).size !== 300) throw new Error("300名または氏名一意性の検証に失敗");
if (riders.filter((r) => r.preferred.includes("ステージハンター")).length < 20) throw new Error("ステージハンターが20名未満です");
if (riders.filter((r) => r.preferred.includes("逃げ屋")).length < 20) throw new Error("逃げ屋が20名未満です");

const workbook = Workbook.create();
const summary = workbook.worksheets.add("概要");
const list = workbook.worksheets.add("選手一覧");
const legacy = workbook.worksheets.add("レジェンド別枠");
const monumentSheet = workbook.worksheets.add("モニュメント実績");
const gtSheet = workbook.worksheets.add("GT実績");
for (const sheet of workbook.worksheets.items) sheet.showGridLines = false;

const navy = "#18324A", blue = "#2F6B8A", pale = "#EAF2F7", gold = "#D7A928", lightGold = "#FFF5D6", ink = "#20313F", line = "#CAD8E2";
const titleFormat = { fill: navy, font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
const headerFormat = { fill: blue, font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: line } };
const sectionFormat = { fill: pale, font: { bold: true, color: ink }, borders: { preset: "outside", style: "thin", color: line } };

summary.getRange("A1:F1").merge();
summary.getRange("A1").values = [["初期ロードレース選手モチーフ 300名 — 主脚質・副脚質＋適性タグ"]];
summary.getRange("A1:F1").format = titleFormat;
summary.getRange("A2:F2").merge();
summary.getRange("A2").values = [["主脚質を最も強く、副脚質を次点、適性タグを第3脚質ではない局面適性として分離します。"]];
summary.getRange("A2:F2").format = { fill: "#DCE8EF", font: { color: ink }, wrapText: true };
summary.getRange("A4:B4").values = [["検証項目", "値"]];
summary.getRange("D4:F4").values = [["主脚質", "人数", "設計上の意味"]];
summary.getRange("A4:B4").format = headerFormat;
summary.getRange("D4:F4").format = headerFormat;
summary.getRange("A5:A12").values = [["総人数"], ["主脚質数"], ["ステージハンター適性"], ["逃げ屋適性"], ["日本人モチーフ"], ["エース適性80以上"], ["アシスト適性80以上"], ["平均仮Credit"]];
summary.getRange("B5:B12").formulas = [["=COUNTA('選手一覧'!$B$5:$B$304)"], ["=COUNTA(D5:D10)"], ["=COUNTIF('選手一覧'!$J$5:$J$304,\"ステージハンター\")"], ["=COUNTIF('選手一覧'!$J$5:$J$304,\"逃げ屋\")"], ["=COUNTIF('選手一覧'!$C$5:$C$304,\"日本\")"], ["=COUNTIF('選手一覧'!$G$5:$G$304,\">=80\")"], ["=COUNTIF('選手一覧'!$H$5:$H$304,\">=80\")"], ["=AVERAGE('選手一覧'!$L$5:$L$304)"]];
summary.getRange("A5:B12").format = { borders: { preset: "inside", style: "thin", color: line } };
summary.getRange("B5:B11").format.numberFormat = "#,##0";
summary.getRange("B12").format.numberFormat = "#,##0.0";
const meanings = {
  "総合型": "長期総合、登坂、TT、日ごとの回復", "スプリンター": "平坦の最高速、位置取り、発射台連携", "クライマー": "長い登坂、山岳耐久、軽量性",
  "パンチャー": "短い急坂、反復加速、丘陵決着", "クラシック型": "石畳、横風、位置取り、悪天候", "TT・ルーラー型": "巡航、単独走、集団牽引、隊列維持",
};
summary.getRange("D5:D10").values = archetypes.map((x) => [x]);
summary.getRange("E5:E10").formulas = archetypes.map((_, i) => [`=COUNTIF('選手一覧'!$E$5:$E$304,D${i + 5})`]);
summary.getRange("F5:F10").values = archetypes.map((x) => [meanings[x]]);
summary.getRange("D5:F10").format = { borders: { preset: "inside", style: "thin", color: line }, wrapText: true };
summary.getRange("A15:F15").merge(); summary.getRange("A15").values = [["主脚質・副脚質＋適性タグのルール"]]; summary.getRange("A15:F15").format = sectionFormat;
summary.getRange("A16:B23").values = [
  ["選手固有", "主脚質 / 副脚質 / 適性タグ（最大3つ） / エース適性 / アシスト適性"],
  ["レース役割", "当日エース / 副エース / アシスト / ロードキャプテン / リードアウト / ステージハンター / 逃げ屋"],
  ["8人編成", "エース候補2名＋支援役割6名を基本形。支援役割は固定身分ではなく当日の任務"],
  ["役割変更", "コース、体調、疲労、健康度、年間目標により同じ選手の担当を変更可能"],
  ["適性値", "0〜100。高いほどその任務で能力と固有パッシブを発揮しやすい"],
  ["適性タグ", "第3脚質ではなく局面適性。最大3つ。主副脚質の人数集計には含めない"],
  ["年俸上限", "通常42,000 / 上位45,000 / 最高峰48,000 Cr"],
  ["日本人", "Fumiyuki Beppu / Yukiya Arashiro モチーフ"],
];
summary.getRange("A16:B23").format = { borders: { preset: "inside", style: "thin", color: line }, wrapText: true };
summary.getRange("A25:F25").merge(); summary.getRange("A25").values = [["参考情報"]]; summary.getRange("A25:F25").format = sectionFormat;
summary.getRange("A26:B29").values = [["項目", "URL"], ["UCI 世界選手権史", "https://www.uci.org/article/the-history-and-the-records-of-road-s-rainbow-jersey/3Qvg8Z7qJQeieqj8EYNoCd"], ["Tour de France 公式", "https://www.letour.fr/en/"], ["Giro d’Italia 公式", "https://www.giroditalia.it/en/"]];
summary.getRange("A26:B26").format = headerFormat;
summary.getRange("A27:B29").format = { borders: { preset: "inside", style: "thin", color: line }, wrapText: true };
summary.getRange("A31:F31").merge(); summary.getRange("A31").values = [["Credit適正化検証"]]; summary.getRange("A31:F31").format = sectionFormat;
summary.getRange("A32:A41").values = [["最高Credit"], ["最高額選手"], ["中央値"], ["通常レース上限"], ["上位レース上限"], ["最高峰レース上限"], ["最高額の通常上限比率"], ["最高額の最高峰上限比率"], ["次点との差"], ["検証判定"]];
summary.getRange("B32:B40").formulas = [["=MAX('選手一覧'!$L$5:$L$304)"], ["=INDEX('選手一覧'!$B$5:$B$304,MATCH(B32,'選手一覧'!$L$5:$L$304,0))"], ["=MEDIAN('選手一覧'!$L$5:$L$304)"], ["=42000"], ["=45000"], ["=48000"], ["=B32/B35"], ["=B32/B37"], ["=B32-LARGE('選手一覧'!$L$5:$L$304,2)"]];
summary.getRange("B41").values = [["15,000 Cr＋13,000 Crを同時採用すると残り6枠は20,000 Cr。二枚看板と支援層の配分が重要"]];
summary.getRange("D32:F32").values = [["価格帯", "人数", "設計意図"]]; summary.getRange("D32:F32").format = headerFormat;
summary.getRange("D33:D38").values = [["15,000 Cr"], ["12,000–14,999 Cr"], ["9,000–11,999 Cr"], ["6,000–8,999 Cr"], ["3,000–5,999 Cr"], ["3,000 Cr未満"]];
summary.getRange("E33:E38").formulas = [["=COUNTIF('選手一覧'!$L$5:$L$304,15000)"], ["=COUNTIFS('選手一覧'!$L$5:$L$304,\">=12000\",'選手一覧'!$L$5:$L$304,\"<15000\")"], ["=COUNTIFS('選手一覧'!$L$5:$L$304,\">=9000\",'選手一覧'!$L$5:$L$304,\"<12000\")"], ["=COUNTIFS('選手一覧'!$L$5:$L$304,\">=6000\",'選手一覧'!$L$5:$L$304,\"<9000\")"], ["=COUNTIFS('選手一覧'!$L$5:$L$304,\">=3000\",'選手一覧'!$L$5:$L$304,\"<6000\")"], ["=COUNTIF('選手一覧'!$L$5:$L$304,\"<3000\")"]];
summary.getRange("F33:F38").values = [["世代最強級の例外枠"], ["歴代級・最上位エース"], ["トップエース"], ["主力・専門カード"], ["中核・アシスト"], ["低コスト編成枠"]];
summary.getRange("A32:B41").format = { borders: { preset: "inside", style: "thin", color: line }, wrapText: true };
summary.getRange("D33:F38").format = { borders: { preset: "inside", style: "thin", color: line }, wrapText: true };
summary.getRange("B32:B37").format.numberFormat = "#,##0 \"Cr\""; summary.getRange("B38:B39").format.numberFormat = "0.0%"; summary.getRange("B40").format.numberFormat = "#,##0 \"Cr\"";
summary.getRange("A1:F41").format.font.name = "Yu Gothic";
summary.getRange("A1:F41").format.rowHeight = 22;
summary.getRange("A1:F2").format.rowHeight = 34;
summary.getRange("A16:F23").format.rowHeight = 40;
summary.getRange("A27:F29").format.rowHeight = 34;
summary.getRange("A41:F41").format.rowHeight = 40;
summary.getRange("A:A").format.columnWidth = 23; summary.getRange("B:B").format.columnWidth = 48; summary.getRange("C:C").format.columnWidth = 3; summary.getRange("D:D").format.columnWidth = 22; summary.getRange("E:E").format.columnWidth = 10; summary.getRange("F:F").format.columnWidth = 45;
summary.freezePanes.freezeRows(4);

list.getRange("A1:N1").merge(); list.getRange("A1").values = [["初期選手300名 — 主脚質・副脚質 × 適性タグ"]]; list.getRange("A1:N1").format = titleFormat;
list.getRange("A2:N2").merge(); list.getRange("A2").values = [["主脚質は最も強く、副脚質は対応範囲を広げ、適性タグは第3脚質にせず局面の得意を最大3つまで表します。"]]; list.getRange("A2:N2").format = { fill: "#DCE8EF", font: { color: ink }, wrapText: true };
const headers = ["No.", "実在選手名", "国・地域", "時代区分", "主脚質", "副脚質", "エース適性", "アシスト適性", "得意役割", "専門役割", "適性タグ", "仮Credit", "主なモチーフ", "人物確認URL"];
list.getRange("A4:N4").values = [headers]; list.getRange("A4:N4").format = headerFormat;
list.getRange("A5:N304").values = riders.map((r) => [r.no, r.name, r.country, r.era, r.primary, r.secondary, r.aceAptitude, r.supportAptitude, r.preferred.replace(/ \/ (ステージハンター|逃げ屋)/g, ""), r.specialistRole || (stageHunters.has(r.name) ? "ステージハンター" : breakawayRiders.has(r.name) ? "逃げ屋" : ""), r.aptitudeTags.join(" / "), r.credit, r.motif, r.url]);
list.getRange("A5:N304").format = { font: { name: "Yu Gothic", color: ink }, verticalAlignment: "center", borders: { insideHorizontal: { style: "thin", color: "#E2E9EE" } } };
list.getRange("G5:H304").format.numberFormat = "0"; list.getRange("L5:L304").format.numberFormat = "#,##0 \"Cr\"";
list.getRange("E5:F304").dataValidation = { rule: { type: "list", values: archetypes } };
list.getRange("G5:H304").conditionalFormats.add("colorScale", { colors: ["#FCE8E6", "#FFF4CC", "#D9EAD3"], thresholds: ["min", "50%", "max"] });
list.getRange("L5:L304").conditionalFormats.add("cellIs", { operator: "equal", formula: 15000, format: { fill: "#F4D35E", font: { bold: true, color: "#5B3A00" } } });
list.getRange("A1:N304").format.rowHeight = 22; list.getRange("A1:N2").format.rowHeight = 34; list.getRange("A4:N4").format.rowHeight = 32;
const widths = [7, 24, 14, 11, 17, 17, 12, 14, 28, 20, 30, 13, 48, 62]; widths.forEach((w, i) => list.getRangeByIndexes(0, i, 304, 1).format.columnWidth = w);
list.getRange("I5:K304").format.wrapText = true; list.getRange("M5:N304").format.wrapText = true;
list.freezePanes.freezeRows(4); list.freezePanes.freezeColumns(2);
list.tables.add("A4:N304", true, "RiderMotifTable").style = "TableStyleMedium2";

legacy.getRange("A1:K1").merge(); legacy.getRange("A1").values = [["後日登場候補 — 歴史・クラシック選手 11名"]]; legacy.getRange("A1:K1").format = titleFormat;
legacy.getRange("A2:K2").merge(); legacy.getRange("A2").values = [["初期300名には含めず、後日登場させる別枠。主脚質・副脚質・適性タグの構造は本編と共通です。"]]; legacy.getRange("A2:K2").format = { fill: "#DCE8EF", font: { color: ink }, wrapText: true };
legacy.getRange("A4:K4").values = [["No.", "実在選手名", "国・地域", "時代区分", "主脚質", "副脚質", "エース適性", "アシスト適性", "適性タグ", "仮Credit", "人物確認URL"]]; legacy.getRange("A4:K4").format = headerFormat;
legacy.getRange("A5:K15").values = legacyRows.map((row) => {
  let rider;
  if (legacyIsTwoAxis) {
    if (legacyHasAptitudeTags) {
      const [no, name, country, era, primary, secondary, aceAptitude, supportAptitude, _tags, credit, url] = row;
      rider = { no, name, country, era, primary, secondary, aceAptitude, supportAptitude, credit, url };
    } else {
      const [no, name, country, era, primary, secondary, aceAptitude, supportAptitude, credit, url] = row;
      rider = { no, name, country, era, primary, secondary, aceAptitude, supportAptitude, credit, url };
    }
  } else {
    const [no, name, country, era, oldRole, credit, _policy, url] = row;
    const primary = primaryFromRole(name, oldRole);
    rider = { no, name, country, era, primary, secondary: secondaryFrom(primary, name, oldRole), aceAptitude: 97 - (Number(no) % 4), supportAptitude: 65 + (Number(no) % 5), credit, url };
  }
  return [rider.no, rider.name, rider.country, rider.era, rider.primary, rider.secondary, rider.aceAptitude, rider.supportAptitude, aptitudeTagsFor(rider).join(" / "), rider.credit, rider.url];
});
legacy.getRange("A5:K15").format = { font: { name: "Yu Gothic", color: ink }, borders: { insideHorizontal: { style: "thin", color: "#E2E9EE" } } };
legacy.getRange("G5:H15").format.numberFormat = "0"; legacy.getRange("J5:J15").format.numberFormat = "#,##0 \"Cr\"";
const legacyWidths = [7, 25, 14, 11, 17, 17, 12, 14, 30, 13, 64]; legacyWidths.forEach((w, i) => legacy.getRangeByIndexes(0, i, 15, 1).format.columnWidth = w);
legacy.getRange("A1:K15").format.rowHeight = 22; legacy.getRange("A1:K2").format.rowHeight = 34; legacy.getRange("A4:K4").format.rowHeight = 32;
legacy.getRange("I5:K15").format.wrapText = true; legacy.getRange("A5:K15").format.rowHeight = 34;
legacy.freezePanes.freezeRows(4); legacy.tables.add("A4:K15", true, "LegacyRiderTable").style = "TableStyleMedium2";
monumentSheet.getRange("A1:H1").merge();
monumentSheet.getRange("A1").values = [["五大モニュメント勝利数 — 全300名"]];
monumentSheet.getRange("A1:H1").format = titleFormat;
monumentSheet.getRange("A2:H2").merge();
monumentSheet.getRange("A2").values = [["★表示用の元数値。春の4大会は2026年終了、イル・ロンバルディアは2025年終了時点。"]];
monumentSheet.getRange("A2:H2").format = { fill: "#DCE8EF", font: { color: ink }, wrapText: true };
monumentSheet.getRange("A4:H4").values = [["No.", "実在選手名", "ミラノ〜サンレモ", "ロンド", "パリ〜ルーベ", "リエージュ", "ロンバルディア", "合計"]];
monumentSheet.getRange("A4:H4").format = headerFormat;
monumentSheet.getRange("A5:H304").values = riders.map((rider) => {
  const m = monumentAchievementByName.get(rider.name) || { msr: 0, flanders: 0, roubaix: 0, liege: 0, lombardia: 0 };
  return [rider.no, rider.name, m.msr, m.flanders, m.roubaix, m.liege, m.lombardia, m.msr + m.flanders + m.roubaix + m.liege + m.lombardia];
});
monumentSheet.getRange("A5:H304").format = { font: { name: "Yu Gothic", color: ink }, verticalAlignment: "center", borders: { insideHorizontal: { style: "thin", color: "#E2E9EE" } } };
monumentSheet.getRange("A5:A304").format.numberFormat = "0";
monumentSheet.getRange("C5:H304").format.numberFormat = "0";
[7, 27, 18, 12, 16, 14, 16, 10].forEach((w, i) => monumentSheet.getRangeByIndexes(0, i, 304, 1).format.columnWidth = w);
monumentSheet.getRange("A1:H304").format.rowHeight = 22;
monumentSheet.getRange("A1:H2").format.rowHeight = 34;
monumentSheet.getRange("A4:H4").format.rowHeight = 32;
monumentSheet.freezePanes.freezeRows(4);
monumentSheet.freezePanes.freezeColumns(2);
monumentSheet.tables.add("A4:H304", true, "MonumentAchievementTable").style = "TableStyleMedium2";

gtSheet.getRange("A1:Q1").merge();
gtSheet.getRange("A1").values = [["グランツール実績 — 全300名"]];
gtSheet.getRange("A1:Q1").format = titleFormat;
gtSheet.getRange("A2:Q2").merge();
gtSheet.getRange("A2").values = [["総合・個人ステージ勝利・最終ポイント賞・最終山岳賞・最終新人賞。ツール2025、ジロ2026、ブエルタ2025終了時点。TTTは個人勝利に含めない。"]];
gtSheet.getRange("A2:Q2").format = { fill: "#DCE8EF", font: { color: ink }, wrapText: true };
gtSheet.getRange("A4:Q4").values = [["No.", "実在選手名", "Tour総合", "Tourステージ", "Tourポイント", "Tour山岳", "Tour新人", "Giro総合", "Giroステージ", "Giroポイント", "Giro山岳", "Giro新人", "Vuelta総合", "Vueltaステージ", "Vueltaポイント", "Vuelta山岳", "Vuelta新人"]];
gtSheet.getRange("A4:Q4").format = headerFormat;
gtSheet.getRange("A5:Q304").values = riders.map((rider) => {
  const g = gtAchievementByName.get(rider.name);
  return [rider.no, rider.name, g.tour.gc, g.tour.stages, g.tour.points, g.tour.mountains, g.tour.young, g.giro.gc, g.giro.stages, g.giro.points, g.giro.mountains, g.giro.young, g.vuelta.gc, g.vuelta.stages, g.vuelta.points, g.vuelta.mountains, g.vuelta.young];
});
gtSheet.getRange("A5:Q304").format = { font: { name: "Yu Gothic", color: ink }, verticalAlignment: "center", borders: { insideHorizontal: { style: "thin", color: "#E2E9EE" } } };
gtSheet.getRange("A5:A304").format.numberFormat = "0";
gtSheet.getRange("C5:Q304").format.numberFormat = "0";
[7, 27, 11, 13, 13, 11, 11, 11, 13, 13, 11, 11, 12, 14, 14, 12, 12].forEach((w, i) => gtSheet.getRangeByIndexes(0, i, 304, 1).format.columnWidth = w);
gtSheet.getRange("A1:Q304").format.rowHeight = 22;
gtSheet.getRange("A1:Q2").format.rowHeight = 38;
gtSheet.getRange("A4:Q4").format.rowHeight = 38;
gtSheet.freezePanes.freezeRows(4);
gtSheet.freezePanes.freezeColumns(2);
gtSheet.tables.add("A4:Q304", true, "GrandTourAchievementTable").style = "TableStyleMedium2";
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(workbookPath);

const roleOrder = ["当日エース", "副エース", "アシスト", "ロードキャプテン", "リードアウト", "ステージハンター", "逃げ屋"];
const counts = Object.fromEntries(archetypes.map((a) => [a, riders.filter((r) => r.primary === a).length]));
let md = `# 初期ロードレース選手モチーフ300名一覧（近代・現代）\n\n> 初期300名から歴史・クラシック選手を除外済み。ゲーム本編では全員を架空名・架空プロフィールへ変換する。仮Creditはゲーム内編成コストであり、現実の年俸・市場価値ではない。\n\n## 分類方針\n\n- 選手固有: 主脚質 / 副脚質 / 適性タグ（最大3つ） / エース適性 / アシスト適性\n- レースごとの役割: ${roleOrder.join(" / ")}\n- 固定の「勝利担当」「アシスト系」分類は使用しない\n- 8人編成はエース候補2名＋支援役割6名を基本形とする\n- Credit上限: 通常レース42,000Cr / 上位レース45,000Cr / 最高峰レース48,000Cr\n- 最高額: Tadej Pogacarモチーフ15,000Cr（最高峰枠の31.3%、残り7枠33,000Cr）\n- 次点: Mathieu van der Poelモチーフ13,000Cr（モニュメント8勝の最上位クラシック枠）\n- ステージハンター適性: ${riders.filter((r) => r.preferred.includes("ステージハンター")).length}名\n- 逃げ屋適性: ${riders.filter((r) => r.preferred.includes("逃げ屋")).length}名\n- 歴史・クラシック選手: 0名（別枠管理）\n- 日本人モチーフ: Fumiyuki Beppu / Yukiya Arashiro\n\n## 主脚質の人数\n\n| 主脚質 | 人数 |\n|---|---:|\n${archetypes.map((a) => `| ${a} | ${counts[a]} |`).join("\n")}\n| 合計 | 300 |\n\n## 専門役割\n\n| 専門役割 | 人数 | 対象選手 |\n|---|---:|---|\n| ステージハンター | ${riders.filter((r) => r.preferred.includes("ステージハンター")).length} | ${riders.filter((r) => r.preferred.includes("ステージハンター")).map((r) => r.name).join(" / ")} |\n| 逃げ屋 | ${riders.filter((r) => r.preferred.includes("逃げ屋")).length} | ${riders.filter((r) => r.preferred.includes("逃げ屋")).map((r) => r.name).join(" / ")} |\n`;
md += "\n## Credit実績補正基準\n\n- 実績は加算せず、GT総合・GTステージ・最終各賞・モニュメントのうち最も高い最低価格だけを採用する。\n- 既存の脚質・役割評価による価格は下げず、実績に対して安すぎるカードのみ引き上げる。\n- モニュメント: 8勝以上13,000 / 7勝12,000 / 6勝11,500 / 5勝11,000 / 4勝10,500 / 3勝9,500 / 2勝8,500 Cr。\n- GT個人ステージ: 50勝以上11,000 / 35勝以上10,500 / 25勝以上10,000 / 15勝以上9,000 / 10勝以上8,200 Cr。\n- GT最終各賞: 8回以上10,500 / 5回以上9,500 / 3回以上8,500 Cr。GT総合1勝は8,500 Cr。複数回総合優勝は別表の高い基準を使う。\n";
md += `\n## Credit再査定変更一覧（${achievementCreditChanges.length}名）\n\n| 実在選手名 | 変更前 | 変更後 | GT総合 | GTステージ | GT最終各賞 | モニュメント |\n|---|---:|---:|---:|---:|---:|---:|\n${achievementCreditChanges.sort((a, b) => b.newCredit - a.newCredit || a.no - b.no).map((row) => `| ${row.name} | ${row.oldCredit.toLocaleString("ja-JP")} Cr | ${row.newCredit.toLocaleString("ja-JP")} Cr | ${row.gtGc} | ${row.gtStages} | ${row.gtJerseys} | ${row.monuments} |`).join("\n")}\n`;
md += "\n## 複数回グランツール総合優勝補正\n\n> ★1個を各大会の総合優勝1回として表示する。未勝利は—。勝利数は2026年ジロ終了時点で固定する。勝利回数に応じてエース適性とCreditの最低値を引き上げ、ポガチャル型のみ15,000Cr・エース適性99の別格枠を維持する。\n\n| 実在選手名 | ツール | ジロ | ブエルタ | 合計 | エース適性 | 仮Credit |\n|---|---:|---:|---:|---:|---:|---:|\n" + [...grandTourWinBreakdown.entries()].map(([name, wins]) => { const rider = riders.find((item) => item.name === name); const total = wins.tour + wins.giro + wins.vuelta; return "| " + name + " | " + grandTourStars(wins.tour) + " | " + grandTourStars(wins.giro) + " | " + grandTourStars(wins.vuelta) + " | " + total + " | " + rider.aceAptitude + " | " + Number(rider.credit).toLocaleString("ja-JP") + " Cr |"; }).join("\n") + "\n\n参考: https://www.giroditalia.it/en/palmares/ / https://www.letour.fr/en/history / https://www.lavuelta.es/en/history\n";

const statMark = (value) => value ? String(value) : "—";
const gtSummaryCell = (race) => "総" + statMark(race.gc) + " / St" + statMark(race.stages) + " / P" + statMark(race.points) + " / 山" + statMark(race.mountains) + " / 新" + statMark(race.young);
md += "\n## グランツール実績（全300名）\n\n> 表記は「総＝総合優勝、St＝個人ステージ勝利、P＝最終ポイント賞、山＝最終山岳賞、新＝最終新人賞」。途中着用日数とTTT勝利は含めない。ツールは2025年、ジロは2026年、ブエルタは2025年終了時点。\n\n| No. | 実在選手名 | ツール | ジロ | ブエルタ |\n|---:|---|---|---|---|\n" + riders.map((rider) => {
  const g = gtAchievementByName.get(rider.name);
  return "| " + rider.no + " | " + rider.name + " | " + gtSummaryCell(g.tour) + " | " + gtSummaryCell(g.giro) + " | " + gtSummaryCell(g.vuelta) + " |";
}).join("\n") + "\n\n公式参照: https://www.letour.fr/en/history / https://www.giroditalia.it/en/palmares/ / https://www.lavuelta.es/en/history\n";

md += "\n## モニュメント勝利数（全300名）\n\n> 五大モニュメントを対象とし、各大会1勝につき★1個、未勝利は—。春の4大会は2026年、イル・ロンバルディアは2025年終了時点。\n\n| No. | 実在選手名 | ミラノ〜サンレモ | ロンド | パリ〜ルーベ | リエージュ | ロンバルディア | 合計 |\n|---:|---|---:|---:|---:|---:|---:|---:|\n" + riders.map((rider) => {
  const m = monumentAchievementByName.get(rider.name);
  const total = m.msr + m.flanders + m.roubaix + m.liege + m.lombardia;
  return "| " + rider.no + " | " + rider.name + " | " + grandTourStars(m.msr) + " | " + grandTourStars(m.flanders) + " | " + grandTourStars(m.roubaix) + " | " + grandTourStars(m.liege) + " | " + grandTourStars(m.lombardia) + " | " + total + " |";
}).join("\n") + "\n\n公式参照: https://www.milanosanremo.it/en/roll-of-honour-milano-sanremo/ / https://www.rondevanvlaanderen.be/en/race/men-elite/history / https://www.paris-roubaix.fr/en/history / https://www.liege-bastogne-liege.be/fr/histoire / https://www.ilombardia.it/en/albo-oro/\n";
for (const archetype of archetypes) {
  const group = riders.filter((r) => r.primary === archetype);
  md += `\n## ${archetype}（${group.length}名）\n\n| No. | 実在選手名 | 国・地域 | 時代区分 | 副脚質 | エース適性 | アシスト適性 | 得意役割 | 適性タグ | 仮Credit |\n|---:|---|---|---|---|---:|---:|---|---|---:|\n`;
  md += group.map((r) => `| ${r.no} | ${r.name} | ${r.country} | ${r.era} | ${r.secondary} | ${r.aceAptitude} | ${r.supportAptitude} | ${r.preferred} | ${r.aptitudeTags.join(" / ")} | ${Number(r.credit).toLocaleString("en-US")} Cr |`).join("\n");
  md += "\n";
}
md += `\n## 検証\n\n- 総人数: ${riders.length}名\n- 氏名重複: ${riders.length - new Set(riders.map((r) => r.name)).size}名\n- ステージハンター: ${riders.filter((r) => r.preferred.includes("ステージハンター")).length}名\n- 逃げ屋: ${riders.filter((r) => r.preferred.includes("逃げ屋")).length}名\n`;
await fs.writeFile(`${workspace}/docs/rider_motif_300_list.md`, md, "utf8");
await fs.writeFile(`${workspace}/data/credit_recalibration_300.json`, JSON.stringify({ changes: achievementCreditChanges }, null, 2) + "\n", "utf8");

const inspect = await workbook.inspect({ kind: "table", range: "概要!A1:F41", include: "values,formulas", tableMaxRows: 45, tableMaxCols: 8, maxChars: 14000 });
await fs.writeFile(`${outputDir}two_axis_summary_inspect.ndjson`, inspect.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(`${outputDir}two_axis_formula_errors.ndjson`, errors.ndjson, "utf8");
for (const sheet of workbook.worksheets.items) {
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}after_${sheet.name}.png`, new Uint8Array(await preview.arrayBuffer()));
}
for (const [name, range] of [["選手一覧_上", "A1:N104"], ["選手一覧_中", "A105:N204"], ["選手一覧_下", "A205:N304"]]) {
  const preview = await workbook.render({ sheetName: "選手一覧", range, scale: 0.7, format: "png" });
  await fs.writeFile(`${outputDir}after_${name}.png`, new Uint8Array(await preview.arrayBuffer()));
}
console.log(JSON.stringify({ workbookPath, riders: riders.length, counts, stageHunters: riders.filter((r) => r.preferred.includes("ステージハンター")).length, breakawayRiders: riders.filter((r) => r.preferred.includes("逃げ屋")).length, creditChanges: achievementCreditChanges.length }));
