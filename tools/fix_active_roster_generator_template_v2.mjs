import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "tools", "sync_active_roster_workbook_generator.mjs");
let source = await fs.readFile(filePath, "utf8");
source = source.replaceAll('${sheetName}', '\\${sheetName}');
source = source.replaceAll('${endRow}', '\\${endRow}');
await fs.writeFile(filePath, source, "utf8");
console.log(JSON.stringify({ file: path.relative(workspace, filePath), status: "escaped-v2" }, null, 2));
