import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const root = path.resolve(here, "..", "..");
const outputPath = path.join(here, "QOMISO_Game_Tour_Card_Performance.xlsx");
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(root, "data", file), "utf8"));
const basics = await readJson("basic_card_templates.json");
const specialties = await readJson("specialty_card_templates.json");
const roleCards = await readJson("assist_card_role_templates.json");
const genericDecisives = await readJson("generic_decisive_card_templates.json");
const signatures = await readJson("ace_signature_cards.json");
const eliteAssists = await readJson("elite_assist_cards.json");
const rules = await readJson("card_system_rules.json");
const assignments = await readJson("rider_card_assignments.json");

const usage = new Map();
for (const rider of assignments) {
  for (const card of [...rider.basicCards, ...rider.specialtyCards, rider.decisiveCard]) {
    const current = usage.get(card.name) ?? { count: 0, riders: [] };
    current.count += 1;
    if (current.riders.length < 5) current.riders.push(rider.riderName);
    usage.set(card.name, current);
  }
}

const slotLabel = { basic: "基本技", specialty: "得意技", decisive: "勝負手" };
const roleTypeLabel = { ace: "エース", assist: "アシスト" };
const limit = (value) => value == null || value === "" ? "制限なし" : value;
const abilities = (value) => Array.isArray(value) ? value.join(" / ") : "";
const performance = [];
const add = (entry) => performance.push({ ...entry, usage: usage.get(entry.name) ?? { count: 0, riders: [] } });

for (const card of basics) add({ category: "地形共通基本", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: `${card.terrain}${roleTypeLabel[card.roleType]}`, terrain: card.terrain, target: card.target, description: card.description, basis: abilities(card.abilities), extra: "" });
for (const card of specialties) add({ category: "地形共通得意", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: `${card.terrain}${roleTypeLabel[card.roleType]}`, terrain: card.terrain, target: card.target, description: card.description, basis: abilities(card.abilities), extra: "" });
for (const card of roleCards) add({ category: "役割共通", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: card.role, terrain: "役割依存", target: card.target, description: card.description, basis: abilities(card.abilities), extra: "" });
for (const card of genericDecisives) add({ category: "汎用勝負手", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: card.role, terrain: card.role.replace(/エース|アシスト|・TT/g, ""), target: card.target, description: card.description, basis: abilities(card.abilities), extra: `発展元: ${abilities(card.baseSpecialties)}` });
for (const card of signatures) add({ category: "エース固有", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: card.riderName, terrain: card.riderName === "Tom Pidcock" ? "下り" : `${card.primaryArchetype} / ${card.secondaryArchetype}`, target: "本人", description: card.description, basis: abilities(card.basedOn), extra: `二つ名: ${card.riderTitle}` });
for (const rider of eliteAssists) for (const card of rider.cards) add({ category: "高適性アシスト固有", slot: card.slot, cost: card.cost, usageLimit: limit(card.usageLimit), name: card.name, user: rider.riderName, terrain: "役割依存", target: card.target, description: card.description, basis: abilities(rider.basedOn), extra: `アシスト適性 ${rider.supportAptitude}` });

performance.sort((a, b) => a.cost - b.cost || a.category.localeCompare(b.category, "ja") || a.name.localeCompare(b.name, "ja"));
if (performance.length !== 157 || new Set(performance.map((card) => card.name)).size !== 157) throw new Error(`card definition mismatch: ${performance.length}`);

const wb = Workbook.create();
const colors = { title: "#F1F3F4", header: "#E0E0E0", line: "#DADCE0", text: "#202124", muted: "#5F6368", white: "#FFFFFF", basic: "#E6F4EA", specialty: "#FEF7E0", decisive: "#FCE8E6", warning: "#FFF4CE" };
const col = (index) => { let n = index + 1, out = ""; while (n) { const r = (n - 1) % 26; out = String.fromCharCode(65 + r) + out; n = Math.floor((n - 1) / 26); } return out; };

