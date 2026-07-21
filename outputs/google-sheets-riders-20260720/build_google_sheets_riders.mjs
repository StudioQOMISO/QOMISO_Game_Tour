import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const workspace = path.resolve(outputDir, "..", "..");
const sourcePath = path.join(workspace, "outputs", "019f62a4-ba4e-7ce2-af75-e9b62e4e67a6", "QOMISO_Game_Tour_実在選手モチーフ300名_仮Credit.xlsx");
const outputPath = path.join(outputDir, "QOMISO_Game_Tour_実在選手300名_全パラメーター.xlsx");
const csvPath = path.join(workspace, "data", "rider_parameters_300.csv");
const fixedCsvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const markdownPath = path.join(workspace, "docs", "rider_parameters_300.md");
const paveJsonPath = path.join(workspace, "data", "paris_roubaix_results_300.json");
const worldJsonPath = path.join(workspace, "data", "world_championship_achievements_300.json");
const roleDefinitionPath = path.join(workspace, "data", "rider_role_definitions.json");
const activeRosterPath = path.join(workspace, "選手スプレッドシート", "01_現役選手300名.csv");
const retiredRosterPath = path.join(workspace, "選手スプレッドシート", "02_引退選手.csv");
const pendingRosterPath = path.join(workspace, "選手スプレッドシート", "03_区分保留.csv");

const statKeys = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "pave", "recovery", "dailyRecovery", "teamwork", "ego", "fighting"];
const statLabels = ["スプリント", "加速力", "パンチ力", "巡航力", "登坂力", "持久力", "耐性", "技術", "バイクコントロール", "パヴェ", "回復力", "日間回復力", "チームワーク", "エゴ", "負けん気"];
const statDefinitions = [
  ["sprint", "スプリント", "5〜20秒の最高速", "ゴールスプリント、最高速維持", "スプリント勝利・ポイント賞・脚質"],
  ["acceleration", "加速力", "速度変化の鋭さ", "アタック開始、位置取り、再加速", "脚質・スプリント/パンチ特性"],
  ["punch", "パンチ力", "30秒〜5分の高出力", "短坂、丘陵アタック、集団からの飛び出し", "丘陵脚質・リエージュ/ロンド実績"],
  ["cruise", "巡航力", "数分以上の高速維持", "平坦牽引、逃げ、個人TT、チームTT", "TT・ルーラー脚質・GT実績"],
  ["climb", "登坂力", "長い登りでの速度", "山岳、総合争い、山岳牽引", "総合・山岳実績、クライマー脚質"],
  ["stamina", "持久力", "長距離を走り切る容量", "距離による疲労増加を軽減", "長距離クラシック・GT実績"],
  ["resistance", "耐性", "高強度を繰り返す力", "アタック・スプリント時の疲労と乳酸を軽減", "脚質、反復勝負、長期実績"],
  ["technique", "技術", "位置取り・判断・走行効率", "隊列、補給、TT、トラブル回避", "脚質・適性タグ・アシスト適性"],
  ["bikeControl", "バイクコントロール", "コーナー・下り・悪路の操作", "下り速度、落車・悪路消耗を軽減", "下り・悪路・複合競技特性"],
  ["pave", "パヴェ", "石畳を速く安全に走る専門能力", "石畳出力とトラブル耐性。グラベルとは分離", "パリ〜ルーベを主基準、ロンド優勝実績を副基準"],
  ["recovery", "回復力", "レース中の短時間回復", "乳酸低下、SP回復、反復アタック", "脚質・ステージ実績・回復特性"],
  ["dailyRecovery", "日間回復力", "ステージ間の一晩の回復", "翌日の疲労・SP・健康・乳酸開始値", "GT総合・長期安定性・適性タグ"],
  ["teamwork", "チームワーク", "役割遂行と連携", "牽引、エース保護、補給、隊列維持", "アシスト適性・役割特性"],
  ["ego", "エゴ", "自分で勝負したがる強さ", "チームワーク超過分だけ編成リスク", "エース適性とアシスト適性の差"],
  ["fighting", "負けん気", "苦しい局面で勝負を続ける力", "終盤、逃げ、悪条件、接戦", "勝利実績・脚質・戦術特性"],
];

const profiles = {
  "総合型": [58, 72, 75, 78, 82, 82, 81, 78, 76, 50, 82, 83, 75, 75, 80],
  "スプリンター": [83, 82, 70, 76, 55, 75, 77, 80, 74, 50, 74, 73, 72, 80, 78],
  "クライマー": [55, 75, 78, 68, 84, 82, 82, 73, 76, 50, 80, 81, 74, 74, 81],
  "パンチャー": [72, 82, 84, 75, 76, 79, 81, 79, 80, 50, 78, 78, 72, 78, 82],
  "クラシック型": [75, 78, 79, 81, 65, 83, 84, 82, 83, 50, 78, 78, 77, 77, 83],
  "TT・ルーラー型": [66, 70, 68, 84, 69, 83, 82, 82, 79, 50, 77, 77, 81, 70, 78],
};

const tagBonuses = {
  "最高速": { sprint: 2, acceleration: 1 }, "スプリント": { sprint: 1, acceleration: 1 }, "集団スプリント": { sprint: 1, technique: 1 },
  "パンチ力": { punch: 2, acceleration: 1 }, "反復加速": { acceleration: 1, resistance: 1 },
  "巡航力": { cruise: 2, stamina: 1 }, "TT適性": { cruise: 2, technique: 1 },
  "登坂力": { climb: 2 }, "山岳耐久": { climb: 1, stamina: 1 },
  "日別回復": { dailyRecovery: 2, recovery: 1 }, "総合安定": { dailyRecovery: 1, resistance: 1 },
  "バイクコントロール": { bikeControl: 2 }, "下り": { bikeControl: 2, technique: 1 }, "悪路耐性": { bikeControl: 1, resistance: 1 },
  "位置取り": { technique: 2 }, "リードアウト": { teamwork: 1, technique: 1 }, "逃げ屋": { fighting: 1, cruise: 1 }, "ステージハンター": { fighting: 1, recovery: 1 },
};

const clamp = (value, min = 50, max = 85) => Math.max(min, Math.min(max, Math.round(value)));
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const csvCell = (value) => /[",\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
function parseCsvLine(line) {
  const cells = []; let cell = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell); return cells;
}
const decodeHtml = (value) => value.replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&apos;|&#39;/gi, "'").replace(/&[a-z]+;|&#\d+;/gi, " ");

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const listSheet = workbook.worksheets.getItem("選手一覧");
const sourceRows = listSheet.getRange("A5:N304").values.map((row) => ({
  no: Number(row[0]), name: String(row[1]), country: String(row[2]), era: String(row[3]), primary: String(row[4]), secondary: String(row[5]),
  aceAptitude: Number(row[6]), supportAptitude: Number(row[7]), preferred: String(row[8] || ""), specialistRole: String(row[9] || ""),
  tags: String(row[10] || "").split(" / ").filter(Boolean), credit: Number(row[11]), motif: String(row[12] || ""), profileUrl: String(row[13] || ""),
}));

