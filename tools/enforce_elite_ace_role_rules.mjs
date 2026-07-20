import fs from "node:fs/promises";

const files=[
  "data/rider_parameters_300.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300_pre_rebalance.csv",
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
];
const longRaiders=new Set(["Remco Evenepoel","Wout van Aert","Mathieu van der Poel"]);
const ruleNote="エース適性90以上は名称に「アシスト」を含む役割を付与しない。Remco Evenepoel、Wout van Aert、Mathieu van der Poelは超ロングスパート固定";

function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])))};}
const cell=v=>/[",\r\n]/.test(String(v??""))?`"${String(v??"").replace(/"/g,'""')}"`:String(v??"");
const serialize=p=>[p.headers.map(cell).join(","),...p.rows.map(r=>p.headers.map(h=>cell(r[h]??"")).join(","))].join("\n")+"\n";
const result={};
for(const file of files){
  try{await fs.access(file);}catch{continue;}
  const p=parseCsv(await fs.readFile(file,"utf8"));let elite=0,removed=0,longRaid=0;
  for(const r of p.rows){
    let roles=String(r.preferred_roles||"").split(" / ").map(x=>x.trim()).filter(Boolean);
    if(Number(r.ace_aptitude)>=90){elite+=1;const before=roles.length;roles=roles.filter(role=>!role.includes("アシスト")&&role!=="サブエース");removed+=before-roles.length;if(!roles.includes("エース"))roles.unshift("エース");}
    if(longRaiders.has(r.name)&&!roles.includes("超ロングスパート")){roles.push("超ロングスパート");longRaid+=1;}
    roles=[...new Set(roles)];
    if(roles.includes("エース"))roles=["エース",...roles.filter(x=>x!=="エース")];
    r.preferred_roles=roles.slice(0,7).join(" / ");
    if("specialist_role" in r)r.specialist_role="";
    if("rating_basis" in r&&!String(r.rating_basis||"").includes(ruleNote))r.rating_basis=`${String(r.rating_basis||"").replace(/[。\s]+$/,"")}。${ruleNote}`;
  }
  await fs.writeFile(file,serialize(p),"utf8");
  result[file]={rows:p.rows.length,elite,removedAssistRoles:removed,addedLongRaid:longRaid,longRaiders:[...longRaiders].filter(name=>p.rows.some(r=>r.name===name&&String(r.preferred_roles).includes("超ロングスパート")))};
}
console.log(JSON.stringify(result,null,2));
