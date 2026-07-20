import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const workspace = path.resolve(outputDir, "..", "..");
const workbookPath = path.join(outputDir, "QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const source = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));

function parseCsv(text) {
  const raw = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i + 1] === "\n") i += 1; row.push(cell); if (row.some(Boolean)) raw.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return raw.map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])));
}
const loadCsv = async (name) => parseCsv(await fs.readFile(path.join(workspace, "選手スプレッドシート", name), "utf8"));
const [active, retired, pending] = await Promise.all([
  loadCsv("01_現役選手300名.csv"), loadCsv("02_引退選手.csv"), loadCsv("03_区分保留.csv"),
]);
const normalize = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const n = (v) => v === "" || v == null ? "" : Number(v);
const statKeys = ["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const statLabels = ["スプリント","加速力","パンチ力","巡航力","登坂力","持久力","耐性","技術","バイクコントロール","パヴェ","回復力","日間回復力","チームワーク","エゴ","負けん気"];
const rosterHeaders = ["No.","実在選手名","二つ名","国・地域","現所属","生年月日","区分","主脚質","副脚質","エース適性","アシスト適性","役割・戦術特性","Credit",...statLabels,"選定根拠","確認URL","評価状態","人物URL"];
const rosterRow = (r, no = Number(r.no)) => [no,r.name,r.rider_title,r.country,r.current_team,r.birth_date,r.active_status,r.primary_archetype,r.secondary_archetype,n(r.ace_aptitude),n(r.support_aptitude),r.preferred_roles,n(r.credit_salary),...statKeys.map((k)=>n(r[k])),r.selection_basis,r.active_source_url,r.rating_status,r.profile_url];

const titleFormat = { fill: "#18324A", font: { name: "Yu Gothic", size: 18, bold: true, color: "#FFFFFF" }, verticalAlignment: "center" };
const subtitleFormat = { fill: "#DCE8EF", font: { name: "Yu Gothic", size: 11, color: "#20313F" }, wrapText: true, verticalAlignment: "center" };
const sectionFormat = { fill: "#2F6B8A", font: { name: "Yu Gothic", size: 13, bold: true, color: "#FFFFFF" }, verticalAlignment: "center" };
const headerFormat = { fill: "#2F6B8A", font: { name: "Yu Gothic", size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: "#C9D8E2" } };
const bodyFormat = { font: { name: "Yu Gothic", size: 10, color: "#20313F" }, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: "#E3E9ED" } } };

const wb = Workbook.create();
function title(sheet, text, subtitle, width) {
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0,0,1,width).merge(); sheet.getCell(0,0).values=[[text]]; sheet.getRangeByIndexes(0,0,1,width).format=titleFormat;
  sheet.getRangeByIndexes(1,0,1,width).merge(); sheet.getCell(1,0).values=[[subtitle]]; sheet.getRangeByIndexes(1,0,1,width).format=subtitleFormat;
  sheet.getRangeByIndexes(0,0,2,width).format.rowHeight=34;
}
function makeRosterSheet(name, rows, tableName, subtitle) {
  const s=wb.worksheets.add(name); title(s,name,subtitle,rosterHeaders.length);
  s.getRangeByIndexes(3,0,1,rosterHeaders.length).values=[rosterHeaders]; s.getRangeByIndexes(3,0,1,rosterHeaders.length).format=headerFormat;
  s.getRangeByIndexes(4,0,rows.length,rosterHeaders.length).values=rows; s.getRangeByIndexes(4,0,rows.length,rosterHeaders.length).format=bodyFormat;
  s.getRangeByIndexes(4,9,rows.length,2).format.numberFormat="0"; s.getRangeByIndexes(4,12,rows.length,1).format.numberFormat='#,##0 "Cr"'; s.getRangeByIndexes(4,13,rows.length,15).format.numberFormat="0";
  [7,25,24,14,28,14,15,18,18,12,14,48,13,...Array(15).fill(11),48,58,22,52].forEach((w,i)=>s.getRangeByIndexes(0,i,rows.length+4,1).format.columnWidth=w);
  s.getRangeByIndexes(4,11,rows.length,1).format.wrapText=true; s.getRangeByIndexes(4,28,rows.length,4).format.wrapText=true;
  s.getRangeByIndexes(0,0,rows.length+4,rosterHeaders.length).format.rowHeight=26; s.getRangeByIndexes(3,0,1,rosterHeaders.length).format.rowHeight=42;
  s.freezePanes.freezeRows(4); s.freezePanes.freezeColumns(2); s.tables.add(`A4:AF${rows.length+4}`,true,tableName).style="TableStyleMedium2";
  return s;
}

