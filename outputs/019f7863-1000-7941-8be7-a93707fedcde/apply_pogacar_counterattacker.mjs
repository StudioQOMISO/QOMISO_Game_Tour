import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
let changed=0,finalRole="";
for(const [name,count] of [["現役選手300名",300],["レジェンド・引退選手",181],["区分保留",40]]){const s=wb.worksheets.getItem(name),v=s.getRangeByIndexes(4,0,count,10).values;for(let i=0;i<count;i+=1){if(String(v[i]?.[1])!=="Tadej Pogacar")continue;let roles=String(v[i]?.[9]||"").split(" / ").map(x=>x.trim()).filter(Boolean);if(!roles.includes("カウンターアタッカー"))roles.push("カウンターアタッカー");finalRole=[...new Set(roles)].slice(0,7).join(" / ");s.getCell(4+i,9).values=[[finalRole]];changed+=1;}}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"Pogacar role formula scan"});
const check=await wb.inspect({kind:"table",range:"現役選手300名!A1:J8",include:"values,formulas",tableMaxRows:8,tableMaxCols:10});await fs.writeFile(path.join(outputDir,"pogacar_counterattacker_check.ndjson"),check.ndjson,"utf8");
const image=await wb.render({sheetName:"現役選手300名",range:"A1:J8",scale:1,format:"png"});await fs.writeFile(path.join(outputDir,"pogacar_counterattacker.png"),new Uint8Array(await image.arrayBuffer()));
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);console.log(JSON.stringify({workbookPath,changed,finalRole,formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