const fixedLines = (await fs.readFile(fixedCsvPath, "utf8")).trim().split(/\r?\n/);
const fixedHeaders = parseCsvLine(fixedLines.shift());
const fixedRows = fixedLines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(fixedHeaders.map((header, index) => [header, cells[index] ?? ""])); });
const loadCsvObjects = async (filePath) => {
  const lines = (await fs.readFile(filePath, "utf8")).trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => { const cells = parseCsvLine(line); return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])); });
};
const activeRoster = await loadCsvObjects(activeRosterPath);
const retiredRoster = await loadCsvObjects(retiredRosterPath);
const pendingRoster = await loadCsvObjects(pendingRosterPath);
if (activeRoster.length !== 300) throw new Error(`現役選手は300名必須です: ${activeRoster.length}`);
const fixedByName = new Map(fixedRows.map((row) => [normalize(row.name), row]));
if (fixedRows.length !== 300 || fixedByName.size !== 300) throw new Error(`固定正本は300名必須です: rows=${fixedRows.length}, unique=${fixedByName.size}`);

const gtData = JSON.parse(await fs.readFile(path.join(workspace, "data", "grand_tour_achievements_300.json"), "utf8"));
const monumentData = JSON.parse(await fs.readFile(path.join(workspace, "data", "monument_achievements_300.json"), "utf8"));
const gtByName = new Map(gtData.riders.map((row) => [normalize(row.name), row]));
const monumentByName = new Map(monumentData.riders.map((row) => [normalize(row.name), row]));
const worldData = JSON.parse(await fs.readFile(worldJsonPath, "utf8"));
const roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));
const worldByName = new Map(worldData.riders.map((row) => [normalize(row.name), row]));


async function fetchRoubaixYear(year) {
  if (year === 2020) return { year, url: "", results: [] };
  const url = `https://bikeraceinfo.com/classics/paris-roubaix/pr${year}.html`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { year, url, results: [], error: `HTTP ${response.status}` };
    const html = await response.text();
    const lines = decodeHtml(html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<\/tr>/gi, "\n").replace(/<\/td>/gi, "\n").replace(/<[^>]+>/g, " "))
      .split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
    let start = -1;
    lines.forEach((line, index) => { if (/^complete results:?$/i.test(line)) start = index; });
    const results = [];
    let lastRank = 0;
    for (let index = start + 1; index < lines.length - 1; index += 1) {
      if (!/^\d{1,3}$/.test(lines[index])) continue;
      const rank = Number(lines[index]);
      const name = lines[index + 1];
      if (rank < 1 || rank > 250 || !/[A-Za-zÀ-ž]/.test(name)) continue;
      if (lastRank >= 10 && rank <= lastRank) break;
      if (rank < lastRank) continue;
      results.push({ rank, name });
      lastRank = rank;
    }
    return { year, url, results, error: results.length ? "" : "順位抽出なし" };
  } catch (error) {
    return { year, url, results: [], error: error.message };
  }
}

const years = Array.from({ length: 67 }, (_, index) => 1960 + index).filter((year) => year !== 2020);
const yearResults = [];
for (let index = 0; index < years.length; index += 8) {
  yearResults.push(...await Promise.all(years.slice(index, index + 8).map(fetchRoubaixYear)));
}

const riderKeyByCompressed = new Map(sourceRows.map((rider) => [normalize(rider.name), normalize(rider.name)]));
const paveHistory = new Map(sourceRows.map((rider) => [normalize(rider.name), []]));
for (const edition of yearResults) {
  for (const result of edition.results) {
    const key = riderKeyByCompressed.get(normalize(result.name));
    if (key) paveHistory.get(key).push({ year: edition.year, rank: result.rank, url: edition.url });
  }
}

const manualPave = new Map([
  ["Peter Sagan", { value: 84, basis: "2018優勝、2019年5位、2014年6位", status: "手動検証済" }],
  ["Luke Rowe", { value: 78, basis: "2015年8位、2016年14位、10回出走8回完走", status: "手動検証済" }],
  ["Mark Cavendish", { value: 69, basis: "最高30位、2回出走1回完走", status: "手動検証済" }],
  ["Tim Declercq", { value: 69, basis: "最高39位", status: "手動検証済" }],
  ["Fumiyuki Beppu", { value: 64, basis: "最高71位、5回出走1回完走", status: "手動検証済" }],
  ["Mark Renshaw", { value: 57, basis: "2回出走、完走なし", status: "手動検証済" }],
  ["Yukiya Arashiro", { value: 57, basis: "1回出走、完走なし", status: "手動検証済" }],
  ["Marco Pantani", { value: 50, basis: "未出走", status: "手動検証済" }],
  ["Sepp Kuss", { value: 50, basis: "未出走", status: "手動検証済" }],
].map(([name, value]) => [normalize(name), value]));

function paveRating(rider, monument) {
  const rondeWins = Number(monument.flanders || 0);
  const rondeFloor = rondeWins >= 3 ? 80 : rondeWins === 2 ? 78 : rondeWins === 1 ? 76 : 50;
  const rondeSource = "https://www.rondevanvlaanderen.be/en/race/men-elite/history";
  const combineRonde = (base) => {
    const rondeBonus = Math.min(3, Math.max(0, rondeWins));
    const value = Math.min(85, Math.max(base.value + rondeBonus, rondeFloor));
    const rondeBasis = rondeWins ? ` / ロンド優勝${rondeWins}回・加点+${rondeBonus}・最低保証${rondeFloor}` : "";
    return { ...base, value, rondeWins, rondeFloor, rondeSource, basis: `${base.basis}${rondeBasis}` };
  };
  const key = normalize(rider.name);
  const history = paveHistory.get(key) || [];
  const manual = manualPave.get(key);
  if (manual) return combineRonde({ ...manual, best: history.length ? Math.min(...history.map((row) => row.rank)) : "", finishes: history.length, top10s: history.filter((row) => row.rank <= 10).length, wins: monument.roubaix || 0, source: history.sort((a, b) => a.rank - b.rank)[0]?.url || "https://www.paris-roubaix.fr/en/history" });
  if (!history.length && !monument.roubaix) return combineRonde({ value: 50, best: "", finishes: 0, top10s: 0, wins: 0, status: "要出走確認", basis: "1960〜2026完走順位との一致なし。未出走または表記差を要確認", source: "https://bikeraceinfo.com/classics/paris-roubaix/paris-roubaix-index.html" });
  const best = history.length ? Math.min(...history.map((row) => row.rank)) : 1;
  const finishes = history.length;
  const top10s = history.filter((row) => row.rank <= 10).length;
  const wins = Number(monument.roubaix || history.filter((row) => row.rank === 1).length);
  let value = wins >= 4 ? 85 : wins === 3 ? 84 : wins === 2 ? 83 : wins === 1 ? 82 : best <= 3 ? 80 : best <= 5 ? 78 : best <= 10 ? 76 : best <= 20 ? 73 : best <= 50 ? 69 : 64;
  if (!wins) value = Math.min(82, value + Math.min(2, Math.max(0, top10s - 1) + (finishes >= 5 ? 1 : 0)));
  const bestRow = history.sort((a, b) => a.rank - b.rank || a.year - b.year)[0];
  return combineRonde({ value, best, finishes, top10s, wins, status: "結果照合済", basis: `最高${best}位 / 完走${finishes}回 / Top10 ${top10s}回 / 優勝${wins}回`, source: bestRow?.url || "https://www.paris-roubaix.fr/en/history" });
}