const overview=wb.worksheets.add("概要"); title(overview,"QOMISO Game Tour — 選手パラメーター統合版","重複タブを統合し、選手・実績・定義を6タブに集約しました。",8);
overview.getRange("A4:D4").values=[["タブ","収録内容","行数","統合元"]]; overview.getRange("A4:D4").format=headerFormat;
overview.getRange("A5:D10").values=[
  ["現役選手300名","現役選手の役割・15能力・所属・確認情報",active.length,"選手一覧／300選手能力／現役選手300名／二つ名一覧"],
  ["レジェンド・引退選手","歴史的レジェンドと近代引退選手",181,"レジェンド別枠／引退選手"],
  ["区分保留","現役・引退区分を確定していない選手",pending.length,"区分保留"],
  ["実績・根拠","モニュメント・GT・世界選手権・パヴェ根拠",300,"モニュメント実績／GT実績／世界選手権実績／パヴェ根拠"],
  ["設定・定義","15能力・30役割・評価ルール",30,"能力概要／能力定義／役割定義／評価ルール"],
  ["削除した重複表示","二つ名は各選手表へ統合",10,"単独の二つ名一覧を廃止"],
]; overview.getRange("A5:D10").format={...bodyFormat,wrapText:true};
overview.getRange("A12:B12").values=[["検証項目","値"]]; overview.getRange("A12:B12").format=headerFormat;
overview.getRange("A13:B18").values=[["現役",active.length],["引退",retired.length],["歴史的追加",11],["区分保留",pending.length],["能力種類",15],["役割種類",30]]; overview.getRange("A13:B18").format=bodyFormat;
[24,54,12,62,4,4,4,4].forEach((w,i)=>overview.getRangeByIndexes(0,i,20,1).format.columnWidth=w); overview.getRange("A1:H20").format.rowHeight=28; overview.freezePanes.freezeRows(4);

makeRosterSheet("現役選手300名",active.map((r)=>rosterRow(r)),"ActiveRiders","現役300名を一つの正本表へ統合。選手名を固定し、全列で並べ替え・絞り込みできます。");

const legacyRows=source.worksheets.getItem("レジェンド別枠").getRange("A5:K185").values;
const retiredMap=new Map(retired.map((r)=>[normalize(r.name),r]));
const legendRows=legacyRows.map((legacy,index)=>{
  const found=retiredMap.get(normalize(legacy[1]));
  if(found) return rosterRow(found,index+1);
  return [index+1,String(legacy[1]||""),"",String(legacy[2]||""),"引退","","歴史的レジェンド",String(legacy[4]||""),String(legacy[5]||""),n(legacy[6]),n(legacy[7]),"エース",n(legacy[9]),...Array(15).fill(""),"歴史的レジェンド別枠",String(legacy[10]||""),"能力値未設定",String(legacy[10]||"")];
});
makeRosterSheet("レジェンド・引退選手",legendRows,"LegendRetired","歴史的レジェンド11名と近代引退選手170名を一つの表へ統合しました。");
makeRosterSheet("区分保留",pending.map((r)=>rosterRow(r)),"PendingRiders","現役・引退を断定しない選手。確認後に現役または引退表へ移動します。");

const readRows=(sheet,range)=>source.worksheets.getItem(sheet).getRange(range).values;
const monument=readRows("モニュメント実績","A5:I304"), gt=readRows("GT実績","A5:R304"), world=readRows("世界選手権実績","A5:L304"), pave=readRows("パヴェ根拠","A5:M304");
const mapByName=(rows)=>new Map(rows.map((r)=>[normalize(r[1]),r]));
const mm=mapByName(monument), gm=mapByName(gt), wm=mapByName(world), pm=mapByName(pave);
const statusMap=new Map([...active.map(r=>[normalize(r.name),"現役"]),...retired.map(r=>[normalize(r.name),"引退"]),...pending.map(r=>[normalize(r.name),"区分保留"])]);
const evidenceHeaders=["No.","実在選手名","区分","ミラノ〜サンレモ","ロンド","パリ〜ルーベ","リエージュ","ロンバルディア","モニュメント計","Tour総合","Tourステージ","Tourポイント","Tour山岳","Tour新人","Giro総合","Giroステージ","Giroポイント","Giro山岳","Giro新人","Vuelta総合","Vueltaステージ","Vueltaポイント","Vuelta山岳","Vuelta新人","ロード金","ロード銀","ロード銅","ITT金","ITT銀","ITT銅","PR最高順位","PR完走","PR Top10","PR優勝","パヴェ検証","パヴェ評価根拠","PR出典URL","ロンド出典URL","世界選手権根拠","世界選手権出典URL"];
const evidenceRows=monument.map((base,index)=>{const key=normalize(base[1]),g=gm.get(key)||[],w=wm.get(key)||[],p=pm.get(key)||[];return [index+1,base[1],statusMap.get(key)||"旧評価対象",...base.slice(2,9).map(n),...g.slice(2,17).map(n),...w.slice(2,8).map(n),n(p[3]),n(p[4]),n(p[5]),n(p[6]),p[8]||"",p[9]||"",p[10]||"",p[11]||"",w[10]||"",w[11]||""];});
const ev=wb.worksheets.add("実績・根拠"); title(ev,"主要実績・評価根拠 — 統合表","モニュメント、グランツール、世界選手権、パヴェ評価根拠を選手名で結合しました。",evidenceHeaders.length);
ev.getRangeByIndexes(3,0,1,evidenceHeaders.length).values=[evidenceHeaders]; ev.getRangeByIndexes(3,0,1,evidenceHeaders.length).format=headerFormat;
ev.getRangeByIndexes(4,0,evidenceRows.length,evidenceHeaders.length).values=evidenceRows; ev.getRangeByIndexes(4,0,evidenceRows.length,evidenceHeaders.length).format=bodyFormat;
ev.getRangeByIndexes(4,3,evidenceRows.length,31).format.numberFormat="0"; ev.getRangeByIndexes(4,34,evidenceRows.length,6).format.wrapText=true;
[7,26,14,...Array(31).fill(11),16,52,58,58,42,58].forEach((w,i)=>ev.getRangeByIndexes(0,i,evidenceRows.length+4,1).format.columnWidth=w);
ev.getRangeByIndexes(0,0,evidenceRows.length+4,evidenceHeaders.length).format.rowHeight=26; ev.getRangeByIndexes(3,0,1,evidenceHeaders.length).format.rowHeight=44; ev.freezePanes.freezeRows(4); ev.freezePanes.freezeColumns(2); ev.tables.add(`A4:AN${evidenceRows.length+4}`,true,"EvidenceTable").style="TableStyleMedium2";

