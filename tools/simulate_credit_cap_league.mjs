import fs from "node:fs/promises";
import path from "node:path";
import { evaluateTeamCardPackage, loadCardPerformanceContext } from "./card_performance_engine.mjs";

const DEFAULTS = {
  source: "選手スプレッドシート/01_現役選手300名.csv",
  output: "outputs/team_simulation_20x8_40000",
  teams: 20,
  teamSize: 8,
  cap: 40000,
  races: 1000,
  seed: 20260721,
};

const STAT_KEYS = [
  "sprint", "acceleration", "punch", "cruise", "climb", "stamina",
  "resistance", "technique", "bikeControl", "pave", "recovery",
  "dailyRecovery", "teamwork", "ego", "fighting",
];

const PROFILES = {
  flat: {
    label: "平坦",
    weights: { sprint: .27, acceleration: .18, cruise: .16, stamina: .10, technique: .09, resistance: .07, bikeControl: .05, teamwork: .05, fighting: .03 },
    rolePatterns: [/スプリントトレイン|リードアウト|最終発射台/, /平坦|横風|集団コントローラー|TT牽引/, /ロードキャプテン|位置取り|補給/],
  },
  hill: {
    label: "丘陵",
    weights: { punch: .25, acceleration: .16, climb: .15, stamina: .12, recovery: .08, technique: .08, resistance: .06, fighting: .06, bikeControl: .04 },
    rolePatterns: [/ステージハンター|逃げ屋|カウンターアタッカー/, /丘陵|パンチ|位置取り/, /ロードキャプテン|保護|補給/],
  },
  mountain: {
    label: "山岳",
    weights: { climb: .30, stamina: .16, recovery: .14, dailyRecovery: .10, punch: .08, resistance: .06, fighting: .06, technique: .05, cruise: .05 },
    rolePatterns: [/山岳アシスト|山岳牽引|山岳番手|山岳ガード/, /サブエース|ステージハンター/, /ロードキャプテン|保護|補給/],
  },
  tt: {
    label: "TT",
    weights: { cruise: .30, stamina: .17, technique: .14, resistance: .10, recovery: .08, teamwork: .08, dailyRecovery: .06, fighting: .04, bikeControl: .03 },
    rolePatterns: [/TTスペシャリスト|TT牽引/, /平坦ペースメーカー|集団コントローラー|横風要員/, /ロードキャプテン|隊列|補給/],
  },
  pave: {
    label: "石畳",
    weights: { pave: .25, resistance: .18, bikeControl: .16, technique: .12, stamina: .12, punch: .06, acceleration: .04, teamwork: .04, fighting: .03 },
    rolePatterns: [/石畳護衛|悪路|クラシック/, /横風要員|平坦アシスト|位置取り/, /ロードキャプテン|保護|補給/],
  },
};

function parseArgs(argv) {
  const config = { ...DEFAULTS };
  for (const arg of argv) {
    const match = arg.match(/^--([a-z-]+)=(.+)$/);
    if (!match) continue;
    const [, key, raw] = match;
    const camel = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!(camel in config)) throw new Error(`Unknown option: --${key}`);
    config[camel] = typeof config[camel] === "number" ? Number(raw) : raw;
  }
  for (const key of ["teams", "teamSize", "cap", "races", "seed"]) {
    if (!Number.isInteger(config[key]) || config[key] <= 0) throw new Error(`${key} must be a positive integer`);
  }
  if (config.teamSize < 3) throw new Error("teamSize must be at least 3");
  return config;
}

function parseCsv(text) {
  const raw = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) raw.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return raw.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

