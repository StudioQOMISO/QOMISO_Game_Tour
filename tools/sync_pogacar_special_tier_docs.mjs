import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changes = new Map([
  ["docs/rider_parameters_300.md", [
    ["架空選手は含みません。全能力は50〜85。", "架空選手は含みません。通常選手の全能力は50〜85。Tadej Pogacarのみ特別Tierとして上限88です。"],
    ["Credit 15,000／総合型／パンチャー／世界ロード金2", "Credit 20,000／総合型／パンチャー／世界ロード金2"],
    ["| 9 | Tadej Pogacar | 64 | 77 | 82 | 79 | 85 |", "| 9 | Tadej Pogacar | 66 | 80 | 85 | 82 | 88 |"],
    ["| 9 | Tadej Pogacar | 85 | 84 | 80 | 80 | 83 | 結果照合済 |", "| 9 | Tadej Pogacar | 88 | 86 | 84 | 83 | 82 | 結果照合済 |"],
    ["| 9 | Tadej Pogacar | 84 | 84 | 75 | 79 | 84 |", "| 9 | Tadej Pogacar | 88 | 88 | 75 | 79 | 87 |"],
    ["## 85希少化ルール\n\n", "## 85希少化ルール\n\n- 例外: Tadej Pogacarのみ特別Tier。エース適性100、Credit 20,000、主要能力上限88。\n"],
  ]],
  ["outputs/019f7863-1000-7941-8be7-a93707fedcde/build_rider_parameters_300.mjs", [
    ["架空選手は含みません。全能力は50〜85。", "架空選手は含みません。通常選手の全能力は50〜85。Tadej Pogacarのみ特別Tierとして上限88です。"],
    ["md.push(\"## 85希少化ルール\", \"\",", "md.push(\"## 85希少化ルール\", \"\", \"- 例外: Tadej Pogacarのみ特別Tier。エース適性100、Credit 20,000、主要能力上限88。\", "],
    ["全能力は50〜85。世界選手権、パリ〜ルーベ、ロンド実績を反映し、対象64名にはゲーム内二つ名を付与します。", "通常選手は50〜85。Tadej Pogacarのみ特別Tier上限88。世界選手権、パリ〜ルーベ、ロンド実績を反映します。"],
    ["[\"全値50〜85\"]", "[\"通常50〜85・特例上限88\"]"],
    ["const invalidBeforeExport = rows.flatMap((row) => statKeys.filter((key) => !Number.isFinite(row.stats[key]) || row.stats[key] < 50 || row.stats[key] > 85));", "const invalidBeforeExport = rows.flatMap((row) => statKeys.filter((key) => { const maxValue = row.name === \"Tadej Pogacar\" ? 88 : 85; return !Number.isFinite(row.stats[key]) || row.stats[key] < 50 || row.stats[key] > maxValue; }));"],
    ["[\"85\", \"歴史的最高峰\", \"複数回支配\", \"複数優勝\", \"上限\"]", "[\"85 / 86〜88\", \"通常上限 / 特別Tier\", \"歴史的最高峰 / ポガチャル\", \"複数優勝 / 例外\", \"上限\"]"],
  ]],
  ["docs/rider_motif_300_list.md", [
    ["最高額: Tadej Pogacarモチーフ15,000Cr（最高峰枠の31.3%、残り7枠33,000Cr）", "最高額: Tadej Pogacarモチーフ20,000Cr（最高峰枠の41.7%、残り7枠28,000Cr）"],
    ["ポガチャル型のみ15,000Cr・エース適性99の別格枠", "ポガチャル型のみ20,000Cr・エース適性100の特別Tier"],
    ["| Tadej Pogacar | ★★★★ | ★ | — | 5 | 99 | 15,000 Cr |", "| Tadej Pogacar | ★★★★ | ★ | — | 5 | 100 | 20,000 Cr |"],
    ["| 9 | Tadej Pogacar | スロベニア | 現代 | パンチャー | 99 | 84 | エース | パンチ力 / TT適性 / 日別回復 | 15,000 Cr |", "| 9 | Tadej Pogacar | スロベニア | 現代 | パンチャー | 100 | 84 | エース | パンチ力 / TT適性 / 日別回復 | 20,000 Cr |"],
  ]],
  ["docs/rider_motif_200_list.md", [
    ["最高額: Tadej Pogacarモチーフ15,000Cr（最高峰枠の31.3%、残り7枠33,000Cr）", "最高額: Tadej Pogacarモチーフ20,000Cr（最高峰枠の41.7%、残り7枠28,000Cr）"],
    ["ポガチャル型のみ15,000Cr・エース適性99の別格枠", "ポガチャル型のみ20,000Cr・エース適性100の特別Tier"],
    ["| Tadej Pogacar | ★★★★ | ★ | — | 5 | 99 | 15,000 Cr |", "| Tadej Pogacar | ★★★★ | ★ | — | 5 | 100 | 20,000 Cr |"],
    ["| 9 | Tadej Pogacar | スロベニア | 現代 | パンチャー | 99 | 84 | エース | パンチ力 / TT適性 / 日別回復 | 15,000 Cr |", "| 9 | Tadej Pogacar | スロベニア | 現代 | パンチャー | 100 | 84 | エース | パンチ力 / TT適性 / 日別回復 | 20,000 Cr |"],
  ]],
  ["docs/rider_motif_database_plan.md", [
    ["世代最強級の例外枠 15,000", "世代最強級の特別Tier 20,000"],
    ["ポガチャル型は例外としてエース適性99・15,000Crを維持する。", "ポガチャル型は特別Tierとしてエース適性100・20,000Cr・主要能力上限88を維持する。"],
    ["15,000 Creditカードは通常上限42,000 Creditの35.7%、最高峰上限48,000 Creditの31.3%を単独で占める。最高峰でも残り7枠は33,000 Credit", "20,000 Creditカードは通常上限42,000 Creditの47.6%、最高峰上限48,000 Creditの41.7%を単独で占める。最高峰でも残り7枠は28,000 Credit"],
    ["15,000 Creditと13,000 Creditを同時採用すると、最高峰上限48,000 Creditでも残り6枠は20,000 Credit", "20,000 Creditと13,000 Creditを同時採用すると、最高峰上限48,000 Creditでも残り6枠は15,000 Credit"],
  ]],
  ["docs/publisher_pitch.md", [["世代最強級の例外枠: 15000 Credit", "世代最強級の特別Tier: 20000 Credit"]]],
]);

const result = {};
for (const [relativePath, replacements] of changes) {
  const filePath = path.join(workspace, relativePath);
  let text = await fs.readFile(filePath, "utf8");
  let count = 0;
  for (const [before, after] of replacements) {
    if (text.includes(after)) continue;
    if (!text.includes(before)) throw new Error(`${relativePath}: 置換元が見つかりません: ${before}`);
    text = text.replace(before, after);
    count += 1;
  }
  if (count) await fs.writeFile(filePath, text, "utf8");
  result[relativePath] = count;
}
console.log(JSON.stringify(result, null, 2));