function dataSheet(sheet, title, note, headers, rows, widths, tableName, freezeColumns = 2) {
  const lastCol = col(headers.length - 1), lastRow = rows.length + 4;
  sheet.showGridLines = false;
  sheet.mergeCells(`A1:${lastCol}1`); sheet.mergeCells(`A2:${lastCol}2`);
  sheet.getRange("A1").values = [[title]]; sheet.getRange("A2").values = [[note]];
  sheet.getRange(`A1:${lastCol}1`).format = { fill: colors.title, font: { bold: true, color: colors.text, size: 16 }, verticalAlignment: "center" };
  sheet.getRange(`A2:${lastCol}2`).format = { fill: colors.white, font: { color: colors.muted, size: 10 }, verticalAlignment: "center", wrapText: true, borders: { bottom: { style: "thin", color: colors.line } } };
  sheet.getRange(`A4:${lastCol}4`).values = [headers];
  sheet.getRange(`A4:${lastCol}4`).format = { fill: colors.header, font: { bold: true, color: colors.text }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "doubleBottom", style: "thin", color: colors.line } };
  if (rows.length) {
    sheet.getRange(`A5:${lastCol}${lastRow}`).values = rows;
    sheet.getRange(`A5:${lastCol}${lastRow}`).format = { font: { color: colors.text, size: 9 }, verticalAlignment: "top", wrapText: true, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
    const table = sheet.tables.add(`A4:${lastCol}${lastRow}`, true, tableName); table.style = "TableStyleLight1"; table.showBandedRows = true; table.showFilterButton = true;
  }
  sheet.getRange(`A1:${lastCol}1`).format.rowHeight = 34; sheet.getRange(`A2:${lastCol}2`).format.rowHeight = 34; sheet.getRange(`A4:${lastCol}4`).format.rowHeight = 30;
  if (rows.length) sheet.getRange(`A5:${lastCol}${lastRow}`).format.rowHeight = 40;
  widths.forEach((width, i) => { sheet.getRange(`${col(i)}1:${col(i)}${lastRow}`).format.columnWidth = width; });
  sheet.freezePanes.freezeRows(4); sheet.freezePanes.freezeColumns(freezeColumns);
  return { lastRow, lastCol };
}

const cardSheet = wb.worksheets.add("カード性能一覧");
const cardRows = performance.map((card) => [card.category, slotLabel[card.slot], card.cost, card.usageLimit, card.name, card.user, card.terrain, card.target, card.description, card.basis, card.extra, card.usage.count, card.usage.riders.join(" / "), card.usage.count ? "採用中" : "未割当"]);
const cardMeta = dataSheet(cardSheet, "カード性能一覧", "正本で定義済みの全157カード。個別の威力係数・体力/SP消費値は未定義のため、現時点の性能はコスト・回数・対象・効果・参照能力で管理します。", ["分類", "枠", "コスト", "回数上限", "カード名", "対応役割・本人", "地形", "対象", "効果", "参照能力・根拠", "発展元・二つ名", "採用人数", "代表選手（最大5名）", "状態"], cardRows, [19, 12, 9, 12, 27, 25, 18, 18, 58, 40, 36, 12, 70, 12], "CardPerformanceTable");
cardSheet.getRange(`C5:C${cardMeta.lastRow}`).format.numberFormat = "0"; cardSheet.getRange(`L5:L${cardMeta.lastRow}`).format.numberFormat = "#,##0";
cardSheet.getRange(`B5:B${cardMeta.lastRow}`).conditionalFormats.add("containsText", { text: "基本", format: { fill: colors.basic, font: { bold: true } } });
cardSheet.getRange(`B5:B${cardMeta.lastRow}`).conditionalFormats.add("containsText", { text: "得意", format: { fill: colors.specialty, font: { bold: true } } });
cardSheet.getRange(`B5:B${cardMeta.lastRow}`).conditionalFormats.add("containsText", { text: "勝負", format: { fill: colors.decisive, font: { bold: true } } });
cardSheet.getRange(`N5:N${cardMeta.lastRow}`).conditionalFormats.add("containsText", { text: "未割当", format: { fill: colors.warning, font: { bold: true } } });

