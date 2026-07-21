import fs from "node:fs/promises";

const rosterPath = "選手スプレッドシート/01_現役選手300名.csv";
const aceCardPath = "data/ace_signature_cards.json";
const outputPath = "data/elite_assist_cards.json";
const roleDefinitionPath = "data/rider_role_definitions.json";
const roleTemplateOutputPath = "data/assist_card_role_templates.json";
const basicTemplateOutputPath = "data/basic_card_templates.json";
const specialtyTemplateOutputPath = "data/specialty_card_templates.json";
const genericDecisiveOutputPath = "data/generic_decisive_card_templates.json";

const assistRoleCards = {
  "サブエース": ["プランB", 2],
  "ロードキャプテン": ["隊列再編", 2],

  "リードアウト": ["高速リードアウト", 2],

  "スプリントトレイン": ["トレイン加速", 2],
  "平坦ペースメーカー": ["ハイペース維持", 2],
  "山岳番手": ["最後の山岳牽引", 2],
  "山岳ペースメーカー": ["山岳ペースアップ", 2],
  "下り牽引": ["ダウンヒル牽引", 2],
  "ブレイクアウェイキラー": ["逃げ吸収", 2],
  "トラブル復帰牽引": ["集団復帰", 2],
  "サテライトライダー": ["サテライト合流", 2],
};

const breakawaySpecialtyCards = [
  { suffix: "join", name: "逃げ参加", description: "序盤の逃げ形成時、逃げ集団へ入る成功率を上げる。", target: "本人" },
  { suffix: "bridge", name: "ブリッジ", description: "メイン集団から加速し、すでに形成された逃げ集団へ合流する。", target: "本人" },
  { suffix: "rotation", slot: "basic", cost: 1, name: "先頭交代", description: "逃げ集団の先頭を長く引き、本人の体力を使ってタイム差を広げる。", target: "逃げ集団" },
  { suffix: "control", slot: "basic", cost: 1, name: "ペース調整", description: "余計な体力消費を抑えながら、逃げ集団の速度とタイム差を維持する。", target: "逃げ集団" },
  { suffix: "selection", name: "逃げ選別", description: "起伏や横風でペースを上げ、逃げ集団の人数を絞り込む。", target: "逃げ集団" },
  { suffix: "survival", name: "逃げ粘り", description: "吸収されそうな場面で再加速し、逃げ集団の生存時間を延ばす。", target: "本人" },
];

const downhillSpecialtyCards = [
  { suffix: "cornering", slot: "basic", cost: 1, name: "高速コーナリング", description: "コーナーでの速度低下と落車リスクを抑える。", target: "本人" },
  { suffix: "acceleration", name: "下り加速", description: "下りの直線で速度を上げ、前方集団との差を縮める。", target: "本人" },
  { suffix: "attack", name: "下りアタック", description: "テクニカルな下りで仕掛け、後続とのタイム差を作る。", target: "本人" },
  { suffix: "safety", slot: "basic", cost: 1, name: "安全誘導", description: "安全な走行ラインを示し、味方エースの落車リスクを下げる。", target: "味方エース" },
  { suffix: "return", name: "下り復帰", description: "下りで遅れた味方を牽引し、プロトンや前方集団へ復帰させる。", target: "味方エース" },
];

const card = (slot, name, description, target = "味方エース") => ({
  slot,
  cost: slot === "basic" ? 1 : slot === "specialty" ? 2 : 3,
  usageLimit: slot === "decisive" ? 1 : null,
  name,
  description,
  target,
});

