import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "outputs", "019f7863-1000-7941-8be7-a93707fedcde", "build_rider_parameters_300.mjs");
let source = await fs.readFile(filePath, "utf8");
const replacements = [
  ["return { ...rider, aceAptitude:", "return { ...rider, no: Number(fixed.no || rider.no), aceAptitude:"],
  ["specialistRole: fixed.specialist_role || rider.specialistRole", "specialistRole: \"\""],
  ["});\n\nlistSheet.getRange(\"I5:K304\")", "});\nrows.sort((a, b) => a.no - b.no);\n\nlistSheet.getRange(\"I4:K4\").values = [[\"役割・戦術特性\", \"旧専門役割\", \"適性タグ\"]];\nlistSheet.getRange(\"I5:K304\")"],
  ["\"得意役割\", \"専門役割\", \"適性タグ\"", "\"役割・戦術特性\", \"旧専門役割\", \"適性タグ\""],
  ["アシスト適性・得意役割", "アシスト適性・役割特性"],
  ["勝利実績・脚質・専門役割", "勝利実績・脚質・戦術特性"],
];
let changed = 0;
for (const [before, after] of replacements) {
  if (source.includes(after)) continue;
  if (!source.includes(before)) throw new Error(`置換元が見つかりません: ${before}`);
  source = source.replace(before, after);
  changed += 1;
}
if (changed) await fs.writeFile(filePath, source, "utf8");
console.log(JSON.stringify({ file: path.relative(workspace, filePath), changed }, null, 2));
