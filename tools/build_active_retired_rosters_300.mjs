import fs from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const rosterHtmlPath = process.argv.find((arg) => arg.startsWith("--roster-html="))?.slice(14)
  || "C:/tmp/uci_2026_worldteams.html";
const skipProfiles = process.argv.includes("--skip-profiles");
const sourceUrl = "https://en.wikipedia.org/wiki/List_of_2026_UCI_WorldTeams_and_riders";
const fixedCsvPath = path.join(workspace, "data", "rider_parameters_300_fixed.csv");
const candidatesCsvPath = path.join(workspace, "data", "rider_motif_candidates_500.csv");
const rosterJsonPath = path.join(workspace, "data", "uci_2026_worldteam_roster.json");
const profileJsonPath = path.join(workspace, "data", "rider_activity_profiles_2026.json");
const activeCsvPath = path.join(workspace, "data", "rider_parameters_active_300.csv");
const retiredCsvPath = path.join(workspace, "data", "rider_parameters_retired.csv");
const pendingCsvPath = path.join(workspace, "data", "rider_parameters_status_pending.csv");
const reportPath = path.join(workspace, "docs", "rider_active_retired_roster_2026.md");

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const cleanWiki = (value) => String(value || "")
  .replace(/<!--.*?-->/gs, "")
  .replace(/<ref[^>]*>[\s\S]*?<\/ref>|<ref[^>]*\/>/gi, "")
  .replace(/\{\{[^{}]*\}\}/g, " ")
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
  .replace(/\[\[([^\]]+)\]\]/g, "$1")
  .replace(/''+/g, "")
  .replace(/\s+/g, " ")
  .trim();
const decodeHtml = (value) => String(value || "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;|&#160;/g, " ");
const csvCell = (value) => /[",\n\r]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");

function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some((value) => value !== "")) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return { headers, rows: rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]))) };
}

