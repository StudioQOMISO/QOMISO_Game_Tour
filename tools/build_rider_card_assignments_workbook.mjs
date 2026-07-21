import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const outputDir = path.join(root, "outputs", "019f7f47-ab6b-78c3-b21b-d2602f240962");
const outputPath = path.join(outputDir, "QOMISO_Game_Tour_Rider_Card_Assignments.xlsx");
const assignments = JSON.parse(await fs.readFile(path.join(root, "data", "rider_card_assignments.json"), "utf8"));

const workbook = Workbook.create();
const colors = { navy: "#17365D", blue: "#2F75B5", paleBlue: "#D9EAF7", teal: "#008C95", paleTeal: "#DDEBF7", amber: "#C47F00", paleAmber: "#FFF2CC", magenta: "#A64D79", paleMagenta: "#F4CCCC", ink: "#1F2937", gray: "#667085", paleGray: "#F3F4F6", white: "#FFFFFF", line: "#D0D5DD" };
const colLetter = (index) => { let n = index + 1, result = ""; while (n > 0) { const rem = (n - 1) % 26; result = String.fromCharCode(65 + rem) + result; n = Math.floor((n - 1) / 26); } return result; };
const rosterLabel = (file) => file.includes("01_") ? "現役" : file.includes("02_") ? "引退" : "区分保留";

