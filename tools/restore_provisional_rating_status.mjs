import fs from "node:fs/promises";
const file="選手スプレッドシート/01_現役選手300名.csv";
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])))};}
const cell=v=>/[",\r\n]/.test(String(v??""))?`"${String(v??"").replace(/"/g,'""')}"`:String(v??"");
const p=parseCsv(await fs.readFile(file,"utf8"));let changed=0;
for(const r of p.rows){if(String(r.rating_basis).includes("同一テンプレートを廃止")){r.rating_status=String(r.rating_basis).startsWith("公開プロフィール脚質")?"公開脚質反映・暫定能力分散済":"情報少・相対配分による暫定評価";changed+=1;}}
await fs.writeFile(file,[p.headers.map(cell).join(","),...p.rows.map(r=>p.headers.map(h=>cell(r[h]??"")).join(","))].join("\n")+"\n","utf8");
console.log(JSON.stringify({changed,statuses:Object.fromEntries([...new Set(p.rows.map(r=>r.rating_status))].map(s=>[s,p.rows.filter(r=>r.rating_status===s).length]))},null,2));