const settings=wb.worksheets.add("設定・定義"); title(settings,"パラメーター・役割・評価ルール","能力15種類、役割30種類、評価上限・パヴェ基準を一つの設定タブへ統合しました。",17);
const ability=readRows("能力定義","A4:E19"), roles=readRows("役割定義","A4:H34"), rules=readRows("評価ルール","A4:Q30"), summary=readRows("能力概要","A4:H10");
settings.getRange("A4:Q4").merge(); settings.getRange("A4").values=[["能力定義 — 15種類"]]; settings.getRange("A4:Q4").format=sectionFormat;
settings.getRange("A5:E20").values=ability; settings.getRange("A5:E5").format=headerFormat; settings.getRange("A6:E20").format={...bodyFormat,wrapText:true};
settings.getRange("A23:Q23").merge(); settings.getRange("A23").values=[["役割定義 — 30種類"]]; settings.getRange("A23:Q23").format=sectionFormat;
settings.getRange("A24:H54").values=roles; settings.getRange("A24:H24").format=headerFormat; settings.getRange("A25:H54").format={...bodyFormat,wrapText:true};
settings.getRange("A57:Q57").merge(); settings.getRange("A57").values=[["評価ルール"]]; settings.getRange("A57:Q57").format=sectionFormat;
settings.getRange("A58:Q84").values=rules; settings.getRange("A58:Q58").format=headerFormat; settings.getRange("A59:Q84").format={...bodyFormat,wrapText:true};
settings.getRange("A87:Q87").merge(); settings.getRange("A87").values=[["能力設計サマリー"]]; settings.getRange("A87:Q87").format=sectionFormat;
settings.getRange("A88:H94").values=summary; settings.getRange("A88:H88").format=headerFormat; settings.getRange("A89:H94").format={...bodyFormat,wrapText:true};
[18,20,34,52,48,32,32,15,...Array(9).fill(13)].forEach((w,i)=>settings.getRangeByIndexes(0,i,94,1).format.columnWidth=w); settings.getRange("A1:Q94").format.rowHeight=30; settings.freezePanes.freezeRows(4); settings.freezePanes.freezeColumns(2);

const formulaErrors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"consolidated formula scan"});
const inspect=await wb.inspect({kind:"sheet,table",maxChars:12000,tableMaxRows:6,tableMaxCols:8});
await fs.writeFile(path.join(outputDir,"consolidated_workbook_inspect.ndjson"),inspect.ndjson,"utf8");
await fs.writeFile(path.join(outputDir,"consolidated_formula_errors.ndjson"),formulaErrors.ndjson,"utf8");
for(const [name,range] of [["概要","A1:H20"],["現役選手300名","A1:M16"],["レジェンド・引退選手","A1:M16"],["区分保留","A1:M16"],["実績・根拠","A1:AN14"],["設定・定義","A1:Q30"]]){const image=await wb.render({sheetName:name,range,scale:1,format:"png"});await fs.writeFile(path.join(outputDir,`consolidated_${name}.png`),new Uint8Array(await image.arrayBuffer()));}
const exported=await SpreadsheetFile.exportXlsx(wb); await exported.save(workbookPath);
console.log(JSON.stringify({workbookPath,sheets:wb.worksheets.items.map(s=>s.name),active:active.length,legendRetired:legendRows.length,pending:pending.length,evidence:evidenceRows.length,formulaErrors:(formulaErrors.ndjson.match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/g)||[]).length},null,2));
