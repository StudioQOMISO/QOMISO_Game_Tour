import fs from "node:fs/promises";

const sources = [
  ["gt_gc", "Grand Tour GC", "https://en.wikipedia.org/wiki/List_of_Grand_Tour_general_classification_winners", "gc"],
  ["gt_points", "Grand Tour points", "https://en.wikipedia.org/wiki/List_of_Grand_Tour_points_classification_winners", "sprint"],
  ["gt_mountains", "Grand Tour mountains", "https://en.wikipedia.org/wiki/List_of_Grand_Tour_mountains_classification_winners", "climber"],
  ["gt_stage_wins", "Grand Tour stage wins", "https://en.wikipedia.org/wiki/Grand_Tour_(cycling)", "stage_hunter"],
  ["tdf_gc", "Tour de France GC", "https://en.wikipedia.org/wiki/List_of_Tour_de_France_general_classification_winners", "gc"],
  ["giro_gc", "Giro d'Italia GC", "https://en.wikipedia.org/wiki/List_of_Giro_d%27Italia_general_classification_winners", "gc"],
  ["vuelta_gc", "Vuelta a Espana GC", "https://en.wikipedia.org/wiki/List_of_Vuelta_a_Espa%C3%B1a_general_classification_winners", "gc"],
  ["world_rr", "World road race", "https://en.wikipedia.org/wiki/UCI_Road_World_Championships_%E2%80%93_Men%27s_road_race", "classic"],
  ["world_tt", "World time trial", "https://en.wikipedia.org/wiki/UCI_Road_World_Championships_%E2%80%93_Men%27s_time_trial", "itt"],
  ["roubaix", "Paris-Roubaix", "https://en.wikipedia.org/wiki/Paris%E2%80%93Roubaix", "classic_cobble"],
  ["flanders", "Tour of Flanders", "https://en.wikipedia.org/wiki/Tour_of_Flanders", "classic_cobble"],
  ["sanremo", "Milan-San Remo", "https://en.wikipedia.org/wiki/Milan%E2%80%93San_Remo", "sprinter"],
  ["liege", "Liege-Bastogne-Liege", "https://en.wikipedia.org/wiki/Li%C3%A8ge%E2%80%93Bastogne%E2%80%93Li%C3%A8ge", "puncheur"],
  ["lombardia", "Giro di Lombardia", "https://en.wikipedia.org/wiki/Giro_di_Lombardia", "climber"],
  ["paris_nice", "Paris-Nice", "https://en.wikipedia.org/wiki/Paris%E2%80%93Nice", "stage_hunter"],
  ["tirreno", "Tirreno-Adriatico", "https://en.wikipedia.org/wiki/Tirreno%E2%80%93Adriatico", "stage_hunter"],
  ["dauphine", "Criterium du Dauphine", "https://en.wikipedia.org/wiki/Crit%C3%A9rium_du_Dauphin%C3%A9", "gc"],
  ["suisse", "Tour de Suisse", "https://en.wikipedia.org/wiki/Tour_de_Suisse", "stage_hunter"],
];

const blacklistParts = [
  "classification", "general classification", "points classification", "mountains classification", "young rider",
  "Tour de", "Tour ", "Giro d", "Giro ", "Vuelta", "Paris", "Milan", "Liège", "Liege", "Lombardia", "Flanders", "Abu Dhabi", "UAE Tour", " Race", "Classic", "Omloop", "Volta", "Sprint", "Bianche", "Copenhagen", "Strade", "Benelux", "Vlaanderen", "Dwars", "Flèche", "Fleche", "Wallonne",
  "UCI", "World Championship", "Olympic", "cycling", "Cycling", "cycle race", "cycle races", "monument", "Monument", "Road bicycle racing", "road race", "time trial", "stage", "team", "template", "Template", "Wikidata",
  "Belgium", "France", "Italy", "Spain", "Netherlands", "Germany", "Switzerland", "United Kingdom", "Great Britain",
  "United States", "Australia", "Denmark", "Norway", "Slovenia", "Colombia", "Ecuador", "Ireland", "Luxembourg",
  "Soviet Union", "Russia", "Kazakhstan", "Portugal", "Austria", "Poland", "Czechoslovakia", "Czech", "Slovakia",
  "File:", "Help:", "Template:", "Category:", "Wikipedia:", "Special:", "Talk:", "Main Page", "ISBN"
];

function htmlDecode(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&eacute;/g, "e")
    .replace(/&Eacute;/g, "E")
    .replace(/&nbsp;/g, " ");
}

function isLikelyRider(title) {
  if (!title || title.length < 4 || title.length > 60) return false;
  if (!/^[A-ZÀ-ÖØ-ÞĀ-ž]/.test(title)) return false;
  if (!title.includes(" ")) return false;
  if (/\d/.test(title)) return false;
  if (blacklistParts.some((part) => title.includes(part))) return false;
  if (/\(.+\)/.test(title) && !title.includes("cyclist")) return false;
  return true;
}

