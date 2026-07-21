import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const input = path.join(root, "data", "tour_2026_reference_route.json");
const output = path.join(root, "data", "tour_2026_route.js");
const route = JSON.parse(await fs.readFile(input, "utf8"));

await fs.writeFile(output, `window.TOUR_2026_ROUTE = ${JSON.stringify(route, null, 2)};\n`, "utf8");
console.log(`Wrote ${route.stages.length} Tour 2026 stages / ${route.officialDistanceKm} km`);
