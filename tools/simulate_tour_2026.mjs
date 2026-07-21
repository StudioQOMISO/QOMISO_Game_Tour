import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routePath = path.join(root, "data", "tour_2026_reference_route.json");
const coursePointsPath = path.join(root, "data", "tour_2026_course_points.json");
const leaguePath = path.join(root, "outputs", "team_simulation_20x8_40000", "simulation_results.json");
const riderPath = path.join(root, "選手スプレッドシート", "01_現役選手300名.csv");
const outputDir = path.join(root, "outputs", "tour_2026_simulation");
const seed = Number(process.argv.find((arg) => arg.startsWith("--seed="))?.split("=")[1] || 20260721);

function mulberry32(value) {
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

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const csvCell = (value) => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replace(/"/g, '""')}"` : String(value ?? "");
const toCsv = (headers, rows) => [headers.join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join("\n") + "\n";
const formatGap = (seconds) => seconds <= 0 ? "0:00" : `+${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const RIDER_STAT_KEYS = ["sprint", "acceleration", "punch", "cruise", "climb", "stamina", "resistance", "technique", "bikeControl", "recovery", "dailyRecovery", "teamwork", "fighting"];
const PROFILE_WEIGHTS = {
  flat: { sprint: .27, acceleration: .18, cruise: .16, stamina: .10, technique: .09, resistance: .07, bikeControl: .05, teamwork: .05, fighting: .03 },
  hill: { punch: .25, acceleration: .16, climb: .15, stamina: .12, recovery: .08, technique: .08, resistance: .06, fighting: .06, bikeControl: .04 },
  mountain: { climb: .30, stamina: .16, recovery: .14, dailyRecovery: .10, punch: .08, resistance: .06, fighting: .06, technique: .05, cruise: .05 },
  tt: { cruise: .30, stamina: .17, technique: .14, resistance: .10, recovery: .08, teamwork: .08, dailyRecovery: .06, fighting: .04, bikeControl: .03 },
};
const isSprintProfile = (rider) => [rider.primaryArchetype, rider.secondaryArchetype].includes("スプリンター");
const getSprintProfileBonus = (rider) => rider.primaryArchetype === "スプリンター" ? 4
  : rider.secondaryArchetype === "スプリンター" ? 2.5
    : 0;

const [route, coursePoints, league, riderCsv] = await Promise.all([
  fs.readFile(routePath, "utf8").then(JSON.parse),
  fs.readFile(coursePointsPath, "utf8").then(JSON.parse),
  fs.readFile(leaguePath, "utf8").then(JSON.parse),
  fs.readFile(riderPath, "utf8"),
]);
const riderStats = new Map(parseCsv(riderCsv).map((rider) => [rider.name, rider]));
const random = mulberry32(seed);
const individualRandom = mulberry32(seed ^ 0xA5A5A5A5);
const checkpointRandom = mulberry32(seed ^ 0xC0FFEE26);
const escapeRandom = mulberry32(seed ^ 0xBEEFB026);

const teams = league.teams.map((team) => ({
  ...team,
  gcSeconds: 0,
  stageWins: 0,
  podiums: 0,
  echelons: 0,
  crashes: 0,
  mechanicals: 0,
  riders: team.riders.map((rider) => {
    const stats = riderStats.get(rider.name) || {};
    return {
      ...rider,
      ...Object.fromEntries(RIDER_STAT_KEYS.map((stat) => [stat, Number(stats[stat] || 65)])),
      aceAptitude: Number(stats.ace_aptitude || rider.aceAptitude || 65),
      supportAptitude: Number(stats.support_aptitude || rider.supportAptitude || 65),
      birthDate: stats.birth_date || "",
      gcSeconds: 0,
      stageWins: 0,
      podiums: 0,
      echelons: 0,
      crashes: 0,
      mechanicals: 0,
      fatigue: 0,
      peakFatigue: 0,
      health: 100,
    };
  }),
}));

const escapeWinTarget = 3 + Math.abs(seed % 2);
const escapeStageSet = new Set(route.stages
  .filter((stage) => !["tt"].includes(stage.profileKey)
    && ["hill", "mountain"].includes(stage.profileKey)
    && stage.elevationGainM < 4500)
  .map((stage) => ({ stage: stage.stage, opportunity: escapeRandom() + (stage.profileKey === "hill" ? .18 : 0) }))
  .sort((a, b) => b.opportunity - a.opportunity)
  .slice(0, escapeWinTarget)
  .map((entry) => entry.stage));
function getStageAssistState(team, profileKey) {
  const aceName = team.profileAces[profileKey];
  const topSupports = [...team.riders]
    .filter((rider) => rider.name !== aceName)
    .sort((a, b) => b.supportAptitude - a.supportAptitude)
    .slice(0, 2);
  const freshness = mean(topSupports.map((rider) => clamp(1 - rider.fatigue / 70, .2, 1)));
  const assistStrength = mean(topSupports.map((rider) => rider.supportAptitude)) * freshness;
  const fatigueShield = clamp(assistStrength / 500, .04, .17);
  return { aceName, topSupports, assistStrength, fatigueShield };
}
function getSprintTactics(team, profileKey) {
  const aceName = team.profileAces[profileKey];
  const cardPackage = team.cardPackages[profileKey];
  let leadoutPower = 0;
  let positioningPower = 0;
  let finalLaunchPower = 0;
  let freeRidePower = 0;
  const freeRideByRider = {};
  for (const phase of cardPackage?.phases || []) {
    const phaseWeight = Number(phase.weight || 0);
    for (const card of phase.cards || []) {
      const abilities = new Set(card.abilities || []);
      const weightedPower = Number(card.power || 0) * phaseWeight;
      const assistsAce = card.riderRoleType === "assist" && card.target === "味方エース";
      const isLeadout = assistsAce && abilities.has("acceleration")
        && (abilities.has("sprint") || abilities.has("teamwork"));
      const positionsAce = (assistsAce || card.rider === aceName) && card.card !== "無賃乗車"
        && abilities.has("positioning");
      const isFinalLaunch = assistsAce && phase.id === "decisive"
        && abilities.has("sprint") && abilities.has("acceleration");
      if (isLeadout) leadoutPower += weightedPower;
      if (positionsAce) positioningPower += weightedPower;
      if (isFinalLaunch) finalLaunchPower += weightedPower;
      if (card.card === "無賃乗車" && card.rider === aceName) freeRidePower += weightedPower;
      if (card.card === "無賃乗車") freeRideByRider[card.rider] = (freeRideByRider[card.rider] || 0) + weightedPower;
    }
  }
  for (const riderName of Object.keys(freeRideByRider)) freeRideByRider[riderName] = Number(freeRideByRider[riderName].toFixed(2));
  return {
    leadoutPower: Number(leadoutPower.toFixed(2)),
    positioningPower: Number(positioningPower.toFixed(2)),
    finalLaunchPower: Number(finalLaunchPower.toFixed(2)),
    freeRidePower: Number(freeRidePower.toFixed(2)),
    freeRideByRider,
  };
}
const sprintTacticsByTeamProfile = new Map(teams.flatMap((team) => Object.keys(PROFILE_WEIGHTS)
  .map((profileKey) => [`${team.name}|${profileKey}`, getSprintTactics(team, profileKey)])));
const stageRows = [];
const riderStageRows = [];
const stageDetails = [];
const cardUsageRows = [];
for (const stage of route.stages) {
  const difficulty = stage.elevationGainM / 1000 + stage.distanceKm / 100;
  const isCrosswind = stage.windDirection === "横風" && stage.windSpeedKmh >= 28;
  const isTechnicalDescent = stage.maxDescent <= -8;
  const isHighMountain = stage.profileKey === "mountain" && (stage.elevationGainM >= 4500 || stage.maxGradient >= 13);

  for (const team of teams) {
    const cardPackage = team.cardPackages[stage.profileKey];
    for (const phase of cardPackage?.phases || []) {
      for (const card of phase.cards || []) {
        cardUsageRows.push({
          stage: stage.stage,
          route: `${stage.start} > ${stage.finish}`,
          stageType: stage.type,
          profile: stage.profileKey,
          team: team.name,
          phase: phase.id,
          phaseLabel: phase.label,
          rider: card.rider,
          card: card.card,
          slot: card.slot,
          cost: card.cost,
          target: card.target,
          power: card.power,
          packageTotalEffect: cardPackage.totalEffect,
        });
      }
    }
  }

  const performances = teams.map((team) => {
    const averageFatigue = mean(team.riders.map((rider) => rider.fatigue));
    const averageHealth = mean(team.riders.map((rider) => rider.health));
    const teamwork = mean(team.riders.map((rider) => rider.teamwork));
    const bikeControl = mean(team.riders.map((rider) => rider.bikeControl));
    const technique = mean(team.riders.map((rider) => rider.technique));
    const cardEffect = team.cardPackages[stage.profileKey]?.totalEffect || 0;
    let incidentSeconds = 0;
    const events = [];
    const riderIncidents = new Map(team.riders.map((rider) => [rider.name, { seconds: 0, events: [] }]));

    if (isCrosswind && random() < clamp(.30 - teamwork / 380, .055, .16)) {
      const loss = Math.round(25 + random() * 75);
      incidentSeconds += loss;
      team.echelons += 1;
      events.push(`エシュロン+${loss}s`);
      for (const incident of riderIncidents.values()) {
        incident.seconds += loss;
        incident.events.push(`エシュロン+${loss}s`);
      }
    }
    if (isTechnicalDescent && random() < clamp(.075 + averageFatigue / 900 - bikeControl / 1700, .018, .11)) {
      const loss = Math.round(35 + random() * 130);
      incidentSeconds += loss;
      team.crashes += 1;
      events.push(`落車+${loss}s`);
      const victim = team.riders[Math.floor(random() * team.riders.length)];
      riderIncidents.get(victim.name).seconds += loss;
      riderIncidents.get(victim.name).events.push(`落車+${loss}s`);
      victim.health = clamp(victim.health - 8 - Math.round(random() * 8), 55, 100);
    }
    if (random() < clamp(.018 + stage.distanceKm / 18000 + averageFatigue / 1800 - technique / 3500, .008, .055)) {
      const loss = Math.round(20 + random() * 80);
      incidentSeconds += loss;
      team.mechanicals += 1;
      events.push(`機材+${loss}s`);
      const victim = team.riders[Math.floor(random() * team.riders.length)];
      riderIncidents.get(victim.name).seconds += loss;
      riderIncidents.get(victim.name).events.push(`機材+${loss}s`);
    }

    const base = team.profileScores[stage.profileKey] || team.profileScores.hill;
    const score = base + cardEffect * .42 - averageFatigue * .13 - (100 - averageHealth) * .16 + normal(random) * 1.8;
    return { team, score, incidentSeconds, events, riderIncidents };
  }).sort((a, b) => b.score - a.score);

  const leaderScore = performances[0].score;
  const gapFactor = stage.profileKey === "mountain" ? 24 : stage.profileKey === "tt" ? 13 : stage.profileKey === "hill" ? 9 : 2.5;
  const results = performances.map((result, index) => {
    let stageGap = Math.max(0, Math.round((leaderScore - result.score) * gapFactor)) + result.incidentSeconds;
    if (stage.profileKey === "flat") stageGap = result.incidentSeconds;
    result.team.gcSeconds += stageGap;
    if (index === 0) result.team.stageWins += 1;
    if (index < 3) result.team.podiums += 1;
    stageRows.push({ stage: stage.stage, route: `${stage.start} > ${stage.finish}`, type: stage.type, distanceKm: stage.distanceKm, elevationGainM: stage.elevationGainM, place: index + 1, team: result.team.name, stageGapSeconds: stageGap, events: result.events.join(" / ") });
    return { place: index + 1, team: result.team.name, gapSeconds: stageGap, events: result.events };
  });

  const teamPerformance = new Map(performances.map((result) => [result.team.name, result]));
  const weights = PROFILE_WEIGHTS[stage.profileKey] || PROFILE_WEIGHTS.hill;
  const escapeWinnerName = escapeStageSet.has(stage.stage)
    ? teams.flatMap((team) => {
      const { aceName } = getStageAssistState(team, stage.profileKey);
      return team.riders
        .filter((rider) => rider.name !== aceName && rider.aceAptitude < 90)
        .map((rider) => ({
          rider,
          escapeScore: rider.fighting * .34
            + rider.stamina * .26
            + (stage.profileKey === "mountain" ? rider.climb : rider.punch) * .22
            + rider.recovery * .10
            + rider.supportAptitude * .08
            - rider.stageWins * 5
            + normal(escapeRandom) * 5.5,
        }));
    }).sort((a, b) => b.escapeScore - a.escapeScore)[0]?.rider.name
    : null;
  const individualPerformances = teams.flatMap((team) => {
    const teamResult = teamPerformance.get(team.name);
    const cardEffect = team.cardPackages[stage.profileKey]?.totalEffect || 0;
    const { aceName, assistStrength, fatigueShield } = getStageAssistState(team, stage.profileKey);
    return team.riders.map((rider) => {
      const riderIncident = teamResult.riderIncidents.get(rider.name);
      const base = Object.entries(weights).reduce((score, [stat, weight]) => score + rider[stat] * weight, 0);
      const isAce = rider.name === aceName;
      const supportBonus = isAce ? assistStrength * .032 + cardEffect * .18 : cardEffect * .08 + rider.supportAptitude * .006;
      const specialty = stage.profileKey === "flat"
        ? rider.sprint * .55 + rider.acceleration * .30 + rider.technique * .15
        : stage.profileKey === "hill"
          ? rider.punch * .50 + rider.acceleration * .25 + rider.climb * .15 + rider.fighting * .10
          : stage.profileKey === "mountain"
            ? rider.climb * .55 + rider.stamina * .20 + rider.recovery * .15 + rider.fighting * .10
            : rider.cruise * .55 + rider.technique * .20 + rider.stamina * .15 + rider.resistance * .10;
      const isPlannedEscape = rider.name === escapeWinnerName;
      const breakawayBonus = isPlannedEscape ? 38
        : !isAce && ["hill", "mountain"].includes(stage.profileKey) && individualRandom() < (stage.profileKey === "hill" ? .10 : .04) ? 7 : 0;
      const mountainPenalty = stage.profileKey !== "mountain" ? 0
        : isHighMountain
          ? Math.max(0, 84 - rider.climb) * .75 + Math.max(0, 82 - rider.recovery) * .25
          : Math.max(0, 80 - rider.climb) * .35;
      const mountainRolePenalty = isHighMountain && !["総合型", "クライマー"].includes(rider.primaryArchetype) ? 12 : 0;
      const mountainTimeLossSeconds = stage.profileKey !== "mountain" ? 0
        : isHighMountain
          ? Math.max(0, 82 - rider.climb) * 24 + mountainRolePenalty * 12
          : Math.max(0, 78 - rider.climb) * 8;
      const score = stage.type === "チームTT"
        ? teamResult.score + individualRandom() * .01
        : base + supportBonus - mountainPenalty - rider.fatigue * .28 - (100 - rider.health) * .22 + normal(individualRandom) * 1.5;
      const specialtyBlend = stage.profileKey === "flat" ? .84 : stage.profileKey === "hill" ? .60 : .55;
      const sprintProfileBonus = stage.profileKey === "flat" ? getSprintProfileBonus(rider) : 0;
      const teamSprintTactics = sprintTacticsByTeamProfile.get(`${team.name}|${stage.profileKey}`);
      const personalFreeRidePower = teamSprintTactics.freeRideByRider[rider.name] || 0;
      const sprintTactics = isAce ? { ...teamSprintTactics, freeRidePower: Math.max(teamSprintTactics.freeRidePower, personalFreeRidePower) }
        : { leadoutPower: 0, positioningPower: 0, finalLaunchPower: 0, freeRidePower: personalFreeRidePower };
      const rivalLeadoutPower = (isAce || sprintTactics.freeRidePower > 0) ? Math.max(0, ...teams
        .filter((rival) => rival.name !== team.name)
        .map((rival) => sprintTacticsByTeamProfile.get(`${rival.name}|${stage.profileKey}`)?.leadoutPower || 0)) : 0;
      const borrowedLeadoutPower = sprintTactics.freeRidePower > 0 ? rivalLeadoutPower * .5 : 0;
      const effectiveLeadoutPower = Math.max(sprintTactics.leadoutPower, borrowedLeadoutPower);
      const sprintPosition = stage.profileKey === "flat" ? Math.round(clamp(23
        + rider.technique * .26 + rider.acceleration * .18
        + effectiveLeadoutPower * 3.5 + sprintTactics.positioningPower * 5
        + sprintTactics.freeRidePower * 5
        - rider.fatigue * .18 + normal(individualRandom) * 4.5, 0, 100)) : 0;
      const boxedInChance = sprintPosition < 45 ? .28 : sprintPosition < 60 ? .12 : sprintPosition < 75 ? .035 : .008;
      const boxedIn = stage.profileKey === "flat" && individualRandom() < boxedInChance;
      const boxedInPenalty = boxedIn ? 14 + individualRandom() * 6 : 0;
      const leadoutLaunchBonus = stage.profileKey === "flat" && (isAce || sprintTactics.freeRidePower > 0)
        ? effectiveLeadoutPower * .55 + sprintTactics.finalLaunchPower * .65
          + sprintTactics.freeRidePower * .40 : 0;
      const sprintTacticalBonus = stage.profileKey === "flat"
        ? (sprintPosition - 60) * .20 + leadoutLaunchBonus - boxedInPenalty : 0;
      const winScore = stage.type === "チームTT"
        ? teamResult.score + individualRandom() * .01
        : base + (specialty - base) * specialtyBlend + sprintProfileBonus + sprintTacticalBonus + supportBonus * .25 + breakawayBonus - mountainPenalty * .60 - mountainRolePenalty
          - rider.fatigue * .22 - rider.stageWins * 1.7 - rider.podiums * .20
          + normal(individualRandom) * 4.5;
      return { team, rider, score, winScore, mountainTimeLossSeconds, incidentSeconds: riderIncident.seconds, events: riderIncident.events, isAce, isBreakaway: isPlannedEscape, fatigueShield,
        sprintPosition, boxedIn, leadoutPower: sprintTactics.leadoutPower, positioningPower: sprintTactics.positioningPower,
        finalLaunchPower: sprintTactics.finalLaunchPower, freeRidePower: sprintTactics.freeRidePower,
        borrowedLeadoutPower: Number(borrowedLeadoutPower.toFixed(2)), leadoutLaunchBonus: Number(leadoutLaunchBonus.toFixed(2)) };
    });
  });

  const stageFinishOrder = [...individualPerformances].sort((a, b) => b.winScore - a.winScore);
  const individualLeaderScore = Math.max(...individualPerformances.map((result) => result.score));
  const individualGapFactor = isHighMountain ? 6.5 : stage.profileKey === "mountain" ? 5.5 : stage.profileKey === "tt" ? 7.5 : stage.profileKey === "hill" ? 4.2 : 4;
  const individualResults = stageFinishOrder.map((result, index) => {
    let stageGap = index === 0 ? 0 : Math.max(0, Math.round((individualLeaderScore - result.score) * individualGapFactor))
      + result.mountainTimeLossSeconds + result.incidentSeconds;
    if (stage.profileKey === "flat") stageGap = result.incidentSeconds;
    result.rider.gcSeconds += stageGap;
    if (index === 0) result.rider.stageWins += 1;
    if (index < 3) result.rider.podiums += 1;
    if (result.events.some((event) => event.startsWith("エシュロン"))) result.rider.echelons += 1;
    if (result.events.some((event) => event.startsWith("落車"))) result.rider.crashes += 1;
    if (result.events.some((event) => event.startsWith("機材"))) result.rider.mechanicals += 1;
    const row = {
      stage: stage.stage,
      route: `${stage.start} > ${stage.finish}`,
      type: stage.type,
      highMountain: isHighMountain,
      place: index + 1,
      rider: result.rider.name,
      team: result.team.name,
      role: result.isAce ? "エース" : "アシスト/自由役",
      victoryType: index === 0 ? (result.isBreakaway ? "逃げ切り" : "集団/本命") : "",
      stageGapSeconds: stageGap,
      events: result.events.join(" / "),
      fatigueStart: Number(result.rider.fatigue.toFixed(1)),
      healthStart: Math.round(result.rider.health),
      assistProtectionPercent: result.isAce ? Math.round(result.fatigueShield * 100) : 0,
      mountainTimeLossSeconds: result.mountainTimeLossSeconds,
      sprintPosition: result.sprintPosition,
      boxedIn: result.boxedIn ? "yes" : "no",
      leadoutPower: result.leadoutPower,
      positioningPower: result.positioningPower,
      finalLaunchPower: result.finalLaunchPower,
      freeRidePower: result.freeRidePower,
      borrowedLeadoutPower: result.borrowedLeadoutPower,
      leadoutLaunchBonus: result.leadoutLaunchBonus,
    };
    riderStageRows.push(row);
    return row;
  });
  const load = difficulty * (stage.profileKey === "mountain" ? 2.6 : stage.profileKey === "hill" ? 1.85 : 1.25);
  for (const team of teams) {
    const { aceName, topSupports, fatigueShield } = getStageAssistState(team, stage.profileKey);
    const supportNames = new Set(topSupports.map((rider) => rider.name));
    for (const rider of team.riders) {
      let personalLoad = load * clamp(1.2 - rider.stamina / 210, .72, .98);
      if (rider.name === aceName) personalLoad *= 1 - fatigueShield;
      else if (supportNames.has(rider.name)) personalLoad *= 1.18;
      rider.fatigue = clamp(rider.fatigue + personalLoad, 0, 100);
      rider.peakFatigue = Math.max(rider.peakFatigue, rider.fatigue);
      const recoveryGain = 2.5 + rider.dailyRecovery / 24 + rider.recovery / 45;
      rider.fatigue = clamp(rider.fatigue - recoveryGain, 0, 100);
      rider.health = clamp(rider.health + 1 + rider.dailyRecovery / 45, 55, 100);
    }
  }
  if (route.restAfterStages.includes(stage.stage)) {
    for (const team of teams) for (const rider of team.riders) {
      rider.fatigue = clamp(rider.fatigue - (10 + rider.dailyRecovery / 4), 0, 100);
      rider.health = clamp(rider.health + 6 + rider.dailyRecovery / 12, 55, 100);
    }
  }
  stageDetails.push({
    ...stage,
    winner: results[0].team,
    individualWinner: individualResults[0].rider,
    top3: results.slice(0, 3),
    individualWinnerType: individualResults[0].victoryType,
    top3Riders: individualResults.slice(0, 3),
  });
}

const gc = [...teams].sort((a, b) => a.gcSeconds - b.gcSeconds);
const gcLeader = gc[0].gcSeconds;
const gcRows = gc.map((team, index) => ({
  place: index + 1,
  team: team.name,
  gapSeconds: team.gcSeconds - gcLeader,
  gap: formatGap(team.gcSeconds - gcLeader),
  stageWins: team.stageWins,
  podiums: team.podiums,
  echelons: team.echelons,
  crashes: team.crashes,
  mechanicals: team.mechanicals,
  finalFatigue: Number(mean(team.riders.map((rider) => rider.fatigue)).toFixed(1)),
  peakFatigue: Number(mean(team.riders.map((rider) => rider.peakFatigue)).toFixed(1)),
  minHealth: Math.round(Math.min(...team.riders.map((rider) => rider.health))),
  credit: team.totalCredit,
}));

const individualGcSource = teams
  .flatMap((team) => team.riders.map((rider) => ({ team, rider })))
  .sort((a, b) => a.rider.gcSeconds - b.rider.gcSeconds);
const individualGcLeader = individualGcSource[0].rider.gcSeconds;
const individualGcRows = individualGcSource.map(({ team, rider }, index) => ({
  place: index + 1,
  rider: rider.name,
  team: team.name,
  gapSeconds: rider.gcSeconds - individualGcLeader,
  gap: formatGap(rider.gcSeconds - individualGcLeader),
  stageWins: rider.stageWins,
  podiums: rider.podiums,
  echelons: rider.echelons,
  crashes: rider.crashes,
  mechanicals: rider.mechanicals,
  finalFatigue: Number(rider.fatigue.toFixed(1)),
  peakFatigue: Number(rider.peakFatigue.toFixed(1)),
  health: Math.round(rider.health),
  aceAptitude: rider.aceAptitude,
  supportAptitude: rider.supportAptitude,
  credit: rider.credit,
}));
const riderByName = new Map(teams.flatMap((team) => team.riders.map((rider) => [rider.name, rider])));
const classificationTotals = new Map(individualGcRows.map((row) => [row.rider, {
  rider: row.rider,
  team: row.team,
  points: 0,
  finishPoints: 0,
  intermediatePoints: 0,
  mountainPoints: 0,
  mountainWins: 0,
  stageWins: row.stageWins,
  gcPlace: row.place,
  gcGapSeconds: row.gapSeconds,
}]));
const coursePointByStage = new Map(coursePoints.stages.map((stage) => [stage.stage, stage]));
const stageRowsByStage = new Map(route.stages.map((stage) => [
  stage.stage,
  riderStageRows.filter((row) => row.stage === stage.stage),
]));
if (coursePointByStage.size !== route.stages.length) {
  throw new Error(`Course checkpoint data mismatch: ${coursePointByStage.size} point stages / ${route.stages.length} route stages`);
}

function getCheckpointScore(row, event) {
  const rider = riderByName.get(row.rider);
  const freshness = 100 - row.fatigueStart;
  if (event.type === "intermediateSprint") {
    const breakawayChance = row.type === "平坦" ? .025 : .06;
    const breakawayBonus = checkpointRandom() < breakawayChance ? (row.type === "平坦" ? 7 : 11) : 0;
    const positionEffect = row.type === "平坦" ? (row.sprintPosition - 60) * .12
      + row.leadoutLaunchBonus * .35 - (row.boxedIn === "yes" ? 4 : 0) : 0;
    return rider.sprint * .46
      + rider.acceleration * .25
      + rider.cruise * .10
      + rider.fighting * .05
      + rider.stamina * .05
      + rider.technique * .05
      + freshness * .04
      + getSprintProfileBonus(rider)
      + breakawayBonus
      + positionEffect
      + normal(checkpointRandom) * 3.2;
  }
  const category = event.category;
  const longClimb = category === "HC" || category === "1";
  const breakawayChance = longClimb ? .045 : .08;
  const breakawayBonus = checkpointRandom() < breakawayChance ? (longClimb ? 14 : 28) : 0;
  return rider.climb * (longClimb ? .50 : .38)
    + rider.stamina * (longClimb ? .17 : .12)
    + rider.recovery * .10
    + rider.punch * (longClimb ? .08 : .20)
    + rider.fighting * .09
    + rider.acceleration * (longClimb ? .02 : .06)
    + freshness * .04
    - row.mountainTimeLossSeconds * .025
    + breakawayBonus
    + normal(checkpointRandom) * (longClimb ? 3.8 : 5.2);
}

const checkpointRows = [];
for (const stage of route.stages) {
  const pointStage = coursePointByStage.get(stage.stage);
  const stageRiders = stageRowsByStage.get(stage.stage);
  for (const row of stageRiders) {
    const finishPoints = pointStage.finishPoints[row.place - 1] || 0;
    const total = classificationTotals.get(row.rider);
    total.finishPoints += finishPoints;
    total.points += finishPoints;
  }
  for (const event of pointStage.events) {
    const schedule = event.type === "intermediateSprint" ? coursePoints.intermediateSprintPoints : event.points;
    const ranked = event.isFinish
      ? [...stageRiders].sort((a, b) => a.place - b.place)
      : stageRiders
        .map((row) => ({ ...row, checkpointScore: getCheckpointScore(row, event) }))
        .sort((a, b) => b.checkpointScore - a.checkpointScore || a.place - b.place);
    ranked.slice(0, schedule.length).forEach((row, index) => {
      const awarded = schedule[index];
      const total = classificationTotals.get(row.rider);
      if (event.type === "intermediateSprint") {
        total.intermediatePoints += awarded;
        total.points += awarded;
      } else {
        total.mountainPoints += awarded;
        if (index === 0) total.mountainWins += 1;
      }
      checkpointRows.push({
        stage: stage.stage,
        route: `${stage.start} > ${stage.finish}`,
        km: event.km,
        checkpointType: event.type,
        checkpoint: event.name,
        category: event.category || "",
        passagePlace: index + 1,
        rider: row.rider,
        team: row.team,
        points: awarded,
        finishLinked: Boolean(event.isFinish),
      });
    });
  }
}
const pointsRows = [...classificationTotals.values()]
  .sort((a, b) => b.points - a.points || b.stageWins - a.stageWins || a.gcGapSeconds - b.gcGapSeconds)
  .map((row, index) => {
    const rider = riderByName.get(row.rider);
    return { place: index + 1, rider: row.rider, team: row.team, points: row.points, finishPoints: row.finishPoints, intermediatePoints: row.intermediatePoints, stageWins: row.stageWins, gcPlace: row.gcPlace,
      primaryArchetype: rider.primaryArchetype, secondaryArchetype: rider.secondaryArchetype, sprintProfile: isSprintProfile(rider) ? "yes" : "no" };
  });
const mountainRows = [...classificationTotals.values()]
  .sort((a, b) => b.mountainPoints - a.mountainPoints || b.mountainWins - a.mountainWins || a.gcGapSeconds - b.gcGapSeconds)
  .map((row, index) => ({ place: index + 1, rider: row.rider, team: row.team, mountainPoints: row.mountainPoints, mountainWins: row.mountainWins, gcPlace: row.gcPlace }));
const youngSource = individualGcRows.filter((row) => (riderByName.get(row.rider)?.birthDate || "") >= "2001-01-01");
const youngLeaderGap = youngSource[0]?.gapSeconds || 0;
const youngRows = youngSource.map((row, index) => ({ place: index + 1, rider: row.rider, team: row.team,
  gapSeconds: row.gapSeconds - youngLeaderGap, gap: formatGap(row.gapSeconds - youngLeaderGap),
  gcPlace: row.place, birthDate: riderByName.get(row.rider).birthDate }));
const aceProtectionValues = riderStageRows.filter((row) => row.role === "エース").map((row) => row.assistProtectionPercent);
const averageFinalFatigue = mean(individualGcRows.map((row) => row.finalFatigue)).toFixed(1);
const averagePeakFatigue = mean(individualGcRows.map((row) => row.peakFatigue)).toFixed(1);
const intermediateCheckpointCount = coursePoints.stages.reduce((sum, stage) => sum + stage.events.filter((event) => event.type === "intermediateSprint").length, 0);
const komCheckpointCount = coursePoints.stages.reduce((sum, stage) => sum + stage.events.filter((event) => event.type === "kom").length, 0);
const pointsTop10SprintProfiles = pointsRows.slice(0, 10).filter((row) => row.sprintProfile === "yes").length;
const flatSprintWinners = riderStageRows.filter((row) => row.type === "平坦" && row.place === 1);
const flatSprintAceRows = riderStageRows.filter((row) => row.type === "平坦" && row.role === "エース");
const sprintTacticsRows = riderStageRows.filter((row) => row.type === "平坦" && (row.role === "エース" || row.place <= 10));
const averageFlatWinnerPosition = Number(mean(flatSprintWinners.map((row) => row.sprintPosition)).toFixed(1));
const flatAceBoxedInCount = flatSprintAceRows.filter((row) => row.boxedIn === "yes").length;
const freeRideRows = riderStageRows.filter((row) => row.type === "平坦" && row.freeRidePower > 0);
const freeRideSummaryRows = [...new Set(freeRideRows.map((row) => row.rider))].map((rider) => {
  const rows = freeRideRows.filter((row) => row.rider === rider);
  return { rider, team: rows[0].team, uses: rows.length,
    bestPlace: Math.min(...rows.map((row) => row.place)),
    top10: rows.filter((row) => row.place <= 10).length,
    podiums: rows.filter((row) => row.place <= 3).length,
    averagePosition: Number(mean(rows.map((row) => row.sprintPosition)).toFixed(1)),
    averageBorrowedLeadout: Number(mean(rows.map((row) => row.borrowedLeadoutPower)).toFixed(2)) };
});
const cardUsageSummaryMap = new Map();
for (const row of cardUsageRows) {
  const key = `${row.slot}|${row.card}`;
  const summary = cardUsageSummaryMap.get(key) || {
    slot: row.slot,
    card: row.card,
    uses: 0,
    totalPower: 0,
    riders: new Set(),
    teams: new Set(),
    profiles: new Set(),
    phases: new Set(),
  };
  summary.uses += 1;
  summary.totalPower += Number(row.power);
  summary.riders.add(row.rider);
  summary.teams.add(row.team);
  summary.profiles.add(row.profile);
  summary.phases.add(row.phase);
  cardUsageSummaryMap.set(key, summary);
}
const cardUsageSummaryRows = [...cardUsageSummaryMap.values()]
  .map((row) => ({ slot: row.slot, card: row.card, uses: row.uses,
    averagePower: Number((row.totalPower / row.uses).toFixed(3)),
    riders: row.riders.size, teams: row.teams.size,
    profiles: [...row.profiles].sort().join(" / "), phases: [...row.phases].sort().join(" / ") }))
  .sort((a, b) => b.uses - a.uses || b.averagePower - a.averagePower || a.card.localeCompare(b.card, "ja"));
const report = [
  "# 2026 Tour de France reference simulation",
  "",
  `- Seed: ${seed}`,
  `- Course: 21 stages / listed stages ${route.listedStageDistanceKm} km / official published total ${route.officialDistanceKm} km / D+ ${route.officialElevationGainM.toLocaleString()} m`,
  `- Official course points: intermediate sprints ${intermediateCheckpointCount} / KOM summits ${komCheckpointCount} / awarded passages ${checkpointRows.length}`,
  `- Game field: ${teams.length} teams × ${teams[0].riders.length} riders / ${league.config.cap.toLocaleString()} Credit cap`,
  `- Card usage: ${cardUsageRows.length} plays / ${cardUsageSummaryRows.length} unique slot-card combinations`,
  `- Winner: ${gcRows[0].team} / stage wins ${gcRows[0].stageWins}`,
  `- Individual winner: ${individualGcRows[0].rider} (${individualGcRows[0].team}) / stage wins ${individualGcRows[0].stageWins}`,
  `- Jerseys: GC ${individualGcRows[0].rider} / Points ${pointsRows[0].rider} (${pointsRows[0].points}) / KOM ${mountainRows[0].rider} (${mountainRows[0].mountainPoints}) / Young ${youngRows[0]?.rider || "none"}`,
  `- GC top 10 spread: ${individualGcRows[9].gap} (target: within 30:00)`,
  `- Breakaway wins: ${stageDetails.filter((stage) => stage.individualWinnerType === "逃げ切り").length} stages (target: 3-4)`,
  `- Points top 10 sprint profiles: ${pointsTop10SprintProfiles}/10 (target: majority)`,
  `- Sprint tactics: flat winner position avg ${averageFlatWinnerPosition}/100 / ace boxed-in ${flatAceBoxedInCount}/${flatSprintAceRows.length}`,
  `- Free ride decisive: ${freeRideRows.length} plays / ${freeRideSummaryRows.length} riders / top 10 ${freeRideRows.filter((row) => row.place <= 10).length} / podiums ${freeRideRows.filter((row) => row.place <= 3).length} / wins ${freeRideRows.filter((row) => row.place === 1).length}`,
  `- Assist/Fatigue: ace protection ${Math.min(...aceProtectionValues)}-${Math.max(...aceProtectionValues)}% / final fatigue avg ${averageFinalFatigue} / peak fatigue avg ${averagePeakFatigue}`,
  `- Events: echelons ${teams.reduce((sum, team) => sum + team.echelons, 0)}, crashes ${teams.reduce((sum, team) => sum + team.crashes, 0)}, mechanicals ${teams.reduce((sum, team) => sum + team.mechanicals, 0)}`,
  "",
  "## Final GC",
  "",
  "| # | Team | Gap | Wins | Podiums | Echelons | Crashes | Mechanicals | End fatigue | Peak fatigue | Min health |",
  "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...gcRows.map((row) => `| ${row.place} | ${row.team} | ${row.gap} | ${row.stageWins} | ${row.podiums} | ${row.echelons} | ${row.crashes} | ${row.mechanicals} | ${row.finalFatigue} | ${row.peakFatigue} | ${row.minHealth} |`),
  "",
  "## Individual GC — Top 20",
  "",
  "| # | Rider | Team | Gap | Wins | Podiums | Echelons | Crashes | Mechanicals | End fatigue | Peak fatigue | Health |",
  "|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ...individualGcRows.slice(0, 20).map((row) => `| ${row.place} | ${row.rider} | ${row.team} | ${row.gap} | ${row.stageWins} | ${row.podiums} | ${row.echelons} | ${row.crashes} | ${row.mechanicals} | ${row.finalFatigue} | ${row.peakFatigue} | ${row.health} |`),
  "",
  "## Points classification — Top 10",
  "",
  "| # | Rider | Team | Points | Finish | Intermediate | Stage wins | GC | Sprint profile |",
  "|---:|---|---|---:|---:|---:|---:|---:|---|",
  ...pointsRows.slice(0, 10).map((row) => `| ${row.place} | ${row.rider} | ${row.team} | ${row.points} | ${row.finishPoints} | ${row.intermediatePoints} | ${row.stageWins} | ${row.gcPlace} | ${row.sprintProfile} |`),
  "",
  "## Sprint lead-out and positioning",
  "",
  "| Stage | Winner | Team | Position | Lead-out | Position cards | Final launch | Free ride | Borrowed | Boxed in |",
  "|---:|---|---|---:|---:|---:|---:|---:|---:|---|",
  ...flatSprintWinners.map((row) => `| ${row.stage} | ${row.rider} | ${row.team} | ${row.sprintPosition} | ${row.leadoutPower} | ${row.positioningPower} | ${row.finalLaunchPower} | ${row.freeRidePower} | ${row.borrowedLeadoutPower} | ${row.boxedIn} |`),
  "",
  "## Free ride decisive card",
  "",
  "| Rider | Team | Uses | Best | Top 10 | Podiums | Avg position | Avg borrowed lead-out |",
  "|---|---|---:|---:|---:|---:|---:|---:|",
  ...freeRideSummaryRows.map((row) => `| ${row.rider} | ${row.team} | ${row.uses} | ${row.bestPlace} | ${row.top10} | ${row.podiums} | ${row.averagePosition} | ${row.averageBorrowedLeadout} |`),
  "",
  "## Mountain classification — Top 10",
  "",
  "| # | Rider | Team | KOM points | Mountain wins | GC |",
  "|---:|---|---|---:|---:|---:|",
  ...mountainRows.slice(0, 10).map((row) => `| ${row.place} | ${row.rider} | ${row.team} | ${row.mountainPoints} | ${row.mountainWins} | ${row.gcPlace} |`),
  "",
  "## Young rider classification — Top 10",
  "",
  "| # | Rider | Team | Gap | GC | Birth date |",
  "|---:|---|---|---:|---:|---|",
  ...youngRows.slice(0, 10).map((row) => `| ${row.place} | ${row.rider} | ${row.team} | ${row.gap} | ${row.gcPlace} | ${row.birthDate} |`),
  "",
  "## Card usage — Top 20",
  "",
  "| Slot | Card | Uses | Avg power | Riders | Teams | Profiles | Phases |",
  "|---|---|---:|---:|---:|---:|---|---|",
  ...cardUsageSummaryRows.slice(0, 20).map((row) => `| ${row.slot} | ${row.card} | ${row.uses} | ${row.averagePower} | ${row.riders} | ${row.teams} | ${row.profiles} | ${row.phases} |`),
  "",
  "## Stage winners",
  "",
  ...stageDetails.map((stage) => `- Stage ${stage.stage}: ${stage.start} > ${stage.finish} (${stage.distanceKm}km, D+${stage.elevationGainM}m) — ${stage.individualWinner} [${stage.individualWinnerType}] / ${stage.winner}`),
  "",
  "> Distances, stage types, starts and finishes follow the official route. Per-stage elevation, gradients and weather are game-model estimates whose total elevation is constrained to the official 53,950m.",
  "",
].join("\n");

await fs.mkdir(outputDir, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, "report.md"), report, "utf8"),
  fs.writeFile(path.join(outputDir, "gc_final.csv"), toCsv(Object.keys(gcRows[0]), gcRows), "utf8"),
  fs.writeFile(path.join(outputDir, "stage_results.csv"), toCsv(Object.keys(stageRows[0]), stageRows), "utf8"),
  fs.writeFile(path.join(outputDir, "rider_gc_final.csv"), toCsv(Object.keys(individualGcRows[0]), individualGcRows), "utf8"),
  fs.writeFile(path.join(outputDir, "rider_stage_results.csv"), toCsv(Object.keys(riderStageRows[0]), riderStageRows), "utf8"),
  fs.writeFile(path.join(outputDir, "course_checkpoint_results.csv"), toCsv(Object.keys(checkpointRows[0]), checkpointRows), "utf8"),
  fs.writeFile(path.join(outputDir, "card_usage_results.csv"), toCsv(Object.keys(cardUsageRows[0]), cardUsageRows), "utf8"),
  fs.writeFile(path.join(outputDir, "card_usage_summary.csv"), toCsv(Object.keys(cardUsageSummaryRows[0]), cardUsageSummaryRows), "utf8"),
  fs.writeFile(path.join(outputDir, "points_classification.csv"), toCsv(Object.keys(pointsRows[0]), pointsRows), "utf8"),
  fs.writeFile(path.join(outputDir, "mountain_classification.csv"), toCsv(Object.keys(mountainRows[0]), mountainRows), "utf8"),
  fs.writeFile(path.join(outputDir, "sprint_tactics_results.csv"), toCsv(Object.keys(sprintTacticsRows[0]), sprintTacticsRows), "utf8"),
  fs.writeFile(path.join(outputDir, "young_rider_classification.csv"), toCsv(Object.keys(youngRows[0]), youngRows), "utf8"),
  fs.writeFile(path.join(outputDir, "free_ride_results.csv"), toCsv(Object.keys(freeRideRows[0]), freeRideRows), "utf8"),
  fs.writeFile(path.join(outputDir, "free_ride_summary.csv"), toCsv(Object.keys(freeRideSummaryRows[0]), freeRideSummaryRows), "utf8"),
  fs.writeFile(path.join(outputDir, "simulation_results.json"), JSON.stringify({ seed, route, coursePoints, stageDetails, checkpointResults: checkpointRows, cardUsage: cardUsageRows, cardUsageSummary: cardUsageSummaryRows, gc: gcRows, individualGc: individualGcRows, classifications: { points: pointsRows, mountain: mountainRows, young: youngRows } }, null, 2) + "\n", "utf8"),
]);
console.log(`Tour simulation complete: ${gcRows[0].team} / ${individualGcRows[0].rider} / ${riderStageRows.length} rider-stage results`);