function achievementTotals(gt) {
  const races = [gt.tour, gt.giro, gt.vuelta];
  return {
    gc: races.reduce((sum, race) => sum + race.gc, 0), stages: races.reduce((sum, race) => sum + race.stages, 0),
    points: races.reduce((sum, race) => sum + race.points, 0), mountains: races.reduce((sum, race) => sum + race.mountains, 0), young: races.reduce((sum, race) => sum + race.young, 0),
  };
}

function buildStats(rider, gt, monument, pave) {
  const primary = profiles[rider.primary];
  const secondary = profiles[rider.secondary] || primary;
  const stats = Object.fromEntries(statKeys.map((key, index) => [key, primary[index] * 0.78 + secondary[index] * 0.22]));
  const overallAdjustment = Math.max(-2, Math.min(2, Math.round((((rider.aceAptitude + rider.supportAptitude) / 2) - 76) / 10)));
  for (const key of ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "recovery", "dailyRecovery", "fighting"]) stats[key] += overallAdjustment;
  stats.teamwork += Math.max(-3, Math.min(4, Math.round((rider.supportAptitude - 80) / 5)));
  stats.ego += Math.max(-4, Math.min(5, Math.round((rider.aceAptitude - rider.supportAptitude) / 6)));
  for (const tag of rider.tags) for (const [key, bonus] of Object.entries(tagBonuses[tag] || {})) stats[key] += bonus;
  const totals = achievementTotals(gt);
  stats.climb += Math.min(4, totals.gc); stats.stamina += Math.min(3, totals.gc); stats.dailyRecovery += Math.min(4, totals.gc); stats.recovery += Math.min(3, totals.gc); stats.cruise += Math.min(2, totals.gc);
  if (rider.primary === "スプリンター") { stats.sprint += Math.min(4, Math.floor(totals.stages / 10)); stats.acceleration += Math.min(2, Math.floor(totals.stages / 20)); }
  else if (rider.primary === "クライマー" || rider.primary === "総合型") stats.climb += Math.min(3, Math.floor(totals.stages / 8));
  else stats.fighting += Math.min(3, Math.floor(totals.stages / 10));
  stats.sprint += Math.min(4, totals.points); stats.resistance += Math.min(2, totals.points);
  stats.climb += Math.min(4, totals.mountains); stats.stamina += Math.min(2, totals.mountains); stats.fighting += Math.min(2, totals.mountains);
  stats.sprint += Math.min(2, monument.msr); stats.stamina += Math.min(2, monument.msr);
  stats.punch += Math.min(3, monument.flanders); stats.stamina += Math.min(2, monument.flanders); stats.bikeControl += Math.min(2, monument.flanders);
  stats.punch += Math.min(3, monument.liege); stats.climb += Math.min(2, monument.liege);
  stats.climb += Math.min(3, monument.lombardia); stats.punch += Math.min(2, monument.lombardia); stats.stamina += Math.min(2, monument.lombardia);
  for (const key of statKeys) stats[key] = clamp(stats[key]);
  stats.pave = pave.value;
  const fixed = fixedByName.get(normalize(rider.name));
  if (!fixed) throw new Error(`固定能力値がありません: ${rider.name}`);
  const fixedMax = rider.name === "Tadej Pogacar" ? 88 : 85;
  for (const key of statKeys) stats[key] = clamp(Number(fixed[key]), 50, fixedMax);
  return stats;
}

const rows = sourceRows.map((rider) => {
  const gt = gtByName.get(normalize(rider.name)) || { tour: {}, giro: {}, vuelta: {} };
  const monument = monumentByName.get(normalize(rider.name)) || { msr: 0, flanders: 0, roubaix: 0, liege: 0, lombardia: 0 };
  const pave = paveRating(rider, monument);
  const stats = buildStats(rider, gt, monument, pave);
  const fixed = fixedByName.get(normalize(rider.name));
  const world = worldByName.get(normalize(rider.name)) || { road: { gold: 0, silver: 0, bronze: 0, years: [] }, itt: { gold: 0, silver: 0, bronze: 0, years: [] } };
  return { ...rider, no: Number(fixed.no || rider.no), aceAptitude: Number(fixed.ace_aptitude || rider.aceAptitude), supportAptitude: Number(fixed.support_aptitude || rider.supportAptitude), credit: Number(fixed.credit_salary || rider.credit), monument, preferred: fixed.preferred_roles || rider.preferred, specialistRole: "", tags: String(fixed.aptitude_tags || "").split(" / ").filter(Boolean).length ? String(fixed.aptitude_tags).split(" / ").filter(Boolean) : rider.tags, stats, pave, world, title: fixed.rider_title || "", titleEligibility: fixed.rider_title_eligibility || "対象外", titleBasis: fixed.rider_title_basis || "", worldBasis: fixed.world_championship_basis || "ロード 金0/銀0/銅0、ITT 金0/銀0/銅0", worldSource: fixed.world_championship_source_url || "", ratingStatus: fixed.rating_status || "世界選手権反映・300名再編成済", ratingBasis: fixed.rating_basis || "世界選手権実績補正＋能力別順位上限方式" };
});
rows.sort((a, b) => a.no - b.no);

listSheet.getRange("A4:N4").values = [["No.", "実在選手名", "二つ名", "国・地域", "現所属", "主脚質", "副脚質", "エース適性", "アシスト適性", "役割・戦術特性", "適性タグ", "Credit", "現役区分", "人物URL"]];
listSheet.getRange("A5:N304").values = activeRoster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.current_team, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, row.aptitude_tags, Number(row.credit_salary), row.active_status, row.profile_url]);
for (const sheetName of ["選手一覧", "モニュメント実績", "GT実績"]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  sheet.freezePanes.freezeRows(4);
  sheet.freezePanes.freezeColumns(2);
}

