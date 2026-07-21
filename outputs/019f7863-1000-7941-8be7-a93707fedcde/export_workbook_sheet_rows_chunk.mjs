import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,"").split("=")));
const sheet=args.sheet||"現役選手300名",start=Number(args.start||0),count=Number(args.count||20);
const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const rows=wb.worksheets.getItem(sheet).getRangeByIndexes(4+start,0,count,32).values;
console.log(JSON.stringify(rows));