import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const outputDir = path.join(root, "outputs", "019f7d3d-0c92-7fc3-ad6b-aa8b1d2aacd1");
const outputPath = path.join(outputDir, "QOMISO_Game_Tour_Card_Catalog.xlsx");

const readJson = async (relative) => JSON.parse(await fs.readFile(path.join(root, relative), "utf8"));
const signatures = await readJson("data/ace_signature_cards.json");
const eliteAssists = await readJson("data/elite_assist_cards.json");
const basicTemplates = await readJson("data/basic_card_templates.json");
const specialtyTemplates = await readJson("data/specialty_card_templates.json");
const genericDecisives = await readJson("data/generic_decisive_card_templates.json");
const roleTemplates = await readJson("data/assist_card_role_templates.json");
const rules = await readJson("data/card_system_rules.json");

const workbook = Workbook.create();
const colors = {
  navy: "#17365D",
  blue: "#2F75B5",
  paleBlue: "#D9EAF7",
  teal: "#008C95",
  paleTeal: "#DDEBF7",
  amber: "#C47F00",
  paleAmber: "#FFF2CC",
  magenta: "#A64D79",
  paleMagenta: "#F4CCCC",
  ink: "#1F2937",
  gray: "#667085",
  paleGray: "#F3F4F6",
  white: "#FFFFFF",
  line: "#D0D5DD",
};

