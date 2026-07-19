import fs from "node:fs/promises";

function parseCsv(text) {
  const raw=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i+=1){const ch=text[i];if(ch==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(ch==='"')quoted=!quoted;else if(ch===","&&!quoted){row.push(cell);cell="";}else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&text[i+1]==="\n")i+=1;row.push(cell);if(row.some(v=>v!==""))raw.push(row);row=[];cell="";}else cell+=ch;} if(cell||row.length){row.push(cell);raw.push(row);} const headers=raw.shift(); return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??""])));
}
const normalize=(v)=>String(v||"").replace(/\s*\(cyclist\)\s*$/i,"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const cleanWiki=(v)=>String(v||"").replace(/<!--.*?-->/gs,"").replace(/<ref[^>]*>[\s\S]*?<\/ref>|<ref[^>]*\/>/gi,"").replace(/\{\{[^{}]*\}\}/g," ").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,"$2").replace(/\[\[([^\]]+)\]\]/g,"$1").replace(/''+/g,"").replace(/\s+/g," ").trim();
const getField=(text,field)=>text.match(new RegExp(`^[ \\t]*\\|[ \\t]*${field}[ \\t]*=[ \\t]*(.*)$`,"im"))?.[1]?.trim()||"";
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const rows=parseCsv(await fs.readFile("data/rider_parameters_active_300.csv","utf8"));
const profiles=[];
for(let i=0;i<rows.length;i+=10){
  const titles=rows.slice(i,i+10).map(r=>r.name);
  const params=new URLSearchParams({action:"query",prop:"revisions",rvprop:"content|size",rvslots:"main",redirects:"1",format:"json",formatversion:"2",titles:titles.join("|")});
  let response;
  for(let attempt=0;attempt<7;attempt+=1){response=await fetch(`https://en.wikipedia.org/w/api.php?${params}`,{headers:{"User-Agent":"QOMISO-Game-Tour-parameter-audit/1.0 (local game data audit)"},signal:AbortSignal.timeout(30000)});if(response.ok)break;if(response.status!==429&&response.status<500)throw new Error(`Wikipedia API HTTP ${response.status}`);await sleep(5000*(attempt+1));}
  if(!response?.ok)throw new Error(`Wikipedia API HTTP ${response?.status||"no response"}`);
  const json=await response.json();
  for(const page of json.query?.pages||[]){const rev=page.revisions?.[0];const wiki=rev?.slots?.main?.content||"";profiles.push({title:page.title,normalized_name:normalize(page.title),rider_type:cleanWiki(getField(wiki,"ridertype")||getField(wiki,"rider_type")),page_size:rev?.size||wiki.length,source_url:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,"_"))}`});}
  await sleep(2200);
}
await fs.writeFile("data/rider_activity_profiles_2026.json",JSON.stringify({generated_at:new Date().toISOString(),count:profiles.length,profiles},null,2)+"\n","utf8");
console.log(JSON.stringify({profiles:profiles.length,withRiderType:profiles.filter(p=>p.rider_type).length},null,2));