const csvHeaders = ["no", "name", "rider_title", "rider_title_eligibility", "rider_title_basis", "country", "era", "primary_archetype", "secondary_archetype", "ace_aptitude", "support_aptitude", "preferred_roles", "specialist_role", "aptitude_tags", "credit_salary", ...statKeys, "pave_best_result", "pave_finishes", "pave_top10s", "pave_wins", "pave_status", "pave_basis", "pave_source_url", "rating_status", "rating_basis", "profile_url", "world_road_gold", "world_road_silver", "world_road_bronze", "world_itt_gold", "world_itt_silver", "world_itt_bronze", "world_championship_basis", "world_championship_source_url"];
const ratingRows = activeRoster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.era, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, "", row.aptitude_tags, Number(row.credit_salary), ...statKeys.map((key) => Number(row[key])), Number(row.pave_best_result), Number(row.pave_finishes), Number(row.pave_top10s), Number(row.pave_wins), row.pave_status, row.pave_basis, row.pave_source_url, row.rating_status, row.rating_basis, row.profile_url]);
const csvRows = rows.map((row) => [row.no, row.name, row.title, row.titleEligibility, row.titleBasis, row.country, row.era, row.primary, row.secondary, row.aceAptitude, row.supportAptitude, row.preferred, row.specialistRole, row.tags.join(" / "), row.credit, ...statKeys.map((key) => row.stats[key]), row.pave.best, row.pave.finishes, row.pave.top10s, row.pave.wins, row.pave.status, row.pave.basis, row.pave.source, row.ratingStatus, row.ratingBasis, row.profileUrl, row.world.road.gold, row.world.road.silver, row.world.road.bronze, row.world.itt.gold, row.world.itt.silver, row.world.itt.bronze, row.worldBasis, row.worldSource]);
await fs.writeFile(csvPath, [csvHeaders, ...csvRows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
await fs.writeFile(paveJsonPath, JSON.stringify({ snapshot: "2026 Paris-Roubaix + Ronde van Vlaanderen final", source: "Paris-Roubaix主基準・Ronde優勝実績副基準", rondeSource: "https://www.rondevanvlaanderen.be/en/race/men-elite/history", pages: yearResults.map((row) => ({ year: row.year, url: row.url, finishers: row.results.length, error: row.error || "" })), riders: rows.map((row) => ({ no: row.no, name: row.name, value: row.stats.pave, best: row.pave.best, finishes: row.pave.finishes, top10s: row.pave.top10s, wins: row.pave.wins, rondeWins: row.pave.rondeWins, rondeFloor: row.pave.rondeFloor, status: row.pave.status, basis: row.pave.basis, source: row.pave.source })) }, null, 2) + "\n", "utf8");

const mdCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const md = [
  "# 実在選手300名 全パラメーター",
  "",
  "> 300名全員を固定値として管理する正本閲覧用Markdownです。架空選手は含みません。通常選手の全能力は50〜85。Tadej Pogacarのみ特別Tierとして上限88です。パヴェの成績確認状態は能力値の固定状態とは分離します。",
  "",
  "## パラメーター15種類",
  "",
  "| キー | 表示名 | 特徴 | ゲームへの影響 | 主な根拠 |",
  "|---|---|---|---|---|",
  ...statDefinitions.map((row) => `| ${row.map(mdCell).join(" | ")} |`),
  "",
  `- 選手数: ${rows.length}名`,
  `- 世界選手権表彰台実績あり: ${rows.filter((row) => row.world.road.gold + row.world.road.silver + row.world.road.bronze + row.world.itt.gold + row.world.itt.silver + row.world.itt.bronze > 0).length}名`,
  `- 固定能力値: ${rows.length * statKeys.length}個`,
  `- パヴェ成績照合済・手動検証済: ${rows.filter((row) => row.pave.status !== "要出走確認").length}名`,
  `- パヴェ出走確認待ち: ${rows.filter((row) => row.pave.status === "要出走確認").length}名`,
  "",
];
md.push("## 役割・戦術特性", "", "旧「得意役割」「専門役割」を単一カテゴリーへ統合。実装は preferred_roles を正本とし、specialist_role は互換用空欄。", "", "| No. | カテゴリー | 役割名 | ロードレース上の意味 | ゲーム内効果 | 参照能力 | 実戦用語・英語 |", "|---:|---|---|---|---|---|---|", ...roleDefinitions.map((role, index) => `| ${index + 1} | ${mdCell(role.category)} | ${mdCell(role.name)} | ${mdCell(role.raceMeaning)} | ${mdCell(role.gameEffect)} | ${mdCell(role.abilities.join("、"))} | ${mdCell(role.term)} |`), "");
md.push("## 世界選手権実績の反映", "", "- 世界選手権エリート男子ロードは、金3・銀2・銅1の実績点を3段階化し、持久力・耐性・技術・負けん気へ補正する。", "- 世界選手権エリート男子個人TTは、同じ実績点を巡航力・持久力・耐性・技術へ補正する。", "- 2025年大会までの表彰台を対象とし、補正後に300名順位上限を適用する。", "");
md.push("## 85希少化ルール", "", "- 例外: Tadej Pogacarのみ特別Tier。エース適性100、Credit 20,000、主要能力上限88。",  "- 85は各能力最大2名、1選手最大2項目。世界選手権実績補正後の値を候補とする。", "- 同点は関連能力、エース／アシスト適性、Creditで順位付けする。", "- パヴェは順位正規化せず、パリ〜ルーベを主基準とし、ロンド優勝は1勝+1・2勝+2・3勝以上+3を加点し、最低保証76・78・80も適用して300名全員を再計算する。", "");
md.push("## ゲーム内二つ名", "", "- Credit 10,000以上、またはCredit未満でも世界選手権ロード／個人TT・パリ〜ルーベ優勝者に付与する。", "- 史実上の正式な異名一覧ではなく、脚質と実績を短く表現したゲーム内演出名。", "", "| No. | 選手名 | 二つ名 | 付与区分 | 根拠 |", "|---:|---|---|---|---|");
for (const row of rows.filter((row) => row.title)) md.push(`| ${row.no} | ${mdCell(row.name)} | ${mdCell(row.title)} | ${mdCell(row.titleEligibility)} | ${mdCell(row.titleBasis)} |`);
md.push("");
const groups = [
  ["勝負・走行能力", ["sprint", "acceleration", "punch", "cruise", "climb"]],
  ["持久・技術・路面能力", ["stamina", "resistance", "technique", "bikeControl", "pave"]],
  ["回復・連携・精神能力", ["recovery", "dailyRecovery", "teamwork", "ego", "fighting"]],
];
for (const [title, keys] of groups) {
  const hasPave = keys.includes("pave");
  md.push(`## ${title}`, "", `| No. | 選手名 | ${keys.map((key) => statLabels[statKeys.indexOf(key)]).join(" | ")}${hasPave ? " | パヴェ確認" : ""} |`, `|---:|---|${keys.map(() => "---:").join("|")}${hasPave ? "|---" : ""}|`);
  for (const row of rows) md.push(`| ${row.no} | ${mdCell(row.name)} | ${keys.map((key) => row.stats[key]).join(" | ")}${hasPave ? ` | ${mdCell(row.pave.status)}` : ""} |`);
  md.push("");
}
md.push("## 世界選手権ロード・個人TT実績", "", "| No. | 選手名 | ロード金 | ロード銀 | ロード銅 | ITT金 | ITT銀 | ITT銅 | 評価根拠 |", "|---:|---|---:|---:|---:|---:|---:|---:|---|");
for (const row of rows.filter((row) => row.world.road.gold + row.world.road.silver + row.world.road.bronze + row.world.itt.gold + row.world.itt.silver + row.world.itt.bronze > 0)) md.push(`| ${row.no} | ${mdCell(row.name)} | ${row.world.road.gold} | ${row.world.road.silver} | ${row.world.road.bronze} | ${row.world.itt.gold} | ${row.world.itt.silver} | ${row.world.itt.bronze} | ${mdCell(row.worldBasis)} |`);
md.push("");
await fs.writeFile(markdownPath, md.join("\n") + "\n", "utf8");
const titleFormat = { fill: "#18324A", font: { name: "Yu Gothic", bold: true, color: "#FFFFFF", fontSize: 18 } };
const subtitleFormat = { fill: "#DCE8EF", font: { name: "Yu Gothic", color: "#20313F" }, wrapText: true };
const headerFormat = { fill: "#2F6B8A", font: { name: "Yu Gothic", bold: true, color: "#FFFFFF" }, wrapText: true, horizontalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#CAD8E2" } };
const bodyFormat = { font: { name: "Yu Gothic", color: "#20313F" }, verticalAlignment: "center", borders: { insideHorizontal: { style: "thin", color: "#E2E9EE" } } };

const summary = workbook.worksheets.add("能力概要");
summary.showGridLines = false;
summary.getRange("A1:H1").merge(); summary.getRange("A1").values = [["実在選手300名 — 固定パラメーター設計"]]; summary.getRange("A1:H1").format = titleFormat;
summary.getRange("A2:H2").merge(); summary.getRange("A2").values = [["通常選手は50〜85。Tadej Pogacarのみ特別Tier上限88。世界選手権、パリ〜ルーベ、ロンド実績を反映します。"]]; summary.getRange("A2:H2").format = subtitleFormat;
summary.getRange("A4:B4").values = [["検証項目", "値"]]; summary.getRange("A4:B4").format = headerFormat;
summary.getRange("A5:A11").values = [["総人数"], ["能力種類"], ["通常50〜85・特例上限88"], ["パヴェ結果照合済"], ["パヴェ要出走確認"], ["再編成済選手"], ["氏名重複"]];
const invalidBeforeExport = rows.flatMap((row) => statKeys.filter((key) => { const maxValue = row.name === "Tadej Pogacar" ? 88 : 85; return !Number.isFinite(row.stats[key]) || row.stats[key] < 50 || row.stats[key] > maxValue; }));
const duplicateCount = rows.length - new Set(rows.map((row) => normalize(row.name))).size;
const paveVerifiedCount = rows.filter((row) => row.pave.status !== "要出走確認").length;
const pavePendingCount = rows.filter((row) => row.pave.status === "要出走確認").length;
const manuallyVerifiedCount = rows.filter((row) => row.ratingStatus.includes("再編成済")).length;
summary.getRange("B5:B11").values = [[rows.length], [statKeys.length], [invalidBeforeExport.length === 0 ? "OK" : "NG"], [paveVerifiedCount], [pavePendingCount], [manuallyVerifiedCount], [duplicateCount]];
summary.getRange("D4:H4").values = [["尺度", "意味", "用途", "確度", "扱い"]]; summary.getRange("D4:H4").format = headerFormat;
summary.getRange("D5:H10").values = [["50〜59", "未実績・不得意", "専門外", "初期値", "低評価"], ["60〜69", "完走・対応可能", "支援・限定運用", "実績/推定", "並"], ["70〜76", "一線級", "主力", "実績/脚質", "高"], ["77〜81", "世界トップ級", "エース候補", "上位実績", "非常に高い"], ["82〜84", "優勝級", "最高峰エース", "勝利実績", "最高"], ["85 / 86〜88", "通常上限 / 特別Tier", "歴史的最高峰 / ポガチャル", "複数優勝 / 例外", "上限"]];
summary.getRange("A4:B11").format = { ...bodyFormat, wrapText: true }; summary.getRange("D4:H10").format = { ...bodyFormat, wrapText: true };
summary.getRange("A:A").format.columnWidth = 24; summary.getRange("B:B").format.columnWidth = 18; summary.getRange("C:C").format.columnWidth = 3; ["D:D", "E:E", "F:F", "G:G", "H:H"].forEach((col) => summary.getRange(col).format.columnWidth = 18);
summary.getRange("A1:H11").format.rowHeight = 24; summary.getRange("A1:H2").format.rowHeight = 34; summary.freezePanes.freezeRows(4);

const definitions = workbook.worksheets.add("能力定義");
definitions.showGridLines = false;
definitions.getRange("A1:E1").merge(); definitions.getRange("A1").values = [["パラメーター15種類と特徴"]]; definitions.getRange("A1:E1").format = titleFormat;
definitions.getRange("A2:E2").merge(); definitions.getRange("A2").values = [["レース中能力、連続ステージ回復、精神・連携を分離。パヴェはバイクコントロールやグラベルと別能力です。"]]; definitions.getRange("A2:E2").format = subtitleFormat;
definitions.getRange("A4:E4").values = [["キー", "表示名", "特徴", "ゲームへの影響", "主な根拠"]]; definitions.getRange("A4:E4").format = headerFormat;
definitions.getRange("A5:E19").values = statDefinitions; definitions.getRange("A5:E19").format = { ...bodyFormat, wrapText: true };
[18, 20, 34, 48, 42].forEach((width, index) => definitions.getRangeByIndexes(0, index, 19, 1).format.columnWidth = width);
definitions.getRange("A1:E19").format.rowHeight = 34; definitions.freezePanes.freezeRows(4); definitions.tables.add("A4:E19", true, "StatDefinitionTable").style = "TableStyleMedium2";

const roleSheet = workbook.worksheets.add("役割定義");
roleSheet.showGridLines = false;
roleSheet.getRange("A1:H1").merge(); roleSheet.getRange("A1").values = [["役割・戦術特性 — 30種類"]]; roleSheet.getRange("A1:H1").format = titleFormat;
roleSheet.getRange("A2:H2").merge(); roleSheet.getRange("A2").values = [["旧『得意役割』『専門役割』を統合。現役300名への付与人数を表示します。"]]; roleSheet.getRange("A2:H2").format = subtitleFormat;
roleSheet.getRange("A4:H4").values = [["No.", "カテゴリー", "役割・戦術特性", "ロードレース上の意味", "ゲーム内効果", "主に参照する能力", "実戦用語・英語", "現役選手数"]]; roleSheet.getRange("A4:H4").format = headerFormat;
const roleCounts = new Map(roleDefinitions.map((role) => [role.name, 0]));
for (const row of activeRoster) for (const role of String(row.preferred_roles || "").split(" / ").filter(Boolean)) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
roleSheet.getRange("A5:H34").values = roleDefinitions.map((role, index) => [index + 1, role.category, role.name, role.raceMeaning, role.gameEffect, role.abilities.join("、"), role.term, roleCounts.get(role.name) || 0]);
roleSheet.getRange("A5:H34").format = { ...bodyFormat, wrapText: true, verticalAlignment: "top" };
[7, 20, 27, 48, 48, 32, 32, 14].forEach((width, index) => roleSheet.getRangeByIndexes(0, index, 34, 1).format.columnWidth = width);
roleSheet.getRange("A1:H34").format.rowHeight = 44; roleSheet.getRange("A1:H2").format.rowHeight = 34; roleSheet.getRange("A4:H4").format.rowHeight = 42;
roleSheet.freezePanes.freezeRows(4); roleSheet.freezePanes.freezeColumns(3); roleSheet.tables.add("A4:H34", true, "RoleDefinitionTable").style = "TableStyleMedium2";

const ratings = workbook.worksheets.add("300選手能力");
ratings.showGridLines = false;
const ratingHeaders = ["No.", "実在選手名", "二つ名", "国・地域", "時代", "主脚質", "副脚質", "エース適性", "アシスト適性", "役割・戦術特性", "旧専門役割", "適性タグ", "Credit", ...statLabels, "PR最高順位", "PR完走", "PR Top10", "PR優勝", "パヴェ検証", "パヴェ根拠", "パヴェ出典", "能力検証", "能力算出根拠", "人物URL"];
const lastCol = ratingHeaders.length;
ratings.getRangeByIndexes(0, 0, 1, lastCol).merge(); ratings.getCell(0, 0).values = [["実在選手300名 — 全15パラメーター"]]; ratings.getRangeByIndexes(0, 0, 1, lastCol).format = titleFormat;
ratings.getRangeByIndexes(1, 0, 1, lastCol).merge(); ratings.getCell(1, 0).values = [["黄色はパヴェ、青は身体・技術、緑は回復・連携。フィルターで脚質・検証状態を絞り込めます。"]]; ratings.getRangeByIndexes(1, 0, 1, lastCol).format = subtitleFormat;
ratings.getRangeByIndexes(3, 0, 1, lastCol).values = [ratingHeaders]; ratings.getRangeByIndexes(3, 0, 1, lastCol).format = headerFormat;
ratings.getRangeByIndexes(4, 0, 300, lastCol).values = ratingRows;
ratings.getRangeByIndexes(4, 0, 300, lastCol).format = bodyFormat;
ratings.getRange("H5:I304").format.numberFormat = "0"; ratings.getRange("M5:M304").format.numberFormat = "#,##0 \"Cr\""; ratings.getRange("N5:AB304").format.numberFormat = "0";
ratings.getRange("N5:AB304").conditionalFormats.add("colorScale", { colors: ["#FCE8E6", "#FFF4CC", "#D9EAD3"], thresholds: ["min", "50%", "max"] });
ratings.getRange("W5:W304").conditionalFormats.add("colorScale", { colors: ["#ECEFF1", "#F7D774", "#C58B20"], thresholds: ["min", "50%", "max"] });
ratings.getRange("AG5:AG304").conditionalFormats.add("containsText", { text: "要出走確認", format: { fill: "#FCE8E6", font: { color: "#A61B1B", bold: true } } });
const widths = [7, 24, 24, 14, 10, 16, 16, 12, 14, 28, 18, 28, 12, ...Array(15).fill(11), 12, 10, 11, 9, 15, 42, 52, 14, 48, 52];
widths.forEach((width, index) => ratings.getRangeByIndexes(0, index, 304, 1).format.columnWidth = width);
ratings.getRange("C5:C304").format = { ...bodyFormat, font: { name: "Yu Gothic", color: "#7A4A00", bold: true } };
ratings.getRangeByIndexes(4, 9, 300, 3).format.wrapText = true; ratings.getRangeByIndexes(4, 32, 300, 6).format.wrapText = true;
ratings.getRangeByIndexes(0, 0, 304, lastCol).format.rowHeight = 24; ratings.getRangeByIndexes(0, 0, 2, lastCol).format.rowHeight = 34; ratings.getRangeByIndexes(3, 0, 1, lastCol).format.rowHeight = 42;
ratings.freezePanes.freezeRows(4); ratings.freezePanes.freezeColumns(3); ratings.tables.add(`A4:AL304`, true, "RiderParameterTable").style = "TableStyleMedium2";

const titleSheet = workbook.worksheets.add("二つ名一覧");
const titledRows = activeRoster.filter((row) => row.rider_title);
titleSheet.showGridLines = false;
titleSheet.getRange("A1:H1").merge(); titleSheet.getRange("A1").values = [["ゲーム内二つ名 — Credit上位・著名実績選手"]]; titleSheet.getRange("A1:H1").format = titleFormat;
titleSheet.getRange("A2:H2").merge(); titleSheet.getRange("A2").values = [["Credit 10,000以上、または世界選手権ロード／個人TT・パリ〜ルーベ優勝者。史実の正式異名ではなくゲーム内演出名です。"]]; titleSheet.getRange("A2:H2").format = subtitleFormat;
titleSheet.getRange("A4:H4").values = [["No.", "実在選手名", "二つ名", "付与区分", "Credit", "主脚質", "副脚質", "命名根拠"]]; titleSheet.getRange("A4:H4").format = headerFormat;
titleSheet.getRange(`A5:H${titledRows.length + 4}`).values = titledRows.map((row) => [Number(row.no), row.name, row.rider_title, row.rider_title_eligibility, Number(row.credit_salary), row.primary_archetype, row.secondary_archetype, row.rider_title_basis]);
titleSheet.getRange(`A5:H${titledRows.length + 4}`).format = bodyFormat;
titleSheet.getRange(`C5:C${titledRows.length + 4}`).format = { ...bodyFormat, font: { name: "Yu Gothic", color: "#7A4A00", bold: true } };
titleSheet.getRange(`E5:E${titledRows.length + 4}`).format.numberFormat = "#,##0 \"Cr\"";
[7, 26, 26, 24, 13, 18, 18, 70].forEach((width, index) => titleSheet.getRangeByIndexes(0, index, titledRows.length + 4, 1).format.columnWidth = width);
titleSheet.getRange(`A1:H${titledRows.length + 4}`).format.rowHeight = 36; titleSheet.getRange("A1:H2").format.rowHeight = 34; titleSheet.getRange("A4:H4").format.rowHeight = 42;
titleSheet.getRange(`D5:H${titledRows.length + 4}`).format.wrapText = true;
titleSheet.freezePanes.freezeRows(4); titleSheet.freezePanes.freezeColumns(3); titleSheet.tables.add(`A4:H${titledRows.length + 4}`, true, "RiderTitleTable").style = "TableStyleMedium2";

const paveSheet = workbook.worksheets.add("パヴェ根拠");
paveSheet.showGridLines = false;
paveSheet.getRange("A1:M1").merge(); paveSheet.getRange("A1").values = [["パヴェ能力 — パリ〜ルーベ＋ロンド成績根拠"]]; paveSheet.getRange("A1:M1").format = titleFormat;
paveSheet.getRange("A2:M2").merge(); paveSheet.getRange("A2").values = [["パリ〜ルーベ基準値にロンド優勝1勝+1・2勝+2・3勝以上+3を加点し、最低保証76・78・80も適用。300名全員を同じ式で再計算します。"]]; paveSheet.getRange("A2:M2").format = subtitleFormat;
paveSheet.getRange("A4:M4").values = [["No.", "実在選手名", "パヴェ", "PR最高順位", "PR完走", "PR Top10", "PR優勝", "ロンド優勝", "検証状態", "評価根拠", "PR出典URL", "ロンド出典URL", "備考"]]; paveSheet.getRange("A4:M4").format = headerFormat;
paveSheet.getRange("A5:M304").values = activeRoster.map((row) => { const monument = monumentByName.get(normalize(row.name)) || {}; return [Number(row.no), row.name, Number(row.pave), Number(row.pave_best_result), Number(row.pave_finishes), Number(row.pave_top10s), Number(row.pave_wins), Number(monument.flanders || 0), row.pave_status, row.pave_basis, row.pave_source_url, monument.rondeSource || "", row.rating_status]; });
paveSheet.getRange("A5:M304").format = bodyFormat; paveSheet.getRange("C5:H304").format.numberFormat = "0";
paveSheet.getRange("C5:C304").conditionalFormats.add("colorScale", { colors: ["#ECEFF1", "#F7D774", "#C58B20"], thresholds: ["min", "50%", "max"] });
paveSheet.getRange("I5:I304").conditionalFormats.add("containsText", { text: "要出走確認", format: { fill: "#FCE8E6", font: { color: "#A61B1B", bold: true } } });
[7, 26, 10, 12, 9, 10, 9, 12, 16, 52, 54, 54, 14].forEach((width, index) => paveSheet.getRangeByIndexes(0, index, 304, 1).format.columnWidth = width);
paveSheet.getRange("I5:M304").format.wrapText = true; paveSheet.getRange("A1:M304").format.rowHeight = 24; paveSheet.getRange("A1:M2").format.rowHeight = 34; paveSheet.getRange("A4:M4").format.rowHeight = 38;
paveSheet.freezePanes.freezeRows(4); paveSheet.freezePanes.freezeColumns(2); paveSheet.tables.add("A4:M304", true, "PaveEvidenceTable").style = "TableStyleMedium2";

const worldSheet = workbook.worksheets.add("世界選手権実績");
worldSheet.showGridLines = false;
worldSheet.getRange("A1:L1").merge(); worldSheet.getRange("A1").values = [["世界選手権ロード・個人TT — 表彰台実績"]]; worldSheet.getRange("A1:L1").format = titleFormat;
worldSheet.getRange("A2:L2").merge(); worldSheet.getRange("A2").values = [["2025年大会までのエリート男子。金3・銀2・銅1の実績点を能力補正し、その後に300名順位上限を適用します。"]]; worldSheet.getRange("A2:L2").format = subtitleFormat;
worldSheet.getRange("A4:L4").values = [["No.", "実在選手名", "ロード金", "ロード銀", "ロード銅", "ITT金", "ITT銀", "ITT銅", "ロード年", "ITT年", "評価根拠", "出典URL"]]; worldSheet.getRange("A4:L4").format = headerFormat;
worldSheet.getRange("A5:L304").values = activeRoster.map((row) => [Number(row.no), row.name, Number(row.world_road_gold), Number(row.world_road_silver), Number(row.world_road_bronze), Number(row.world_itt_gold), Number(row.world_itt_silver), Number(row.world_itt_bronze), "", "", row.world_championship_basis, row.world_championship_source_url]);
worldSheet.getRange("A5:L304").format = bodyFormat; worldSheet.getRange("C5:H304").format.numberFormat = "0";
worldSheet.getRange("C5:H304").conditionalFormats.add("colorScale", { colors: ["#FFFFFF", "#DCE8EF", "#F7D774"], thresholds: ["min", "50%", "max"] });
[7, 25, 11, 11, 11, 10, 10, 10, 30, 30, 46, 62].forEach((width, index) => worldSheet.getRangeByIndexes(0, index, 304, 1).format.columnWidth = width);
worldSheet.getRange("I5:L304").format.wrapText = true; worldSheet.getRange("A1:L304").format.rowHeight = 24; worldSheet.getRange("A1:L2").format.rowHeight = 34; worldSheet.getRange("A4:L4").format.rowHeight = 38;
worldSheet.freezePanes.freezeRows(4); worldSheet.freezePanes.freezeColumns(2); worldSheet.tables.add("A4:L304", true, "WorldChampionshipTable").style = "TableStyleMedium2";
const rosterHeaders = ["No.", "実在選手名", "二つ名", "国・地域", "現所属", "生年月日", "区分", "主脚質", "副脚質", "エース適性", "アシスト適性", "役割・戦術特性", "Credit", ...statLabels, "選定根拠", "現役確認URL", "評価状態", "人物URL"];
function createRosterSheet(sheetName, roster, tableName) {
  const sheet = workbook.worksheets.add(sheetName);
  const endRow = roster.length + 4;
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0, 0, 1, rosterHeaders.length).merge(); sheet.getCell(0, 0).values = [[`${sheetName} — 役割・全15能力`]]; sheet.getRangeByIndexes(0, 0, 1, rosterHeaders.length).format = titleFormat;
  sheet.getRangeByIndexes(1, 0, 1, rosterHeaders.length).merge(); sheet.getCell(1, 0).values = [["役割・戦術特性は統合済み。エース適性順のNo.で管理します。"]]; sheet.getRangeByIndexes(1, 0, 1, rosterHeaders.length).format = subtitleFormat;
  sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).values = [rosterHeaders]; sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).format = headerFormat;
  sheet.getRangeByIndexes(4, 0, roster.length, rosterHeaders.length).values = roster.map((row) => [Number(row.no), row.name, row.rider_title, row.country, row.current_team, row.birth_date, row.active_status, row.primary_archetype, row.secondary_archetype, Number(row.ace_aptitude), Number(row.support_aptitude), row.preferred_roles, Number(row.credit_salary), ...statKeys.map((key) => Number(row[key])), row.selection_basis, row.active_source_url, row.rating_status, row.profile_url]);
  sheet.getRangeByIndexes(4, 0, roster.length, rosterHeaders.length).format = bodyFormat;
  sheet.getRangeByIndexes(4, 9, roster.length, 2).format.numberFormat = "0"; sheet.getRangeByIndexes(4, 12, roster.length, 1).format.numberFormat = "#,##0 \"Cr\""; sheet.getRangeByIndexes(4, 13, roster.length, 15).format.numberFormat = "0";
  const widths = [7, 26, 25, 14, 28, 14, 14, 18, 18, 12, 14, 40, 13, ...Array(15).fill(11), 48, 58, 20, 52];
  widths.forEach((width, index) => sheet.getRangeByIndexes(0, index, endRow, 1).format.columnWidth = width);
  sheet.getRangeByIndexes(4, 2, roster.length, 1).format = { ...bodyFormat, font: { name: "Yu Gothic", color: "#7A4A00", bold: true } };
  sheet.getRangeByIndexes(4, 11, roster.length, 1).format.wrapText = true; sheet.getRangeByIndexes(4, 28, roster.length, 4).format.wrapText = true;
  sheet.getRangeByIndexes(0, 0, endRow, rosterHeaders.length).format.rowHeight = 26; sheet.getRangeByIndexes(0, 0, 2, rosterHeaders.length).format.rowHeight = 34; sheet.getRangeByIndexes(3, 0, 1, rosterHeaders.length).format.rowHeight = 42;
  sheet.freezePanes.freezeRows(4); sheet.freezePanes.freezeColumns(2); sheet.tables.add(`A4:AF${endRow}`, true, tableName).style = "TableStyleMedium2";
}
createRosterSheet("現役選手300名", activeRoster, "ActiveRiderTable");
createRosterSheet("引退選手", retiredRoster, "RetiredRiderTable");
createRosterSheet("区分保留", pendingRoster, "PendingRiderTable");

