import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(workspace, "data");
const roleDefinitionPath = path.join(dataDir, "rider_role_definitions.json");
const roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));
const statKeys = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "pave", "recovery", "dailyRecovery", "teamwork", "ego", "fighting"];
const roleRename = new Map([
  ["逃げ", "逃げ屋"],
  ["山岳賞狙い", "山岳賞ハンター"],
  ["集団コントロール", "集団コントローラー"],
  ["石畳アシスト", "石畳護衛"],
]);
const specialLongRange = new Set([
  "Tadej Pogacar", "Mathieu van der Poel", "Remco Evenepoel", "Wout van Aert", "Thomas De Gendt",
  "Matej Mohoric", "Victor Campenaerts", "Ben Healy", "Marc Hirschi", "Julian Alaphilippe", "Jens Voigt",
]);
const ruleNote = "役割・戦術特性を単一カテゴリへ統合。エース適性降順、同点はCredit・15能力平均・選手名順でNo.を再採番";

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
const n = (row, key) => Number(row[key] || 0);
const average = (row) => statKeys.reduce((sum, key) => sum + n(row, key), 0) / statKeys.length;
const appendBasis = (value, note) => String(value || "").includes(note)
  ? String(value || "")
  : `${String(value || "").replace(/[。\s]+$/, "")}。${note}`;

function unifiedRoles(row) {
  const roles = [];
  const add = (role) => {
    const normalized = roleRename.get(String(role || "").trim()) || String(role || "").trim();
    if (normalized && !roles.includes(normalized)) roles.push(normalized);
  };
  String(row.preferred_roles || "").split(" / ").forEach(add);
  add(row.specialist_role);
  if (roles.includes("エース")) {
    const index = roles.indexOf("サブエース");
    if (index >= 0) roles.splice(index, 1);
  }

  const additions = [];
  const suggest = (role, condition) => { if (condition) additions.push(role); };
  suggest("超ロングスパート", specialLongRange.has(row.name) || (n(row, "cruise") >= 82 && n(row, "stamina") >= 82 && n(row, "fighting") >= 82));
  suggest("無賃乗車", n(row, "technique") >= 80 && Math.max(n(row, "sprint"), n(row, "punch")) >= 78 && n(row, "teamwork") <= 76);
  suggest("最終発射台", roles.includes("リードアウト") && n(row, "sprint") >= 78 && n(row, "acceleration") >= 78);
  suggest("スーパー・ドメスティーク", n(row, "support_aptitude") >= 88 && n(row, "ace_aptitude") >= 78);
  suggest("ブレイクアウェイキラー", n(row, "cruise") >= 80 && n(row, "stamina") >= 80 && n(row, "teamwork") >= 80);
  suggest("サテライトライダー", n(row, "support_aptitude") >= 84 && n(row, "climb") >= 78 && n(row, "stamina") >= 79);
  suggest("ブリッジャー", n(row, "acceleration") >= 79 && n(row, "cruise") >= 79 && n(row, "stamina") >= 79);
  suggest("カウンターアタッカー", n(row, "acceleration") >= 80 && n(row, "punch") >= 80 && n(row, "technique") >= 78);
  suggest("ポジションキーパー", n(row, "technique") >= 82 && n(row, "bikeControl") >= 80);
  suggest("トラブル復帰牽引", n(row, "support_aptitude") >= 86 && n(row, "cruise") >= 80 && n(row, "teamwork") >= 82);
  additions.forEach(add);
  return roles.slice(0, 7);
}

const files = (await fs.readdir(dataDir))
  .filter((name) => /^rider_parameters.*\.csv$/i.test(name))
  .map((name) => path.join(dataDir, name));
const result = {};
const allRoleCounts = new Map();

for (const filePath of files) {
  const parsed = parseCsv(await fs.readFile(filePath, "utf8"));
  if (!parsed.headers.includes("name") || !parsed.headers.includes("ace_aptitude") || !parsed.headers.includes("preferred_roles")) continue;
  for (const row of parsed.rows) {
    const roles = unifiedRoles(row);
    row.preferred_roles = roles.join(" / ");
    if (parsed.headers.includes("specialist_role")) row.specialist_role = "";
    if (parsed.headers.includes("rating_status")) row.rating_status = "役割統合・エース順位再採番済";
    if (parsed.headers.includes("rating_basis")) row.rating_basis = appendBasis(row.rating_basis, ruleNote);
  }
  parsed.rows.sort((a, b) =>
    n(b, "ace_aptitude") - n(a, "ace_aptitude") ||
    n(b, "credit_salary") - n(a, "credit_salary") ||
    average(b) - average(a) ||
    String(a.name).localeCompare(String(b.name), "en")
  );
  parsed.rows.forEach((row, index) => { row.no = String(index + 1); });
  await fs.writeFile(filePath, serializeCsv(parsed.headers, parsed.rows), "utf8");
  const roleCounts = new Map();
  for (const row of parsed.rows) for (const role of String(row.preferred_roles).split(" / ").filter(Boolean)) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
  if (path.basename(filePath) === "rider_parameters_active_300.csv") {
    for (const [role, count] of roleCounts) allRoleCounts.set(role, count);
  }
  result[path.relative(workspace, filePath)] = {
    rows: parsed.rows.length,
    first: parsed.rows.slice(0, 5).map((row) => `${row.no}:${row.name}(${row.ace_aptitude})`),
    superLongSprint: roleCounts.get("超ロングスパート") || 0,
    freeRide: roleCounts.get("無賃乗車") || 0,
  };
}

const taxonomyPath = path.join(workspace, "docs", "rider_role_taxonomy.md");
const taxonomy = [
  "# 役割・戦術特性 — 統合定義",
  "",
  "> 旧「得意役割」「専門役割」を単一カテゴリーへ統合する。表示順は主な役割から最大7項目。",
  "",
  "## No.再採番規則",
  "",
  "1. エース適性（降順）",
  "2. Credit（降順）",
  "3. 15能力平均（降順）",
  "4. 選手名（昇順）",
  "",
  "## 役割定義（現役300名）",
  "",
  "| No. | カテゴリー | 役割・戦術特性 | ロードレース上の意味 | ゲーム内効果 | 主に参照する能力 | 実戦用語・英語 | 選手数 |",
  "|---:|---|---|---|---|---|---|---:|",
  ...roleDefinitions.map((role, index) => `| ${index + 1} | ${role.category} | ${role.name} | ${role.raceMeaning} | ${role.gameEffect} | ${role.abilities.join("、")} | ${role.term} | ${allRoleCounts.get(role.name) || 0} |`),
  "",
  "## 付与ルール",
  "",
  "- エースとサブエースは原則として同時に付与しない。",
  "- 役割は固定身分ではなく、能力・実績・走り方から判定する。",
  "- 超ロングスパートは残り80〜100km級のソロレイド実績または再現性を重視する。",
  "- 無賃乗車は車輪利用と脚の温存が巧みな選手に付与し、チームワーク型の役割とは慎重に併用する。",
  "",
].join("\n");
await fs.writeFile(taxonomyPath, taxonomy, "utf8");
result[path.relative(workspace, taxonomyPath)] = { roles: allRoleCounts.size };
console.log(JSON.stringify(result, null, 2));
