import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const root=path.resolve(outputDir,"..","..");
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])));}
const load=async(name)=>parseCsv(await fs.readFile(path.join(root,"選手スプレッドシート",name),"utf8"));
const [active,retired,pending]=await Promise.all([load("01_現役選手300名.csv"),load("02_引退選手.csv"),load("03_区分保留.csv")]);
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const statKeys=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const statLabels=["スプリント","加速力","パンチ力","巡航力","登坂力","持久力","耐性","技術","バイクコントロール","パヴェ","回復力","日間回復力","チームワーク","エゴ","負けん気"];
const headers=["No.","実在選手名","二つ名","国・地域","現所属","主脚質","副脚質","エース適性","アシスト適性","役割・戦術特性","Credit",...statLabels,"生年月日","区分","選定根拠","確認URL","評価状態","人物URL"];
const n=v=>v===""||v==null?"":Number(v);
const csvRow=r=>[n(r.no),r.name,r.rider_title,r.country,r.current_team,r.primary_archetype,r.secondary_archetype,n(r.ace_aptitude),n(r.support_aptitude),r.preferred_roles,n(r.credit_salary),...statKeys.map(k=>n(r[k])),r.birth_date,r.active_status,r.selection_basis,r.active_source_url,r.rating_status,r.profile_url];
const oldToNew=old=>[old[0],old[1],old[2],old[3],old[4],old[7],old[8],old[9],old[10],old[11],old[12],...old.slice(13,28),old[5],old[6],old[28],old[29],old[30],old[31]];
const normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const retiredMap=new Map(retired.map(r=>[normalize(r.name),r]));
const legendSheet=wb.worksheets.getItem("レジェンド・引退選手");
const oldLegend=legendSheet.getRange("A5:AF185").values;
const legend=oldLegend.map(old=>retiredMap.has(normalize(old[1]))?csvRow(retiredMap.get(normalize(old[1]))):oldToNew(old));
const fills={"総合型":"#DCEEFF","スプリンター":"#FCE0E4","クライマー":"#E1F2E3","パンチャー":"#FDE8D2","クラシック型":"#F6EDC8","TT・ルーラー型":"#E8E1F2"};
function rewrite(name,rows){
  const s=wb.worksheets.getItem(name), count=rows.length, end=count+4;
  s.getRange("A2").values=[["名前・脚質・適性・役割・能力の順に整理。AA:AFは根拠・URL等の詳細列です。全列で並べ替え・絞り込みできます。"]];
  s.getRange("A4:AF4").values=[headers];
  s.getRangeByIndexes(4,0,count,32).values=rows;
  s.getRangeByIndexes(4,0,count,32).format.rowHeight=24;
  s.getRangeByIndexes(3,0,1,32).format.rowHeight=42;
  s.getRangeByIndexes(4,7,count,2).format.numberFormat="0";
  s.getRangeByIndexes(4,10,count,1).format.numberFormat='#,##0 "Cr"';
  s.getRangeByIndexes(4,11,count,15).format.numberFormat="0";
  s.getRangeByIndexes(4,9,count,1).format.wrapText=false;
  s.getRangeByIndexes(4,26,count,6).format.wrapText=false;
  [7,26,23,14,27,17,17,12,14,46,13,...Array(15).fill(10),14,15,44,52,22,48].forEach((w,i)=>s.getRangeByIndexes(0,i,end,1).format.columnWidth=w);
  for(let i=0;i<count;i+=1){const type=rows[i][5];if(fills[type])s.getRangeByIndexes(i+4,5,1,1).format.fill=fills[type];}
}
rewrite("現役選手300名",active.map(csvRow));
rewrite("レジェンド・引退選手",legend);
rewrite("区分保留",pending.map(csvRow));
const overview=wb.worksheets.getItem("概要");
overview.getRange("A20:D20").values=[["主脚質","人数","上限方針","備考"]];
overview.getRange("A21:D26").values=[["総合型",35,"300名内上限","公開脚質を優先"],["スプリンター",45,"300名内上限","同一テンプレート廃止"],["クライマー",60,"300名内上限","同一テンプレート廃止"],["パンチャー",60,"300名内上限","同一テンプレート廃止"],["クラシック型",55,"300名内上限","ロンド・パヴェを考慮"],["TT・ルーラー型",45,"300名内上限","ITT・巡航力を考慮"]];
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"});
const check=await wb.inspect({kind:"table",range:"現役選手300名!A1:Z16",include:"values,formulas",tableMaxRows:16,tableMaxCols:26});
await fs.writeFile(path.join(outputDir,"reformatted_inspect.ndjson"),check.ndjson,"utf8");
await fs.writeFile(path.join(outputDir,"reformatted_formula_errors.ndjson"),errors.ndjson,"utf8");
for(const [name,range] of [["概要","A1:D26"],["現役選手300名","A1:Z16"],["レジェンド・引退選手","A1:Z16"],["区分保留","A1:Z16"],["実績・根拠","A1:AN14"],["設定・定義","A1:Q30"]]){const img=await wb.render({sheetName:name,range,scale:1,format:"png"});await fs.writeFile(path.join(outputDir,`final_${name}.png`),new Uint8Array(await img.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(workbookPath);
console.log(JSON.stringify({workbookPath,active:active.length,legend:legend.length,pending:pending.length,formulaErrors:(errors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
