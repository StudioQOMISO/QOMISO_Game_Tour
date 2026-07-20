import fs from "node:fs/promises";
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])));}
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,"").split("=")));
const group=args.group||"active",start=Number(args.start||0),count=Number(args.count||20);
const files={active:"01_現役選手300名.csv",retired:"02_引退選手.csv",pending:"03_区分保留.csv"};
if(!files[group])throw new Error(`unknown group ${group}`);
const src=parseCsv(await fs.readFile(`選手スプレッドシート/${files[group]}`,"utf8"));
const keys=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const n=v=>v===""||v==null?"":Number(v);
const row=r=>[n(r.no),r.name,r.rider_title,r.country,r.current_team,r.primary_archetype,r.secondary_archetype,n(r.ace_aptitude),n(r.support_aptitude),r.preferred_roles,n(r.credit_salary),...keys.map(k=>n(r[k])),r.birth_date,r.active_status,r.selection_basis,r.active_source_url,r.rating_status,r.profile_url];
console.log(JSON.stringify(src.slice(start,start+count).map(row)));
