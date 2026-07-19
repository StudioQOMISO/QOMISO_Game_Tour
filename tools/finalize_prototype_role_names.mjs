import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(workspace, "app.js");
let source = await fs.readFile(filePath, "utf8");
source = source.replace('preferredRoles: ["ロードキャプテン", "アシスト"]', 'preferredRoles: ["ロードキャプテン", "石畳護衛", "横風要員"]');
source = source.replace('return rider?.preferredRoles[0] || "アシスト";', 'return rider?.preferredRoles[0] || "平坦アシスト";');
await fs.writeFile(filePath, source, "utf8");
console.log(JSON.stringify({ file: "app.js", status: "normalized" }, null, 2));