const csvCell = (value) => /[",\r\n]/.test(String(value ?? ""))
  ? `"${String(value ?? "").replace(/"/g, '""')}"`
  : String(value ?? "");
const toCsv = (headers, rows) => [headers.join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join("\n") + "\n";
const number = (value) => Number(value || 0);
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
const round = (value, digits = 2) => Number(value.toFixed(digits));

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function normal(random) {
  const a = Math.max(Number.EPSILON, random());
  const b = Math.max(Number.EPSILON, random());
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
}

function hydrate(row) {
  const rider = {
    ...row,
    no: number(row.no),
    ace_aptitude: number(row.ace_aptitude),
    support_aptitude: number(row.support_aptitude),
    credit_salary: number(row.credit_salary),
    roles: String(row.preferred_roles || "").split(" / ").map((role) => role.trim()).filter(Boolean),
  };
  for (const stat of STAT_KEYS) rider[stat] = number(row[stat]);
  rider.profileScores = Object.fromEntries(Object.entries(PROFILES).map(([key, profile]) => [
    key,
    Object.entries(profile.weights).reduce((score, [stat, weight]) => score + rider[stat] * weight, 0),
  ]));
  rider.allRoundScore = mean(Object.values(rider.profileScores));
  return rider;
}

function riderDraftScore(rider, priority, roster) {
  const archetypes = new Set(roster.map((item) => item.primary_archetype));
  const diversityBonus = archetypes.has(rider.primary_archetype) ? 0 : 2.5;
  const secondAceWeight = roster.length < 2 ? .27 : .13;
  return rider.support_aptitude * .35
    + rider.profileScores[priority] * .28
    + rider.allRoundScore * .12
    + rider.ace_aptitude * secondAceWeight
    + diversityBonus
    - rider.credit_salary / 5500;
}

function cheapestTotal(riders, count, excludedName = "") {
  return [...riders]
    .filter((rider) => rider.name !== excludedName)
    .sort((a, b) => a.credit_salary - b.credit_salary || a.no - b.no)
    .slice(0, count)
    .reduce((sum, rider) => sum + rider.credit_salary, 0);
}

function buildTeams(riders, config) {
  const profileKeys = Object.keys(PROFILES);
  const priorities = Array.from({ length: config.teams }, (_, index) => profileKeys[index % profileKeys.length]);
  const anchors = [...riders]
    .sort((a, b) => b.ace_aptitude - a.ace_aptitude || b.credit_salary - a.credit_salary || a.no - b.no)
    .slice(0, config.teams);
  const unassignedAnchors = new Set(anchors);
  const teams = priorities.map((priority, index) => {
    const candidates = [...unassignedAnchors].sort((a, b) => b.profileScores[priority] - a.profileScores[priority] || b.ace_aptitude - a.ace_aptitude);
    const anchor = candidates[0];
    unassignedAnchors.delete(anchor);
    return { id: index + 1, name: `Team ${String(index + 1).padStart(2, "0")}`, priority, riders: [anchor], totalCredit: anchor.credit_salary };
  });
  const anchorNames = new Set(anchors.map((rider) => rider.name));
  const available = riders.filter((rider) => !anchorNames.has(rider.name));

  // Build a guaranteed low-cost baseline from the cheapest required support
  // pool. Give each next rider to the team with the tightest per-slot budget.
  const baselinePool = [...available]
    .sort((a, b) => a.credit_salary - b.credit_salary || a.no - b.no)
    .slice(0, config.teams * (config.teamSize - 1));
  while (teams.some((team) => team.riders.length < config.teamSize)) {
    const team = teams
      .filter((item) => item.riders.length < config.teamSize)
      .sort((a, b) => {
        const aSlots = config.teamSize - a.riders.length;
        const bSlots = config.teamSize - b.riders.length;
        return (config.cap - a.totalCredit) / aSlots - (config.cap - b.totalCredit) / bSlots || a.id - b.id;
      })[0];
    const chosen = baselinePool.shift();
    if (!chosen || team.totalCredit + chosen.credit_salary > config.cap) {
      throw new Error(`Could not create a baseline roster for ${team.name} under ${config.cap}Cr`);
    }
    team.riders.push(chosen);
    team.totalCredit += chosen.credit_salary;
    available.splice(available.findIndex((item) => item.name === chosen.name), 1);
  }

  // Upgrade support slots from the unused pool while preserving the cap.
  // Released riders can be picked up by later teams or on the next pass.
  for (let pass = 0; pass < 8; pass += 1) {
    let changes = 0;
    for (const team of teams) {
      for (let slot = 1; slot < team.riders.length; slot += 1) {
        const current = team.riders[slot];
        const otherRiders = team.riders.filter((_, index) => index !== slot);
        const currentScore = riderDraftScore(current, team.priority, otherRiders);
        const room = config.cap - (team.totalCredit - current.credit_salary);
        const candidates = available
          .filter((rider) => rider.credit_salary <= room)
          .map((rider) => ({ rider, score: riderDraftScore(rider, team.priority, otherRiders) }))
          .filter((item) => item.score > currentScore + .01)
          .sort((a, b) => b.score - a.score || a.rider.credit_salary - b.rider.credit_salary || a.rider.no - b.rider.no);
        if (!candidates.length) continue;
        const chosen = candidates[0].rider;
        team.riders[slot] = chosen;
        team.totalCredit += chosen.credit_salary - current.credit_salary;
        available.splice(available.findIndex((rider) => rider.name === chosen.name), 1, current);
        changes += 1;
      }
    }
    if (!changes) break;
  }
  return teams;
}

function evaluateTeam(team, config, assignmentByName, cardContext) {
  const sortedByAce = [...team.riders].sort((a, b) => b.ace_aptitude - a.ace_aptitude || b.credit_salary - a.credit_salary);
  team.aceCandidates = sortedByAce.slice(0, 2).map((rider) => rider.name);
  team.profileScores = {};
  team.profileAces = {};
  team.cardPackages = {};
  const roleText = team.riders.flatMap((rider) => rider.roles).join(" / ");
  for (const [key, profile] of Object.entries(PROFILES)) {
    const ace = [...sortedByAce].sort((a, b) => (b.profileScores[key] + b.ace_aptitude * .12) - (a.profileScores[key] + a.ace_aptitude * .12))[0];
    const supportPower = (rider) => rider.profileScores[key] * (.84 + rider.support_aptitude / 500);
    const supports = team.riders.filter((rider) => rider.name !== ace.name).sort((a, b) => supportPower(b) - supportPower(a)).slice(0, 2);
    const teamAverage = mean(team.riders.map((rider) => rider.profileScores[key]));
    const coveredRoleGroups = profile.rolePatterns.filter((pattern) => pattern.test(roleText)).length;
    const roleAdjustment = coveredRoleGroups * .6 - (profile.rolePatterns.length - coveredRoleGroups) * .8;
    const cardPackage = evaluateTeamCardPackage({ team, assignmentByName, profileKey: key, profile, context: cardContext });
    team.cardPackages[key] = cardPackage;
    team.profileScores[key] = round(ace.profileScores[key] * .55 + mean(supports.map(supportPower)) * .35 + teamAverage * .10 + roleAdjustment + cardPackage.totalEffect);
    team.profileAces[key] = ace.name;
  }
  const expectedPatterns = PROFILES[team.priority].rolePatterns;
  team.roleCoverage = expectedPatterns.map((pattern) => pattern.test(roleText));
  team.missingRoleGroups = expectedPatterns.map((pattern, index) => pattern.test(roleText) ? null : index + 1).filter(Boolean);
  team.budgetRemaining = config.cap - team.totalCredit;
  team.budgetUsePercent = round(team.totalCredit / config.cap * 100, 1);
  team.averageAceAptitude = round(mean(team.riders.slice().sort((a, b) => b.ace_aptitude - a.ace_aptitude).slice(0, 2).map((rider) => rider.ace_aptitude)), 1);
  team.averageSupportAptitude = round(mean(team.riders.slice().sort((a, b) => b.support_aptitude - a.support_aptitude).slice(0, 6).map((rider) => rider.support_aptitude)), 1);
  return team;
}

function simulate(teams, config) {
  const random = mulberry32(config.seed);
  const profileKeys = Object.keys(PROFILES);
  const standings = new Map(teams.map((team) => [team.id, {
    teamId: team.id, teamName: team.name, wins: 0, podiums: 0, placeSum: 0,
    profileWins: Object.fromEntries(profileKeys.map((key) => [key, 0])),
  }]));
  const riderWins = new Map();
  const winningCardUsage = new Map();
  const raceLog = [];
  for (let race = 0; race < config.races; race += 1) {
    const profile = profileKeys[race % profileKeys.length];
    const results = teams.map((team) => {
      const incident = random() < .05 ? 2 + random() * 8 : 0;
      const form = normal(random) * 3.2;
      const performance = team.profileScores[profile] + form - incident;
      return { team, performance, incident };
    }).sort((a, b) => b.performance - a.performance);
    results.forEach((result, index) => {
      const row = standings.get(result.team.id);
      row.placeSum += index + 1;
      if (index === 0) {
        row.wins += 1;
        row.profileWins[profile] += 1;
        const rider = result.team.profileAces[profile];
        riderWins.set(rider, (riderWins.get(rider) || 0) + 1);
        for (const phase of result.team.cardPackages[profile].phases) {
          for (const card of phase.cards) {
            const slotLabel = { basic: "基本技", specialty: "得意技", decisive: "勝負手" }[card.slot] || card.slot;
            const label = `${slotLabel}｜${card.card}`;
            winningCardUsage.set(label, (winningCardUsage.get(label) || 0) + 1);
          }
        }
      }
      if (index < 3) row.podiums += 1;
    });
    if (race < 50) raceLog.push({
      race: race + 1,
      profile,
      winner: results[0].team.name,
      winningAce: results[0].team.profileAces[profile],
      cardEffect: results[0].team.cardPackages[profile].totalEffect,
      decisiveQueue: results[0].team.cardPackages[profile].phases.find((phase) => phase.id === "decisive").cards.map((card) => `${card.rider}:${card.card}`),
      performance: round(results[0].performance),
      incident: results[0].incident > 0,
    });
  }
  const table = [...standings.values()].map((row) => ({
    ...row,
    winRate: round(row.wins / config.races * 100, 2),
    podiumRate: round(row.podiums / config.races * 100, 2),
    averagePlace: round(row.placeSum / config.races, 2),
  })).sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || a.averagePlace - b.averagePlace);
  return {
    standings: table,
    riderWins: [...riderWins.entries()].map(([name, wins]) => ({ name, wins })).sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name)),
    winningCardUsage: [...winningCardUsage.entries()].map(([name, uses]) => ({ name, uses })).sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name, "ja")),
    sampleRaceLog: raceLog,
  };
}

