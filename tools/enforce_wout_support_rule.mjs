import fs from "node:fs/promises";

const files=["data/rider_parameters_active_300.csv","data/rider_parameters_retired.csv","data/rider_parameters_status_pending.csv","data/rider_parameters_300.csv","data/rider_parameters_300_fixed.csv","data/rider_parameters_300_pre_rebalance.csv"];
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i+=1;row.push(cell);if(row.some(v=>v!==''))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return{headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])))};}
const csvCell=value=>/[",\r\n]/.test(String(value??""))?`"${String(value??"").replace(/"/g,'""')}"`:String(value??"");
const serialize=parsed=>[parsed.headers.map(csvCell).join(","),...parsed.rows.map(row=>parsed.headers.map(h=>csvCell(row[h]??"")).join(","))].join("\n")+"\n";
const report={};
for(const file of files){
  try{await fs.access(file);}catch{continue;}
  const parsed=parseCsv(await fs.readFile(file,"utf8"));let changed=0;
  for(const row of parsed.rows){const before=Number(row.support_aptitude||0);const after=row.name==="Wout van Aert"?90:Math.min(before,85);if(after===before)continue;row.support_aptitude=String(after);if(row.name!=="Tadej Pogacar")row.credit_salary=String(Math.round((Number(row.credit_salary||0)+(after-before)*25)/50)*50);changed+=1;}
  await fs.writeFile(file,serialize(parsed),"utf8");report[file]={rows:parsed.rows.length,changed};
}
console.log(JSON.stringify(report,null,2));
