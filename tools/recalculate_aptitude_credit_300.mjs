import fs from "node:fs/promises";

const files=[
  "data/rider_parameters_active_300.csv",
  "data/rider_parameters_retired.csv",
  "data/rider_parameters_status_pending.csv",
  "data/rider_parameters_300.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300_pre_rebalance.csv",
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
const aceOverrides=new Map([
  ["Tadej Pogacar",100],["Egan Bernal",88],["Paul Seixas",94],["Isaac del Toro",93],
  ["Mathieu van der Poel",97],["Primoz Roglic",92],["Nairo Quintana",77],
  ["Biniam Girmay",88],["John Degenkolb",80],
]);
const creditOverrides=new Map([
  ["Tadej Pogacar",20000],
  ["Mathieu van der Poel",13000],
  ["Jonas Vingegaard",13000],
  ["Wout van Aert",12500],
  ["Remco Evenepoel",12500],
]);
const note="能力・適性整合: エース適性は従来評価70%＋主脚質能力20%＋負けん気・エゴ10%＋主要実績、アシスト適性は支援能力70%＋従来評価30%で再計算。Creditは適性・主脚質能力・支援力・主要実績・85能力数・上位帯プレミアムから算定。上位5名はゲーム内基準価格を適用";

function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i+=1;row.push(cell);if(row.some(v=>v!==''))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])))};}
const csvCell=value=>/[",\r\n]/.test(String(value??""))?`"${String(value??"").replace(/"/g,'""')}"`:String(value??"");
const serialize=parsed=>[parsed.headers.map(csvCell).join(","),...parsed.rows.map(row=>parsed.headers.map(h=>csvCell(row[h]??"")).join(","))].join("\n")+"\n";
const n=(row,key)=>Number(row[key]||0);
const rolePower=row=>{const w=weights[row.primary_archetype]||{};const total=Object.values(w).reduce((a,b)=>a+b,0);return total?Object.entries(w).reduce((sum,[key,value])=>sum+n(row,key)*value,0)/total:stats.reduce((sum,key)=>sum+n(row,key),0)/stats.length;};
const supportPower=row=>n(row,"teamwork")*.32+n(row,"cruise")*.14+n(row,"stamina")*.14+n(row,"resistance")*.12+n(row,"recovery")*.08+n(row,"dailyRecovery")*.08+n(row,"technique")*.07+n(row,"bikeControl")*.05;
const achievement=row=>n(row,"world_road_gold")*3+n(row,"world_road_silver")*2+n(row,"world_road_bronze")+n(row,"world_itt_gold")*3+n(row,"world_itt_silver")*2+n(row,"world_itt_bronze")+n(row,"pave_wins")*2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const avg=row=>stats.reduce((sum,key)=>sum+n(row,key),0)/stats.length;
const rankRows=rows=>rows.sort((a,b)=>n(b,"ace_aptitude")-n(a,"ace_aptitude")||n(b,"credit_salary")-n(a,"credit_salary")||avg(b)-avg(a)||a.name.localeCompare(b.name,"en")).map((row,index)=>({...row,no:String(index+1)}));

const report={};
for(const file of files){
  try{await fs.access(file);}catch{continue;}
  const parsed=parseCsv(await fs.readFile(file,"utf8"));
  let aceChanged=0,supportChanged=0,creditChanged=0;
  for(const row of parsed.rows){
    const oldAce=n(row,"ace_aptitude"),oldSupport=n(row,"support_aptitude"),oldCredit=n(row,"credit_salary");
    const role=rolePower(row),support=supportPower(row),leadership=n(row,"fighting")*.6+n(row,"ego")*.4;
    const achievementBonus=Math.min(3,achievement(row));
    let newAce=clamp(Math.round(oldAce*.70+role*.20+leadership*.10+achievementBonus),50,99);
    if(aceOverrides.has(row.name))newAce=aceOverrides.get(row.name);
    const newSupport=row.name==="Wout van Aert"?90:clamp(Math.round(support*.70+oldSupport*.30),50,85);
    const highStatCount=stats.filter(key=>n(row,key)===85).length;
    const titleBonus=String(row.rider_title||"").trim()?500:0;
    const resultBonus=Math.min(1500,achievement(row)*150);
    const elitePremium=newAce>=97?1200:newAce>=94?800:newAce>=92?600:newAce>=90?400:newAce>=88?250:0;
    let newCredit=Math.round((1800+Math.max(0,newAce-50)*105+Math.max(0,role-60)*70+Math.max(0,newSupport-55)*25+titleBonus+resultBonus+highStatCount*200+elitePremium)/50)*50;
    newCredit=clamp(newCredit,2200,12000);
    if(creditOverrides.has(row.name))newCredit=creditOverrides.get(row.name);
    row.ace_aptitude=String(newAce);row.support_aptitude=String(newSupport);row.credit_salary=String(newCredit);
    if(newAce!==oldAce)aceChanged+=1;if(newSupport!==oldSupport)supportChanged+=1;if(newCredit!==oldCredit)creditChanged+=1;
    if("rating_basis" in row&&!String(row.rating_basis||"").includes(note))row.rating_basis=`${String(row.rating_basis||"").replace(/[。\s]+$/,"")}。${note}`;
    if("rating_status" in row)row.rating_status="能力・適性・Credit整合済";
  }
  parsed.rows=rankRows(parsed.rows);
  await fs.writeFile(file,serialize(parsed),"utf8");
  const credits=parsed.rows.map(row=>n(row,"credit_salary"));
  report[file]={rows:parsed.rows.length,aceChanged,supportChanged,creditChanged,creditMin:Math.min(...credits),creditMedian:[...credits].sort((a,b)=>a-b)[Math.floor(credits.length/2)],creditMax:Math.max(...credits),credit10000Plus:credits.filter(value=>value>=10000).length};
}
console.log(JSON.stringify(report,null,2));