function markdownReport(teams, simulation, config, sourceCount) {
  const headers = ["順位", "チーム", "重点", "Credit", "残額", "平坦", "丘陵", "山岳", "TT", "石畳", "勝利", "表彰台", "平均順位", "役割不足"];
  const rows = simulation.standings.map((standing, index) => {
    const team = teams.find((item) => item.id === standing.teamId);
    return [index + 1, team.name, PROFILES[team.priority].label, team.totalCredit, team.budgetRemaining,
      team.profileScores.flat, team.profileScores.hill, team.profileScores.mountain, team.profileScores.tt, team.profileScores.pave,
      standing.wins, standing.podiums, standing.averagePlace, team.missingRoleGroups.length ? team.missingRoleGroups.join(",") : "なし"];
  });
  const lines = [
    "# 20チーム Credit制限シミュレーション", "",
    `- 母集団: 現役${sourceCount}名`,
    `- 編成: ${config.teams}チーム × ${config.teamSize}名（選手重複なし）`,
    `- 上限: 1チーム ${config.cap.toLocaleString("ja-JP")}Cr`,
    `- レース: ${config.races.toLocaleString("ja-JP")}回（平坦・丘陵・山岳・TT・石畳を均等実施）`,
    `- 乱数シード: ${config.seed}`,
    "- チーム実効値: コースごとに最適エース55%＋アシスト適性補正後の上位2名平均35%＋8人平均10%＋役割適合補正",
    "- カード性能: 展開形成25%＋運搬30%＋決着45%。各ターン5コスト、1選手1枚、基本1・得意2・勝負3コストで最適行動キューを選択", "",
    `| ${headers.join(" | ")} |`, `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.join(" | ")} |`), "",
    "## チーム編成", "",
  ];
  for (const team of teams) {
    lines.push(`### ${team.name} — ${PROFILES[team.priority].label}重点 / ${team.totalCredit.toLocaleString("ja-JP")}Cr`, "");
    lines.push(`エース候補: ${team.aceCandidates.join(" / ")}`, "");
    for (const rider of [...team.riders].sort((a, b) => b.ace_aptitude - a.ace_aptitude)) {
      lines.push(`- ${rider.name} — ${rider.credit_salary.toLocaleString("ja-JP")}Cr / エース${rider.ace_aptitude} / アシスト${rider.support_aptitude} / ${rider.primary_archetype}`);
    }
    lines.push("");
  }
  lines.push("## 個人勝利数 上位20名", "", "| 順位 | 選手 | 勝利 |", "|---:|---|---:|",
    ...simulation.riderWins.slice(0, 20).map((row, index) => `| ${index + 1} | ${row.name} | ${row.wins} |`), "",
    "## 勝利チーム使用カード 上位20枚", "", "| 順位 | カード | 使用回数 |", "|---:|---|---:|",
    ...simulation.winningCardUsage.slice(0, 20).map((row, index) => `| ${index + 1} | ${row.name} | ${row.uses} |`), "");
  return lines.join("\n");
}

