import fs from "node:fs/promises";

const text=await fs.readFile("選手スプレッドシート/01_現役選手300名.csv","utf8");
function parseCsv(text){const raw=[];let row=[],cell="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i+=1;}else if(c==='"')quoted=!quoted;else if(c===","&&!quoted){row.push(cell);cell="";}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i+=1;row.push(cell);if(row.some(v=>v!==''))raw.push(row);row=[];cell="";}else cell+=c;}if(cell||row.length){row.push(cell);raw.push(row);}const headers=raw.shift();return raw.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]??''])));}
const rows=parseCsv(text);
const stats=["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const weights={
  "総合型":{climb:20,recovery:14,dailyRecovery:14,stamina:12,cruise:10,punch:8,resistance:8,technique:5,bikeControl:4,fighting:5},
  "スプリンター":{sprint:26,acceleration:22,cruise:12,stamina:8,resistance:8,technique:6,bikeControl:6,punch:6,fighting:6},
  "クライマー":{climb:30,stamina:16,recovery:15,dailyRecovery:15,resistance:7,punch:6,technique:5,fighting:6},
  "パンチャー":{punch:25,acceleration:15,climb:13,stamina:10,resistance:9,bikeControl:8,recovery:7,fighting:8,cruise:5},
  "クラシック型":{pave:20,resistance:15,bikeControl:14,stamina:12,technique:10,punch:8,acceleration:7,cruise:7,fighting:7},
  "TT・ルーラー型":{cruise:28,stamina:18,technique:14,resistance:12,recovery:8,dailyRecovery:7,teamwork:7,fighting:6},
};
const num=(r,k)=>Number(r[k]||0);
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const corr=(xs,ys)=>{const mx=mean(xs),my=mean(ys);let xy=0,xx=0,yy=0;for(let i=0;i<xs.length;i++){const x=xs[i]-mx,y=ys[i]-my;xy+=x*y;xx+=x*x;yy+=y*y;}return xy/Math.sqrt(xx*yy);};
const rank=xs=>{const order=xs.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);const out=Array(xs.length);for(let p=0;p<order.length;){let q=p+1;while(q<order.length&&order[q].v===order[p].v)q++;const avg=(p+q-1)/2+1;for(let k=p;k<q;k++)out[order[k].i]=avg;p=q;}return out;};
const spear=(xs,ys)=>corr(rank(xs),rank(ys));
const rolePower=r=>{const w=weights[r.primary_archetype]||{};const total=Object.values(w).reduce((a,b)=>a+b,0);return Object.entries(w).reduce((sum,[k,v])=>sum+num(r,k)*v,0)/total;};
const average=r=>mean(stats.map(k=>num(r,k)));
const supportComposite=r=>num(r,"teamwork")*.32+num(r,"cruise")*.14+num(r,"stamina")*.14+num(r,"resistance")*.12+num(r,"recovery")*.08+num(r,"dailyRecovery")*.08+num(r,"technique")*.07+num(r,"bikeControl")*.05;
for(const r of rows){r._avg=average(r);r._role=rolePower(r);r._support=supportComposite(r);}
const series=key=>rows.map(r=>key.startsWith('_')?r[key]:num(r,key));
const pairs=[["ace_aptitude","_avg"],["ace_aptitude","_role"],["support_aptitude","teamwork"],["support_aptitude","_support"],["credit_salary","ace_aptitude"],["credit_salary","_role"],["credit_salary","_avg"]];
const correlations=Object.fromEntries(pairs.map(([a,b])=>[`${a}__${b}`,{pearson:+corr(series(a),series(b)).toFixed(3),spearman:+spear(series(a),series(b)).toFixed(3)}]));
const z=(value,values)=>{const m=mean(values),sd=Math.sqrt(mean(values.map(v=>(v-m)**2)));return (value-m)/sd;};
const aceVals=series("ace_aptitude"),roleVals=series("_role"),creditVals=series("credit_salary");
const anomalies=rows.map(r=>({name:r.name,type:r.primary_archetype,ace:num(r,"ace_aptitude"),rolePower:+r._role.toFixed(1),credit:num(r,"credit_salary"),aceRoleGap:+(z(num(r,"ace_aptitude"),aceVals)-z(r._role,roleVals)).toFixed(2),creditGap:+(z(num(r,"credit_salary"),creditVals)-(.65*z(num(r,"ace_aptitude"),aceVals)+.35*z(r._role,roleVals))).toFixed(2)}));
console.log(JSON.stringify({rows:rows.length,correlations,largestAceRoleGaps:[...anomalies].sort((a,b)=>Math.abs(b.aceRoleGap)-Math.abs(a.aceRoleGap)).slice(0,20),largestCreditGaps:[...anomalies].sort((a,b)=>Math.abs(b.creditGap)-Math.abs(a.creditGap)).slice(0,25)},null,2));
