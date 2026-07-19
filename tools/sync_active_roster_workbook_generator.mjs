import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "outputs", "019f7863-1000-7941-8be7-a93707fedcde", "build_rider_parameters_300.mjs");
let source = await fs.readFile(filePath, "utf8");

function replaceOnce(before, after) {
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`置換元が見つかりません: ${before.slice(0, 100)}`);
  source = source.replace(before, after);
}

replaceOnce(
  'const roleDefinitionPath = path.join(workspace, "data", "rider_role_definitions.json");',
  'const roleDefinitionPath = path.join(workspace, "data", "rider_role_definitions.json");\nconst activeRosterPath = path.join(workspace, "data", "rider_parameters_active_300.csv");\nconst retiredRosterPath = path.join(workspace, "data", "rider_parameters_retired.csv");\nconst pendingRosterPath = path.join(workspace, "data", "rider_parameters_status_pending.csv");'
);

replaceOnce(
  'const fixedByName = new Map(fixedRows.map((row) => [normalize(row.name), row]));',
  'const loadCsvObjects = async (filePath) => {\n  const lines = (await fs.readFile(filePath, "utf8")).trim().split(/\\r?\\n/);\n  const headers = parseCsvLine(lines.shift());\n  return lines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])); });\n};\nconst activeRoster = await loadCsvObjects(activeRosterPath);\nconst retiredRoster = await loadCsvObjects(retiredRosterPath);\nconst pendingRoster = await loadCsvObjects(pendingRosterPath);\nif (activeRoster.length !== 300) throw new Error(`現役選手は300名必須です: ${activeRoster.length}`);\nconst fixedByName = new Map(fixedRows.map((row) => [normalize(row.name), row]));'
);

replaceOnce(
  'listSheet.getRange("I4:K4").values = [["役割・戦術特性", "旧専門役割", "適性タグ"]];\nlistSheet.getRange("I5:K304").values = rows.map((row) => [row.preferred, row.specialistRole, row.tags.join(" / ")]);',
  'listSheet.getRange("A4:N4").values = [["No.", "実在選手名", "二つ名", "国・地域", "現所属", "主脚質", "副脚質", "エース適性", "アシスト適性", "役割・戦術特性", "適性タグ", "Credit", "現役区分", "人物URL"]];\nlistSheet.getRange("A5:N304").values = activeRoster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.current_team, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, row.aptitude_tags, Number(row.credit_salary), row.active_status, row.profile_url]);'
);

replaceOnce(
  'const ratingRows = rows.map((row) => [row.no, row.name, row.title, row.country, row.era, row.primary, row.secondary, row.aceAptitude, row.supportAptitude, row.preferred, row.specialistRole, row.tags.join(" / "), row.credit, ...statKeys.map((key) => row.stats[key]), row.pave.best, row.pave.finishes, row.pave.top10s, row.pave.wins, row.pave.status, row.pave.basis, row.pave.source, row.ratingStatus, row.ratingBasis, row.profileUrl]);',
  'const ratingRows = activeRoster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.era, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, "", row.aptitude_tags, Number(row.credit_salary), ...statKeys.map((key) => Number(row[key])), Number(row.pave_best_result), Number(row.pave_finishes), Number(row.pave_top10s), Number(row.pave_wins), row.pave_status, row.pave_basis, row.pave_source_url, row.rating_status, row.rating_basis, row.profile_url]);'
);

source = source.replace(
  'for (const row of rows) for (const role of String(row.preferred || "").split(" / ").filter(Boolean)) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);',
  'for (const row of activeRoster) for (const role of String(row.preferred_roles || "").split(" / ").filter(Boolean)) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);'
);

replaceOnce(
  'const titledRows = rows.filter((row) => row.title);',
  'const titledRows = activeRoster.filter((row) => row.rider_title);'
);
replaceOnce(
  'titleSheet.getRange(`A5:H${titledRows.length + 4}`).values = titledRows.map((row) => [row.no, row.name, row.title, row.titleEligibility, row.credit, row.primary, row.secondary, row.titleBasis]);',
  'titleSheet.getRange(`A5:H${titledRows.length + 4}`).values = titledRows.map((row) => [Number(row.no), row.name, row.rider_title, row.rider_title_eligibility, Number(row.credit_salary), row.primary_archetype, row.secondary_archetype, row.rider_title_basis]);'
);

replaceOnce(
  'paveSheet.getRange("A5:M304").values = rows.map((row) => [row.no, row.name, row.stats.pave, row.pave.best, row.pave.finishes, row.pave.top10s, row.pave.wins, row.pave.rondeWins, row.pave.status, row.pave.basis, row.pave.source, row.pave.rondeSource, row.ratingStatus]);',
  'paveSheet.getRange("A5:M304").values = activeRoster.map((row) => { const monument = monumentByName.get(normalize(row.name)) || {}; return [Number(row.no), row.name, Number(row.pave), Number(row.pave_best_result), Number(row.pave_finishes), Number(row.pave_top10s), Number(row.pave_wins), Number(monument.flanders || 0), row.pave_status, row.pave_basis, row.pave_source_url, monument.rondeSource || "", row.rating_status]; });'
);