function styleDataSheet(sheet, title, note, headers, rows, widths, tableName, freezeColumns = 3) {
  const lastCol = colLetter(headers.length - 1), lastRow = rows.length + 4;
  sheet.showGridLines = false;
  sheet.mergeCells(`A1:${lastCol}1`); sheet.mergeCells(`A2:${lastCol}2`);
  sheet.getRange("A1").values = [[title]]; sheet.getRange("A2").values = [[note]];
  sheet.getRange(`A1:${lastCol}1`).format = { fill: colors.navy, font: { bold: true, color: colors.white, size: 16 }, verticalAlignment: "center" };
  sheet.getRange(`A2:${lastCol}2`).format = { fill: colors.paleBlue, font: { color: colors.ink, size: 10 }, wrapText: true, verticalAlignment: "center" };
  sheet.getRange(`A4:${lastCol}4`).values = [headers];
  sheet.getRange(`A4:${lastCol}4`).format = { fill: colors.blue, font: { bold: true, color: colors.white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "doubleBottom", style: "thin", color: colors.navy } };
  if (rows.length) {
    sheet.getRange(`A5:${lastCol}${lastRow}`).values = rows;
    sheet.getRange(`A5:${lastCol}${lastRow}`).format = { font: { color: colors.ink, size: 9 }, verticalAlignment: "top", wrapText: true, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
    const table = sheet.tables.add(`A4:${lastCol}${lastRow}`, true, tableName); table.style = "TableStyleMedium2"; table.showBandedRows = true; table.showFilterButton = true;
  }
  sheet.getRange(`A1:${lastCol}1`).format.rowHeight = 34; sheet.getRange(`A2:${lastCol}2`).format.rowHeight = 34; sheet.getRange(`A4:${lastCol}4`).format.rowHeight = 30;
  if (rows.length) sheet.getRange(`A5:${lastCol}${lastRow}`).format.rowHeight = 40;
  widths.forEach((width, index) => { sheet.getRange(`${colLetter(index)}1:${colLetter(index)}${lastRow}`).format.columnWidth = width; });
  sheet.freezePanes.freezeRows(4); sheet.freezePanes.freezeColumns(freezeColumns);
  return { lastRow, lastCol };
}

const assignmentRows = assignments.map((entry) => [
  rosterLabel(entry.rosterFile), entry.riderNo, entry.riderName, entry.primaryArchetype, entry.secondaryArchetype, entry.roleType === "ace" ? "エース型" : "アシスト型", entry.roles.join(" / "),
  ...entry.basicCards.map((card) => card.name), ...entry.specialtyCards.map((card) => card.name), entry.decisiveCard.name, entry.decisiveCard.source, entry.assignmentBasis,
]);

const assignmentSheet = workbook.worksheets.add("全選手割当");
const assignmentMeta = styleDataSheet(assignmentSheet, "全選手カード割当", "能力15項目、主副脚質、役割3つ、固有枠を照合した固定6枚。基本3・得意2・勝負手1の順です。", ["区分", "No.", "選手名", "主脚質", "副脚質", "カード型", "役割（3つ）", "基本1", "基本2", "基本3", "得意1", "得意2", "勝負手", "勝負手区分", "割当根拠"], assignmentRows, [11, 7, 24, 14, 14, 13, 34, 19, 19, 19, 22, 22, 28, 20, 44], "RiderAssignmentsTable");
assignmentSheet.getRange(`B5:B${assignmentMeta.lastRow}`).format.numberFormat = "0";
assignmentSheet.getRange(`H5:J${assignmentMeta.lastRow}`).format.fill = colors.paleTeal;
assignmentSheet.getRange(`K5:L${assignmentMeta.lastRow}`).format.fill = colors.paleAmber;
assignmentSheet.getRange(`M5:N${assignmentMeta.lastRow}`).format.fill = colors.paleMagenta;
assignmentSheet.getRange(`F5:F${assignmentMeta.lastRow}`).conditionalFormats.add("containsText", { text: "エース", format: { fill: "#E8F1FB", font: { bold: true, color: colors.blue } } });
assignmentSheet.getRange(`F5:F${assignmentMeta.lastRow}`).conditionalFormats.add("containsText", { text: "アシスト", format: { fill: "#E6F5F3", font: { bold: true, color: colors.teal } } });

const usage = new Map();
for (const entry of assignments) {
  const cards = [...entry.basicCards.map((card) => ["基本", card]), ...entry.specialtyCards.map((card) => ["得意", card]), ["勝負手", entry.decisiveCard]];
  for (const [slot, card] of cards) {
    const key = `${slot}\u0000${card.name}\u0000${card.source}`;
    const current = usage.get(key) ?? { slot, name: card.name, source: card.source, count: 0, examples: [] };
    current.count += 1; if (current.examples.length < 5) current.examples.push(entry.riderName); usage.set(key, current);
  }
}
const usageRows = [...usage.values()].sort((a, b) => a.slot.localeCompare(b.slot, "ja") || b.count - a.count || a.name.localeCompare(b.name, "ja")).map((entry) => [entry.slot, entry.name, entry.source, entry.count, entry.examples.join(" / ")]);
const usageSheet = workbook.worksheets.add("カード使用数");
const usageMeta = styleDataSheet(usageSheet, "カード使用数", "全510名・計3,060枠の採用数。偏りと未使用カードを確認する監査表です。", ["枠", "カード名", "区分", "割当人数", "代表選手（最大5名）"], usageRows, [12, 28, 20, 13, 70], "CardUsageTable", 2);
usageSheet.getRange(`D5:D${usageMeta.lastRow}`).format.numberFormat = "#,##0";
usageSheet.getRange(`D5:D${usageMeta.lastRow}`).conditionalFormats.add("dataBar", { color: colors.blue, gradient: true });

const byName = new Map();
for (const entry of assignments) { const list = byName.get(entry.riderName) ?? []; list.push(entry); byName.set(entry.riderName, list); }
const duplicateRows = [...byName.entries()].filter(([, entries]) => entries.length > 1).map(([name, entries]) => [name, entries.length, entries.map((entry) => rosterLabel(entry.rosterFile)).join(" / "), entries.map((entry) => entry.status).join(" / "), "名簿区分の正本側で要整理。カード割当では現役限定の固有枠を非現役行へ流用しない。"]);
const duplicateSheet = workbook.worksheets.add("名簿重複確認");
const duplicateMeta = styleDataSheet(duplicateSheet, "名簿重複確認", "割当時に検出した名簿間の同名行。カード作業では削除せず、誤った固有カード付与だけを防止しています。", ["選手名", "行数", "所在", "状態", "対応"], duplicateRows, [26, 10, 25, 34, 72], "DuplicateRosterTable", 1);
duplicateSheet.getRange(`B5:B${duplicateMeta.lastRow}`).format.numberFormat = "0";
duplicateSheet.getRange(`A5:E${duplicateMeta.lastRow}`).format.fill = colors.paleAmber;

const summary = workbook.worksheets.add("概要");
summary.showGridLines = false; summary.mergeCells("A1:H1"); summary.mergeCells("A2:H2");
summary.getRange("A1").values = [["QOMISO Game Tour 選手別カード割当"]]; summary.getRange("A2").values = [["全名簿行へ基本3枚・得意2枚・勝負手1枚を割り当てた監査用正本。更新日 2026-07-20"]];
summary.getRange("A1:H1").format = { fill: colors.navy, font: { bold: true, color: colors.white, size: 18 }, verticalAlignment: "center" }; summary.getRange("A2:H2").format = { fill: colors.paleBlue, font: { color: colors.ink }, verticalAlignment: "center" };
summary.getRange("A4:B4").values = [["集計", "件数"]]; summary.getRange("A5:A14").values = [["名簿行"], ["現役"], ["引退"], ["区分保留"], ["エース型"], ["アシスト型"], ["カード枠合計"], ["エース固有勝負手"], ["高適性アシスト固有"], ["名簿重複名"]];
summary.getRange("B5:B14").formulas = [[`=COUNTA('全選手割当'!$C$5:$C$${assignmentMeta.lastRow})`], [`=COUNTIF('全選手割当'!$A$5:$A$${assignmentMeta.lastRow},"現役")`], [`=COUNTIF('全選手割当'!$A$5:$A$${assignmentMeta.lastRow},"引退")`], [`=COUNTIF('全選手割当'!$A$5:$A$${assignmentMeta.lastRow},"区分保留")`], [`=COUNTIF('全選手割当'!$F$5:$F$${assignmentMeta.lastRow},"エース型")`], [`=COUNTIF('全選手割当'!$F$5:$F$${assignmentMeta.lastRow},"アシスト型")`], ["=B5*6"], [`=COUNTIF('全選手割当'!$N$5:$N$${assignmentMeta.lastRow},"エース固有")`], [`=COUNTIF('全選手割当'!$N$5:$N$${assignmentMeta.lastRow},"高適性アシスト固有")`], [`=COUNTA('名簿重複確認'!$A$5:$A$${duplicateMeta.lastRow})`]];
summary.getRange("D4:E4").values = [["割当順", "基準"]]; summary.getRange("D5:E10").values = [["基本3枚", "能力・主副脚質・地形適合・役割一致"], ["得意2枚", "能力・主副脚質・地形適合・役割一致"], ["勝負手1", "エース固有を最優先"], ["次点", "現役の高適性アシスト固有"], ["汎用", "得意技の発展先と役割を優先"], ["同点", "カード名順で固定"]];
for (const range of ["A4:B4", "D4:E4"]) summary.getRange(range).format = { fill: colors.blue, font: { bold: true, color: colors.white }, horizontalAlignment: "center" };
for (const range of ["A5:B14", "D5:E10"]) summary.getRange(range).format = { fill: colors.paleGray, font: { color: colors.ink }, wrapText: true, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
summary.getRange("B5:B14").format.numberFormat = "#,##0"; summary.getRange("A1:H1").format.rowHeight = 38; summary.getRange("A2:H2").format.rowHeight = 32;
[["A", 24], ["B", 14], ["D", 18], ["E", 54]].forEach(([col, width]) => { summary.getRange(`${col}1:${col}14`).format.columnWidth = width; }); summary.freezePanes.freezeRows(2);

workbook.worksheets.getItem("概要").position = 0;
await fs.mkdir(outputDir, { recursive: true });
const inspect = await workbook.inspect({ kind: "table", range: "概要!A1:E14", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 8 });
await fs.writeFile(path.join(outputDir, "rider_card_assignments_summary_inspect.ndjson"), inspect.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(outputDir, "rider_card_assignments_formula_errors.ndjson"), errors.ndjson, "utf8");
for (const [name, range] of [["概要", "A1:H16"], ["全選手割当", "A1:O20"], ["カード使用数", `A1:E${Math.min(usageMeta.lastRow, 40)}`], ["名簿重複確認", `A1:E${duplicateMeta.lastRow}`]]) {
  const preview = await workbook.render({ sheetName: name, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `preview_${name}.png`), new Uint8Array(await preview.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(workbook); await output.save(outputPath);
console.log(JSON.stringify({ outputPath, riders: assignments.length, cardSlots: assignments.length * 6, uniqueCardsUsed: usageRows.length, duplicateNames: duplicateRows.length, formulaErrors: errors.ndjson.trim() ? errors.ndjson.trim().split(/\r?\n/).length : 0 }, null, 2));