function archetypeStats(archetype, sourceCount) {
  const base = { sprint: 55, climb: 55, stamina: 70, technique: 65, teamwork: 60, ego: 65, fighting: 70 };
  const add = {
    gc: { sprint: 5, climb: 28, stamina: 25, technique: 18, teamwork: 12, ego: 14, fighting: 18 },
    sprint: { sprint: 35, climb: -16, stamina: 10, technique: 18, teamwork: 8, ego: 20, fighting: 10 },
    climber: { sprint: -10, climb: 38, stamina: 16, technique: 8, teamwork: 4, ego: 12, fighting: 22 },
    puncheur: { sprint: 22, climb: 22, stamina: 14, technique: 18, teamwork: 2, ego: 18, fighting: 18 },
    classic: { sprint: 18, climb: 12, stamina: 24, technique: 24, teamwork: 8, ego: 14, fighting: 22 },
    classic_cobble: { sprint: 22, climb: 2, stamina: 24, technique: 30, teamwork: 10, ego: 14, fighting: 24 },
    itt: { sprint: 10, climb: 0, stamina: 24, technique: 35, teamwork: 10, ego: 10, fighting: 10 },
    stage_hunter: { sprint: 12, climb: 14, stamina: 24, technique: 18, teamwork: -2, ego: 20, fighting: 24 },
    legend_allround: { sprint: 30, climb: 30, stamina: 28, technique: 28, teamwork: 10, ego: 24, fighting: 26 },
  }[archetype] || {};
  const reputationBoost = Math.min(sourceCount * 2, 10);
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, Math.max(20, Math.min(99, value + (add[key] || 0) + reputationBoost))]));
}

function inferPrimary(tags) {
  const uniqueTags = new Set(tags);
  if (tags.length >= 8 && uniqueTags.size >= 3) return "legend_allround";
  const weights = { gc: 3, sprint: 2, climber: 2.5, puncheur: 2, classic: 2, classic_cobble: 2.2, itt: 2.4, stage_hunter: 1 };
  const scores = new Map();
  for (const tag of tags) scores.set(tag, (scores.get(tag) || 0) + (weights[tag] || 1));
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "stage_hunter";
}


function estimateCreditSalary(archetype, sourceCount, stats) {
  const baseByRole = {
    legend_allround: 9200,
    gc: 7600,
    sprint: 6800,
    sprinter: 6400,
    climber: 6200,
    puncheur: 5900,
    classic: 6100,
    classic_cobble: 6000,
    itt: 5600,
    stage_hunter: 4700,
  };
  const base = baseByRole[archetype] || 4200;
  const reputation = Math.min(sourceCount, 10) * 260;
  const teamworkDiscount = Math.max(0, stats.teamwork - stats.ego) * 18;
  return Math.max(800, Math.round((base + reputation - teamworkDiscount) / 100) * 100);
}
function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function main() {
  const riders = new Map();
  for (const [id, label, url, archetype] of sources) {
    const response = await fetch(url, { headers: { "user-agent": "QOMISO_Game_Tour_design_script/0.1" } });
    if (!response.ok) {
      console.error(`skip ${id}: ${response.status}`);
      continue;
    }
    const html = await response.text();
    const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
    for (const table of tables) {
      const rows = table.match(/<tr[\s\S]*?<\/tr>/g) || [];
      for (const row of rows) {
        const titles = [...row.matchAll(/title="([^"]+)"/g)].map((match) => htmlDecode(match[1]));
        const candidate = titles.find(isLikelyRider);
        if (!candidate) continue;
        const clean = candidate.replace(/ \(cyclist\)$/i, "").trim();
        const entry = riders.get(clean) || { name: clean, sources: new Set(), tags: [] };
        entry.sources.add(label);
        entry.tags.push(archetype);
        riders.set(clean, entry);
      }
    }
  }

  const sorted = [...riders.values()]
    .sort((a, b) => b.sources.size - a.sources.size || a.name.localeCompare(b.name))
    .slice(0, 500);

  const header = ["reference_name", "source_count", "source_labels", "credit_salary", "primary_archetype", "secondary_archetype", "motif_reason", "sprint", "climb", "stamina", "technique", "teamwork", "ego", "fighting", "race_fit", "game_conversion_note"];
  const lines = [header.join(",")];
  for (const rider of sorted) {
    const primary = inferPrimary(rider.tags);
    const secondary = rider.tags.find((tag) => tag !== primary) || "none";
    const stats = archetypeStats(primary, rider.sources.size);
    const creditSalary = estimateCreditSalary(primary, rider.sources.size, stats);
    const row = [
      rider.name,
      rider.sources.size,
      [...rider.sources].join(" / "),
      creditSalary,
      primary,
      secondary,
      `Referenced from ${rider.sources.size} major race/classification source(s)`,
      stats.sprint,
      stats.climb,
      stats.stamina,
      stats.technique,
      stats.teamwork,
      stats.ego,
      stats.fighting,
      primary.includes("cobble") ? "cobble/wind" : primary === "itt" ? "itt/ttt" : primary === "gc" ? "mountain/itt" : primary === "sprint" ? "flat" : primary === "climber" ? "mountain" : "hill/breakaway",
      "Use only as research motif; create fictional name, nationality variant, visual design, and career history before game use",
    ];
    lines.push(row.map(escapeCsv).join(","));
  }

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/rider_motif_candidates_500.csv", lines.join("\n"), "utf8");
  console.log(`wrote ${sorted.length} riders to data/rider_motif_candidates_500.csv`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});