const config = parseArgs(process.argv.slice(2));
const sourceText = await fs.readFile(config.source, "utf8");
const riders = parseCsv(sourceText).map(hydrate).filter((rider) => rider.name && rider.credit_salary > 0);
if (riders.length < config.teams * config.teamSize) throw new Error(`Need ${config.teams * config.teamSize} riders, found ${riders.length}`);
const cardAssignments = JSON.parse(await fs.readFile("data/rider_card_assignments.json", "utf8"));
const activeAssignments = cardAssignments.filter((assignment) => assignment.rosterFile.replaceAll("\\", "/") === config.source.replaceAll("\\", "/"));
const assignmentByName = new Map(activeAssignments.map((assignment) => [assignment.riderName, assignment]));
const cardContext = await loadCardPerformanceContext();
const teams = buildTeams(riders, config).map((team) => evaluateTeam(team, config, assignmentByName, cardContext));
const usedNames = teams.flatMap((team) => team.riders.map((rider) => rider.name));
const diagnostics = {
  valid: teams.length === config.teams
    && teams.every((team) => team.riders.length === config.teamSize && team.totalCredit <= config.cap)
    && new Set(usedNames).size === usedNames.length,
  teams: teams.length,
  ridersUsed: usedNames.length,
  uniqueRiders: new Set(usedNames).size,
  overCapTeams: teams.filter((team) => team.totalCredit > config.cap).map((team) => team.name),
  incompleteTeams: teams.filter((team) => team.riders.length !== config.teamSize).map((team) => team.name),
  teamsWithRoleWarnings: teams.filter((team) => team.missingRoleGroups.length).map((team) => ({ team: team.name, missingGroups: team.missingRoleGroups })),
  totalCredit: teams.reduce((sum, team) => sum + team.totalCredit, 0),
  totalBudget: config.teams * config.cap,
  minTeamCredit: Math.min(...teams.map((team) => team.totalCredit)),
  maxTeamCredit: Math.max(...teams.map((team) => team.totalCredit)),
  cardAssignments: assignmentByName.size,
  missingCardAssignments: usedNames.filter((name) => !assignmentByName.has(name)),
};
if (!diagnostics.valid) throw new Error(`Invalid draft: ${JSON.stringify(diagnostics)}`);

