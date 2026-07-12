const baseStats = {
  sprint: 48,
  climb: 45,
  stamina: 52,
  technique: 44,
  teamwork: 46,
};

const trainingCommands = [
  {
    id: "sprint",
    label: "スプリント練習",
    detail: "瞬発力 +8 / スタミナ -3",
    effect: { sprint: 8, stamina: -3 },
  },
  {
    id: "climb",
    label: "登坂インターバル",
    detail: "登坂力 +8 / 技術 +2",
    effect: { climb: 8, technique: 2 },
  },
  {
    id: "endurance",
    label: "ロングライド",
    detail: "スタミナ +9 / チーム +2",
    effect: { stamina: 9, teamwork: 2 },
  },
  {
    id: "handling",
    label: "コーナー練習",
    detail: "技術 +7 / 瞬発力 +1",
    effect: { technique: 7, sprint: 1 },
  },
  {
    id: "leadout",
    label: "隊列連携",
    detail: "チーム +8 / 技術 +2",
    effect: { teamwork: 8, technique: 2 },
  },
  {
    id: "rest",
    label: "回復走",
    detail: "全能力 +2 / 育成週 +1",
    effect: { sprint: 2, climb: 2, stamina: 2, technique: 2, teamwork: 2 },
  },
];

const supportCards = [
  { id: "coach", name: "冷静な監督", type: "作戦", bonus: { technique: 8, teamwork: 10 }, skill: "位置取り補正" },
  { id: "sprinter", name: "黄金の発射台", type: "速度", bonus: { sprint: 14, teamwork: 4 }, skill: "最終直線加速" },
  { id: "climber", name: "山岳王の助言", type: "登坂", bonus: { climb: 15, stamina: 3 }, skill: "峠アタック" },
  { id: "mechanic", name: "精密メカニック", type: "安定", bonus: { technique: 12, stamina: 5 }, skill: "落車回避" },
  { id: "domestique", name: "献身の牽引役", type: "連携", bonus: { teamwork: 15, stamina: 5 }, skill: "風よけ" },
  { id: "nutrition", name: "補給プランナー", type: "持久", bonus: { stamina: 14, climb: 4 }, skill: "終盤回復" },
];

const riders = [
  { id: "ace", name: "朝霧 レン", role: "エース", stats: { sprint: 8, climb: 8, stamina: 6, technique: 5, teamwork: 2 } },
  { id: "leadout", name: "真壁 ソウ", role: "リードアウト", stats: { sprint: 10, climb: 1, stamina: 4, technique: 6, teamwork: 8 } },
  { id: "climber", name: "七瀬 コウ", role: "クライマー", stats: { sprint: 2, climb: 12, stamina: 7, technique: 5, teamwork: 4 } },
  { id: "rouleur", name: "榊 ミナト", role: "ルーラー", stats: { sprint: 5, climb: 4, stamina: 10, technique: 6, teamwork: 7 } },
  { id: "captain", name: "風見 ハル", role: "キャプテン", stats: { sprint: 4, climb: 5, stamina: 7, technique: 8, teamwork: 11 } },
  { id: "sprinter", name: "黒須 リオ", role: "スプリンター", stats: { sprint: 13, climb: 0, stamina: 5, technique: 5, teamwork: 3 } },
];

const stages = [
  {
    id: "flat",
    name: "湾岸クリテリウム",
    tactic: "高速隊列",
    difficulty: 375,
    weights: { sprint: 1.35, climb: 0.35, stamina: 0.9, technique: 0.9, teamwork: 1.1 },
  },
  {
    id: "hill",
    name: "丘陵クラシック",
    tactic: "中盤アタック",
    difficulty: 410,
    weights: { sprint: 0.85, climb: 1.0, stamina: 1.0, technique: 1.05, teamwork: 0.9 },
  },
  {
    id: "mountain",
    name: "山岳クイーンステージ",
    tactic: "峠決戦",
    difficulty: 455,
    weights: { sprint: 0.35, climb: 1.55, stamina: 1.15, technique: 0.75, teamwork: 0.8 },
  },
  {
    id: "tour",
    name: "総合ステージレース",
    tactic: "総合管理",
    difficulty: 490,
    weights: { sprint: 0.9, climb: 1.05, stamina: 1.25, technique: 0.95, teamwork: 1.1 },
  },
];

const statLabels = {
  sprint: "瞬発力",
  climb: "登坂力",
  stamina: "持久力",
  technique: "技術",
  teamwork: "連携",
};

