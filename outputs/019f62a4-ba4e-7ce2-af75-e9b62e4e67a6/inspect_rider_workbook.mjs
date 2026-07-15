import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = new URL("./", import.meta.url).pathname.slice(1);
const workbookPath = `${outputDir}QOMISO_Game_Tour_実在選手モチーフ200名_仮Credit.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));

const sheets = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 8000,
  tableMaxRows: 8,
  tableMaxCols: 12,
  tableMaxCellChars: 100,
});
await fs.writeFile(`${outputDir}current_workbook_inspect.ndjson`, sheets.ndjson, "utf8");

for (const sheet of workbook.worksheets.items) {
  const safe = sheet.name.replace(/[\\/:*?"<>|]/g, "_");
  const preview = await workbook.render({
    sheetName: sheet.name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(`${outputDir}before_${safe}.png`, new Uint8Array(await preview.arrayBuffer()));
}

console.log(JSON.stringify({ workbookPath, sheets: workbook.worksheets.items.map((sheet) => sheet.name) }));