const simulation = simulate(teams, config);
const serializableTeams = teams.map((team) => ({
  id: team.id, name: team.name, priority: team.priority, totalCredit: team.totalCredit,
  budgetRemaining: team.budgetRemaining, budgetUsePercent: team.budgetUsePercent,
  aceCandidates: team.aceCandidates, averageAceAptitude: team.averageAceAptitude,
  averageSupportAptitude: team.averageSupportAptitude, profileScores: team.profileScores,
  profileAces: team.profileAces, cardPackages: team.cardPackages, missingRoleGroups: team.missingRoleGroups,
  riders: team.riders.map((rider) => ({ no: rider.no, name: rider.name, credit: rider.credit_salary, primaryArchetype: rider.primary_archetype, secondaryArchetype: rider.secondary_archetype, aceAptitude: rider.ace_aptitude, supportAptitude: rider.support_aptitude, roles: rider.roles })),
}));

await fs.mkdir(config.output, { recursive: true });
await fs.writeFile(path.join(config.output, "simulation_results.json"), JSON.stringify({ config, sourceCount: riders.length, diagnostics, teams: serializableTeams, simulation }, null, 2) + "\n", "utf8");
await fs.writeFile(path.join(config.output, "report.md"), markdownReport(teams, simulation, config, riders.length) + "\n", "utf8");

