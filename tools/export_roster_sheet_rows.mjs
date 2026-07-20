import fs from "node:fs/promises";
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])));}
const load=async(name)=>parseCsv(await fs.readFile(`選手スプレッドシート/${name}`,"utf8"));
const [active,retired,pending]=await Promise.all([load("01_現役選手300名.csv"),load("02_引退選手.csv"),load("03_区分保留.csv")]);
const keys=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const headers=["No.","実在選手名","二つ名","国・地域","現所属","主脚質","副脚質","エース適性","アシスト適性","役割・戦術特性","Credit","スプリント","加速力","パンチ力","巡航力","登坂力","持久力","耐性","技術","バイクコントロール","パヴェ","回復力","日間回復力","チームワーク","エゴ","負けん気","生年月日","区分","選定根拠","確認URL","評価状態","人物URL"];
const n=v=>v===""||v==null?"":Number(v);
const row=r=>[n(r.no),r.name,r.rider_title,r.country,r.current_team,r.primary_archetype,r.secondary_archetype,n(r.ace_aptitude),n(r.support_aptitude),r.preferred_roles,n(r.credit_salary),...keys.map(k=>n(r[k])),r.birth_date,r.active_status,r.selection_basis,r.active_source_url,r.rating_status,r.profile_url];
console.log(JSON.stringify({headers,active:active.map(row),retired:retired.map(row),pending:pending.map(row)}));
