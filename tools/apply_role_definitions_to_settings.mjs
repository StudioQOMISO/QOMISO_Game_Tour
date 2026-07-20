import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rolePath = path.join(workspace, "data", "rider_role_definitions.json");
const roles = JSON.parse(await fs.readFile(rolePath, "utf8"));
if (roles.length !== 28 || new Set(roles.map((role) => role.name)).size !== 28) {
  throw new Error(`役割定義は重複なし28種類必須です: ${roles.length}`);
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

const activeRows = parseCsv(await fs.readFile(path.join(workspace, "選手スプレッドシート", "01_現役選手300名.csv"), "utf8"));
const counts = new Map(roles.map((role) => [role.name, 0]));
for (const rider of activeRows) {
  for (const name of String(rider.preferred_roles || "").split(" / ").filter(Boolean)) {
    if (!counts.has(name)) throw new Error(`未定義の役割: ${name} (${rider.name})`);
    counts.set(name, counts.get(name) + 1);
  }
}

const mdCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const roleTable = [
  "| No. | カテゴリー | 役割・戦術特性 | ロードレース上の意味 | ゲーム内効果 | 主に参照する能力 | 実戦用語・英語 | 現役選手数 |",
  "|---:|---|---|---|---|---|---|---:|",
  ...roles.map((role, index) => `| ${index + 1} | ${mdCell(role.category)} | ${mdCell(role.name)} | ${mdCell(role.raceMeaning)} | ${mdCell(role.gameEffect)} | ${mdCell(role.abilities.join("、"))} | ${mdCell(role.term)} | ${counts.get(role.name)} |`),
].join("\n");

const taxonomy = [
  "# 役割・戦術特性 — 統合定義",
  "",
  "> 旧「得意役割」「専門役割」を単一カテゴリーへ統合する。1選手につき主なものから3項目を付与し、技・行動は個人カードへ分離する。",
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
  roleTable,
  "",
  "## 付与ルール",
  "",
  "- エースとサブエースは原則として同時に付与しない。",
  "- 役割は固定身分ではなく、能力・実績・走り方から判定する。",
  "- 選手数は現役300名の `preferred_roles` を集計した値で、1選手3役のため合計は900。",
  "- 個人カードは基本技、得意技、勝負手の3枚。超ロングスパートなどの技・行動は役割へ混在させない。",
  "",
].join("\n");
await fs.writeFile(path.join(workspace, "docs", "rider_role_taxonomy.md"), taxonomy, "utf8");

async function replaceSection(relativePath, start, end, replacement) {
  const filePath = path.join(workspace, relativePath);
  let source = await fs.readFile(filePath, "utf8");
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) throw new Error(`${relativePath}: セクション境界が見つかりません`);
  source = source.slice(0, startIndex) + replacement + "\n\n" + source.slice(endIndex);
  await fs.writeFile(filePath, source, "utf8");
}

await replaceSection(
  "docs/rider_parameters_300.md",
  "## 役割・戦術特性",
  "## 世界選手権実績の反映",
  [
    "## 役割・戦術特性",
    "",
    "旧「得意役割」「専門役割」は `役割・戦術特性` に統合します。実装上は `preferred_roles` を正本とし、互換列 `specialist_role` は空欄にします。1選手につき主なものから3項目で、エースとサブエースは原則として同時に付与しません。",
    "",
    roleTable,
    "",
    "詳細な付与ルールの正本は `docs/rider_role_taxonomy.md`、機械可読の正本は `data/rider_role_definitions.json` です。",
  ].join("\n")
);

await replaceSection(
  "docs/rider_motif_database_plan.md",
  "### 役割・戦術特性",
  "### 初期300名の仮Credit年俸",
  [
    "### 役割・戦術特性",
    "",
    "役割は固定身分ではなく、選手が担当できる仕事と戦術傾向です。旧「得意役割」「専門役割」は単一カテゴリーへ統合し、現役300名では次の28種類を使用します。",
    "",
    roleTable,
    "",
    "- 8人編成はエース1名を中心に、必要に応じてサブエース1名と支援・攻撃役を組み合わせる。",
    "- エースを持つ選手にはサブエースを原則として同時付与しない。",
    "- 支援は固定身分ではなく、コース、体調、疲労、健康度、年間目標で変更できる。",
    "- 役割定義の機械可読な正本は `data/rider_role_definitions.json` とする。",
  ].join("\n")
);

for (const relativePath of ["README.md", "app.js", "index.html"]) {
  const filePath = path.join(workspace, relativePath);
  let source = await fs.readFile(filePath, "utf8");
  source = source.replaceAll("当日エース", "エース").replaceAll("副エース", "サブエース");
  if (relativePath === "README.md") {
    source = source.replaceAll("専門役割", "役割・戦術特性").replaceAll("得意役割", "役割・戦術特性");
    const marker = "## 設定資料";
    if (!source.includes("data/rider_role_definitions.json")) {
      source = source.replace(marker, `${marker}\n\n- data/rider_role_definitions.json: 28種類の役割名、カテゴリー、実戦上の意味、ゲーム内効果、参照能力を管理する機械可読の正本\n- docs/rider_role_taxonomy.md: 現役300名への付与人数を含む役割定義表`);
    }
  }
  await fs.writeFile(filePath, source, "utf8");
}

