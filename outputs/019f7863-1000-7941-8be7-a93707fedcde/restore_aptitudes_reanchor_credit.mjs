import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir=path.dirname(new URL(import.meta.url).pathname.slice(1));
const root=path.resolve(outputDir,"..","..");
const workbookPath=path.join(outputDir,"QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const files=[
  "選手スプレッドシート/01_現役選手300名.csv","選手スプレッドシート/02_引退選手.csv","選手スプレッドシート/03_区分保留.csv",
  "data/rider_parameters_300.csv","data/rider_parameters_300_fixed.csv","data/rider_parameters_300_pre_rebalance.csv",
];
const stats=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const weights={
  "総合型":{climb:20,recovery:14,dailyRecovery:14,stamina:12,cruise:10,punch:8,resistance:8,technique:5,bikeControl:4,fighting:5},
  "スプリンター":{sprint:26,acceleration:22,cruise:12,stamina:8,resistance:8,technique:6,bikeControl:6,punch:6,fighting:6},
  "クライマー":{climb:30,stamina:16,recovery:15,dailyRecovery:15,resistance:7,punch:6,technique:5,fighting:6},
  "パンチャー":{punch:25,acceleration:15,climb:13,stamina:10,resistance:9,bikeControl:8,recovery:7,fighting:8,cruise:5},
  "クラシック型":{pave:20,resistance:15,bikeControl:14,stamina:12,technique:10,punch:8,acceleration:7,cruise:7,fighting:7},
  "TT・ルーラー型":{cruise:28,stamina:18,technique:14,resistance:12,recovery:8,dailyRecovery:7,teamwork:7,fighting:6},
};
const creditOverrides=new Map([
  ["Tadej Pogacar",20000],["Mathieu van der Poel",13000],["Jonas Vingegaard",13000],
  ["Wout van Aert",12500],["Remco Evenepoel",12500],
]);
const note="Credit再計算: 適性・主脚質能力・支援力・主要実績・85能力数・上位帯プレミアムから算定。ポガチャル20,000、ファンデルプール／ビンゲゴー13,000、ワウト／エベネプール12,500を上位基準価格として固定";

function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])))};}
const csvCell=value=>/[",\r\n]/.test(String(value??""))?`"${String(value??"").replace(/"/g,'""')}"`:String(value??"");
const serialize=p=>[p.headers.map(csvCell).join(","),...p.rows.map(r=>p.headers.map(h=>csvCell(r[h]??"")).join(","))].join("\n")+"\n";
const n=(r,k)=>Number(r[k]||0);
const normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const rolePower=r=>{const w=weights[r.primary_archetype]||{};const total=Object.values(w).reduce((a,b)=>a+b,0);return total?Object.entries(w).reduce((s,[k,v])=>s+n(r,k)*v,0)/total:stats.reduce((s,k)=>s+n(r,k),0)/stats.length;};
const achievement=r=>n(r,"world_road_gold")*3+n(r,"world_road_silver")*2+n(r,"world_road_bronze")+n(r,"world_itt_gold")*3+n(r,"world_itt_silver")*2+n(r,"world_itt_bronze")+n(r,"pave_wins")*2;
const avg=r=>stats.reduce((s,k)=>s+n(r,k),0)/stats.length;
const rankRows=rows=>rows.sort((a,b)=>n(b,"ace_aptitude")-n(a,"ace_aptitude")||n(b,"credit_salary")-n(a,"credit_salary")||avg(b)-avg(a)||a.name.localeCompare(b.name,"en")).map((r,i)=>({...r,no:String(i+1)}));

const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const baseline=new Map();
for(const [sheetName,count] of [["現役選手300名",300],["区分保留",40],["レジェンド・引退選手",181]]){
  const rows=wb.worksheets.getItem(sheetName).getRangeByIndexes(4,0,count,32).values;
  for(const row of rows){if(row[1])baseline.set(normalize(row[1]),{ace:Number(row[7]),support:Number(row[8])});}
}
const legendBaseline=JSON.parse(await fs.readFile(path.join(outputDir,"legend_baseline.json"),"utf8"));
for(const row of legendBaseline)baseline.set(normalize(row.name),{ace:Number(row.ace),support:Number(row.support)});
const report={};
for(const filename of files){
  const file=path.join(root,filename);try{await fs.access(file);}catch{continue;}
  const parsed=parseCsv(await fs.readFile(file,"utf8"));let restored=0,changed=0;
  for(const row of parsed.rows){
    const base=baseline.get(normalize(row.name));
    if(base&&Number.isFinite(base.ace)&&Number.isFinite(base.support)){row.ace_aptitude=String(base.ace);row.support_aptitude=String(base.support);restored++;}
    const ace=n(row,"ace_aptitude"),support=n(row,"support_aptitude"),role=rolePower(row);
    const highStatCount=stats.filter(k=>n(row,k)===85).length;
    const titleBonus=String(row.rider_title||"").trim()?500:0;
    const resultBonus=Math.min(1500,achievement(row)*150);
    const elitePremium=ace>=97?1200:ace>=94?800:ace>=92?600:ace>=90?400:ace>=88?250:0;
    let credit=Math.round((1800+Math.max(0,ace-50)*105+Math.max(0,role-60)*70+Math.max(0,support-55)*25+titleBonus+resultBonus+highStatCount*200+elitePremium)/50)*50;
    credit=Math.max(2200,Math.min(12000,credit));
    if(creditOverrides.has(row.name))credit=creditOverrides.get(row.name);
    if(credit!==n(row,"credit_salary"))changed++;
    row.credit_salary=String(credit);
    if("rating_basis" in row&&!String(row.rating_basis||"").includes(note))row.rating_basis=`${String(row.rating_basis||"").replace(/[。\s]+$/,"")}。${note}`;
    if("rating_status" in row)row.rating_status="能力・適性・Credit整合済";
  }
  parsed.rows=rankRows(parsed.rows);await fs.writeFile(file,serialize(parsed),"utf8");
  const credits=parsed.rows.map(r=>n(r,"credit_salary"));
  report[filename]={rows:parsed.rows.length,restored,creditChanged:changed,min:Math.min(...credits),median:[...credits].sort((a,b)=>a-b)[Math.floor(credits.length/2)],max:Math.max(...credits),over10000:credits.filter(v=>v>=10000).length};
}
console.log(JSON.stringify(report,null,2));