const assignmentRows = assignments.map((rider) => [rider.rosterFile.includes("01_") ? "現役" : rider.rosterFile.includes("02_") ? "引退" : "区分保留", rider.riderNo, rider.riderName, rider.primaryArchetype, rider.secondaryArchetype, rider.roleType === "ace" ? "エース型" : "アシスト型", rider.roles.join(" / "), ...rider.basicCards.map((card) => card.name), ...rider.specialtyCards.map((card) => card.name), rider.decisiveCard.name]);
const assignmentSheet = wb.worksheets.add("選手別採用");
const assignmentMeta = dataSheet(assignmentSheet, "選手別採用カード", "全510名の固定6枚。カード性能一覧の採用人数・代表選手はこの割当を集計しています。", ["区分", "No.", "選手名", "主脚質", "副脚質", "カード型", "役割（3つ）", "基本1", "基本2", "基本3", "得意1", "得意2", "勝負手"], assignmentRows, [11, 7, 24, 15, 15, 13, 34, 20, 20, 20, 22, 22, 28], "RiderCardUseTable", 3);
assignmentSheet.getRange(`B5:B${assignmentMeta.lastRow}`).format.numberFormat = "0";

const unused = performance.filter((card) => !card.usage.count);
const unusedSheet = wb.worksheets.add("未割当カード");
const unusedRows = unused.map((card) => [card.category, slotLabel[card.slot], card.cost, card.name, card.user, card.description, card.basis, "現在の510名固定デッキでは未採用。代替候補として定義を維持。"]);
const unusedMeta = dataSheet(unusedSheet, "未割当カード", "定義済みだが現在の固定6枚へ入っていないカード。削除候補ではなく、役割変更・将来選手・バランス調整用の監査対象です。", ["分類", "枠", "コスト", "カード名", "対応役割", "効果", "参照能力", "扱い"], unusedRows, [20, 12, 9, 27, 24, 58, 40, 58], "UnusedCardsTable");
unusedSheet.getRange(`C5:C${unusedMeta.lastRow}`).format.numberFormat = "0"; unusedSheet.getRange(`A5:H${unusedMeta.lastRow}`).format.fill = colors.warning;

const ruleSheet = wb.worksheets.add("カードルール");
const ruleRows = [
  ["1ターン作戦コスト", rules.turnBudget, "個人カードとチームカードの合計上限"],
  ["未使用コスト持越", rules.carryOverUnusedBudget ? "あり" : "なし", "次ターンへ持ち越さない"],
  ["同一選手の個人カード", rules.maxIndividualCardsPerRiderPerTurn, "1ターンに使える上限"],
  ["チームカード", rules.maxTeamCardsPerTurn, "1ターンに使える上限"],
  ["基本技", 1, "低コストの通常行動／1選手3枚"],
  ["得意技", 2, "条件に合う強い行動／1選手2枚"],
  ["勝負手", 3, "原則レース中1回／1選手1枚"],
  ["個人カード表示", 6, "選手選択時に固定表示。ランダムドローなし"],
  ["8人編成の候補", 48, "8人×6枚"],
  ["数値威力・体力/SP消費", "未定義", "現在は効果文と参照能力で管理。実装前に数値設計が必要"],
];
dataSheet(ruleSheet, "カード性能ルール", "性能表を読むための共通ルール。数値化済みの項目と、今後定義が必要な項目を分離しています。", ["項目", "設定", "意味"], ruleRows, [32, 18, 72], "CardRulesTable", 1);

