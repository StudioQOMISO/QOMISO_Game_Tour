import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "tools", "sync_active_roster_workbook_generator.mjs");
let source = await fs.readFile(filePath, "utf8");
source = source.replace('[[\`${sheetName} — 役割・全15能力\`]]', '[[\`\${sheetName} — 役割・全15能力\`]]');
source = source.replace('sheet.tables.add(\`A4:AF${endRow}\`', 'sheet.tables.add(\`A4:AF\${endRow}\`');
await fs.writeFile(filePath, source, "utf8");
console.log(JSON.stringify({ file: path.relative(workspace, filePath), status: "fixed" }, null, 2));
