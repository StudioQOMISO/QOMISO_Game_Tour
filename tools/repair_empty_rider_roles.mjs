import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["data/rider_parameters_active_300.csv", "data/rider_parameters_retired.csv", "data/rider_parameters_status_pending.csv"];
const fallback = { "総合型": "山岳アシスト", "スプリンター": "スプリントトレイン", "クライマー": "山岳アシスト", "パンチャー": "ステージハンター", "クラシック型": "石畳護衛", "TT・ルーラー型": "平坦ペースメーカー" };
function parseCsv(text) { const raw=[]; let row=[],cell="",q=false; for(let i=0;i<text.length;i++){const c=text[i]; if(c==='"'&&q&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')q=!q;else if(c===','&&!q){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))raw.push(row);row=[];cell="";}else cell+=c;} if(cell||row.length){row.push(cell);raw.push(row);} const headers=raw.shift(); return {headers,rows:raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])))}; }
const csvCell=v=>/[",\r\n]/.test(String(v??""))?`"${String(v??"").replace(/"/g,'""')}"`:String(v??"");
const result={};
for(const relativePath of files){const filePath=path.join(workspace,relativePath);const p=parseCsv(await fs.readFile(filePath,"utf8"));const repaired=[];for(const row of p.rows){if(!String(row.preferred_roles||"").trim()){row.preferred_roles=fallback[row.primary_archetype]||"平坦アシスト";repaired.push(row.name);}}await fs.writeFile(filePath,[p.headers.map(csvCell).join(","),...p.rows.map(row=>p.headers.map(h=>csvCell(row[h]??"")).join(","))].join("\n")+"\n","utf8");result[relativePath]=repaired;}
console.log(JSON.stringify(result,null,2));
