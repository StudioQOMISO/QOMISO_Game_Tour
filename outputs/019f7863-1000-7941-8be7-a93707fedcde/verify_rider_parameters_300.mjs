import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath = path.join(outputDir, "QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheetNames = workbook.worksheets.items.map((sheet) => sheet.name);
const requiredSheets = ["概要", "現役選手300名", "レジェンド・引退選手", "区分保留", "実績・根拠", "設定・定義"];
const missingSheets = requiredSheets.filter((name) => !sheetNames.includes(name));
if (missingSheets.length) throw new Error(`必須タブ不足: ${missingSheets.join(" / ")}`);

const roleInspect = await workbook.inspect({
  kind: "table",
  sheetId: "設定・定義",
  range: "A1:Q100",
  include: "values,formulas",
  tableMaxRows: 34,
  tableMaxCols: 8,
  maxChars: 24000,
});
const roleText = roleInspect.ndjson;
for (const token of ["エース", "サブエース", "超ロングスパート", "無賃乗車", "ポジションキーパー", "現役選手数"]) {
  if (!roleText.includes(token)) throw new Error(`役割定義に不足: ${token}`);
}

const riderInspect = await workbook.inspect({
  kind: "table",
  sheetId: "現役選手300名",
  range: "A1:AF16",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 13,
  maxChars: 12000,
});
if (!riderInspect.ndjson.includes("役割・戦術特性") || !riderInspect.ndjson.includes("Credit")) {
  throw new Error("現役選手300名の役割・Credit列が見つかりません");
}

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});

const previewRanges = {
  "概要": "A1:H20",
  "現役選手300名": "A1:AF16",
  "レジェンド・引退選手": "A1:AF16",
  "区分保留": "A1:AF16",
  "実績・根拠": "A1:AN16",
  "設定・定義": "A1:Q40",
};
const previews = [];
for (const name of sheetNames) {
  const preview = await workbook.render({ sheetName: name, range: previewRanges[name] || "A1:M16", scale: 1, format: "png" });
  const fileName = `qa_${String(sheetNames.indexOf(name) + 1).padStart(2, "0")}_${name.replace(/[\\/:*?"<>|]/g, "_")}.png`;
  const previewPath = path.join(outputDir, fileName);
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(previewPath, bytes);
  previews.push({ sheet: name, range: previewRanges[name] || "A1:M16", fileName, bytes: bytes.length });
}

const formulaErrorMatches = (formulaErrors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g) || []).length;
const summary = { workbookPath, sheets: sheetNames, roleRows: 30, formulaErrorMatches, previews };
await fs.writeFile(path.join(outputDir, "rider_parameters_300_qa.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");
console.log(JSON.stringify(summary, null, 2));
