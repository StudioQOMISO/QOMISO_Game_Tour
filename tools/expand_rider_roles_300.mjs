import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvFiles = [
  "data/rider_parameters_300_fixed.csv",
  "data/rider_parameters_300.csv",
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
];

const preferredRoleOrder = [
  "エース", "サブエース", "山岳アシスト", "平坦アシスト", "石畳アシスト",
  "TT牽引", "集団コントロール", "リードアウト", "スプリントトレイン",
  "ロードキャプテン", "逃げ", "ステージハンター", "山岳賞狙い", "横風要員",
];

const primaryRole = {
  "総合型": "山岳アシスト",
  "スプリンター": "リードアウト",
  "クライマー": "山岳アシスト",
  "パンチャー": "ステージハンター",
  "クラシック型": "石畳アシスト",
  "TT・ルーラー型": "TT牽引",
};

const secondaryRole = {
  "総合型": "集団コントロール",
  "スプリンター": "スプリントトレイン",
  "クライマー": "山岳賞狙い",
  "パンチャー": "逃げ",
  "クラシック型": "横風要員",
  "TT・ルーラー型": "平坦アシスト",
};

function parseCsv(text) {
  const rawRows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rawRows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rawRows.push(row); }
  const headers = rawRows.shift();
  return { headers, rows: rawRows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}

