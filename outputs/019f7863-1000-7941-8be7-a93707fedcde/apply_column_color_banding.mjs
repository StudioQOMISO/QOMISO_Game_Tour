import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const body=["#F3F8FC","#FFF7ED","#F2F8F1","#F7F3FA"];
const header=["#2F5D7A","#8A5B32","#4F6F52","#66507A"];
const typeFill={"総合型":"#DCEEFF","スプリンター":"#FCE0E4","クライマー":"#E1F2E3","パンチャー":"#FDE8D2","クラシック型":"#F6EDC8","TT・ルーラー型":"#E8E1F2"};
const specs=[["現役選手300名",300],["レジェンド・引退選手",181],["区分保留",40]];
for(const [name,count] of specs){
  const s=wb.worksheets.getItem(name);
  for(let col=0;col<32;col+=1){
    s.getRangeByIndexes(3,col,1,1).format={fill:header[col%4],font:{name:"Yu Gothic",size:10,bold:true,color:"#FFFFFF"},horizontalAlignment:"center",verticalAlignment:"center",wrapText:true};
    s.getRangeByIndexes(4,col,count,1).format.fill=body[col%4];
  }
  const types=s.getRangeByIndexes(4,5,count,1).values;
  for(let row=0;row<count;row+=1){const fill=typeFill[String(types[row]?.[0]||"")];if(fill)s.getRangeByIndexes(4+row,5,1,1).format.fill=fill;}
}
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"column color formula scan"});
const style=await wb.inspect({kind:"computedStyle",sheetId:"現役選手300名",range:"A4:H7",maxChars:5000});
await fs.writeFile(path.join(outputDir,"column_color_style_check.ndjson"),style.ndjson,"utf8");
await fs.writeFile(path.join(outputDir,"column_color_formula_errors.ndjson"),errors.ndjson,"utf8");
for(const [name] of specs){const image=await wb.render({sheetName:name,range:"A1:Z16",scale:1,format:"png"});await fs.writeFile(path.join(outputDir,`column_color_${name}.png`),new Uint8Array(await image.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);
console.log(JSON.stringify({workbookPath,sheets:specs.map(x=>x[0]),formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
