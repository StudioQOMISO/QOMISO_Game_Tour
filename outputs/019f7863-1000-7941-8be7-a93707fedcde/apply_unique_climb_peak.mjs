import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath = path.join(outputDir, "QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
let changed = 0;
for (const sheetName of ["現役選手300名", "レジェンド・引退選手", "区分保留"]) {
  const sheet = wb.worksheets.getItem(sheetName);
  const names = sheet.getRange("B5:B400").values;
  const climbs = sheet.getRange("P5:P400").values;
  for (let index = 0; index < names.length; index += 1) {
    const name = String(names[index]?.[0] || "");
    if (!name) continue;
    const before = Number(climbs[index]?.[0] || 0);
    const after = name === "Tadej Pogacar" ? 88 : name === "Jonas Vingegaard" ? 85 : Math.min(before, 84);
    if (after !== before) { climbs[index][0] = after; changed += 1; }
  }
  sheet.getRange("P5:P400").values = climbs;
}
const errors = await wb.inspect({kind:"match", searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options:{useRegex:true,maxResults:300}, summary:"formula error scan"});
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(workbookPath);
console.log(JSON.stringify({workbookPath, changed, formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length}, null, 2));
