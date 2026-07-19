import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));
const sourcePath = path.join(outputDir, "consolidate_rider_workbook.mjs");
let code = await fs.readFile(sourcePath, "utf8");
code = code
  .replace(/^import fs[^\n]+\nimport path[^\n]+\nimport \{ FileBlob, SpreadsheetFile, Workbook \}[^\n]+\n/m, "")
  .replace('const outputDir = path.dirname(new URL(import.meta.url).pathname.slice(1));', `const outputDir = ${JSON.stringify(outputDir)};`)
  .replace("...base.slice(2,9).map(n),...g.slice(2,17).map(n)", "...base.slice(2,8).map(n),...g.slice(2,17).map(n)");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
await new AsyncFunction("fs", "path", "FileBlob", "SpreadsheetFile", "Workbook", code)(fs, path, FileBlob, SpreadsheetFile, Workbook);