const teamSummaryRows = teams.map((team) => {
  const standing = simulation.standings.find((row) => row.teamId === team.id);
  return {
    team: team.name, priority: PROFILES[team.priority].label, total_credit: team.totalCredit, remaining_credit: team.budgetRemaining,
    budget_use_percent: team.budgetUsePercent, ace_candidate_1: team.aceCandidates[0], ace_candidate_2: team.aceCandidates[1],
    flat: team.profileScores.flat, hill: team.profileScores.hill, mountain: team.profileScores.mountain, tt: team.profileScores.tt, pave: team.profileScores.pave,
    card_flat: team.cardPackages.flat.totalEffect, card_hill: team.cardPackages.hill.totalEffect, card_mountain: team.cardPackages.mountain.totalEffect, card_tt: team.cardPackages.tt.totalEffect, card_pave: team.cardPackages.pave.totalEffect,
    wins: standing.wins, podiums: standing.podiums, average_place: standing.averagePlace, missing_role_groups: team.missingRoleGroups.join(" / ") || "none",
  };
});
await fs.writeFile(path.join(config.output, "team_summary.csv"), toCsv(Object.keys(teamSummaryRows[0]), teamSummaryRows), "utf8");

const rosterRows = teams.flatMap((team) => {
  const aceNames = new Set(team.aceCandidates);
  return team.riders.map((rider) => ({
    team: team.name, priority: PROFILES[team.priority].label, rider_no: rider.no, rider_name: rider.name,
    assignment: aceNames.has(rider.name) ? "エース候補" : "支援", credit: rider.credit_salary,
    ace_aptitude: rider.ace_aptitude, support_aptitude: rider.support_aptitude,
    primary_archetype: rider.primary_archetype, secondary_archetype: rider.secondary_archetype, roles: rider.roles.join(" / "),
  }));
});
await fs.writeFile(path.join(config.output, "team_rosters.csv"), toCsv(Object.keys(rosterRows[0]), rosterRows), "utf8");

console.log(JSON.stringify({ output: config.output, diagnostics, top5: simulation.standings.slice(0, 5), topRiders: simulation.riderWins.slice(0, 10) }, null, 2));
