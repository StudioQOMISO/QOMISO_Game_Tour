import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const outputDir = path.join(root, "outputs", "019f7d3d-0c92-7fc3-ad6b-aa8b1d2aacd1");
const outputPath = path.join(outputDir, "QOMISO_Game_Tour_Card_Catalog.xlsx");

const readJson = async (relative) => JSON.parse(await fs.readFile(path.join(root, relative), "utf8"));
const signatures = await readJson("data/ace_signature_cards.json");
const eliteAssists = await readJson("data/elite_assist_cards.json");
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
overview.getRange("A5:A9").values = [["全カード定義"], ["固有勝負手"], ["高適性アシストカード"], ["役割共通カード"], ["高適性アシスト選手"]];
overview.getRange("B5").formulas = [["=COUNTA('カード一覧'!$I$5:$I$" + (4 + unifiedRows.length) + ")"]];
overview.getRange("B6").formulas = [["=COUNTA('固有勝負手'!$G$5:$G$" + (4 + signatures.length) + ")"]];
overview.getRange("B7").formulas = [["=COUNTA('高適性アシスト'!$H$5:$H$" + (4 + eliteAssists.reduce((sum, entry) => sum + entry.cards.length, 0)) + ")"]];
overview.getRange("B8").formulas = [["=COUNTA('役割共通'!$F$5:$F$" + (4 + roleTemplates.length) + ")"]];
overview.getRange("B9").formulas = [["=COUNTA('高適性アシスト'!$B$5:$B$" + (4 + eliteAssists.length) + ")"]];
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
overview.getRange("A5:B9").format = overview.getRange("D5:E10").format = { fill: colors.paleGray, font: { color: colors.ink }, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
overview.getRange("B5:B9").format.numberFormat = "#,##0";
overview.getRange("A12:B15").values = [["カード種別", "意味"], ["基本技", "コスト1・日常的な行動"], ["得意技", "コスト2・条件に合う強い行動"], ["勝負手", "コスト3・原則レース中1回"]];
overview.getRange("A12:B12").format = { fill: colors.blue, font: { bold: true, color: colors.white } };
overview.getRange("A13:B13").format.fill = colors.paleTeal;
overview.getRange("A14:B14").format.fill = colors.paleAmber;
overview.getRange("A15:B15").format.fill = colors.paleMagenta;
overview.getRange("A1:H1").format.rowHeight = 38;
overview.getRange("A2:H2").format.rowHeight = 32;
["A", "B", "D", "E"].forEach((col, i) => overview.getRange(col + "1:" + col + "15").format.columnWidth = [25, 24, 27, 30][i]);
overview.freezePanes.freezeRows(2);

const allSheet = workbook.worksheets.add("カード一覧");
const allMeta = styleDataSheet(
  allSheet,
  "カード一覧",
  "固有勝負手50枚、高適性アシスト43枚、役割共通20枚を一つの表で検索できます。",
  ["分類", "No.", "選手名", "二つ名・状態", "役割・適性", "枠", "コスト", "回数", "カード名", "説明", "対象", "根拠能力・役割"],
  unifiedRows,
  [16, 7, 25, 22, 24, 13, 9, 9, 27, 58, 16, 38],
  "AllCardsTable",
);
addSlotColors(allSheet, allSheet.getRange("F5:F" + allMeta.lastRow));
allSheet.getRange("B5:B" + allMeta.lastRow).format.numberFormat = "0";
allSheet.getRange("G5:H" + allMeta.lastRow).format.numberFormat = "0";

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
  "アシスト適性80以上の15名へ43枚を保証。非主エース13名には支援型勝負手があります。",
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
  "通常のアシスト選手は、当日の役割に対応する20種類の共通カードを使います。",
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
  ["アシスト", "高適性基準", rules.assistCardPolicy.eliteSupportAptitudeThreshold, "以上"],
  ["アシスト", "主エース兼任の保証枚数", rules.assistCardPolicy.primaryAceGuaranteedAssistCards, "基本技＋得意技"],
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
for (const sheetName of ["概要", "カード一覧", "固有勝負手", "高適性アシスト", "役割共通", "カードルール"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheetName.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(path.join(outputDir, "preview_" + safeName + ".png"), new Uint8Array(await preview.arrayBuffer()));
}

const inspectSummary = await workbook.inspect({
  kind: "table",
  range: "概要!A1:H15",
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
  sheets: 6,
  unifiedCards: unifiedRows.length,
  signatureCards: signatures.length,
  eliteAssistCards: eliteRows.length,
  roleTemplates: roleRows.length,
}, null, 2));
