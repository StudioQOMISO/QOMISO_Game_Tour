import fs from "node:fs/promises";

const files = [
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
];

const outputPath = "outputs/google-sheets-riders-20260720/roles_3_cards_3.json";
let previousAssignments = new Map();
try {
  const previous = JSON.parse(await fs.readFile(outputPath, "utf8"));
  previousAssignments = new Map(previous.map((entry) => [entry.file + "\u0000" + entry.name, entry]));
} catch {}

const forcedLongSprintRiders = new Set([
  "Mathieu van der Poel",
  "Wout van Aert",
  "Remco Evenepoel",
]);

const cardOnlyTraits = new Set([
  "超ロングスパート",
  "ブリッジャー",
  "カウンターアタッカー",
  "横風分断",
  "無賃乗車",
]);

const cardNames = {
  総合エース: "タイム差管理",
  スプリントエース: "ファイナルスプリント",
  丘陵エース: "激坂アタック",
  山岳エース: "山頂アタック",
  サブエース: "プランB",
  ロードキャプテン: "隊列再編",
  "スーパー・ドメスティーク": "全力献身",
  ステージハンター: "勝負日の逃げ",
  山岳賞ハンター: "山頂ポイント奪取",
  TTスペシャリスト: "エアロ巡航",
  リードアウト: "高速リードアウト",
  最終発射台: "最終発射",
  スプリントトレイン: "トレイン加速",
  平坦アシスト: "平坦牽引",
  平坦ペースメーカー: "ハイペース維持",
  山岳アシスト: "山岳牽引",
  山岳番手: "最後の山岳牽引",
  山岳ペースメーカー: "山岳ペースアップ",
  TT牽引: "エアロ牽引",
  石畳護衛: "パヴェ護衛",
  下り牽引: "ダウンヒル牽引",
  集団コントローラー: "逃げ差調整",
  ブレイクアウェイキラー: "逃げ吸収",
  横風要員: "横風ガード",
  トラブル復帰牽引: "集団復帰",
  逃げ屋: "逃げに乗る",
  超ロングスパート: "超ロングスパート",
  ブリッジャー: "ブリッジアタック",
  カウンターアタッカー: "カウンターアタック",
  サテライトライダー: "サテライト合流",
  横風分断: "横風分断",
  無賃乗車: "無賃乗車",
  ポジションキーパー: "前方位置キープ",
};

const archetypeFallbacks = {
  総合型: ["集団コントローラー", "山岳番手", "TTスペシャリスト"],
  スプリンター: ["リードアウト", "最終発射台", "スプリントトレイン"],
  パンチャー: ["ステージハンター", "逃げ屋", "ポジションキーパー"],
  クラシック型: ["石畳護衛", "横風要員", "ステージハンター"],
  クライマー: ["山岳賞ハンター", "山岳アシスト", "山岳番手"],
  "TT・ルーラー型": ["TTスペシャリスト", "TT牽引", "平坦ペースメーカー"],
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
  return { headers, rows: raw.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]))) };
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const serializeCsv = (headers, rows) =>
  [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n") + "\n";

const unique = (values) => [...new Set(values.filter(Boolean))];
const isLeader = (role) => role.endsWith("エース") && role !== "サブエース";

const result = [];
for (const file of files) {
  const parsed = parseCsv(await fs.readFile(file, "utf8"));
  let moved = 0;
  let backfilled = 0;
  for (const rider of parsed.rows) {
    const originalRoles = rider.preferred_roles.split(" / ").map((role) => role.trim()).filter(Boolean);
    const movedTraits = originalRoles.filter((role) => cardOnlyTraits.has(role));
    moved += movedTraits.length;

    const stableRoles = originalRoles.filter((role) => !cardOnlyTraits.has(role));
    const roles = unique(stableRoles.slice(0, 3));
    const fallbackPool = unique([
      ...(archetypeFallbacks[rider.primary_archetype] ?? []),
      ...(archetypeFallbacks[rider.secondary_archetype] ?? []),
      "ロードキャプテン", "平坦アシスト", "集団コントローラー",
    ]);
    for (const fallback of fallbackPool) {
      if (roles.length >= 3) break;
      if (!roles.includes(fallback)) { roles.push(fallback); backfilled += 1; }
    }
    if (roles.length !== 3) throw new Error(`${rider.name}: role count ${roles.length}`);

    const droppedStableRoles = stableRoles.slice(3);
    const previous = previousAssignments.get(file + "\u0000" + rider.name);
    const previousNormalCards = previous?.cards?.slice(0, 2) ?? [];
    const directCards = unique([
      ...(forcedLongSprintRiders.has(rider.name) ? ["超ロングスパート"] : []),
      ...previousNormalCards,
    ]);
    const actionSources = unique([
      ...movedTraits,
      ...droppedStableRoles,
      ...roles.filter((role) => !isLeader(role)),
      ...roles,
    ]);
    const normalCards = unique([...directCards, ...actionSources.map((role) => cardNames[role] ?? role)]).slice(0, 2);
    if (normalCards.length !== 2) throw new Error(`${rider.name}: normal card count ${normalCards.length}`);

    const specialCard = rider.rider_title || `${rider.name}の${rider.primary_archetype === "スプリンター" ? "最終決戦" : rider.primary_archetype === "クライマー" ? "頂上決戦" : "総合決戦"}`;
    rider.preferred_roles = roles.join(" / ");
    result.push({ file, no: rider.no, name: rider.name, roles, cards: [...normalCards, specialCard] });
  }
  await fs.writeFile(file, serializeCsv(parsed.headers, parsed.rows), "utf8");
  console.log(JSON.stringify({ file, riders: parsed.rows.length, movedCardTraits: moved, backfilledRoles: backfilled }));
}

await fs.mkdir("outputs/google-sheets-riders-20260720", { recursive: true });
await fs.writeFile(
  outputPath,
  JSON.stringify(result, null, 2) + "\n",
  "utf8",
);