replaceOnce(
  'worldSheet.getRange("A5:L304").values = rows.map((row) => [row.no, row.name, row.world.road.gold, row.world.road.silver, row.world.road.bronze, row.world.itt.gold, row.world.itt.silver, row.world.itt.bronze, row.world.road.years.map((item) => `${item.year}:${item.medal}`).join(" / "), row.world.itt.years.map((item) => `${item.year}:${item.medal}`).join(" / "), row.worldBasis, row.worldSource]);',
  'worldSheet.getRange("A5:L304").values = activeRoster.map((row) => [Number(row.no), row.name, Number(row.world_road_gold), Number(row.world_road_silver), Number(row.world_road_bronze), Number(row.world_itt_gold), Number(row.world_itt_silver), Number(row.world_itt_bronze), "", "", row.world_championship_basis, row.world_championship_source_url]);'
);

if (!source.includes('createRosterSheet("現役選手300名"')) {
  const anchor = 'const rules = workbook.worksheets.add("評価ルール");';
  const code = `const rosterHeaders = ["No.", "実在選手名", "二つ名", "国・地域", "現所属", "生年月日", "区分", "主脚質", "副脚質", "エース適性", "アシスト適性", "役割・戦術特性", "Credit", ...statLabels, "選定根拠", "現役確認URL", "評価状態", "人物URL"];\nfunction createRosterSheet(sheetName, roster, tableName) {\n  const sheet = workbook.worksheets.add(sheetName);\n  const endRow = roster.length + 4;\n  sheet.showGridLines = false;\n  sheet.getRangeByIndexes(0, 0, 1, rosterHeaders.length).merge(); sheet.getCell(0, 0).values = [[\`\${sheetName} — 役割・全15能力\`]]; sheet.getRangeByIndexes(0, 0, 1, rosterHeaders.length).format = titleFormat;\n  sheet.getRangeByIndexes(1, 0, 1, rosterHeaders.length).merge(); sheet.getCell(1, 0).values = [["役割・戦術特性は統合済み。エース適性順のNo.で管理します。"]]; sheet.getRangeByIndexes(1, 0, 1, rosterHeaders.length).format = subtitleFormat;\n  sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).values = [rosterHeaders]; sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).format = headerFormat;\n  sheet.getRangeByIndexes(4, 0, roster.length, rosterHeaders.length).values = roster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.current_team, row.birth_date, row.active_status, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, Number(row.credit_salary), ...statKeys.map((key) => Number(row[key])), row.selection_basis, row.active_source_url, row.rating_status, row.profile_url]);\n  sheet.getRangeByIndexes(4, 0, roster.length, rosterHeaders.length).format = bodyFormat;\n  sheet.getRangeByIndexes(4, 9, roster.length, 2).format.numberFormat = "0"; sheet.getRangeByIndexes(4, 12, roster.length, 1).format.numberFormat = "#,##0 \\\"Cr\\\""; sheet.getRangeByIndexes(4, 13, roster.length, 15).format.numberFormat = "0";\n  const widths = [7, 26, 25, 14, 28, 14, 14, 18, 18, 12, 14, 40, 13, ...Array(15).fill(11), 48, 58, 20, 52];\n  widths.forEach((width, index) => sheet.getRangeByIndexes(0, index, endRow, 1).format.columnWidth = width);\n  sheet.getRangeByIndexes(4, 2, roster.length, 1).format = { ...bodyFormat, font: { name: "Yu Gothic", color: "#7A4A00", bold: true } };\n  sheet.getRangeByIndexes(4, 11, roster.length, 1).format.wrapText = true; sheet.getRangeByIndexes(4, 28, roster.length, 4).format.wrapText = true;\n  sheet.getRangeByIndexes(0, 0, endRow, rosterHeaders.length).format.rowHeight = 26; sheet.getRangeByIndexes(0, 0, 2, rosterHeaders.length).format.rowHeight = 34; sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).format.rowHeight = 42;\n  sheet.freezePanes.freezeRows(4); sheet.freezePanes.freezeColumns(2); sheet.tables.add(\`A4:AF\${endRow}\`, true, tableName).style = "TableStyleMedium2";\n}\ncreateRosterSheet("現役選手300名", activeRoster, "ActiveRiderTable");\ncreateRosterSheet("引退選手", retiredRoster, "RetiredRiderTable");\ncreateRosterSheet("区分保留", pendingRoster, "PendingRiderTable");\n\n`;
  if (!source.includes(anchor)) throw new Error("roster sheet anchor not found");
  source = source.replace(anchor, code + anchor);
}

await fs.writeFile(filePath, source, "utf8");
console.log(JSON.stringify({ file: path.relative(workspace, filePath), active: 300, retired: 170, pending: 40 }, null, 2));
