import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const appPath = path.join(workspace, "app.js");
let app = await fs.readFile(appPath, "utf8");
const roleReplacements = [
  ['preferredRoles: ["エース", "サブエース", "ステージハンター"]', 'preferredRoles: ["エース", "ステージハンター"]'],
  ['preferredRoles: ["リードアウト", "アシスト"]', 'preferredRoles: ["リードアウト", "最終発射台", "スプリントトレイン"]'],
  ['preferredRoles: ["エース", "サブエース"]', 'preferredRoles: ["エース", "ステージハンター", "山岳賞ハンター"]'],
  ['preferredRoles: ["アシスト", "逃げ屋"]', 'preferredRoles: ["平坦ペースメーカー", "集団コントローラー", "TT牽引", "逃げ屋"]'],
  ['preferredRoles: ["ロードキャプテン", "アシスト"]', 'preferredRoles: ["ロードキャプテン", "TT牽引", "横風要員"]'],
  ['preferredRoles: ["アシスト", "サブエース"]', 'preferredRoles: ["サブエース", "山岳アシスト", "山岳番手", "スーパー・ドメスティーク"]'],
  ['preferredRoles: ["アシスト", "ロードキャプテン", "逃げ屋"]', 'preferredRoles: ["平坦アシスト", "ロードキャプテン", "逃げ屋"]'],
];
for (const [before, after] of roleReplacements) app = app.replace(before, after);
app = app.replaceAll("各自の得意役割", "各自の役割・戦術特性");
await fs.writeFile(appPath, app, "utf8");

const readmePath = path.join(workspace, "README.md");
let readme = await fs.readFile(readmePath, "utf8");
readme = readme.replace(
  /- 8人チームを編成し、主副脚質とエース／アシスト適性に応じて[^\r\n]*/,
  "- 8人チームを編成し、主副脚質とエース／アシスト適性に応じて、30種類の役割・戦術特性からエース、サブエース、牽引、保護、攻撃、位置取り役を任命する"
);
readme = readme.replace(
  /- レース当日はエースを指名し、他の選手へ[^\r\n]*/,
  "- レース当日はエースを指名し、他の選手へ `data/rider_role_definitions.json` の役割・戦術特性を割り当てる"
);
readme = readme.replace(
  /主脚質は総合型38[^\r\n]*/,
  "役割は固定身分ではなく、現役300名の能力・実績・走り方から30種類の役割・戦術特性を最大7件まで付与する。エースとサブエースは原則として同時に付与しない。"
);
await fs.writeFile(readmePath, readme, "utf8");

const parameterPath = path.join(workspace, "docs", "rider_parameters_300.md");
let parameters = await fs.readFile(parameterPath, "utf8");
parameters = parameters.replaceAll("アシスト適性・得意役割", "アシスト適性・役割・戦術特性");
parameters = parameters.replaceAll("勝利実績・脚質・専門役割", "勝利実績・脚質・役割・戦術特性");
await fs.writeFile(parameterPath, parameters, "utf8");

const planPath = path.join(workspace, "docs", "rider_motif_database_plan.md");
let plan = await fs.readFile(planPath, "utf8");
plan = plan.replaceAll("年齢、専門役割", "年齢、役割・戦術特性");
plan = plan.replaceAll("両適性、得意役割、仮Credit", "両適性、役割・戦術特性、仮Credit");
plan = plan.replaceAll("アシスト適性、専門役割、固有パッシブ", "アシスト適性、役割・戦術特性、固有パッシブ");
await fs.writeFile(planPath, plan, "utf8");

console.log(JSON.stringify({ filesUpdated: 4, prototypeRolesNormalized: true }, null, 2));
