import fs from "node:fs/promises";

const canonicalFiles=[
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
];
const outputFiles=[
  ...canonicalFiles,
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
const fixed=new Map([
  ["Tadej Pogacar",20000],
  ["Mathieu van der Poel",13000],
  ["Jonas Vingegaard",13000],
  ["Wout van Aert",12500],
  ["Remco Evenepoel",12500],
]);
const note="Credit全選手再査定: 現役・引退・区分保留の全選手を同一母集団で標準化。エース適性50%・主脚質能力20%・アシスト適性8%・総合能力5%・主要実績12%・知名度5%の合成順位を価格曲線へ変換し、上位5名は指定基準価格を適用";

function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])))};}
const csvCell=value=>/[",\r\n]/.test(String(value??""))?`"${String(value??"").replace(/"/g,'""')}"`:String(value??"");
const serialize=p=>[p.headers.map(csvCell).join(","),...p.rows.map(r=>p.headers.map(h=>csvCell(r[h]??"")).join(","))].join("\n")+"\n";
const n=(r,k)=>Number(r[k]||0);
const normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const rolePower=r=>{const w=weights[r.primary_archetype]||{};const total=Object.values(w).reduce((a,b)=>a+b,0);return total?Object.entries(w).reduce((s,[k,v])=>s+n(r,k)*v,0)/total:stats.reduce((s,k)=>s+n(r,k),0)/stats.length;};
const avg=r=>stats.reduce((s,k)=>s+n(r,k),0)/stats.length;
const achievement=r=>n(r,"world_road_gold")*3+n(r,"world_road_silver")*2+n(r,"world_road_bronze")+n(r,"world_itt_gold")*3+n(r,"world_itt_silver")*2+n(r,"world_itt_bronze")+n(r,"pave_wins")*2;
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const zFactory=a=>{const m=mean(a),sd=Math.sqrt(mean(a.map(v=>(v-m)**2)))||1;return v=>(v-m)/sd;};
const rankRows=rows=>rows.sort((a,b)=>n(b,"ace_aptitude")-n(a,"ace_aptitude")||n(b,"credit_salary")-n(a,"credit_salary")||avg(b)-avg(a)||a.name.localeCompare(b.name,"en")).map((r,i)=>({...r,no:String(i+1)}));

const parsedByFile=new Map();
for(const file of outputFiles){try{parsedByFile.set(file,parseCsv(await fs.readFile(file,"utf8")));}catch{}}
const unique=new Map();
for(const file of canonicalFiles){for(const row of parsedByFile.get(file)?.rows||[])if(!unique.has(normalize(row.name)))unique.set(normalize(row.name),row);}
const riders=[...unique.values()];
const metrics=riders.map(r=>({key:normalize(r.name),ace:n(r,"ace_aptitude"),role:rolePower(r),support:n(r,"support_aptitude"),average:avg(r),results:Math.log1p(achievement(r)),fame:String(r.rider_title||"").trim()?1:0}));
const za=zFactory(metrics.map(x=>x.ace)),zr=zFactory(metrics.map(x=>x.role)),zs=zFactory(metrics.map(x=>x.support)),zv=zFactory(metrics.map(x=>x.average)),zh=zFactory(metrics.map(x=>x.results)),zf=zFactory(metrics.map(x=>x.fame));
for(const x of metrics)x.score=za(x.ace)*.50+zr(x.role)*.20+zs(x.support)*.08+zv(x.average)*.05+zh(x.results)*.12+zf(x.fame)*.05;
const sorted=[...metrics].sort((a,b)=>a.score-b.score||a.key.localeCompare(b.key));
const prices=new Map();
for(let i=0;i<sorted.length;i++){
  const x=sorted[i],percentile=sorted.length===1?1:i/(sorted.length-1);
  const upperTail=Math.max(0,x.score-2)*350;
  let price=Math.round((2800+8200*Math.pow(percentile,1.75)+upperTail)/50)*50;
  price=Math.max(2800,Math.min(12000,price));
  const source=riders.find(r=>normalize(r.name)===x.key);
  if(fixed.has(source.name))price=fixed.get(source.name);
  prices.set(x.key,{price,score:x.score,percentile});
}

const report={population:riders.length,files:{}};
for(const [file,parsed] of parsedByFile){let changed=0,matched=0;for(const row of parsed.rows){const model=prices.get(normalize(row.name));if(!model)continue;matched++;if(n(row,"credit_salary")!==model.price)changed++;row.credit_salary=String(model.price);if("rating_basis" in row){const base=String(row.rating_basis||"").replace(/。Credit全選手再査定:[^。]*/g,"").replace(/[。\s]+$/,"");row.rating_basis=base.includes(note)?base:`${base}。${note}`;}if("rating_status" in row)row.rating_status="能力・適性・Credit整合済";}parsed.rows=rankRows(parsed.rows);await fs.writeFile(file,serialize(parsed),"utf8");const values=parsed.rows.map(r=>n(r,"credit_salary"));report.files[file]={rows:parsed.rows.length,matched,changed,min:Math.min(...values),median:[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)],max:Math.max(...values),over10000:values.filter(v=>v>=10000).length};}
report.top=[...prices.entries()].sort((a,b)=>b[1].price-a[1].price||b[1].score-a[1].score).slice(0,20).map(([key,v])=>({name:riders.find(r=>normalize(r.name)===key).name,credit:v.price,score:Number(v.score.toFixed(3)),percentile:Number(v.percentile.toFixed(3))}));
console.log(JSON.stringify(report,null,2));
