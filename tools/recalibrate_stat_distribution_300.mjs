import fs from "node:fs/promises";

const files = [
  "data/rider_parameters_active_300.csv",
  "data/rider_parameters_retired.csv",
  "data/rider_parameters_status_pending.csv",
  "data/rider_parameters_300.csv",
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300_pre_rebalance.csv",
];
const stats = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "pave", "recovery", "dailyRecovery", "teamwork", "ego", "fighting"];
const bands = [[2,85],[7,84],[11,83],[15,82],[20,81],[26,80],[33,79],[41,78],[51,77],[63,76],[78,75],[94,74],[112,73],[132,72],[153,71],[174,70],[195,69],[215,68],[233,67],[249,66],[263,65],[274,64],[283,63],[290,62],[295,61],[297,60],[298,59],[299,58],[300,57]];
const forced85 = {
  climb: ["Jonas Vingegaard"],
  cruise: ["Filippo Ganna", "Remco Evenepoel"],
  pave: ["Mathieu van der Poel"],
};
const affinity = {
  sprint: {"スプリンター":12,"クラシック型":4,"パンチャー":3},
  acceleration: {"スプリンター":10,"パンチャー":8,"クラシック型":5},
  punch: {"パンチャー":12,"クラシック型":7,"総合型":4},
  cruise: {"TT・ルーラー型":12,"クラシック型":7,"スプリンター":4},
  climb: {"クライマー":12,"総合型":10,"パンチャー":4},
  stamina: {"総合型":9,"クライマー":8,"TT・ルーラー型":7,"クラシック型":7},
  resistance: {"クラシック型":9,"総合型":8,"TT・ルーラー型":7,"クライマー":6},
  technique: {"クラシック型":9,"TT・ルーラー型":7,"パンチャー":6},
  bikeControl: {"クラシック型":11,"パンチャー":8,"スプリンター":4},
  pave: {"クラシック型":15,"スプリンター":4,"パンチャー":4},
  recovery: {"総合型":11,"クライマー":8},
  dailyRecovery: {"総合型":11,"クライマー":8},
  teamwork: {"TT・ルーラー型":8,"クラシック型":7,"クライマー":5},
  ego: {"総合型":8,"パンチャー":7,"スプリンター":6},
  fighting: {"クラシック型":9,"パンチャー":8,"クライマー":6},
};
const note = "能力値を偏差値型分布（中央値約70）へ再配分。Tadej Pogacarのみ特別枠、各能力85は1〜2名、その他は84以下";

function parseCsv(text) {
  const raw=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])))};
}
const csvCell=value=>/[",\r\n]/.test(String(value??""))?`"${String(value??"").replace(/"/g,'""')}"`:String(value??"");
const serialize=parsed=>[parsed.headers.map(csvCell).join(","),...parsed.rows.map(row=>parsed.headers.map(h=>csvCell(row[h]??"")).join(","))].join("\n")+"\n";
const capForRank=(rank,total)=>{const scaled=Math.max(1,Math.ceil(rank*300/total));return bands.find(([end])=>scaled<=end)[1];};
const normalizeCredit=row=>Math.min(10,Number(row.credit_salary||0)/2000);
const score=(row,stat)=>Number(row[stat]||0)+Number(row.ace_aptitude||0)*0.15+normalizeCredit(row)+(affinity[stat]?.[row.primary_archetype]||0)+(stat==="teamwork"?Number(row.support_aptitude||0)*0.12:0);

const reports={};
for(const file of files){
  try{await fs.access(file);}catch{continue;}
  const parsed=parseCsv(await fs.readFile(file,"utf8"));
  const isActive=file.endsWith("rider_parameters_active_300.csv");
  const topByStat={};
  for(const stat of stats){
    const ranked=[...parsed.rows].sort((a,b)=>score(b,stat)-score(a,stat)||Number(b[stat])-Number(a[stat])||a.name.localeCompare(b.name,"en"));
    const selected=new Set();
    for(const name of forced85[stat]||[]){if(ranked.some(row=>row.name===name))selected.add(name);}
    if(!(stat in forced85)){
      for(const row of ranked){if(selected.size>=2)break;if(row.name!=="Tadej Pogacar"&&Number(row[stat])>=80)selected.add(row.name);}
    }
    ranked.forEach((row,index)=>{
      const before=Number(row[stat]||0);
      if(row.name==="Tadej Pogacar")return;
      row[stat]=String(selected.has(row.name)?85:Math.min(before,Math.min(84,capForRank(index+1,ranked.length))));
    });
    topByStat[stat]=ranked.filter(row=>Number(row[stat])===85&&row.name!=="Tadej Pogacar").map(row=>row.name);
  }
  for(const row of parsed.rows){
    if("rating_basis" in row&&!String(row.rating_basis||"").includes(note))row.rating_basis=`${String(row.rating_basis||"").replace(/[。\s]+$/,"")}。${note}`;
    if("rating_status" in row)row.rating_status="偏差値型分布・評価済";
  }
  await fs.writeFile(file,serialize(parsed),"utf8");
  reports[file]={rows:parsed.rows.length,active:isActive,topByStat};
}
console.log(JSON.stringify(reports,null,2));
