import fs from "node:fs/promises";

const rosterPath = "選手スプレッドシート/01_現役選手300名.csv";
const aceCardPath = "data/ace_signature_cards.json";
const outputPath = "data/elite_assist_cards.json";
const roleDefinitionPath = "data/rider_role_definitions.json";
const roleTemplateOutputPath = "data/assist_card_role_templates.json";

const assistRoleCards = {
  "サブエース": ["プランB", 2],
  "ロードキャプテン": ["隊列再編", 2],
  "スーパー・ドメスティーク": ["全力献身", 3],
  "リードアウト": ["高速リードアウト", 2],
  "最終発射台": ["最終発射", 3],
  "スプリントトレイン": ["トレイン加速", 2],
  "平坦アシスト": ["平坦牽引", 1],
  "平坦ペースメーカー": ["ハイペース維持", 2],
  "山岳アシスト": ["山岳牽引", 1],
  "山岳番手": ["最後の山岳牽引", 2],
  "山岳ペースメーカー": ["山岳ペースアップ", 2],
  "TT牽引": ["エアロ牽引", 1],
  "石畳護衛": ["パヴェ護衛", 1],
  "下り牽引": ["ダウンヒル牽引", 2],
  "集団コントローラー": ["逃げ差調整", 1],
  "ブレイクアウェイキラー": ["逃げ吸収", 2],
  "横風要員": ["横風ガード", 1],
  "トラブル復帰牽引": ["集団復帰", 2],
  "サテライトライダー": ["サテライト合流", 2],
  "ポジションキーパー": ["前方位置キープ", 1],
};

const card = (slot, name, description, target = "味方エース") => ({
  slot,
  cost: slot === "basic" ? 1 : slot === "specialty" ? 2 : 3,
  usageLimit: slot === "decisive" ? 1 : null,
  name,
  description,
  target,
});

