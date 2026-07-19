import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "tools", "validate_rider_role_settings.mjs");
let source = await fs.readFile(filePath, "utf8");
const before = 'const csvFiles = (await fs.readdir(path.join(workspace, "data"))).filter((name) => /^rider_parameters.*\\.csv$/i.test(name));';
const after = 'const csvFiles = (await fs.readdir(path.join(workspace, "data"))).filter((name) =>\n  /^rider_parameters.*\\.csv$/i.test(name) && !name.includes("_pre_rebalance")\n);';
if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error("validator scope target not found");
  source = source.replace(before, after);
  await fs.writeFile(filePath, source, "utf8");
}
console.log(JSON.stringify({ file: "tools/validate_rider_role_settings.mjs", excluded: "_pre_rebalance" }, null, 2));