const decisivePackages = {
  "Tadej Pogacar": [
  ],
  "Wout van Aert": [
  ],
  "Mads Pedersen": [
  ],
  "Florian Sénéchal": [
    card("decisive", "クラシック牽引", "終盤の悪路を全開で引き、味方エースへ攻撃機会を作る。"),
  ],
  "Victor Campenaerts": [
    card("decisive", "全開ブリッジ", "自分の体力を使い切る高速走で、味方エースを前方集団へ合流させる。"),
  ],
  "Stefan Bissegger": [
    card("decisive", "横風エンジン", "横風区間で全開牽引し、味方を前方集団へ残したまま集団を分断する。"),
  ],
  "Sepp Kuss": [
    card("decisive", "山岳献身", "自分の残り体力を使い切り、味方エースの山岳攻撃を最大限に強化する。"),
  ],
  "Amaury Capiot": [
    card("decisive", "集団復帰牽引", "遅れた味方エースを全力でメイングループへ復帰させる。"),
  ],
  "Ben Turner": [
    card("decisive", "高速追走", "終盤に全開牽引し、逃げ集団を勝負圏内まで引き戻す。"),
  ],
  "Ethan Hayter": [
    card("decisive", "高速発射", "高速巡航から一段加速し、味方エースをスプリント位置へ送り出す。"),
  ],
  "Johan Price-Pejtersen": [
    card("decisive", "長距離追走", "長時間の全開巡航で、前方集団との大きな差を縮める。"),
  ],
  "Tobias Foss": [
    card("decisive", "クロノ王の隊列再編", "崩れた隊列を立て直し、味方全員を勝負位置へ戻す。"),
  ],
  "Bob Jungels": [
    card("decisive", "逃げ完全吸収", "チームをまとめて追走させ、危険な逃げを一気に吸収する。"),
  ],
  "Dylan van Baarle": [
    card("decisive", "石畳の追撃", "石畳区間を全開で追走し、味方エースを先頭グループへ運ぶ。"),
  ],
  "Edoardo Affini": [
    card("decisive", "高速再編", "散らばった味方を集め直し、高速隊列を即座に再構築する。"),
  ],
};

function parseCsv(text) {
  const raw = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) raw.push(row);
      row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); raw.push(row); }
  const headers = raw.shift();
  return raw.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""])));
}

const riders = parseCsv(await fs.readFile(rosterPath, "utf8"));
const aceCards = JSON.parse(await fs.readFile(aceCardPath, "utf8"));
const aceCardByRider = new Map(aceCards.map((entry) => [entry.riderName, entry.name]));
const elite = riders.filter((row) => Number(row.support_aptitude) >= 80);
const missing = elite.filter((row) => !decisivePackages[row.name]).map((row) => row.name);
if (elite.length !== 15 || missing.length) throw new Error("elite assist mapping mismatch: " + missing.join(" / "));

const output = elite.map((row) => {
  const primaryAce = /(?:総合|スプリント|丘陵|山岳)エース/.test(row.preferred_roles);
  const cards = decisivePackages[row.name];
  const expectedCount = primaryAce ? 0 : 1;
  if (cards.length !== expectedCount) throw new Error(row.name + ": card count " + cards.length);
  if (!primaryAce && !cards.some((entry) => entry.slot === "decisive")) throw new Error(row.name + ": missing assist decisive");
  return {
    riderNo: Number(row.no),
    riderName: row.name,
    supportAptitude: Number(row.support_aptitude),
    primaryAce,
    guaranteedAssistCards: cards.length,
    linkedAceDecisiveCard: primaryAce ? aceCardByRider.get(row.name) : null,
    cards,
    basedOn: [row.preferred_roles, row.aptitude_tags],
  };
});

const totalCards = output.reduce((sum, entry) => sum + entry.cards.length, 0);
if (totalCards !== 12) throw new Error("elite assist card total mismatch: " + totalCards);
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ eliteAssistRiders: output.length, primaryAces: output.filter((entry) => entry.primaryAce).length, assistCards: totalCards, outputPath }, null, 2));

const roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));
const roleByName = new Map(roleDefinitions.map((entry) => [entry.name, entry]));
const baseRoleTemplates = Object.entries(assistRoleCards).map(([role, [name, cost]]) => {
  const definition = roleByName.get(role);
  if (!definition) throw new Error("missing assist role definition: " + role);
  return {
    roleId: definition.id,
    role,
    slot: cost === 1 ? "basic" : cost === 2 ? "specialty" : "decisive",
    cost,
    name,
    description: definition.gameEffect,
    target: role === "ロードキャプテン" || role === "スプリントトレイン" ? "味方チーム" : "味方エース",
    abilities: definition.abilities,
  };
});
const breakawayDefinition = roleByName.get("逃げ屋");
if (!breakawayDefinition) throw new Error("missing assist role definition: 逃げ屋");
const breakawayTemplates = breakawaySpecialtyCards.map((entry) => ({
  roleId: breakawayDefinition.id + "_" + entry.suffix,
  role: breakawayDefinition.name,
  slot: entry.slot || "specialty",
  cost: entry.cost || 2,
  name: entry.name,
  description: entry.description,
  target: entry.target,
  abilities: breakawayDefinition.abilities,
}));
const downhillDefinition = roleByName.get("下り牽引");
if (!downhillDefinition) throw new Error("missing assist role definition: 下り牽引");
const downhillTemplates = downhillSpecialtyCards.map((entry) => ({
  roleId: downhillDefinition.id + "_" + entry.suffix,
  role: downhillDefinition.name,
  slot: entry.slot || "specialty",
  cost: entry.cost || 2,
  name: entry.name,
  description: entry.description,
  target: entry.target,
  abilities: downhillDefinition.abilities,
}));
const roleTemplates = [...baseRoleTemplates, ...breakawayTemplates, ...downhillTemplates];
const roleBasicTemplates = roleTemplates.filter((entry) => entry.slot === "basic");
const roleSpecialtyTemplates = roleTemplates.filter((entry) => entry.slot === "specialty");
if (roleTemplates.length !== 22 || breakawayTemplates.length !== 6 || downhillTemplates.length !== 5 || roleBasicTemplates.length !== 4 || roleSpecialtyTemplates.length !== 18 || roleTemplates.some((entry) => entry.slot === "decisive")) {
  throw new Error("assist role template count mismatch: " + roleTemplates.length);
}
await fs.writeFile(roleTemplateOutputPath, JSON.stringify(roleTemplates, null, 2) + "\n", "utf8");

const basicCardTemplates = JSON.parse(await fs.readFile(basicTemplateOutputPath, "utf8"));
const basicNames = new Set(basicCardTemplates.map((entry) => entry.name));
const basicGroups = new Map();
for (const entry of basicCardTemplates) {
  const key = entry.terrainId + ":" + entry.roleType;
  basicGroups.set(key, (basicGroups.get(key) || 0) + 1);
  if (entry.slot !== "basic" || entry.cost !== 1) throw new Error("invalid basic card: " + entry.id);
}
if (basicCardTemplates.length !== 24 || basicNames.size !== 24 || basicGroups.size !== 8 || [...basicGroups.values()].some((count) => count !== 3)) {
  throw new Error("basic card template matrix mismatch");
}
const specialtyCardTemplates = JSON.parse(await fs.readFile(specialtyTemplateOutputPath, "utf8"));
const specialtyNames = new Set(specialtyCardTemplates.map((entry) => entry.name));
const specialtyGroups = new Map();
for (const entry of specialtyCardTemplates) {
  const key = entry.terrainId + ":" + entry.roleType;
  specialtyGroups.set(key, (specialtyGroups.get(key) || 0) + 1);
  if (entry.slot !== "specialty" || entry.cost !== 2) throw new Error("invalid specialty card: " + entry.id);
}
const specialtyAceGroups = [...specialtyGroups].filter(([key]) => key.endsWith(":ace"));
const specialtyAssistGroups = [...specialtyGroups].filter(([key]) => key.endsWith(":assist"));
if (specialtyCardTemplates.length !== 24 || specialtyNames.size !== 24 || specialtyGroups.size !== 8 || specialtyAceGroups.some(([, count]) => count !== 2) || specialtyAssistGroups.some(([, count]) => count !== 4)) {
  throw new Error("specialty card template matrix mismatch");
}
const genericDecisiveCards = JSON.parse(await fs.readFile(genericDecisiveOutputPath, "utf8"));
const genericNames = new Set(genericDecisiveCards.map((entry) => entry.name));
const genericAceCount = genericDecisiveCards.filter((entry) => entry.roleType === "ace").length;
const genericAssistCount = genericDecisiveCards.filter((entry) => entry.roleType === "assist").length;
if (
  genericDecisiveCards.length !== 24 ||
  genericNames.size !== 24 ||
  genericAceCount !== 12 ||
  genericAssistCount !== 12 ||
  genericDecisiveCards.some((entry) => entry.slot !== "decisive" || entry.cost !== 3 || entry.usageLimit !== 1)
) {
  throw new Error("generic decisive card template mismatch");
}

console.log(JSON.stringify({
  roleTemplates: roleTemplates.length,
  basicCardTemplates: basicCardTemplates.length,
  basicGroups: Object.fromEntries(basicGroups),
  specialtyCardTemplates: specialtyCardTemplates.length,
  specialtyGroups: Object.fromEntries(specialtyGroups),
  genericDecisiveCards: genericDecisiveCards.length,
  genericAceCount,
  genericAssistCount,
}, null, 2));