const packages = {
  "Tadej Pogacar": [
    card("basic", "山岳番手", "登りで味方エースの直後を走り、相手の攻撃へ反応できる位置を維持する。"),
    card("specialty", "サテライト合流", "先行グループから戻って味方エースと合流し、登りの攻撃を補助する。"),
  ],
  "Wout van Aert": [
    card("basic", "石畳護衛", "悪路で味方エースを前方へ導き、分断と落車の危険を軽減する。"),
    card("specialty", "万能アシスト", "地形に応じて牽引、追走、位置上げのうち最も必要な支援を行う。"),
  ],
  "Mads Pedersen (cyclist)": [
    card("basic", "平坦牽引", "平坦で隊列を引き、味方エースの体力消費を抑える。"),
    card("specialty", "スプリントトレイン", "高速隊列を作り、スプリントエースを前方へ運ぶ。"),
    card("decisive", "耐久リードアウト", "長い距離を全開で牽引し、味方エースを最終発射位置へ届ける。"),
  ],
  "Florian Sénéchal": [
    card("basic", "前方確保", "集団前方に安全な進路を作り、味方エースの位置を上げる。"),
    card("specialty", "石畳ペース", "悪路で安定した速度を維持し、隊列の分断を防ぐ。"),
    card("decisive", "クラシック牽引", "終盤の悪路を全開で引き、味方エースへ攻撃機会を作る。"),
  ],
  "Victor Campenaerts": [
    card("basic", "エアロ牽引", "空気抵抗を抑えた牽引で、味方エースの体力を温存する。"),
    card("specialty", "逃げ吸収", "高い巡航力で逃げ集団とのタイム差を大きく縮める。"),
    card("decisive", "全開ブリッジ", "自分の体力を使い切る高速走で、味方エースを前方集団へ合流させる。"),
  ],
  "Stefan Bissegger": [
    card("basic", "横風ガード", "横風側へ入り、味方エースの風による消耗を軽減する。"),
    card("specialty", "TT牽引", "一定の高出力で隊列を引き、集団速度を引き上げる。"),
    card("decisive", "横風エンジン", "横風区間で全開牽引し、味方を前方集団へ残したまま集団を分断する。"),
  ],
  "Sepp Kuss": [
    card("basic", "山岳ガード", "登りで味方エースの風よけとなり、体力消費を軽減する。"),
    card("specialty", "最後の山岳牽引", "山岳終盤まで高いペースを維持し、味方エースを攻撃位置へ運ぶ。"),
    card("decisive", "山岳献身", "自分の残り体力を使い切り、味方エースの山岳攻撃を最大限に強化する。"),
  ],
  "Amaury Capiot": [
    card("basic", "位置案内", "混雑した集団内で安全な進路を選び、味方エースを前方へ導く。"),
    card("specialty", "平坦追走", "平坦区間で先行グループとの差を縮める。"),
    card("decisive", "集団復帰牽引", "遅れた味方エースを全力でメイングループへ復帰させる。"),
  ],
  "Ben Turner (cyclist)": [
    card("basic", "平坦牽引", "平坦で隊列を引き、味方エースの体力消費を抑える。"),
    card("specialty", "逃げ差調整", "危険な逃げだけを追い、不要な消耗を避けながら差を管理する。"),
    card("decisive", "高速追走", "終盤に全開牽引し、逃げ集団を勝負圏内まで引き戻す。"),
  ],
  "Ethan Hayter": [
    card("basic", "エアロ牽引", "空気抵抗を抑えた牽引で、味方エースの体力を温存する。"),
    card("specialty", "ペースアップ", "平坦区間の速度を段階的に上げ、後方の選手を消耗させる。"),
    card("decisive", "高速発射", "高速巡航から一段加速し、味方エースをスプリント位置へ送り出す。"),
  ],
  "Johan Price-Pejtersen": [
    card("basic", "TT牽引", "一定出力で隊列を引き、味方全体の体力消費を抑える。"),
    card("specialty", "集団制御", "逃げとのタイム差を一定に保ち、勝負所まで展開を安定させる。"),
    card("decisive", "長距離追走", "長時間の全開巡航で、前方集団との大きな差を縮める。"),
  ],
  "Tobias Foss": [
    card("basic", "隊列指示", "味方の並びを整え、次に使うアシストカードの効果を高める。"),
    card("specialty", "クロノ牽引", "正確なペースで隊列を引き、味方エースを安全に運ぶ。"),
    card("decisive", "クロノ王の隊列再編", "崩れた隊列を立て直し、味方全員を勝負位置へ戻す。"),
  ],
  "Bob Jungels": [
    card("basic", "ロード指揮", "集団状況を読み、味方エースが動くべき位置を確保する。"),
    card("specialty", "平坦ペースメーカー", "長い平坦区間を高い一定速度で牽引する。"),
    card("decisive", "逃げ完全吸収", "チームをまとめて追走させ、危険な逃げを一気に吸収する。"),
  ],
  "Dylan van Baarle": [
    card("basic", "パヴェ護衛", "石畳で味方エースの進路を確保し、悪路消耗を軽減する。"),
    card("specialty", "ブレイク潰し", "悪路で先行した危険な選手を追走し、攻撃を無効化する。"),
    card("decisive", "石畳の追撃", "石畳区間を全開で追走し、味方エースを先頭グループへ運ぶ。"),
  ],
  "Edoardo Affini": [
    card("basic", "隊列指示", "味方の並びを整え、牽引交代を安定させる。"),
    card("specialty", "高速牽引", "平坦で高い速度を維持し、味方エースの体力を温存する。"),
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
const missing = elite.filter((row) => !packages[row.name]).map((row) => row.name);
if (elite.length !== 15 || missing.length) throw new Error("elite assist mapping mismatch: " + missing.join(" / "));

const output = elite.map((row) => {
  const primaryAce = /(?:総合|スプリント|丘陵|山岳)エース/.test(row.preferred_roles);
  const cards = packages[row.name];
  const expectedCount = primaryAce ? 2 : 3;
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
if (totalCards !== 43) throw new Error("elite assist card total mismatch: " + totalCards);
await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ eliteAssistRiders: output.length, primaryAces: output.filter((entry) => entry.primaryAce).length, assistCards: totalCards, outputPath }, null, 2));

const roleDefinitions = JSON.parse(await fs.readFile(roleDefinitionPath, "utf8"));
const roleByName = new Map(roleDefinitions.map((entry) => [entry.name, entry]));
const roleTemplates = Object.entries(assistRoleCards).map(([role, [name, cost]]) => {
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
if (roleTemplates.length !== 20) throw new Error("assist role template count mismatch: " + roleTemplates.length);
await fs.writeFile(roleTemplateOutputPath, JSON.stringify(roleTemplates, null, 2) + "\n", "utf8");
