import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath = path.join(outputDir, "QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const checks = [
  ["選手一覧", "A4:N8"],
  ["役割定義", "A4:H34"],
  ["現役選手300名", "A4:AF304"],
  ["引退選手", "A4:AF174"],
  ["区分保留", "A4:AF44"],
];
const results = [];
for (const [sheetId, range] of checks) {
  const inspection = await workbook.inspect({ kind: "table", sheetId, range, include: "values,formulas", tableMaxRows: sheetId === "役割定義" ? 34 : 8, tableMaxCols: sheetId === "選手一覧" ? 14 : 32, maxChars: 20000 });
  results.push({ sheetId, range, ndjson: inspection.ndjson });
}
for (const required of [
  ["選手一覧", "Tadej Pogacar"],
  ["役割定義", "無賃乗車"],
  ["現役選手300名", "Tadej Pogacar"],
  ["引退選手", "Miguel Indurain"],
  ["区分保留", "Mads Pedersen"],
]) {
  const result = results.find((item) => item.sheetId === required[0]);
  if (!result?.ndjson.includes(required[1])) throw new Error(`${required[0]} に ${required[1]} が見つかりません`);
}
console.log(results.map(({ sheetId, range, ndjson }) => ({ sheetId, range, sample: ndjson.slice(0, 1800) })));