const colLetter = (index) => {
  let n = index + 1;
  let result = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

function styleDataSheet(sheet, title, note, headers, rows, widths, tableName, freezeColumns = 2) {
  const lastCol = colLetter(headers.length - 1);
  const lastRow = 4 + rows.length;
  sheet.showGridLines = false;
  sheet.mergeCells("A1:" + lastCol + "1");
  sheet.mergeCells("A2:" + lastCol + "2");
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A2").values = [[note]];
  sheet.getRange("A1:" + lastCol + "1").format = {
    fill: colors.navy,
    font: { bold: true, color: colors.white, size: 16 },
    verticalAlignment: "center",
  };
  sheet.getRange("A2:" + lastCol + "2").format = {
    fill: colors.paleBlue,
    font: { color: colors.ink, size: 10 },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange("A4:" + lastCol + "4").values = [headers];
  sheet.getRange("A4:" + lastCol + "4").format = {
    fill: colors.blue,
    font: { bold: true, color: colors.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "doubleBottom", style: "thin", color: colors.navy },
  };
  if (rows.length) {
    sheet.getRange("A5:" + lastCol + lastRow).values = rows;
    sheet.getRange("A5:" + lastCol + lastRow).format = {
      font: { color: colors.ink, size: 10 },
      verticalAlignment: "top",
      wrapText: true,
      borders: { insideHorizontal: { style: "thin", color: colors.line } },
    };
    const table = sheet.tables.add("A4:" + lastCol + lastRow, true, tableName);
    table.style = "TableStyleMedium2";
    table.showBandedRows = true;
    table.showFilterButton = true;
  }
  sheet.getRange("A1:" + lastCol + "1").format.rowHeight = 34;
  sheet.getRange("A2:" + lastCol + "2").format.rowHeight = 34;
  sheet.getRange("A4:" + lastCol + "4").format.rowHeight = 30;
  if (rows.length) sheet.getRange("A5:" + lastCol + lastRow).format.rowHeight = 34;
  widths.forEach((width, index) => {
    sheet.getRange(colLetter(index) + "1:" + colLetter(index) + lastRow).format.columnWidth = width;
  });
  sheet.freezePanes.freezeRows(4);
  sheet.freezePanes.freezeColumns(freezeColumns);
  return { lastRow, lastCol };
}

function addSlotColors(sheet, range) {
  range.conditionalFormats.add("containsText", { text: "basic", format: { fill: colors.paleTeal, font: { color: colors.teal, bold: true } } });
  range.conditionalFormats.add("containsText", { text: "specialty", format: { fill: colors.paleAmber, font: { color: colors.amber, bold: true } } });
  range.conditionalFormats.add("containsText", { text: "decisive", format: { fill: colors.paleMagenta, font: { color: colors.magenta, bold: true } } });
}

const unifiedRows = [
  ...signatures.map((entry) => [
    "固有勝負手", entry.riderNo, entry.riderName, entry.riderTitle, entry.eligibility,
    entry.slot, entry.cost, entry.usageLimit, entry.name, entry.description, "本人", entry.basedOn.join(" / "),
  ]),
  ...eliteAssists.flatMap((entry) => entry.cards.map((item) => [
    "高適性アシスト", entry.riderNo, entry.riderName, entry.primaryAce ? "主エース兼任" : "",
    "アシスト適性 " + entry.supportAptitude, item.slot, item.cost, item.usageLimit,
    item.name, item.description, item.target, entry.basedOn.join(" / "),
  ])),
  ...basicTemplates.map((entry) => [
    "共通基本", "", "", "", entry.terrain + entry.role, entry.slot, entry.cost, "",
    entry.name, entry.description, entry.target, entry.abilities.join(" / "),
  ]),
  ...specialtyTemplates.map((entry) => [
    "共通得意技", "", "", "", entry.terrain + entry.role, entry.slot, entry.cost, "",
    entry.name, entry.description, entry.target, entry.abilities.join(" / "),
  ]),
  ...genericDecisives.map((entry) => [
    "汎用勝負手", "", "", "", entry.role, entry.slot, entry.cost, entry.usageLimit,
    entry.name, entry.description, entry.target, entry.baseSpecialties.join(" / ") + " | " + entry.abilities.join(" / "),
  ]),
  ...roleTemplates.map((entry) => [
    "役割共通", "", "", "", entry.role, entry.slot, entry.cost, "",
    entry.name, entry.description, entry.target, entry.abilities.join(" / "),
  ]),
];

const overview = workbook.worksheets.add("概要");
overview.showGridLines = false;
overview.mergeCells("A1:H1");
overview.mergeCells("A2:H2");
overview.getRange("A1").values = [["QOMISO Game Tour カードカタログ"]];
overview.getRange("A2").values = [["個人カード・アシストカード・共通役割カードを確認するための一覧。更新日 2026-07-20"]];
overview.getRange("A1:H1").format = { fill: colors.navy, font: { bold: true, color: colors.white, size: 18 }, verticalAlignment: "center" };
overview.getRange("A2:H2").format = { fill: colors.paleBlue, font: { color: colors.ink }, verticalAlignment: "center" };
overview.getRange("A4:B4").values = [["集計", "件数"]];
overview.getRange("A5:A11").values = [["全カード定義"], ["固有勝負手"], ["高適性アシストカード"], ["共通基本カード"], ["役割共通カード"], ["高適性アシスト選手"], ["汎用勝負手"]];
overview.getRange("B5").formulas = [["=COUNTA('カード一覧'!$I$5:$I$" + (4 + unifiedRows.length) + ")"]];
overview.getRange("B6").formulas = [["=COUNTA('固有勝負手'!$G$5:$G$" + (4 + signatures.length) + ")"]];
overview.getRange("B7").formulas = [["=COUNTA('高適性アシスト'!$H$5:$H$" + (4 + eliteAssists.reduce((sum, entry) => sum + entry.cards.length, 0)) + ")"]];
overview.getRange("B8").formulas = [["=COUNTA('基本カード'!$H$5:$H$" + (4 + basicTemplates.length + roleTemplates.filter((entry) => entry.slot === "basic").length) + ")"]];
overview.getRange("B9").formulas = [["=COUNTA('役割共通'!$F$5:$F$" + (4 + roleTemplates.length) + ")"]];
overview.getRange("B10").values = [[eliteAssists.length]];
overview.getRange("B11").formulas = [["=COUNTA('汎用勝負手'!$C$5:$C$" + (4 + genericDecisives.length) + ")"]];
overview.getRange("D4:E4").values = [["採用ルール", "設定"]];
overview.getRange("D5:E10").values = [
  ["個人カード", "1選手6枚"],
  ["内訳", "基本3／得意2／勝負手1"],
  ["チームカード", rules.teamCardDeckSize + "枚"],
  ["1ターン作戦コスト", rules.turnBudget],
  ["高適性基準", "アシスト適性 " + rules.assistCardPolicy.eliteSupportAptitudeThreshold + "以上"],
  ["勝負手", "コスト3／原則1回"],
];
overview.getRange("A4:B4").format = overview.getRange("D4:E4").format = { fill: colors.blue, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };
overview.getRange("A5:B11").format = overview.getRange("D5:E10").format = { fill: colors.paleGray, font: { color: colors.ink }, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
overview.getRange("B5:B11").format.numberFormat = "#,##0";
overview.getRange("A13:B16").values = [["カード種別", "意味"], ["基本技", "コスト1・日常的な行動"], ["得意技", "コスト2・条件に合う強い行動"], ["勝負手", "コスト3・原則レース中1回"]];
overview.getRange("A13:B13").format = { fill: colors.blue, font: { bold: true, color: colors.white } };
overview.getRange("A14:B14").format.fill = colors.paleTeal;
overview.getRange("A15:B15").format.fill = colors.paleAmber;
overview.getRange("A16:B16").format.fill = colors.paleMagenta;
overview.getRange("A1:H1").format.rowHeight = 38;
overview.getRange("A2:H2").format.rowHeight = 32;
["A", "B", "D", "E"].forEach((col, i) => overview.getRange(col + "1:" + col + "16").format.columnWidth = [25, 24, 27, 30][i]);
overview.freezePanes.freezeRows(2);

const allSheet = workbook.worksheets.add("カード一覧");
const allMeta = styleDataSheet(
  allSheet,
  "カード一覧",
  "固有勝負手50枚、汎用勝負手24枚、高適性アシスト勝負手13枚、共通基本28枚、共通得意技16枚、役割共通22枚を検索できます。",
  ["分類", "No.", "選手名", "二つ名・状態", "役割・適性", "枠", "コスト", "回数", "カード名", "説明", "対象", "根拠能力・役割"],
  unifiedRows,
  [16, 7, 25, 22, 24, 13, 9, 9, 27, 58, 16, 38],
  "AllCardsTable",
);
addSlotColors(allSheet, allSheet.getRange("F5:F" + allMeta.lastRow));
allSheet.getRange("B5:B" + allMeta.lastRow).format.numberFormat = "0";
allSheet.getRange("G5:H" + allMeta.lastRow).format.numberFormat = "0";
const slotViewHeaders = ["分類", "No.", "選手名", "二つ名・状態", "役割・適性", "コスト", "回数", "カード名", "説明", "対象", "根拠能力・役割"];
const slotViewWidths = [16, 7, 25, 22, 24, 9, 9, 27, 58, 16, 38];
const slotViewRows = (slot) => unifiedRows
  .filter((row) => row[5] === slot)
  .map((row) => [row[0], row[1], row[2], row[3], row[4], row[6], row[7], row[8], row[9], row[10], row[11]]);

const basicRows = slotViewRows("basic");
const basicSheet = workbook.worksheets.add("基本カード");
const basicMeta = styleDataSheet(
  basicSheet,
  "基本カード",
  "地形別24枚に、先頭交代・ペース調整・高速コーナリング・安全誘導の役割別4枚を加えた共通基本技。全28枚です。",
  slotViewHeaders,
  basicRows,
  slotViewWidths,
  "BasicCardsTable",
);
basicSheet.getRange("B5:B" + basicMeta.lastRow).format.numberFormat = "0";
basicSheet.getRange("F5:G" + basicMeta.lastRow).format.numberFormat = "0";
basicSheet.getRange("H5:H" + basicMeta.lastRow).format.fill = colors.paleTeal;

const specialtyRows = slotViewRows("specialty");
const specialtySheet = workbook.worksheets.add("得意技カード");
const specialtyMeta = styleDataSheet(
  specialtySheet,
  "得意技カード",
  "選手固有にしないコスト2の得意技。地形別共通16枚と役割共通18枚の全34枚です。",
  slotViewHeaders,
  specialtyRows,
  slotViewWidths,
  "SpecialtyCardsTable",
);
specialtySheet.getRange("B5:B" + specialtyMeta.lastRow).format.numberFormat = "0";
specialtySheet.getRange("F5:G" + specialtyMeta.lastRow).format.numberFormat = "0";
specialtySheet.getRange("H5:H" + specialtyMeta.lastRow).format.fill = colors.paleAmber;

const genericRows = genericDecisives.map((entry) => [
  entry.roleType === "ace" ? "エース" : "アシスト",
  entry.role,
  entry.name,
  entry.cost,
  entry.usageLimit,
  entry.description,
  entry.target,
  entry.baseSpecialties.join(" / "),
  entry.abilities.join(" / "),
]);
const genericSheet = workbook.worksheets.add("汎用勝負手");
const genericMeta = styleDataSheet(
  genericSheet,
  "汎用勝負手",
  "得意技から発展する共通の勝負手。エース用12枚・アシスト用12枚、全24枚。コスト3、レース中1回です。",
  ["区分", "系統", "勝負手", "コスト", "回数", "説明", "対象", "発展元カード", "参照能力"],
  genericRows,
  [13, 24, 28, 9, 9, 60, 18, 40, 38],
  "GenericDecisiveTable",
  2,
);
genericSheet.getRange("D5:E" + genericMeta.lastRow).format.numberFormat = "0";
genericSheet.getRange("C5:C" + genericMeta.lastRow).format.fill = colors.paleMagenta;

const signatureRows = signatures.map((entry) => [
  entry.riderNo, entry.riderName, entry.riderTitle, entry.eligibility,
  entry.primaryArchetype, entry.secondaryArchetype, entry.name, entry.cost,
  entry.usageLimit, entry.description, entry.basedOn.join(" / "),
]);
const signatureSheet = workbook.worksheets.add("固有勝負手");
const signatureMeta = styleDataSheet(
  signatureSheet,
  "エース固有勝負手",
  "主役割を持つ現役エース50名。二つ名と固有勝負手は全件一意です。",
  ["No.", "選手名", "二つ名", "エース役割", "主脚質", "副脚質", "勝負手", "コスト", "回数", "説明", "根拠"],
  signatureRows,
  [7, 25, 24, 18, 16, 16, 30, 9, 9, 58, 38],
  "AceSignatureTable",
);
signatureSheet.getRange("A5:A" + signatureMeta.lastRow).format.numberFormat = "0";
signatureSheet.getRange("H5:I" + signatureMeta.lastRow).format.numberFormat = "0";
signatureSheet.getRange("G5:G" + signatureMeta.lastRow).format.fill = colors.paleMagenta;

const eliteRows = eliteAssists.flatMap((entry) => entry.cards.map((item) => [
  entry.riderNo, entry.riderName, entry.supportAptitude, entry.primaryAce ? "主エース兼任" : "アシスト",
  item.slot, item.cost, item.usageLimit, item.name, item.description, item.target,
  entry.linkedAceDecisiveCard || "", entry.basedOn.join(" / "),
]));
const eliteSheet = workbook.worksheets.add("高適性アシスト");
const eliteMeta = styleDataSheet(
  eliteSheet,
  "高適性アシストカード",
  "アシスト適性80以上の15名は共通得意技を使用し、非主エース13名だけに固有の支援型勝負手があります。",
  ["No.", "選手名", "アシスト適性", "区分", "枠", "コスト", "回数", "カード名", "説明", "対象", "既存固有勝負手", "根拠"],
  eliteRows,
  [7, 26, 14, 16, 13, 9, 9, 28, 60, 16, 28, 40],
  "EliteAssistTable",
);
addSlotColors(eliteSheet, eliteSheet.getRange("E5:E" + eliteMeta.lastRow));
eliteSheet.getRange("A5:A" + eliteMeta.lastRow).format.numberFormat = "0";
eliteSheet.getRange("C5:C" + eliteMeta.lastRow).format.numberFormat = "0";
eliteSheet.getRange("F5:G" + eliteMeta.lastRow).format.numberFormat = "0";

const roleRows = roleTemplates.map((entry) => [
  entry.roleId, entry.role, entry.slot, entry.cost, entry.name, entry.description, entry.target, entry.abilities.join(" / "),
]);
const roleSheet = workbook.worksheets.add("役割共通");
const roleMeta = styleDataSheet(
  roleSheet,
  "役割別・共通アシストカード",
  "通常の選手が使う役割共通カード。基本技4枚、得意技18枚の全22枚です。",
  ["役割ID", "役割", "枠", "コスト", "カード名", "説明", "対象", "参照能力"],
  roleRows,
  [28, 24, 13, 9, 28, 60, 18, 38],
  "AssistRoleTemplateTable",
);
addSlotColors(roleSheet, roleSheet.getRange("C5:C" + roleMeta.lastRow));
roleSheet.getRange("D5:D" + roleMeta.lastRow).format.numberFormat = "0";

const ruleRows = [
  ["ターン", "作戦コスト", rules.turnBudget, "未使用分は持ち越さない"],
  ["ターン", "同一選手の最大カード", rules.maxIndividualCardsPerRiderPerTurn, "1ターン1枚"],
  ["ターン", "チームカード上限", rules.maxTeamCardsPerTurn, "1ターン最大1枚"],
  ["デッキ", "チームカード枚数", rules.teamCardDeckSize, "チームカーから表示"],
  ...rules.cardSlots.map((slot) => ["個人カード", slot.name + "の枚数", slot.countPerRider, "コスト " + slot.cost + "／" + slot.usage]),
  ["個人カード", "基本技の共通テンプレート", rules.assistCardPolicy.sharedBasicCardTemplates, "地形別24枚＋役割別4枚"],
  ["個人カード", "得意技の共通テンプレート", rules.assistCardPolicy.sharedSpecialtyCardTemplates, "4地形×2役割×各2枚"],
  ["個人カード", "汎用勝負手テンプレート", rules.assistCardPolicy.genericDecisiveCardTemplates, "エース12枚＋アシスト12枚"],
  ["アシスト", "高適性基準", rules.assistCardPolicy.eliteSupportAptitudeThreshold, "以上"],
  ["アシスト", "主エース兼任の保証枚数", rules.assistCardPolicy.primaryAceGuaranteedAssistCards, "得意技（基本技は共通）"],
  ["アシスト", "非主エースの保証枚数", rules.assistCardPolicy.nonPrimaryAceGuaranteedAssistCards, "支援型勝負手を含む"],
  ["アシスト", "役割共通テンプレート", rules.assistCardPolicy.sharedAssistRoleTemplates, "通常アシスト用"],
];
const ruleSheet = workbook.worksheets.add("カードルール");
const ruleMeta = styleDataSheet(
  ruleSheet,
  "カードシステム設定",
  "data/card_system_rules.jsonを見やすく展開した設定表です。",
  ["区分", "設定", "値", "説明"],
  ruleRows,
  [18, 34, 16, 58],
  "CardRulesTable",
  1,
);
ruleSheet.getRange("C5:C" + ruleMeta.lastRow).format.numberFormat = "0";

await fs.mkdir(outputDir, { recursive: true });
for (const sheetName of ["概要", "カード一覧", "基本カード", "得意技カード", "汎用勝負手", "固有勝負手", "高適性アシスト", "役割共通", "カードルール"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheetName.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(path.join(outputDir, "preview_" + safeName + ".png"), new Uint8Array(await preview.arrayBuffer()));
}

const inspectSummary = await workbook.inspect({
  kind: "table",
  range: "概要!A1:H16",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 10,
});
await fs.writeFile(path.join(outputDir, "card_catalog_summary_inspect.ndjson"), inspectSummary.ndjson, "utf8");

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(path.join(outputDir, "card_catalog_formula_errors.ndjson"), errors.ndjson, "utf8");

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(JSON.stringify({
  outputPath,
  sheets: 9,
  basicCards: basicRows.length,
  specialtyCards: specialtyRows.length,
  unifiedCards: unifiedRows.length,
  signatureCards: signatures.length,
  eliteAssistCards: eliteRows.length,
  specialtyTemplates: specialtyTemplates.length,
  genericDecisiveCards: genericDecisives.length,
  basicTemplates: basicRows.length,
  roleTemplates: roleRows.length,
}, null, 2));