const rules = workbook.worksheets.add("評価ルール");
rules.showGridLines = false;
rules.getRange("A1:Q1").merge(); rules.getRange("A1").values = [["能力値の固定・再編成ルール"]]; rules.getRange("A1:Q1").format = titleFormat;
rules.getRange("A2:Q2").merge(); rules.getRange("A2").values = [["世界選手権ロード・個人TT表彰台を補正後、能力別順位上限を適用。85は各能力最大2名・1選手最大2項目です。"]]; rules.getRange("A2:Q2").format = subtitleFormat;
rules.getRange("A4:P4").values = [["主脚質", ...statLabels]]; rules.getRange("A4:P4").format = headerFormat;
rules.getRange("A5:P10").values = Object.entries(profiles).map(([name, values]) => [name, ...values]); rules.getRange("A5:P10").format = bodyFormat; rules.getRange("B5:P10").format.numberFormat = "0";
rules.getRange("A13:E13").values = [["パリ〜ルーベ基準", "基準値", "追加評価", "上限", "検証状態"]]; rules.getRange("A13:E13").format = headerFormat;
rules.getRange("A14:E22").values = [["4勝以上", 85, "なし", 85, "確定"], ["3勝", 84, "なし", 85, "確定"], ["2勝", 83, "なし", 85, "確定"], ["1勝", 82, "上位回数", 84, "確定"], ["2〜3位", 80, "Top10・完走", 82, "照合済"], ["4〜5位", 78, "Top10・完走", 80, "照合済"], ["6〜10位", 76, "Top10・完走", 78, "照合済"], ["11〜50位", 69, "順位帯で73まで", 75, "照合済"], ["51位以下", 64, "完走回数", 66, "照合済"]]; rules.getRange("A14:E22").format = bodyFormat;
rules.getRange("A24:E25").values = [["完走順位なし", 50, "出走確認後DNFなら57", 57, "要確認"], ["プロトタイプ9名", "手動値", "app.jsを正本", 85, "手動検証済"]]; rules.getRange("A24:E25").format = bodyFormat;
rules.getRange("A27:E27").values = [["ロンド優勝", "最低パヴェ", "加点", "上限", "扱い"]]; rules.getRange("A27:E27").format = headerFormat;
rules.getRange("A28:E30").values = [["1勝", 76, "+1", 85, "加点＋最低保証"], ["2勝", 78, "+2", 85, "加点＋最低保証"], ["3勝以上", 80, "+3", 85, "加点＋最低保証"]]; rules.getRange("A28:E30").format = bodyFormat;
rules.getRange("G13:J13").values = [["能力別順位", "上限", "300名比率", "備考"]]; rules.getRange("G13:J13").format = headerFormat;
rules.getRange("G14:J21").values = [["1〜2位", 85, "上位0.7%", "元値85のみ"], ["3〜6位", 84, "上位2%", ""], ["7〜15位", 83, "上位5%", ""], ["16〜30位", 82, "上位10%", ""], ["31〜54位", 81, "上位18%", ""], ["55〜84位", 80, "上位28%", ""], ["85〜120位", 79, "上位40%", ""], ["121位以下", "78以下", "", "実績補正後に上限適用"]]; rules.getRange("G14:J21").format = bodyFormat;
rules.getRange("G23:J25").values = [["85追加条件", "各能力最大2名", "1選手最大2項目", "パヴェは対象外"], ["同点順位", "関連能力", "適性", "Credit"], ["実績補正", "世界ロード", "世界ITT", "上限適用前"]]; rules.getRange("G23:J25").format = bodyFormat;
[18, ...Array(15).fill(11), 3].forEach((width, index) => rules.getRangeByIndexes(0, index, 25, 1).format.columnWidth = width); rules.getRange("A1:Q30").format.rowHeight = 26; rules.getRange("A1:Q2").format.rowHeight = 34; rules.freezePanes.freezeRows(4);

