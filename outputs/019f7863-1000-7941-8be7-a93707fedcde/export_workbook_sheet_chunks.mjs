import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const chunkDir=path.join(outputDir,"sheet_chunks");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const specs=[["active","現役選手300名",300],["legend","レジェンド・引退選手",181],["pending","区分保留",40]];
await fs.mkdir(chunkDir,{recursive:true});
let files=0;
for(const [key,sheet,count] of specs){
  for(let start=0;start<count;start+=20){
    const size=Math.min(20,count-start);
    const rows=wb.worksheets.getItem(sheet).getRangeByIndexes(4+start,0,size,32).values;
    await fs.writeFile(path.join(chunkDir,`${key}_${start}.json`),JSON.stringify(rows),"utf8");
    files++;
  }
}
console.log(JSON.stringify({chunkDir,files}));