function parseRoster(html) {
  const headings = [...html.matchAll(/<h3 id="[^"]+">([\s\S]*?)<\/h3>/g)];
  const riders = [];
  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index;
    const end = index + 1 < headings.length ? headings[index + 1].index : html.length;
    const section = html.slice(start, end);
    const team = decodeHtml(headings[index][1].replace(/<[^>]+>/g, "")).trim();
    const matches = section.matchAll(/"target":\{"wt":"Cycling squad rider"[\s\S]*?"name":\{"wt":"\[\[([^\]]+)\]\]"\}[\s\S]*?"nat":\{"wt":"([A-Z]{3})"\}[\s\S]*?birth date and age2\|df=yes\|2026\|1\|1\|(\d{4})\|(\d{1,2})\|(\d{1,2})/g);
    for (const match of matches) {
      riders.push({
        name: decodeHtml(match[1].replace(/\|.*$/, "")).trim(), team, nationality: match[2],
        birth_date: `${match[3]}-${match[4].padStart(2, "0")}-${match[5].padStart(2, "0")}`,
        roster_status: "2026 UCI WorldTeam名簿掲載", source_url: sourceUrl,
      });
    }
  }
  const unique = new Map(riders.map((rider) => [normalize(rider.name), rider]));
  if (unique.size < 500) throw new Error(`WorldTeam名簿の抽出数が不足しています: ${unique.size}`);
  return [...unique.values()];
}

function getField(wikitext, field) {
  const pattern = new RegExp(`^[ \\t]*\\|[ \\t]*${field}[ \\t]*=[ \\t]*(.*)$`, "im");
  return wikitext.match(pattern)?.[1]?.trim() || "";
}

function latestProYear(wikitext) {
  const values = [...wikitext.matchAll(/^[ \t]*\|[ \t]*proyears\d*[ \t]*=[ \t]*(.*)$/gim)].map((match) => cleanWiki(match[1]));
  let ongoing = false; let latest = 0;
  for (const value of values) {
    if (/2026\s*[–—-]\s*$|2026\s*[–—-]\s*present/i.test(value)) ongoing = true;
    for (const match of value.matchAll(/(?:19|20)\d{2}/g)) latest = Math.max(latest, Number(match[0]));
  }
  return { ongoing, latest };
}

async function fetchProfiles(titles) {
  const profiles = [];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  for (let index = 0; index < titles.length; index += 20) {
    const batch = titles.slice(index, index + 20);
    const params = new URLSearchParams({ action: "query", prop: "revisions", rvprop: "content|size", rvslots: "main", redirects: "1", format: "json", formatversion: "2", titles: batch.join("|") });
    let response;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { headers: { "User-Agent": "QOMISO-Game-Tour-roster-audit/1.0 (local game data audit)" }, signal: AbortSignal.timeout(30000) });
      if (response.ok) break;
      if (response.status !== 429 && response.status < 500) throw new Error(`Wikipedia API HTTP ${response.status}`);
      await sleep(2500 * (attempt + 1));
    }
    if (!response?.ok) throw new Error(`Wikipedia API HTTP ${response?.status || "no response"}`);
    const json = await response.json();
    for (const page of json.query?.pages || []) {
      const revision = page.revisions?.[0];
      const wikitext = revision?.slots?.main?.content || "";
      const currentTeamRaw = getField(wikitext, "currentteam");
      const riderTypeRaw = getField(wikitext, "ridertype") || getField(wikitext, "rider_type");
      const pro = latestProYear(wikitext);
      const currentTeam = cleanWiki(currentTeamRaw);
      const riderType = cleanWiki(riderTypeRaw);
      const explicitlyRetired = /retired|引退/i.test(currentTeamRaw);
      const active = !explicitlyRetired && (!!currentTeamRaw && !/^(none|n\/a|—|-)?$/i.test(currentTeam)) || pro.ongoing;
      const retired = explicitlyRetired || (!active && pro.latest > 0 && pro.latest < 2026);
      profiles.push({ title: page.title, normalized_name: normalize(page.title), current_team: currentTeam, rider_type: riderType, page_size: revision?.size || wikitext.length, latest_pro_year: pro.latest, ongoing_pro_years: pro.ongoing, active, retired, source_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}` });
    }
    await sleep(800);
  }
  return profiles;
}

const countryNames = {
  AUS:"オーストラリア", AUT:"オーストリア", BEL:"ベルギー", CAN:"カナダ", COL:"コロンビア", CZE:"チェコ", DEN:"デンマーク", ECU:"エクアドル", ERI:"エリトリア", ESP:"スペイン", EST:"エストニア", FRA:"フランス", GBR:"イギリス", GER:"ドイツ", IRL:"アイルランド", ISR:"イスラエル", ITA:"イタリア", JPN:"日本", KAZ:"カザフスタン", LUX:"ルクセンブルク", NED:"オランダ", NOR:"ノルウェー", NZL:"ニュージーランド", POL:"ポーランド", POR:"ポルトガル", RSA:"南アフリカ", SLO:"スロベニア", SVK:"スロバキア", SUI:"スイス", USA:"アメリカ",
};
const profileStats = {
  "総合型": [59,72,75,78,81,81,80,77,76,52,80,81,74,75,79],
  "スプリンター": [79,78,68,75,55,73,75,77,73,53,72,71,72,77,76],
  "クライマー": [55,72,75,66,80,79,79,71,74,50,78,79,73,73,79],
  "パンチャー": [68,78,80,73,74,77,78,76,77,54,76,76,72,76,79],
  "クラシック型": [72,75,76,78,63,80,81,78,80,62,76,76,76,75,80],
  "TT・ルーラー型": [62,68,66,80,65,80,79,79,77,54,74,74,79,69,75],
};
const statKeys = ["sprint","acceleration","punch","cruise","climb","stamina","resistance","technique","bikeControl","pave","recovery","dailyRecovery","teamwork","ego","fighting"];
const clamp = (value, min = 50, max = 82) => Math.max(min, Math.min(max, Math.round(value)));

function archetypeFromType(type) {
  const value = String(type || "").toLowerCase();
  if (/sprinter/.test(value)) return "スプリンター";
  if (/climber|general classification|stage race/.test(value)) return /general classification|stage race/.test(value) ? "総合型" : "クライマー";
  if (/puncheur/.test(value)) return "パンチャー";
  if (/classic|cobb|cyclo-cross/.test(value)) return "クラシック型";
  if (/time trial|rouleur|domestique/.test(value)) return "TT・ルーラー型";
  return "TT・ルーラー型";
}

function roleFields(primary) {
  if (primary === "スプリンター") return { secondary: "クラシック型", preferred: "リードアウト / スプリントトレイン", specialist: "リードアウト", tags: "最高速 / 位置取り", ace: 78, support: 70 };
  if (primary === "クライマー") return { secondary: "総合型", preferred: "山岳アシスト / 山岳賞狙い", specialist: "山岳番手", tags: "登坂力 / 山岳耐久", ace: 76, support: 74 };
  if (primary === "パンチャー") return { secondary: "クラシック型", preferred: "ステージハンター / 逃げ", specialist: "ステージハンター", tags: "パンチ力 / 反復加速", ace: 77, support: 70 };
  if (primary === "クラシック型") return { secondary: "パンチャー", preferred: "石畳アシスト / 横風要員", specialist: "石畳護衛", tags: "悪路耐性 / バイクコントロール", ace: 76, support: 75 };
  if (primary === "総合型") return { secondary: "クライマー", preferred: "サブエース / 山岳アシスト / 集団コントロール", specialist: "山岳番手", tags: "日別回復 / 登坂力", ace: 80, support: 72 };
  return { secondary: "クラシック型", preferred: "TT牽引 / 平坦アシスト / 集団コントロール", specialist: "TTスペシャリスト", tags: "巡航力 / TT適性", ace: 69, support: 80 };
}

function pagePercentile(size, sortedSizes) {
  const index = sortedSizes.findIndex((value) => value >= size);
  return (index < 0 ? sortedSizes.length - 1 : index) / Math.max(1, sortedSizes.length - 1);
}

const rosterHtml = await fs.readFile(rosterHtmlPath, "utf8");
const roster = parseRoster(rosterHtml);
const fixed = parseCsv(await fs.readFile(fixedCsvPath, "utf8"));
const candidates = parseCsv(await fs.readFile(candidatesCsvPath, "utf8"));
const fixedByName = new Map(fixed.rows.map((row) => [normalize(row.name), row]));
const candidateByName = new Map(candidates.rows.map((row) => [normalize(row.reference_name), row]));

const allTitles = [...new Map([...roster.map((rider) => [normalize(rider.name), rider.name]), ...fixed.rows.map((rider) => [normalize(rider.name), rider.name])]).values()];
const profiles = skipProfiles ? [] : await fetchProfiles(allTitles);
const profileByName = new Map(profiles.map((profile) => [profile.normalized_name, profile]));
const rosterByName = new Map(roster.map((rider) => [normalize(rider.name), rider]));
const activeExistingOutsideWorldTeams = fixed.rows.filter((row) => !rosterByName.has(normalize(row.name)) && profileByName.get(normalize(row.name))?.active);

const teamGroups = new Map();
for (const rider of roster) {
  if (!teamGroups.has(rider.team)) teamGroups.set(rider.team, []);
  teamGroups.get(rider.team).push(rider);
}
const outsideKeys = new Set(activeExistingOutsideWorldTeams.map((row) => normalize(row.name)));
const worldTeamTarget = 300 - outsideKeys.size;
const teamEntries = [...teamGroups.entries()];
const rawQuotas = teamEntries.map(([team, riders]) => ({ team, size: riders.length, raw: riders.length * worldTeamTarget / roster.length }));
for (const item of rawQuotas) item.quota = Math.floor(item.raw);
let remaining = worldTeamTarget - rawQuotas.reduce((sum, item) => sum + item.quota, 0);
rawQuotas.sort((a, b) => (b.raw - b.quota) - (a.raw - a.quota) || a.team.localeCompare(b.team));
for (let index = 0; index < remaining; index += 1) rawQuotas[index].quota += 1;
const quotaByTeam = new Map(rawQuotas.map((item) => [item.team, item.quota]));

function selectionScore(rider) {
  const key = normalize(rider.name);
  const existing = fixedByName.get(key);
  const candidate = candidateByName.get(key);
  const profile = profileByName.get(key);
  if (existing) return 1_000_000 + Number(existing.credit_salary || 0);
  if (candidate) return 100_000 + Number(candidate.credit_salary || 0);
  return Number(profile?.page_size || 0);
}

const selectedRoster = [];
for (const [team, riders] of teamEntries) {
  selectedRoster.push(...riders.sort((a, b) => selectionScore(b) - selectionScore(a) || a.name.localeCompare(b.name)).slice(0, quotaByTeam.get(team)));
}
const selected = [...activeExistingOutsideWorldTeams.map((row) => ({ name: row.name, team: profileByName.get(normalize(row.name))?.current_team || "WorldTeam外", nationality: "", birth_date: "", roster_status: "2026現役プロフィール確認", source_url: profileByName.get(normalize(row.name))?.source_url || "" })), ...selectedRoster];
if (selected.length !== 300 || new Set(selected.map((rider) => normalize(rider.name))).size !== 300) throw new Error(`現役選手は重複なし300名必須です: ${selected.length}`);

const sizes = selected.map((rider) => profileByName.get(normalize(rider.name))?.page_size || 0).sort((a, b) => a - b);
const extraHeaders = ["current_team","birth_date","active_status","selection_basis","active_source_url"];
const activeHeaders = [...fixed.headers, ...extraHeaders];
const activeRows = selected.map((rider, index) => {
  const key = normalize(rider.name);
  const existing = fixedByName.get(key);
  const profile = profileByName.get(key);
  if (existing) return { ...existing, no: index + 1, era: "現役", current_team: rider.team, birth_date: rider.birth_date, active_status: "現役確認済", selection_basis: rider.roster_status, active_source_url: rider.source_url };
  const primary = archetypeFromType(profile?.rider_type);
  const roles = roleFields(primary);
  const percentile = pagePercentile(profile?.page_size || 0, sizes);
  const offset = Math.round(percentile * 6) - 3;
  const stats = Object.fromEntries(statKeys.map((keyName, statIndex) => [keyName, clamp(profileStats[primary][statIndex] + offset)]));
  const credit = Math.round((2200 + percentile * 4300) / 100) * 100;
  const row = Object.fromEntries(fixed.headers.map((header) => [header, ""]));
  Object.assign(row, stats, {
    no: index + 1, name: rider.name, country: countryNames[rider.nationality] || rider.nationality, era: "現役",
    primary_archetype: primary, secondary_archetype: roles.secondary, ace_aptitude: clamp(roles.ace + offset, 50, 90), support_aptitude: clamp(roles.support + Math.min(2, offset), 50, 90),
    preferred_roles: roles.preferred, specialist_role: roles.specialist, aptitude_tags: roles.tags, credit_salary: credit,
    pave_status: "要実績照合", pave_basis: "現役300名補充時の脚質暫定値。パリ〜ルーベ／ロンド個人成績の追加照合が必要", pave_source_url: "https://www.paris-roubaix.fr/en/history",
    rating_status: "2026現役名簿起点・暫定能力評価", rating_basis: `公開プロフィール脚質「${profile?.rider_type || "記載なし"}」と記事情報量から初期配置。主要実績による個別再評価が必要`,
    profile_url: profile?.source_url || rider.source_url,
    current_team: rider.team, birth_date: rider.birth_date, active_status: "現役確認済", selection_basis: rider.roster_status, active_source_url: rider.source_url,
  });
  return row;
});

const activeKeys = new Set(activeRows.map((row) => normalize(row.name)));
const isRetired = (row) => profileByName.get(normalize(row.name))?.retired || (skipProfiles && row.era === "近代");
const retiredRows = fixed.rows.filter((row) => !activeKeys.has(normalize(row.name)) && isRetired(row))
  .map((row, index) => ({ ...row, no: index + 1, current_team: "引退", birth_date: "", active_status: "引退確認済", selection_basis: skipProfiles ? "既存時代区分「近代」（WorldTeam名簿外）" : `最終プロ年 ${profileByName.get(normalize(row.name))?.latest_pro_year || "不明"}`, active_source_url: profileByName.get(normalize(row.name))?.source_url || row.profile_url }));
const pendingRows = fixed.rows.filter((row) => !activeKeys.has(normalize(row.name)) && !isRetired(row))
  .map((row, index) => ({ ...row, no: index + 1, current_team: profileByName.get(normalize(row.name))?.current_team || "", birth_date: "", active_status: "区分保留", selection_basis: "2026 WorldTeam外・現役／引退を断定せず保留", active_source_url: profileByName.get(normalize(row.name))?.source_url || row.profile_url }));

function serializeCsv(headers, rows) {
  return [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\n") + "\n";
}

await fs.writeFile(rosterJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), source_url: sourceUrl, count: roster.length, riders: roster }, null, 2) + "\n", "utf8");
await fs.writeFile(profileJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), count: profiles.length, profiles }, null, 2) + "\n", "utf8");
await fs.writeFile(activeCsvPath, serializeCsv(activeHeaders, activeRows), "utf8");
await fs.writeFile(retiredCsvPath, serializeCsv(activeHeaders, retiredRows), "utf8");
await fs.writeFile(pendingCsvPath, serializeCsv(activeHeaders, pendingRows), "utf8");

const teamCounts = [...new Set(activeRows.map((row) => row.current_team))].sort().map((team) => [team, activeRows.filter((row) => row.current_team === team).length]);
const existingKept = activeRows.filter((row) => fixedByName.has(normalize(row.name))).length;
const provisional = activeRows.length - existingKept;
const markdown = `# 2026 現役・引退選手の再編成\n\n` +
  `- 現役選手: **${activeRows.length}名**（既存能力を保持 ${existingKept}名／新規暫定評価 ${provisional}名）\n` +
  `- 引退確認済み: **${retiredRows.length}名**\n` +
  `- 区分保留: **${pendingRows.length}名**\n` +
  `- 現役基準: 2026 UCI WorldTeam名簿掲載\n` +
  `- 名簿出典: ${sourceUrl}\n\n` +
  `## チーム別人数\n\n| チーム | 人数 |\n|---|---:|\n${teamCounts.map(([team, count]) => `| ${team} | ${count} |`).join("\n")}\n\n` +
  `## 評価上の注意\n\n新規追加選手は実在名・所属・脚質を公開情報から取得していますが、全15能力は初期配置です。rating_status が「2026現役名簿起点・暫定能力評価」の選手は、主要レース、世界選手権、GT、モニュメント、パリ〜ルーベ／ロンドの実績を追加照合して確定します。\n`;
await fs.writeFile(reportPath, markdown, "utf8");

console.log(JSON.stringify({ roster: roster.length, active: activeRows.length, existingKept, provisional, retired: retiredRows.length, pending: pendingRows.length, files: { activeCsvPath, retiredCsvPath, pendingCsvPath, reportPath } }, null, 2));