const summary = wb.worksheets.add("概要");
summary.showGridLines = false; summary.mergeCells("A1:H1"); summary.mergeCells("A2:H2");
summary.getRange("A1").values = [["QOMISO Game Tour カード性能台帳"]]; summary.getRange("A2").values = [["カードのコスト・回数・対象・効果・参照能力・採用状況を確認する正本。更新日 2026-07-20"]];
summary.getRange("A1:H1").format = { fill: colors.title, font: { bold: true, color: colors.text, size: 18 }, verticalAlignment: "center" }; summary.getRange("A2:H2").format = { fill: colors.white, font: { color: colors.muted }, verticalAlignment: "center", borders: { bottom: { style: "thin", color: colors.line } } };
summary.getRange("A4:B4").values = [["集計", "件数"]]; summary.getRange("A5:A12").values = [["カード定義"], ["基本技"], ["得意技"], ["勝負手"], ["採用中カード"], ["未割当カード"], ["選手名簿行"], ["カード枠合計"]];
summary.getRange("B5:B12").formulas = [[`=COUNTA('カード性能一覧'!$E$5:$E$${cardMeta.lastRow})`], [`=COUNTIF('カード性能一覧'!$B$5:$B$${cardMeta.lastRow},"基本技")`], [`=COUNTIF('カード性能一覧'!$B$5:$B$${cardMeta.lastRow},"得意技")`], [`=COUNTIF('カード性能一覧'!$B$5:$B$${cardMeta.lastRow},"勝負手")`], [`=COUNTIF('カード性能一覧'!$N$5:$N$${cardMeta.lastRow},"採用中")`], [`=COUNTIF('カード性能一覧'!$N$5:$N$${cardMeta.lastRow},"未割当")`], [`=COUNTA('選手別採用'!$C$5:$C$${assignmentMeta.lastRow})`], [`=B11*6`]];
summary.getRange("D4:E4").values = [["性能項目", "現在の定義"]]; summary.getRange("D5:E10").values = [["コスト", "基本1／得意2／勝負手3"], ["回数", "勝負手は原則1回"], ["対象", "本人・味方エース・チームなど"], ["効果", "カード別の行動・支援内容"], ["参照能力", "効果判定に使う選手能力"], ["個別数値", "威力係数・体力/SP消費は未定義"]];
for (const range of ["A4:B4", "D4:E4"]) summary.getRange(range).format = { fill: colors.header, font: { bold: true, color: colors.text }, horizontalAlignment: "center" };
for (const range of ["A5:B12", "D5:E10"]) summary.getRange(range).format = { fill: colors.white, font: { color: colors.text }, wrapText: true, borders: { insideHorizontal: { style: "thin", color: colors.line } } };
summary.getRange("B5:B12").format.numberFormat = "#,##0"; summary.getRange("A1:H1").format.rowHeight = 38; summary.getRange("A2:H2").format.rowHeight = 32;
[["A", 25], ["B", 14], ["D", 24], ["E", 55]].forEach(([letter, width]) => { summary.getRange(`${letter}1:${letter}12`).format.columnWidth = width; }); summary.freezePanes.freezeRows(2);
summary.position = 0;

await fs.mkdir(here, { recursive: true });
const inspect = await wb.inspect({ kind: "table", range: "概要!A1:E12", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 8 });
await fs.writeFile(path.join(here, "card_performance_summary_inspect.ndjson"), inspect.ndjson, "utf8");
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(here, "card_performance_formula_errors.ndjson"), errors.ndjson, "utf8");
for (const [name, range] of [["概要", "A1:E12"], ["カード性能一覧", "A1:N22"], ["選手別採用", "A1:M20"], ["未割当カード", `A1:H${unusedMeta.lastRow}`], ["カードルール", "A1:C14"]]) {
  const preview = await wb.render({ sheetName: name, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(here, `card_performance_${name}.png`), new Uint8Array(await preview.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(wb); await output.save(outputPath);
console.log(JSON.stringify({ outputPath, cards: performance.length, basic: performance.filter((card) => card.slot === "basic").length, specialty: performance.filter((card) => card.slot === "specialty").length, decisive: performance.filter((card) => card.slot === "decisive").length, used: performance.filter((card) => card.usage.count).length, unused: unused.length, assignments: assignments.length, cardSlots: assignments.length * 6, formulaErrors: errors.ndjson.includes("matched 0 entries") ? 0 : 1 }, null, 2));
