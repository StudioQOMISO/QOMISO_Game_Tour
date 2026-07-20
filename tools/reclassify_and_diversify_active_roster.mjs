import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const csvPath = path.join(root, "選手スプレッドシート", "01_現役選手300名.csv");
const profilePath = path.join(root, "data", "rider_activity_profiles_2026.json");
const candidatePath = path.join(root, "data", "rider_motif_candidates_500.csv");
const fetchProfiles = process.argv.includes("--fetch-profiles");

function parseCsv(text) {
  const raw = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); if (row.some((v) => v !== "")) raw.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return { headers, rows: raw.map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]))) };
}

const csvCell = (v) => /[",\r\n]/.test(String(v ?? "")) ? `"${String(v ?? "").replace(/"/g, '""')}"` : String(v ?? "");
const serialize = (headers, rows) => [headers.join(","), ...rows.map((r) => headers.map((h) => csvCell(r[h] ?? "")).join(","))].join("\n") + "\n";
const normalize = (v) => String(v || "").replace(/\s*\(cyclist\)\s*$/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cleanWiki = (v) => String(v || "").replace(/<!--.*?-->/gs, "").replace(/<ref[^>]*>[\s\S]*?<\/ref>|<ref[^>]*\/>/gi, "").replace(/\{\{[^{}]*\}\}/g, " ").replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/''+/g, "").replace(/\s+/g, " ").trim();
const getField = (text, field) => text.match(new RegExp(`^[ \\t]*\\|[ \\t]*${field}[ \\t]*=[ \\t]*(.*)$`, "im"))?.[1]?.trim() || "";
const stableHash = (v) => { let h = 2166136261; for (const ch of String(v)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rand = (name, key, min, max) => min + (stableHash(`${name}|${key}`) % (max - min + 1));
const clamp = (v, min = 50, max = 90) => Math.max(min, Math.min(max, Math.round(v)));

async function downloadProfiles(names) {
  const out = [];
  for (let i = 0; i < names.length; i += 20) {
    const batch = names.slice(i, i + 20);
    const params = new URLSearchParams({ action: "query", prop: "revisions", rvprop: "content|size", rvslots: "main", redirects: "1", format: "json", formatversion: "2", titles: batch.join("|") });
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { "User-Agent": "QOMISO-Game-Tour-parameter-audit/1.0" }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Wikipedia API HTTP ${response.status}`);
    const json = await response.json();
    for (const page of json.query?.pages || []) {
      const rev = page.revisions?.[0];
      const wiki = rev?.slots?.main?.content || "";
      out.push({ title: page.title, normalized_name: normalize(page.title), rider_type: cleanWiki(getField(wiki, "ridertype") || getField(wiki, "rider_type")), page_size: rev?.size || wiki.length, source_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}` });
    }
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
  await fs.writeFile(profilePath, JSON.stringify({ generated_at: new Date().toISOString(), count: out.length, profiles: out }, null, 2) + "\n", "utf8");
  return out;
}

const parsed = parseCsv(await fs.readFile(csvPath, "utf8"));
if (parsed.rows.length !== 300) throw new Error(`現役人数が300名ではありません: ${parsed.rows.length}`);
let profiles = [];
if (fetchProfiles) profiles = await downloadProfiles(parsed.rows.map((r) => r.name));
else profiles = JSON.parse(await fs.readFile(profilePath, "utf8")).profiles || [];
const profileByName = new Map(profiles.map((p) => [normalize(p.title), p]));
const candidates = parseCsv(await fs.readFile(candidatePath, "utf8")).rows;
const candidateByName = new Map(candidates.map((r) => [normalize(r.reference_name), r]));

const types = ["総合型", "スプリンター", "クライマー", "パンチャー", "クラシック型", "TT・ルーラー型"];
const targets = { "総合型":35, "スプリンター":45, "クライマー":60, "パンチャー":60, "クラシック型":55, "TT・ルーラー型":45 };
const placeholderVector = "59,65,63,77,62,77,76,76,74,51,71,71,76,66,72";
const statKeys = ["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const isPlaceholder = (r) => r.ace_aptitude === "66" && r.support_aptitude === "77" && r.credit_salary === "2200" && statKeys.map((k) => r[k]).join(",") === placeholderVector;

const mappedType = (text) => {
  const v = String(text || "").toLowerCase();
  if (/general classification|stage race|all.?round/.test(v)) return "総合型";
  if (/sprinter/.test(v)) return "スプリンター";
  if (/climber/.test(v)) return "クライマー";
  if (/puncheur/.test(v)) return "パンチャー";
  if (/classic|cobb|cyclo.?cross/.test(v)) return "クラシック型";
  if (/time trial|rouleur|domestique/.test(v)) return "TT・ルーラー型";
  if (v === "gc") return "総合型";
  if (v === "sprint" || v === "sprinter") return "スプリンター";
  if (v === "classic" || v === "classic_cobble") return "クラシック型";
  if (v === "itt" || v === "tt") return "TT・ルーラー型";
  return "";
};
const manual = new Map(Object.entries({
  "Alberto Dainese":"スプリンター", "Aleksandr Vlasov":"総合型", "Alexey Lutsenko":"パンチャー", "Andrea Bagioli":"パンチャー", "Andrea Vendrame":"パンチャー", "António Morgado":"クラシック型", "Archie Ryan":"クライマー", "Aurélien Paret-Peintre":"クライマー", "Axel Laurance":"パンチャー", "Bauke Mollema":"総合型", "Ben Healy":"パンチャー", "Ben O'Connor":"総合型", "Bruno Armirail":"TT・ルーラー型", "Carlos Rodríguez":"総合型", "Casper van Uden":"スプリンター", "Cees Bol":"スプリンター", "Cian Uijtdebroeks":"総合型", "Corbin Strong":"スプリンター", "Daan Hoole":"TT・ルーラー型", "Daniel Martínez":"総合型", "Diego Ulissi":"パンチャー", "Einer Rubio":"クライマー", "Ethan Hayter":"TT・ルーラー型", "Ethan Vernon":"スプリンター", "Gerben Thijssen":"スプリンター", "Ilan Van Wilder":"総合型", "Iván García Cortina":"クラシック型", "Jay Vine":"クライマー", "Jarno Widar":"クライマー", "Jonas Abrahamsen":"クラシック型", "Lennert Van Eetvelt":"総合型", "Luke Lamperti":"スプリンター", "Mads Pedersen":"クラシック型", "Magnus Cort":"パンチャー", "Marijn van den Berg":"スプリンター", "Matthew Riccitello":"クライマー", "Michał Kwiatkowski":"クラシック型"
}));

const fixed = parsed.rows.filter((r) => !isPlaceholder(r));
const provisional = parsed.rows.filter(isPlaceholder);
const remaining = { ...targets };
for (const r of fixed) remaining[r.primary_archetype] -= 1;
if (Object.values(remaining).some((v) => v < 0) || Object.values(remaining).reduce((a,b)=>a+b,0) !== provisional.length) throw new Error(`脚質枠が不正です: ${JSON.stringify(remaining)}`);

function scoresFor(r) {
  const p = profileByName.get(normalize(r.name));
  const c = candidateByName.get(normalize(r.name));
  const explicit = manual.get(r.name) || mappedType(p?.rider_type) || mappedType(c?.primary_archetype);
  const scores = Object.fromEntries(types.map((type, i) => [type, rand(r.name, `type-${i}`, 0, 1000) / 100]));
  if (explicit) scores[explicit] += manual.has(r.name) ? 200 : 100;
  return { scores, explicit, profile:p, candidate:c };
}
const scored = provisional.map((r) => ({ r, ...scoresFor(r) }));
scored.sort((a,b) => {
  const av=Object.values(a.scores).sort((x,y)=>y-x), bv=Object.values(b.scores).sort((x,y)=>y-x);
  return (bv[0]-bv[1])-(av[0]-av[1]) || stableHash(a.r.name)-stableHash(b.r.name);
});
for (const item of scored) {
  const ordered = types.slice().sort((a,b) => item.scores[b]-item.scores[a]);
  const primary = ordered.find((type) => remaining[type] > 0);
  if (!primary) throw new Error(`脚質枠が不足: ${item.r.name}`);
  item.r.primary_archetype = primary; remaining[primary] -= 1;
  item.r.secondary_archetype = ordered.find((type) => type !== primary) || types[(types.indexOf(primary)+1)%types.length];
}

const prototypes = {
  "総合型":[58,70,73,76,80,79,78,75,75,52,78,79,74,73,77],
  "スプリンター":[78,77,66,74,55,72,73,76,73,51,71,70,72,76,74],
  "クライマー":[54,70,73,65,79,78,77,72,74,50,77,78,73,72,77],
  "パンチャー":[67,77,79,72,73,76,76,75,76,53,75,75,72,75,78],
  "クラシック型":[71,74,75,77,62,79,80,77,79,69,75,75,76,74,79],
  "TT・ルーラー型":[61,67,65,79,64,79,78,78,76,55,74,74,79,68,74],
};
const bases = {
  "総合型":{ace:72,support:74}, "スプリンター":{ace:70,support:70}, "クライマー":{ace:68,support:78},
  "パンチャー":{ace:69,support:73}, "クラシック型":{ace:69,support:77}, "TT・ルーラー型":{ace:64,support:80},
};
const sizes = scored.map((x)=>Number(x.profile?.page_size||0)).sort((a,b)=>a-b);
const percentile = (size) => size <= 0 ? .28 : sizes.findIndex((v)=>v>=size) / Math.max(1,sizes.length-1);
for (const item of scored) {
  const r=item.r, p=percentile(Number(item.profile?.page_size||0));
  const candidateCredit=Number(item.candidate?.credit_salary||0);
  const reputation = candidateCredit ? Math.max(0, Math.min(12, Math.round((candidateCredit-5000)/300))) : Math.round(p*7);
  const strength = reputation + rand(r.name,"strength",-2,2);
  statKeys.forEach((key,i)=>r[key]=String(clamp(prototypes[r.primary_archetype][i]+strength+rand(r.name,key,-4,4),50,86)));
  r.ace_aptitude=String(clamp(bases[r.primary_archetype].ace+strength+rand(r.name,"ace",-3,3),54,88));
  r.support_aptitude=String(clamp(bases[r.primary_archetype].support+Math.round(strength/2)+rand(r.name,"support",-3,3),60,88));
  const credit = candidateCredit || Math.round((2300 + p*3000 + reputation*120 + rand(r.name,"credit",-3,3)*100)/100)*100;
  r.credit_salary=String(clamp(credit,2200,7800));
  r.aptitude_tags = `${r.primary_archetype} / ${r.secondary_archetype}`;
  r.rating_status = item.explicit ? "公開脚質反映・暫定能力分散済" : "情報少・相対配分による暫定評価";
  const source = item.profile?.rider_type ? `公開プロフィール脚質「${item.profile.rider_type}」を反映` : "公開プロフィールに明確な脚質記載なし";
  r.rating_basis = `${source}。同一テンプレートを廃止し、脚質別基準値＋選手名固定のばらつきで初期能力を分散。主要実績の追加照合が必要`;
  if (item.profile?.source_url) r.profile_url = item.profile.source_url;
}

parsed.rows.sort((a,b)=>Number(b.ace_aptitude)-Number(a.ace_aptitude)||Number(b.credit_salary)-Number(a.credit_salary)||a.name.localeCompare(b.name));
parsed.rows.forEach((r,i)=>r.no=String(i+1));
await fs.writeFile(csvPath, serialize(parsed.headers, parsed.rows), "utf8");

const countBy = (key) => Object.fromEntries(types.map((t)=>[t,parsed.rows.filter((r)=>r[key]===t).length]));
const vectors = new Set(parsed.rows.map((r)=>statKeys.map((k)=>r[k]).join(",")));
console.log(JSON.stringify({profiles:profiles.length,profileTypes:profiles.filter((p)=>p.rider_type).length,diversified:scored.length,primary:countBy("primary_archetype"),uniqueAbilityVectors:vectors.size,oldFixedTriple:parsed.rows.filter((r)=>r.ace_aptitude==="66"&&r.support_aptitude==="77"&&r.credit_salary==="2200").length,creditRange:[Math.min(...parsed.rows.map((r)=>Number(r.credit_salary))),Math.max(...parsed.rows.map((r)=>Number(r.credit_salary)))]},null,2));
