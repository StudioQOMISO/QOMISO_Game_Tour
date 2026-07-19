import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const names=["現役選手300名","レジェンド・引退選手","区分保留"];
for(const name of names){const s=wb.worksheets.getItem(name);s.getRange("A2").values=[["列見出しの▼で並べ替え・絞り込み"]];s.getRange("A2:AF2").format.wrapText=false;s.getRange("A2:AF2").format.rowHeight=24;s.getRange("A2:AF2").format.font={name:"Yu Gothic",size:10,color:"#20313F"};s.getRange("A2:AF2").format.verticalAlignment="center";}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"subtitle formula scan"});
const check=await wb.inspect({kind:"table",range:"現役選手300名!A1:J8",include:"values,formulas",tableMaxRows:8,tableMaxCols:10});await fs.writeFile(path.join(outputDir,"short_subtitle_check.ndjson"),check.ndjson,"utf8");
for(const name of names){const image=await wb.render({sheetName:name,range:"A1:J8",scale:1,format:"png"});await fs.writeFile(path.join(outputDir,`short_subtitle_${name}.png`),new Uint8Array(await image.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);console.log(JSON.stringify({workbookPath,subtitle:"列見出しの▼で並べ替え・絞り込み",formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