const unifyPath = path.join(workspace, "tools", "unify_rider_roles_and_renumber.mjs");
let unify = await fs.readFile(unifyPath, "utf8");
if (!unify.includes("const roleDefinitions =")) {
  unify = unify.replace(
    'const dataDir = path.join(workspace, "data");',
    'const dataDir = path.join(workspace, "data");\nconst roleDefinitionPath = path.join(dataDir, "rider_role_definitions.json");\nconst roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));'
  );
}
const taxonomyStart = unify.indexOf("const taxonomy = [");
const taxonomyEnd = unify.indexOf("await fs.writeFile(taxonomyPath", taxonomyStart);
if (taxonomyStart < 0 || taxonomyEnd < 0) throw new Error("unify script taxonomy block not found");
const taxonomyCode = `const taxonomy = [
  "# 役割・戦術特性 — 統合定義",
  "",
  "> 旧「得意役割」「専門役割」を単一カテゴリーへ統合する。表示順は主な役割から3項目。技・行動は個人カードへ分離する。",
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
  ...roleDefinitions.map((role, index) => \`| \${index + 1} | \${role.category} | \${role.name} | \${role.raceMeaning} | \${role.gameEffect} | \${role.abilities.join("、")} | \${role.term} | \${allRoleCounts.get(role.name) || 0} |\`),
  "",
  "## 付与ルール",
  "",
  "- エースとサブエースは原則として同時に付与しない。",
  "- 役割は固定身分ではなく、能力・実績・走り方から判定する。",
  "",
].join("\\n");
`;
unify = unify.slice(0, taxonomyStart) + taxonomyCode + unify.slice(taxonomyEnd);
await fs.writeFile(unifyPath, unify, "utf8");

const generatorPath = path.join(workspace, "outputs", "019f7863-1000-7941-8be7-a93707fedcde", "build_rider_parameters_300.mjs");
let generator = await fs.readFile(generatorPath, "utf8");
if (!generator.includes("roleDefinitionPath")) {
  generator = generator.replace(
    'const worldJsonPath = path.join(workspace, "data", "world_championship_achievements_300.json");',
    'const worldJsonPath = path.join(workspace, "data", "world_championship_achievements_300.json");\nconst roleDefinitionPath = path.join(workspace, "data", "rider_role_definitions.json");'
  );
  generator = generator.replace(
    'const worldData = JSON.parse(await fs.readFile(worldJsonPath, "utf8"));',
    'const worldData = JSON.parse(await fs.readFile(worldJsonPath, "utf8"));\nconst roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));'
  );
}
generator = generator.replace(
  '"得意役割", "専門役割", "適性タグ"',
  '"役割・戦術特性", "旧専門役割", "適性タグ"'
);
if (!generator.includes('md.push("## 役割・戦術特性"')) {
  generator = generator.replace(
    'md.push("## 世界選手権実績の反映"',
    'md.push("## 役割・戦術特性", "", "旧「得意役割」「専門役割」を単一カテゴリーへ統合。実装は preferred_roles を正本とし、specialist_role は互換用空欄。", "", "| No. | カテゴリー | 役割名 | ロードレース上の意味 | ゲーム内効果 | 参照能力 | 実戦用語・英語 |", "|---:|---|---|---|---|---|---|", ...roleDefinitions.map((role, index) => `| ${index + 1} | ${mdCell(role.category)} | ${mdCell(role.name)} | ${mdCell(role.raceMeaning)} | ${mdCell(role.gameEffect)} | ${mdCell(role.abilities.join("、"))} | ${mdCell(role.term)} |`), "");\nmd.push("## 世界選手権実績の反映"'
  );
}
if (!generator.includes('workbook.worksheets.add("役割定義")')) {
  const anchor = 'const ratings = workbook.worksheets.add("300選手能力");';
  const roleSheetCode = `const roleSheet = workbook.worksheets.add("役割定義");\nroleSheet.showGridLines = false;\nroleSheet.getRange("A1:H1").merge(); roleSheet.getRange("A1").values = [["役割・戦術特性 — 28種類"]]; roleSheet.getRange("A1:H1").format = titleFormat;\nroleSheet.getRange("A2:H2").merge(); roleSheet.getRange("A2").values = [["旧『得意役割』『専門役割』を統合。現役300名への付与人数を表示します。"]]; roleSheet.getRange("A2:H2").format = subtitleFormat;\nroleSheet.getRange("A4:H4").values = [["No.", "カテゴリー", "役割・戦術特性", "ロードレース上の意味", "ゲーム内効果", "主に参照する能力", "実戦用語・英語", "現役選手数"]]; roleSheet.getRange("A4:H4").format = headerFormat;\nconst roleCounts = new Map(roleDefinitions.map((role) => [role.name, 0]));\nfor (const row of rows) for (const role of String(row.preferred || "").split(" / ").filter(Boolean)) roleCounts.set(role, (roleCounts.get(role) || 0) + 1);\nroleSheet.getRange("A5:H32").values = roleDefinitions.map((role, index) => [index + 1, role.category, role.name, role.raceMeaning, role.gameEffect, role.abilities.join("、"), role.term, roleCounts.get(role.name) || 0]);\nroleSheet.getRange("A5:H32").format = { ...bodyFormat, wrapText: true, verticalAlignment: "top" };\n[7, 20, 27, 48, 48, 32, 32, 14].forEach((width, index) => roleSheet.getRangeByIndexes(0, index, 32, 1).format.columnWidth = width);\nroleSheet.getRange("A1:H32").format.rowHeight = 44; roleSheet.getRange("A1:H2").format.rowHeight = 34; roleSheet.getRange("A4:H4").format.rowHeight = 42;\nroleSheet.freezePanes.freezeRows(4); roleSheet.freezePanes.freezeColumns(3); roleSheet.tables.add("A4:H32", true, "RoleDefinitionTable").style = "TableStyleMedium2";\n\n`;
  if (!generator.includes(anchor)) throw new Error("generator role sheet anchor not found");
  generator = generator.replace(anchor, roleSheetCode + anchor);
}
await fs.writeFile(generatorPath, generator, "utf8");

console.log(JSON.stringify({ roles: roles.length, riders: activeRows.length, filesUpdated: 8 }, null, 2));
