import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const longRaiders=new Set(["Remco Evenepoel","Wout van Aert","Mathieu van der Poel"]);
const specs=[["現役選手300名",300],["レジェンド・引退選手",181],["区分保留",40]];
let changed=0,removed=0,added=0;
for(const [name,count] of specs){
  const s=wb.worksheets.getItem(name);const values=s.getRangeByIndexes(4,0,count,10).values;
  for(let row=0;row<count;row+=1){
    const rider=String(values[row]?.[1]||""),ace=Number(values[row]?.[7]||0),old=String(values[row]?.[9]||"");
    let roles=old.split(" / ").map(x=>x.trim()).filter(Boolean);
    if(ace>=90){const before=roles.length;roles=roles.filter(x=>!x.includes("アシスト")&&x!=="サブエース");removed+=before-roles.length;if(!roles.includes("エース"))roles.unshift("エース");}
    if(longRaiders.has(rider)&&!roles.includes("超ロングスパート")){roles.push("超ロングスパート");added+=1;}
    roles=[...new Set(roles)];if(roles.includes("エース"))roles=["エース",...roles.filter(x=>x!=="エース")];
    const next=roles.slice(0,7).join(" / ");if(next!==old){s.getCell(4+row,9).values=[[next]];changed+=1;}
  }
}
const settings=wb.worksheets.getItem("設定・定義");
settings.getRange("A97:Q97").merge();settings.getRange("A97").values=[["エース役割制約"]];settings.getRange("A97:Q97").format={fill:"#2F6B8A",font:{name:"Yu Gothic",size:13,bold:true,color:"#FFFFFF"},verticalAlignment:"center"};
settings.getRange("A98:Q98").merge();settings.getRange("A98").values=[["エース適性90以上の選手には、名称に「アシスト」を含む役割を付与しない。Remco Evenepoel、Wout van Aert、Mathieu van der Poelには「超ロングスパート」を固定付与する。"]];settings.getRange("A98:Q98").format={fill:"#F3F8FC",font:{name:"Yu Gothic",size:10,color:"#20313F"},wrapText:true,verticalAlignment:"center"};settings.getRange("A98:Q98").format.rowHeight=36;
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"elite ace role formula scan"});
const check=await wb.inspect({kind:"table",range:"現役選手300名!A1:J28",include:"values,formulas",tableMaxRows:28,tableMaxCols:10});
await fs.writeFile(path.join(outputDir,"elite_ace_role_check.ndjson"),check.ndjson,"utf8");await fs.writeFile(path.join(outputDir,"elite_ace_role_formula_errors.ndjson"),errors.ndjson,"utf8");
for(const [name] of specs){const image=await wb.render({sheetName:name,range:"A1:J28",scale:1,format:"png"});await fs.writeFile(path.join(outputDir,`elite_roles_${name}.png`),new Uint8Array(await image.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);
console.log(JSON.stringify({workbookPath,changed,removed,added,formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