const inspect = await workbook.inspect({ kind: "table", range: "能力概要!A1:H11", include: "values,formulas", tableMaxRows: 15, tableMaxCols: 10, maxChars: 6000 });
await fs.writeFile(path.join(outputDir, "parameter_summary_inspect.ndjson"), inspect.ndjson, "utf8");
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(outputDir, "parameter_formula_errors.ndjson"), errors.ndjson, "utf8");
for (const [sheetName, range, fileName] of [["能力概要", "A1:H11", "preview_summary.png"], ["能力定義", "A1:E19", "preview_definitions.png"], ["300選手能力", "A1:AL24", "preview_riders_top.png"], ["二つ名一覧", "A1:H24", "preview_titles_top.png"], ["パヴェ根拠", "A1:M24", "preview_pave_top.png"], ["世界選手権実績", "A1:L24", "preview_world_top.png"], ["評価ルール", "A1:Q30", "preview_rules.png"]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, fileName), new Uint8Array(await preview.arrayBuffer()));
}
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);

const invalid = rows.flatMap((row) => statKeys.filter((key) => !Number.isFinite(row.stats[key]) || row.stats[key] < 50 || row.stats[key] > 85).map((key) => `${row.name}:${key}`));
console.log(JSON.stringify({ outputPath, csvPath, riders: rows.length, stats: statKeys.length, invalid, duplicates: rows.length - new Set(rows.map((row) => normalize(row.name))).size, parsedPages: yearResults.filter((row) => row.results.length).length, failedPages: yearResults.filter((row) => !row.results.length).map((row) => row.year), paveVerified: rows.filter((row) => row.pave.status !== "要出走確認").length, pavePending: rows.filter((row) => row.pave.status === "要出走確認").length }, null, 2));
