import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ""; }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ""));
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const appendUnique = (value, item) => [...new Set(String(value || "").split(" / ").filter(Boolean).concat(item))].join(" / ");
const appendBasis = (value, note) => String(value || "").includes(note) ? String(value || "") : `${String(value || "").replace(/\s+$/, "")}。${note}`;

const parsed = parseCsv(await fs.readFile(csvPath, "utf8"));
const headers = parsed.shift();
const rows = parsed.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
const byName = new Map(rows.map((row) => [row.name, row]));

const girmay = byName.get("Biniam Girmay");
const vanDerPoel = byName.get("Mathieu van der Poel");
if (!girmay || !vanDerPoel) throw new Error("対象選手が固定正本に見つかりません");

girmay.sprint = "80";
girmay.rating_status = "手動バランス調整済";
girmay.rating_basis = appendBasis(girmay.rating_basis, "手動調整: Biniam Girmayのスプリントを80に設定");

vanDerPoel.sprint = "80";
vanDerPoel.preferred_roles = appendUnique(vanDerPoel.preferred_roles, "リードアウト");
vanDerPoel.specialist_role = "リードアウト";
vanDerPoel.aptitude_tags = appendUnique(vanDerPoel.aptitude_tags, "リードアウト");
vanDerPoel.rating_status = "手動バランス調整済";
vanDerPoel.rating_basis = appendBasis(vanDerPoel.rating_basis, "手動調整: Mathieu van der Poelのスプリントを80に設定し、リードアウト役割を追加");

await fs.writeFile(csvPath, [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
  .map((cells) => cells.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({
  Biniam_Girmay: { sprint: girmay.sprint },
  Mathieu_van_der_Poel: { sprint: vanDerPoel.sprint, preferred_roles: vanDerPoel.preferred_roles, specialist_role: vanDerPoel.specialist_role, aptitude_tags: vanDerPoel.aptitude_tags },
}, null, 2));