const state = {
  week: 1,
  stats: { ...baseStats },
  selectedSupports: ["coach", "domestique"],
  selectedTeam: ["ace", "leadout", "climber", "rouleur", "captain"],
  selectedStage: "flat",
  log: ["育成を開始。サポートデッキとチーム編成を調整してステージに挑め。"],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function getSupportBonus() {
  return state.selectedSupports.reduce((total, id) => {
    const card = supportCards.find((item) => item.id === id);
    Object.entries(card.bonus).forEach(([stat, value]) => {
      total[stat] = (total[stat] || 0) + value;
    });
    return total;
  }, {});
}

function getTeamBonus() {
  return state.selectedTeam.reduce((total, id) => {
    const rider = riders.find((item) => item.id === id);
    Object.entries(rider.stats).forEach(([stat, value]) => {
      total[stat] = (total[stat] || 0) + value;
    });
    return total;
  }, {});
}

function getFinalStats() {
  const support = getSupportBonus();
  const team = getTeamBonus();
  return Object.keys(baseStats).reduce((finalStats, stat) => {
    finalStats[stat] = clamp((state.stats[stat] || 0) + (support[stat] || 0) + (team[stat] || 0), 0, 160);
    return finalStats;
  }, {});
}

function getSelectedStage() {
  return stages.find((stage) => stage.id === state.selectedStage);
}

function calculatePower() {
  const finalStats = getFinalStats();
  const stage = getSelectedStage();
  return Math.round(
    Object.entries(stage.weights).reduce((sum, [stat, weight]) => sum + finalStats[stat] * weight, 0),
  );
}

function calculateWinRate() {
  const stage = getSelectedStage();
  const power = calculatePower();
  return clamp(Math.round(18 + ((power - stage.difficulty) / stage.difficulty) * 100), 5, 92);
}

function renderStats() {
  const statsNode = document.querySelector("#stats");
  const finalStats = getFinalStats();
  statsNode.innerHTML = Object.entries(finalStats)
    .map(([stat, value]) => {
      const width = clamp(Math.round((value / 160) * 100), 4, 100);
      return `
        <div class="stat-row">
          <span>${statLabels[stat]}</span>
          <div class="bar"><span style="width: ${width}%"></span></div>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");
}

function renderTraining() {
  const node = document.querySelector("#trainingCommands");
  node.innerHTML = trainingCommands
    .map(
      (command) => `
        <button class="choice-button" type="button" data-train="${command.id}">
          <strong>${command.label}</strong>
          <span>${command.detail}</span>
        </button>
      `,
    )
    .join("");
}

function renderSupportDeck() {
  const node = document.querySelector("#supportDeck");
  node.innerHTML = supportCards
    .map((card) => {
      const selected = state.selectedSupports.includes(card.id);
      return `
        <button class="card-button ${selected ? "selected" : ""}" type="button" data-support="${card.id}">
          <div class="card-meta"><strong>${card.name}</strong><span>${card.type}</span></div>
          <span>${card.skill}</span>
        </button>
      `;
    })
    .join("");
  document.querySelector("#deckCount").textContent = state.selectedSupports.length;
}

function renderTeamList() {
  const node = document.querySelector("#teamList");
  node.innerHTML = riders
    .map((rider) => {
      const selected = state.selectedTeam.includes(rider.id);
      return `
        <button class="card-button ${selected ? "selected" : ""}" type="button" data-rider="${rider.id}">
          <div class="card-meta"><strong>${rider.name}</strong><span>${rider.role}</span></div>
          <span>得意: ${getBestStat(rider.stats)}</span>
        </button>
      `;
    })
    .join("");
  document.querySelector("#teamCount").textContent = state.selectedTeam.length;
}

function getBestStat(stats) {
  const [stat] = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
  return statLabels[stat];
}

function renderStages() {
  const node = document.querySelector("#stageSelector");
  node.innerHTML = stages
    .map((stage) => {
      const selected = stage.id === state.selectedStage;
      return `
        <button class="card-button ${selected ? "selected" : ""}" type="button" data-stage="${stage.id}">
          <div class="card-meta"><strong>${stage.name}</strong><span>難度 ${stage.difficulty}</span></div>
          <span>${stage.tactic}</span>
        </button>
      `;
    })
    .join("");
}

function renderRaceSummary() {
  const stage = getSelectedStage();
  document.querySelector("#seasonWeek").textContent = `${state.week} / 12`;
  document.querySelector("#teamPower").textContent = calculatePower();
  document.querySelector("#winRate").textContent = `${calculateWinRate()}%`;
  document.querySelector("#tacticLabel").textContent = stage.tactic;
}

function renderLog() {
  const node = document.querySelector("#raceLog");
  node.innerHTML = state.log.map((item) => `<li>${item}</li>`).join("");
}

function renderCourse() {
  const canvas = document.querySelector("#courseCanvas");
  const ctx = canvas.getContext("2d");
  const stage = getSelectedStage();
  const width = canvas.width;
  const height = canvas.height;
  const profile = {
    flat: [0.62, 0.59, 0.61, 0.56, 0.6, 0.58, 0.55, 0.57],
    hill: [0.68, 0.52, 0.58, 0.35, 0.51, 0.4, 0.63, 0.52],
    mountain: [0.74, 0.66, 0.52, 0.42, 0.28, 0.2, 0.34, 0.48],
    tour: [0.66, 0.58, 0.47, 0.31, 0.54, 0.42, 0.36, 0.57],
  }[stage.id];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#172020";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let y = 34; y < height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(0, height * profile[0]);
  profile.forEach((point, index) => {
    const x = (width / (profile.length - 1)) * index;
    ctx.lineTo(x, height * point);
  });
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = "rgba(244, 200, 74, 0.18)";
  ctx.fill();

  ctx.beginPath();
  profile.forEach((point, index) => {
    const x = (width / (profile.length - 1)) * index;
    const y = height * point;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#f4c84a";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.fillStyle = "#eef3ef";
  ctx.font = "700 24px Segoe UI, sans-serif";
  ctx.fillText(stage.name, 24, 38);
}

function train(commandId) {
  const command = trainingCommands.find((item) => item.id === commandId);
  if (state.week >= 12) {
    state.log.unshift("育成期間は終了。今のチームでレースに挑め。");
    render();
    return;
  }
  Object.entries(command.effect).forEach(([stat, value]) => {
    state.stats[stat] = clamp(state.stats[stat] + value, 10, 120);
  });
  state.week += 1;
  state.log.unshift(`${command.label}を実行。${command.detail}。`);
  render();
}

function toggleSupport(id) {
  if (state.selectedSupports.includes(id)) {
    state.selectedSupports = state.selectedSupports.filter((item) => item !== id);
  } else if (state.selectedSupports.length < 4) {
    state.selectedSupports.push(id);
  } else {
    state.log.unshift("サポートデッキは4枚まで。別カードを外してから選択。");
  }
  render();
}

function toggleRider(id) {
  if (state.selectedTeam.includes(id)) {
    state.selectedTeam = state.selectedTeam.filter((item) => item !== id);
  } else if (state.selectedTeam.length < 5) {
    state.selectedTeam.push(id);
  } else {
    state.log.unshift("チームは5人まで。役割を入れ替えて編成する。");
  }
  render();
}

function runRace() {
  if (state.selectedTeam.length < 3) {
    state.log.unshift("最低3人のチームが必要。エースを守る隊列を組め。");
    render();
    return;
  }

  const stage = getSelectedStage();
  const power = calculatePower();
  const winRate = calculateWinRate();
  const roll = Math.floor(Math.random() * 100) + 1;
  const result = roll <= winRate ? "勝利" : "敗北";
  const margin = Math.abs(winRate - roll);
  const detail =
    result === "勝利"
      ? `${stage.tactic}が決まり、残り2kmで主導権を握った。`
      : `決定局面で脚を使い切り、${stage.tactic}が不発に終わった。`;

  state.log.unshift(`${stage.name}: ${result}。戦力${power} / 判定${roll} / 勝率${winRate}% / 差分${margin}。${detail}`);
  render();
}

function resetGame() {
  state.week = 1;
  state.stats = { ...baseStats };
  state.selectedSupports = ["coach", "domestique"];
  state.selectedTeam = ["ace", "leadout", "climber", "rouleur", "captain"];
  state.selectedStage = "flat";
  state.log = ["育成をリセット。初期デッキから再開。"];
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const trainButton = event.target.closest("[data-train]");
    const supportButton = event.target.closest("[data-support]");
    const riderButton = event.target.closest("[data-rider]");
    const stageButton = event.target.closest("[data-stage]");

    if (trainButton) train(trainButton.dataset.train);
    if (supportButton) toggleSupport(supportButton.dataset.support);
    if (riderButton) toggleRider(riderButton.dataset.rider);
    if (stageButton) {
      state.selectedStage = stageButton.dataset.stage;
      render();
    }
  });

  document.querySelector("#raceBtn").addEventListener("click", runRace);
  document.querySelector("#resetBtn").addEventListener("click", resetGame);
}

function render() {
  renderStats();
  renderTraining();
  renderSupportDeck();
  renderTeamList();
  renderStages();
  renderRaceSummary();
  renderLog();
  renderCourse();
}

bindEvents();
render();
