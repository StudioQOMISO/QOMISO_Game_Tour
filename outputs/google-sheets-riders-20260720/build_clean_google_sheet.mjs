import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), "..", "..");
const outputDir = path.join(root, "outputs", "google-sheets-riders-20260720");
const sources = [
  ["現役選手300名", "01_現役選手300名.csv", 301],
  ["引退選手", "02_引退選手.csv", 171],
  ["区分保留", "03_区分保留.csv", 41],
];

const workbook = Workbook.create();
for (const [sheetName, fileName, expectedRows] of sources) {
  const csvText = await fs.readFile(path.join(root, "選手スプレッドシート", fileName), "utf8");
  await workbook.fromCSV(csvText, { sheetName });
  const sheet = workbook.worksheets.getItem(sheetName);
  const used = sheet.getUsedRange();
  if (used.values.length !== expectedRows || used.values[0].length !== 53) {
    throw new Error(`${sheetName}: expected ${expectedRows}x53, got ${used.values.length}x${used.values[0].length}`);
  }
  sheet.showGridLines = true;
  sheet.getRange("A1:BA1").format = {
    fill: "#E8EAED",
    font: { name: "Arial", size: 10, bold: true, color: "#202124" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    rowHeight: 38,
  };
  sheet.getRangeByIndexes(1, 0, expectedRows - 1, 53).format = {
    font: { name: "Arial", size: 10, color: "#202124" },
    verticalAlignment: "center",
    rowHeight: 22,
  };
  sheet.getRange(`A1:A${expectedRows}`).format.columnWidth = 8;
  sheet.getRange(`B1:B${expectedRows}`).format.columnWidth = 24;
  sheet.getRange(`C1:E${expectedRows}`).format.columnWidth = 24;
  sheet.getRange(`F1:I${expectedRows}`).format.columnWidth = 16;
  sheet.getRange(`J1:P${expectedRows}`).format.columnWidth = 15;
  sheet.getRange(`Q1:AE${expectedRows}`).format.columnWidth = 12;
  sheet.getRange(`AF1:BA${expectedRows}`).format.columnWidth = 28;
  sheet.freezePanes.freezeRows(1);
  sheet.freezePanes.freezeColumns(2);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "clean Google Sheets source formula scan",
});
for (const [sheetName, , expectedRows] of sources) {
  const check = await workbook.inspect({
    kind: "table",
    sheetId: sheetName,
    range: `A1:BA${Math.min(expectedRows, 6)}`,
    include: "values,formulas",
    tableMaxRows: 6,
    tableMaxCols: 10,
    maxChars: 5000,
  });
  await fs.writeFile(path.join(outputDir, `check_${sheetName}.ndjson`), check.ndjson, "utf8");
  const preview = await workbook.render({ sheetName, range: "A1:P12", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `clean_${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const outputPath = path.join(outputDir, "QOMISO_Game_Tour_選手スプレッドシート_3タブ.xlsx");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, sheets: sources.map(([name]) => name), rows: [300, 170, 40], columns: 53, formulaErrors: errors.ndjson }, null, 2));
