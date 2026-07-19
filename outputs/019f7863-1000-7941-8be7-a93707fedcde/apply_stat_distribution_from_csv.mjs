import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const root=path.resolve(outputDir,"..","..");
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])));}
const normalize=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const stats=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const sources=await Promise.all(["rider_parameters_active_300.csv","rider_parameters_retired.csv","rider_parameters_status_pending.csv"].map(async file=>parseCsv(await fs.readFile(path.join(root,"data",file),"utf8"))));
const byName=new Map(sources.flat().map(row=>[normalize(row.name),row]));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
let changed=0;
for(const sheetName of ["現役選手300名","レジェンド・引退選手","区分保留"]){const sheet=wb.worksheets.getItem(sheetName);const names=sheet.getRange("B5:B400").values;const values=sheet.getRange("L5:Z400").values;for(let i=0;i<names.length;i+=1){const row=byName.get(normalize(names[i]?.[0]));if(!row)continue;for(let j=0;j<stats.length;j+=1){const next=Number(row[stats[j]]);if(Number(values[i][j])!==next){values[i][j]=next;changed+=1;}}}sheet.getRange("L5:Z400").values=values;}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"formula error scan"});
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);
console.log(JSON.stringify({workbookPath,changed,formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