const csvCell = (value) => /[",\r\n]/.test(String(value ?? ""))
  ? `"${String(value ?? "").replace(/"/g, '""')}"`
  : String(value ?? "");
const serializeCsv = (headers, rows) =>
  [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\n") + "\n";
const number = (row, key) => Number(row[key] || 0);
const splitRoles = (value) => String(value || "").split(" / ").map((role) => role.trim()).filter(Boolean);
const stableHash = (value) => {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
};
const weighted = (row, entries) => entries.reduce((sum, [key, weight]) => sum + number(row, key) * weight, 0);

function preferredScores(row) {
  return {
    "山岳アシスト": weighted(row, [["climb", .36], ["stamina", .22], ["teamwork", .27], ["dailyRecovery", .15]]),
    "平坦アシスト": weighted(row, [["cruise", .35], ["stamina", .22], ["teamwork", .28], ["resistance", .15]]),
    "石畳アシスト": weighted(row, [["pave", .35], ["bikeControl", .25], ["teamwork", .25], ["resistance", .15]]),
    "TT牽引": weighted(row, [["cruise", .38], ["technique", .24], ["stamina", .23], ["teamwork", .15]]),
    "集団コントロール": weighted(row, [["teamwork", .37], ["cruise", .25], ["stamina", .22], ["technique", .16]]),
    "リードアウト": weighted(row, [["sprint", .32], ["acceleration", .25], ["teamwork", .28], ["technique", .15]]),
    "スプリントトレイン": weighted(row, [["sprint", .24], ["cruise", .22], ["acceleration", .18], ["teamwork", .36]]),
    "ロードキャプテン": weighted(row, [["teamwork", .42], ["technique", .25], ["recovery", .18], ["fighting", .15]]),
    "逃げ": weighted(row, [["stamina", .30], ["fighting", .30], ["cruise", .22], ["recovery", .18]]),
    "ステージハンター": weighted(row, [["punch", .34], ["acceleration", .24], ["fighting", .26], ["stamina", .16]]),
    "山岳賞狙い": weighted(row, [["climb", .36], ["fighting", .25], ["recovery", .20], ["punch", .19]]),
    "横風要員": weighted(row, [["cruise", .27], ["technique", .24], ["teamwork", .28], ["fighting", .21]]),
  };
}

function expandPreferredRoles(row) {
  const oldRoles = splitRoles(row.preferred_roles);
  const roles = [];
  const add = (role) => { if (role && !roles.includes(role)) roles.push(role); };
  const hasAce = oldRoles.includes("エース");
  if (hasAce) add("エース");
  else if (oldRoles.includes("サブエース") || number(row, "ace_aptitude") >= 84) add("サブエース");

  for (const role of ["ロードキャプテン", "リードアウト", "ステージハンター", "逃げ"]) {
    if (oldRoles.includes(role)) add(role);
  }
  add(primaryRole[row.primary_archetype]);
  add(secondaryRole[row.secondary_archetype]);

  const scores = preferredScores(row);
  const ranked = Object.entries(scores)
    .map(([role, score]) => [role, score + (stableHash(`${row.name}|${role}`) % 9) * .11])
    .sort((a, b) => b[1] - a[1] || preferredRoleOrder.indexOf(a[0]) - preferredRoleOrder.indexOf(b[0]));
  for (const [role] of ranked) add(role);

  const limited = roles.slice(0, 3);
  if (limited.includes("エース")) return limited.filter((role) => role !== "サブエース").join(" / ");
  return limited.join(" / ");
}

const specialistScores = (row) => ({
  "ステージハンター": weighted(row, [["punch", .35], ["acceleration", .25], ["fighting", .25], ["stamina", .15]]),
  "逃げ屋": weighted(row, [["stamina", .30], ["fighting", .30], ["cruise", .20], ["recovery", .20]]),
  "リードアウト": weighted(row, [["sprint", .35], ["acceleration", .25], ["teamwork", .25], ["technique", .15]]),
  "山岳番手": weighted(row, [["climb", .35], ["stamina", .20], ["dailyRecovery", .20], ["teamwork", .25]]),
  "山岳ペースメーカー": weighted(row, [["climb", .30], ["cruise", .15], ["stamina", .25], ["teamwork", .30]]),
  "平坦ペースメーカー": weighted(row, [["cruise", .35], ["stamina", .25], ["teamwork", .25], ["resistance", .15]]),
  "TTスペシャリスト": weighted(row, [["cruise", .35], ["technique", .25], ["stamina", .25], ["resistance", .15]]),
  "石畳護衛": weighted(row, [["pave", .35], ["bikeControl", .25], ["resistance", .25], ["fighting", .15]]),
  "横風分断": weighted(row, [["cruise", .25], ["technique", .25], ["teamwork", .25], ["fighting", .25]]),
  "集団コントローラー": weighted(row, [["teamwork", .35], ["cruise", .25], ["stamina", .20], ["technique", .20]]),
  "スプリントトレイン": weighted(row, [["sprint", .25], ["cruise", .20], ["acceleration", .20], ["teamwork", .35]]),
  "ロードキャプテン": weighted(row, [["teamwork", .40], ["technique", .25], ["recovery", .20], ["fighting", .15]]),
  "下り牽引": weighted(row, [["bikeControl", .35], ["technique", .30], ["fighting", .20], ["resistance", .15]]),
  "山岳賞ハンター": weighted(row, [["climb", .35], ["fighting", .25], ["recovery", .20], ["punch", .20]]),
});

const archetypeBonus = {
  "総合型": { "山岳番手": 3, "集団コントローラー": 3, "ロードキャプテン": 2, "TTスペシャリスト": 1 },
  "スプリンター": { "リードアウト": 4, "スプリントトレイン": 3, "ステージハンター": 1 },
  "クライマー": { "山岳番手": 4, "山岳ペースメーカー": 3, "山岳賞ハンター": 2 },
  "パンチャー": { "ステージハンター": 4, "逃げ屋": 3, "下り牽引": 2 },
  "クラシック型": { "石畳護衛": 4, "横風分断": 3, "逃げ屋": 2 },
  "TT・ルーラー型": { "TTスペシャリスト": 4, "平坦ペースメーカー": 3, "横風分断": 2, "集団コントローラー": 1 },
};

function assignSpecialistRole(row) {
  const scores = specialistScores(row);
  const bonuses = archetypeBonus[row.primary_archetype] || {};
  const ranked = Object.entries(scores)
    .map(([role, score]) => [role, score + (bonuses[role] || 0) + (stableHash(`${row.name}|${role}`) % 7) * .13])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
  const suitable = ranked.slice(0, 3);
  return suitable[stableHash(row.name) % suitable.length][0];
}

const summary = {};
for (const relativePath of csvFiles) {
  const filePath = path.join(workspace, relativePath);
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  for (const row of parsed.rows) {
    row.preferred_roles = expandPreferredRoles(row);
    row.specialist_role = assignSpecialistRole(row);
  }
  await fs.writeFile(filePath, serializeCsv(parsed.headers, parsed.rows), "utf8");
  const specialists = new Set(parsed.rows.map((row) => row.specialist_role).filter(Boolean));
  const badLeaderPair = parsed.rows.filter((row) => {
    const roles = splitRoles(row.preferred_roles);
    return roles.includes("エース") && roles.includes("サブエース");
  });
  if (badLeaderPair.length) throw new Error(`${relativePath}: エースとサブエースの重複 ${badLeaderPair.length}名`);
  summary[relativePath] = {
    riders: parsed.rows.length,
    preferredRoleTypes: new Set(parsed.rows.flatMap((row) => splitRoles(row.preferred_roles))).size,
    specialistRoleTypes: specialists.size,
    specialistAssigned: parsed.rows.filter((row) => row.specialist_role).length,
  };
}

console.log(JSON.stringify(summary, null, 2));
