import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "outputs", "019f7863-1000-7941-8be7-a93707fedcde", "build_rider_parameters_300.mjs");
let source = await fs.readFile(filePath, "utf8");
const replacements = [
  [
    "for (const key of statKeys) stats[key] = clamp(Number(fixed[key]));",
    "const fixedMax = rider.name === \"Tadej Pogacar\" ? 88 : 85;\n  for (const key of statKeys) stats[key] = clamp(Number(fixed[key]), 50, fixedMax);",
  ],
  [
    "return { ...rider, monument, preferred:",
    "return { ...rider, aceAptitude: Number(fixed.ace_aptitude || rider.aceAptitude), supportAptitude: Number(fixed.support_aptitude || rider.supportAptitude), credit: Number(fixed.credit_salary || rider.credit), monument, preferred:",
  ],
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
