const baseStats = {
  sprint: 48,
  climb: 45,
  stamina: 52,
  technique: 44,
  teamwork: 46,
  ego: 42,
  fighting: 50,
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
    detail: "スタミナ +9 / チームワーク +2",
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
    detail: "チームワーク +8 / 技術 +2",
    effect: { teamwork: 8, technique: 2 },
  },
  {
    id: "ego",
    label: "単独アタック練習",
    detail: "エゴ +8 / チームワーク -2",
    effect: { ego: 8, teamwork: -2 },
  },
  {
    id: "fighting",
    label: "逆境シミュレーション",
    detail: "負けん気 +8 / スタミナ +1",
    effect: { fighting: 8, stamina: 1 },
  },
  {
    id: "rest",
    label: "回復走",
    detail: "全能力 +2 / 育成週 +1",
    effect: { sprint: 2, climb: 2, stamina: 2, technique: 2, teamwork: 2, ego: 2, fighting: 2 },
  },
];

const supportCards = [
  { id: "coach", name: "冷静な監督", type: "作戦", bonus: { technique: 8, teamwork: 10, ego: -2 }, skill: "位置取り補正" },
  { id: "sprinter", name: "黄金の発射台", type: "速度", bonus: { sprint: 14, teamwork: 4 }, skill: "最終直線加速" },
  { id: "climber", name: "山岳王の助言", type: "登坂", bonus: { climb: 15, stamina: 3, fighting: 4 }, skill: "峠アタック" },
  { id: "mechanic", name: "精密メカニック", type: "安定", bonus: { technique: 12, stamina: 5 }, skill: "落車回避" },
  { id: "domestique", name: "献身の牽引役", type: "連携", bonus: { teamwork: 15, stamina: 5 }, skill: "風よけ" },
  { id: "nutrition", name: "補給プランナー", type: "持久", bonus: { stamina: 14, climb: 4 }, skill: "終盤回復" },
  { id: "rival", name: "宿敵の存在", type: "精神", bonus: { ego: 12, fighting: 10 }, skill: "闘争本能" },
];

const equipmentCatalog = {
  frames: [
    { id: "aero_italia", name: "Veloce Aero X", motif: "イタリアン・エアロフレーム系", bonus: { sprint: 6, technique: 3 }, fit: "平坦/TT" },
    { id: "climb_classic", name: "Corsa Leggera", motif: "伝統系軽量クライミングフレーム", bonus: { climb: 7, stamina: 2 }, fit: "山岳" },
    { id: "allround_race", name: "Universal Race Pro", motif: "万能レーシングフレーム系", bonus: { sprint: 3, climb: 3, technique: 3 }, fit: "総合" },
  ],
  wheels: [
    { id: "deep_aero", name: "Nordwind Deep 60", motif: "ディープリム高速巡航系", bonus: { sprint: 5, stamina: 2 }, fit: "平坦/横風注意" },
    { id: "light_climb", name: "Alto Light 32", motif: "軽量山岳ホイール系", bonus: { climb: 5, technique: 2 }, fit: "山岳" },
    { id: "pave_guard", name: "Pave Shield Wheel", motif: "石畳耐久ホイール系", bonus: { technique: 5, fighting: 3 }, fit: "石畳" },
  ],
  tires: [
    { id: "race_slick", name: "Corsa Slick", motif: "高速ロードタイヤ系", bonus: { sprint: 3, stamina: 2 }, fit: "平坦" },
    { id: "gravel_guard", name: "GravelGuard 40", motif: "グラベル対応タイヤ系", bonus: { technique: 4, fighting: 3 }, fit: "グラベル" },
    { id: "pave_endure", name: "Pave Endure", motif: "石畳耐パンクタイヤ系", bonus: { technique: 4, teamwork: 2 }, fit: "石畳" },
  ],
};

const wearDesign = {
  baseColor: "サフランイエロー",
  accentColor: "ディープティール",
  pattern: "斜めスピードライン",
  sponsorStyle: "架空スポンサー風ロゴ",
  performanceNote: "基本は見た目カスタム。TTスーツや雨具のみ軽い条件ボーナス候補。",
};

const monetizationPlan = [
  {
    id: "soft_gacha",
    name: "緩い選手スカウト",
    share: "35%",
    target: "選手候補 / サポート / 若手 / スタッフ",
    policy: "最高レアは個性と初期才能で差を出し、必須性能にはしない。100連天井と毎週無料配布を前提にする。",
  },
  {
    id: "season_pass",
    name: "シーズンパス",
    share: "40%",
    target: "年間報酬 / 育成素材 / 称号",
    policy: "1年シーズン進行に合わせた主収益。強さより育成効率と継続報酬を中心にする。",
  },
  {
    id: "cosmetic",
    name: "見た目課金",
    share: "15%",
    target: "ウェア / バイクカラー / UIテーマ / チームバス",
    policy: "レース性能を売らず、チーム表現と所有感を売る。ロードレースらしいスポンサー風デザインと相性が良い。",
  },
  {
    id: "expansion",
    name: "レース拡張パック",
    share: "10%",
    target: "架空グランツール / 北方クラシック / 山岳王パック",
    policy: "買い切り型の追加コースとシナリオ。歴史的チーム風イベントや新ルールを入れる。",
  },
];

const gachaRules = [
  "排出確率を購入前に明示する",
  "同名選手の重複は汎用契約ポイントへ変換する",
  "凸前提・期間限定人権・機材性能ガチャは避ける",
  "R/N選手も脚質、性格、チーム相性、育成で役割を持てるようにする",
];
const riders = [
  { id: "ace", name: "朝霧 レン", archetype: "パンチャー", stats: { sprint: 8, climb: 8, stamina: 6, technique: 5, teamwork: 2, ego: 8, fighting: 7 } },
  { id: "leadout", name: "真壁 ソウ", archetype: "リードアウト", stats: { sprint: 10, climb: 1, stamina: 4, technique: 6, teamwork: 8, ego: 2, fighting: 5 } },
  { id: "climber", name: "七瀬 コウ", archetype: "クライマー", stats: { sprint: 2, climb: 12, stamina: 7, technique: 5, teamwork: 4, ego: 7, fighting: 9 } },
  { id: "rouleur", name: "榊 ミナト", archetype: "ルーラー", stats: { sprint: 5, climb: 4, stamina: 10, technique: 6, teamwork: 7, ego: 3, fighting: 6 } },
  { id: "captain", name: "風見 ハル", archetype: "ロードキャプテン", stats: { sprint: 4, climb: 5, stamina: 7, technique: 8, teamwork: 11, ego: 1, fighting: 7 } },
  { id: "sprinter", name: "黒須 リオ", archetype: "スプリンター", stats: { sprint: 13, climb: 0, stamina: 5, technique: 5, teamwork: 3, ego: 9, fighting: 6 } },
];

const worldTeams = [
  { id: "desert_crown", name: "デザートクラウン・エミレーツ", era: "現代", motif: "中東資本の総合最強チーム系", country: "UAE", identity: "グランツール総合", style: "総合エースを山岳列車で守り、最後は個の爆発力で決める。" },
  { id: "yellow_hive", name: "イエロー・ハイヴ", era: "現代", motif: "緻密なオランダ系総合チーム", country: "Netherlands", identity: "戦術とTT", style: "TT、山岳、補給、隊列管理まで計算で支配する。" },
  { id: "red_bull", name: "レッドブル・ベルクシュタイン", era: "現代", motif: "ドイツ/オーストリア系大型強化チーム", country: "Germany", identity: "山岳と爆発力", style: "大型補強で総合とクラシックを同時に狙う。" },
  { id: "wolf_pack", name: "ウルフパック・ブルー", era: "現代", motif: "ベルギーの勝負強いクラシック軍団", country: "Belgium", identity: "クラシック", style: "石畳、横風、短い登りで人数を削って勝つ。" },
  { id: "lion_classic", name: "ライオン・クラシック", era: "現代", motif: "ベルギー/オランダ系スプリントクラシック", country: "Belgium", identity: "スプリントと石畳", style: "リードアウトと位置取りでワンデーを取り切る。" },
  { id: "trek_red", name: "トレイルレッド・レーシング", era: "現代", motif: "米国系総合スポーツブランドチーム", country: "USA", identity: "万能編成", style: "若手とレジェンドを混ぜ、全レースで点を拾う。" },
  { id: "grenadier", name: "グレナディア・ブラック", era: "近代", motif: "英国の科学的グランツール王朝", country: "United Kingdom", identity: "山岳列車", style: "高出力の隊列で山岳を制圧する。" },
  { id: "telefonica", name: "テレフォニカ・アスール", era: "現代", motif: "スペインの長寿名門チーム", country: "Spain", identity: "山岳と経験", style: "ベテランの読みと山岳力で総合上位を狙う。" },
  { id: "french_rooster", name: "トリコロール・ルースター", era: "現代", motif: "フランス育成名門", country: "France", identity: "育成と逃げ", style: "若手を育て、逃げと山岳賞で存在感を出す。" },
  { id: "agri_mondiale", name: "アグリ・モンディアル", era: "現代", motif: "フランスの堅実な総合/ステージチーム", country: "France", identity: "堅実な総合力", style: "ステージレースで崩れず、チーム総合も強い。" },
  { id: "education_pink", name: "エデュケーション・ピンク", era: "現代", motif: "米国系自由派チーム", country: "USA", identity: "逃げと個性", style: "奇襲、逃げ、個性的なエースで流れを壊す。" },
  { id: "bahrain_pearl", name: "バーレーン・パール", era: "現代", motif: "湾岸系ステージハンター", country: "Bahrain", identity: "山岳ステージ", style: "山岳と中級山岳でステージ勝利を狙う。" },
  { id: "kangaroo_green", name: "カンガルー・グリーン", era: "現代", motif: "オーストラリア系ワールドチーム", country: "Australia", identity: "スプリントと逃げ", style: "スプリント、逃げ、TTを柔軟に切り替える。" },
  { id: "nordic_flame", name: "ノルディック・フレイム", era: "現代", motif: "北欧新興チーム", country: "Norway", identity: "若手と登坂", style: "育成力と粘りでトップカテゴリに食い込む。" },
  { id: "kazakh_steppe", name: "ステップ・ブルー", era: "現代", motif: "カザフ系長寿チーム", country: "Kazakhstan", identity: "逃げと耐久", style: "厳しい展開でも粘って逃げ切りを狙う。" },
  { id: "sun_post", name: "サンポスト・オレンジ", era: "現代", motif: "オランダ系育成/スプリントチーム", country: "Netherlands", identity: "若手育成", style: "育成選手を前面に出し、スプリントと逃げで勝負する。" },
  { id: "lotto_heritage", name: "ロト・ヘリテージ", era: "現代", motif: "ベルギー宝くじ系名門", country: "Belgium", identity: "スプリント", style: "集団スプリントとクラシックで伝統を守る。" },
  { id: "italian_rosso", name: "ロッソ・イタリア", era: "過去", motif: "イタリアの名門ステージ/クラシックチーム群", country: "Italy", identity: "ジロとクラシック", style: "ジロ山岳、丘陵クラシック、職人アシストが強い。" },
  { id: "basque_orange", name: "バスク・オレンジ", era: "過去", motif: "バスク山岳チーム", country: "Basque", identity: "山岳特化", style: "登坂力と地元熱で山岳ステージを荒らす。" },
  { id: "postal_train", name: "ポスタル・トレイン", era: "過去", motif: "米国のグランツール列車型チーム", country: "USA", identity: "山岳列車", style: "エース一極集中の強力な山岳隊列を組む。" },
  { id: "danish_saxo", name: "サクソン・ブレイク", era: "過去", motif: "デンマーク系戦術チーム", country: "Denmark", identity: "奇襲戦術", style: "横風分断、ロングアタック、心理戦で勝負する。" },
  { id: "colombia_condor", name: "コンドル・アンデス", era: "過去", motif: "南米クライマー軍団", country: "Colombia", identity: "純粋山岳", style: "軽量クライマーを並べ、超級山岳で一気に逆転する。" },
];
const stages = [
  {
    id: "roubaix_one_day",
    name: "北方石畳クラシック",
    format: "ワンデーレース",
    inspiredBy: "パリ〜ルーベ系",
    type: "平坦",
    condition: "石畳",
    tactic: "位置取り耐久戦",
    difficulty: 455,
    weights: { sprint: 0.95, climb: 0.15, stamina: 1.15, technique: 1.45, teamwork: 1.0, ego: 0.75, fighting: 1.35 },
  },
  {
    id: "flanders_one_day",
    name: "石畳丘陵クラシック",
    format: "ワンデーレース",
    inspiredBy: "ロンド・ファン・フラーンデレン系",
    type: "丘陵",
    condition: "石畳 + 横風",
    tactic: "短坂アタック",
    difficulty: 465,
    weights: { sprint: 0.85, climb: 1.0, stamina: 1.05, technique: 1.3, teamwork: 0.9, ego: 0.9, fighting: 1.2 },
  },
  {
    id: "strade_one_day",
    name: "白い道グラベルクラシック",
    format: "ワンデーレース",
    inspiredBy: "ストラーデ・ビアンケ系",
    type: "丘陵",
    condition: "グラベル",
    tactic: "未舗装路アタック",
    difficulty: 445,
    weights: { sprint: 0.7, climb: 0.95, stamina: 1.0, technique: 1.4, teamwork: 0.75, ego: 0.95, fighting: 1.15 },
  },
  {
    id: "grand_tour_flat",
    name: "大周回 第3ステージ 海岸平坦",
    format: "ステージレース",
    inspiredBy: "ツール・ド・フランス平坦ステージ系",
    type: "平坦",
    condition: "横風",
    tactic: "高速隊列",
    difficulty: 400,
    weights: { sprint: 1.35, climb: 0.25, stamina: 0.95, technique: 1.0, teamwork: 1.25, ego: 0.45, fighting: 0.75 },
  },
  {
    id: "grand_tour_mountain",
    name: "大周回 第15ステージ 超級山岳",
    format: "ステージレース",
    inspiredBy: "アルプス/ピレネー山岳ステージ系",
    type: "山岳",
    condition: "向かい風",
    tactic: "峠決戦",
    difficulty: 485,
    weights: { sprint: 0.3, climb: 1.6, stamina: 1.25, technique: 0.75, teamwork: 0.85, ego: 0.85, fighting: 1.3 },
  },
  {
    id: "grand_tour_itt",
    name: "大周回 最終個人タイムトライアル",
    format: "ステージレース",
    inspiredBy: "グランツール最終TT系",
    type: "個人TT",
    condition: "石畳セクター",
    tactic: "単独巡航",
    difficulty: 455,
    weights: { sprint: 0.55, climb: 0.55, stamina: 1.25, technique: 1.35, teamwork: 0.15, ego: 1.05, fighting: 1.05 },
  },
  {
    id: "team_ttt",
    name: "海岸線チームタイムトライアル",
    format: "ステージレース",
    inspiredBy: "グランツール序盤TTT系",
    type: "チームTT",
    condition: "横風ローテーション",
    tactic: "隊列同期",
    difficulty: 470,
    weights: { sprint: 0.8, climb: 0.35, stamina: 1.15, technique: 1.15, teamwork: 1.6, ego: 0.15, fighting: 0.8 },
  },
];
const grandTourOperationModes = [
  { id: "full", name: "フル操作", detail: "重要地点をすべて操作。勝負ステージ向け。" },
  { id: "key", name: "重要地点だけ操作", detail: "勝負所だけ操作。通常ステージ向け。" },
  { id: "auto", name: "自動シミュレート", detail: "省略ではなく結果・疲労・事故・順位変動を処理。" },
];


const teamObjectives = [
  { id: "gc", name: "総合狙い", short: "総合", detail: "総合タイム差が動く山岳・TT・横風・危険ステージを主導する。" },
  { id: "sprint", name: "スプリント狙い", short: "SP", detail: "平坦と凱旋ステージを重点化し、山岳は温存寄りに回す。" },
  { id: "mountain", name: "山岳狙い", short: "山岳", detail: "山岳賞と山頂決戦を狙い、平坦は回復と位置取りを優先する。" },
  { id: "classic", name: "クラシック狙い", short: "古典", detail: "石畳・グラベル・丘陵で勝負し、荒れる局面を得点源にする。" },
  { id: "breakaway", name: "逃げ/ステージ狙い", short: "逃げ", detail: "総合勢が緩める丘陵・移動日で逃げ切りを狙う。" },
  { id: "tt", name: "TT狙い", short: "TT", detail: "個人TTとチームTTを最大目標にし、隊列とペース配分を重視する。" },
];

const importanceLabels = {
  S: { label: "主導", note: "操作推奨" },
  A: { label: "重点", note: "作戦投入" },
  B: { label: "警戒", note: "最小操作" },
  C: { label: "温存", note: "自動候補" },
};
const grandTourStagePlan = [
  { stage: 1, name: "開幕平坦", type: "平坦", defaultMode: "key", risk: "位置取り" },
  { stage: 2, name: "横風平坦", type: "平坦", defaultMode: "key", risk: "横風分断" },
  { stage: 3, name: "集団スプリント", type: "平坦", defaultMode: "auto", risk: "落車" },
  { stage: 4, name: "丘陵スプリント", type: "丘陵", defaultMode: "key", risk: "位置取り" },
  { stage: 5, name: "石畳/グラベル", type: "丘陵", defaultMode: "full", risk: "メカトラブル" },
  { stage: 6, name: "移動平坦", type: "平坦", defaultMode: "auto", risk: "疲労蓄積" },
  { stage: 7, name: "中級山岳", type: "山岳", defaultMode: "key", risk: "脚削り" },
  { stage: 8, name: "パンチャー向け丘陵", type: "丘陵", defaultMode: "key", risk: "アタック合戦" },
  { stage: 9, name: "第1山岳決戦", type: "山岳", defaultMode: "full", risk: "総合タイム差" },
  { stage: 10, name: "休養日前平坦", type: "平坦", defaultMode: "auto", risk: "補給失敗" },
  { stage: 11, name: "個人TT", type: "個人TT", defaultMode: "full", risk: "ペース配分" },
  { stage: 12, name: "横風ロング", type: "平坦", defaultMode: "key", risk: "横風分断" },
  { stage: 13, name: "逃げ向け丘陵", type: "丘陵", defaultMode: "auto", risk: "逃げ容認" },
  { stage: 14, name: "山岳入口", type: "山岳", defaultMode: "key", risk: "山岳入口" },
  { stage: 15, name: "超級山岳", type: "山岳", defaultMode: "full", risk: "エース変更" },
  { stage: 16, name: "回復平坦", type: "平坦", defaultMode: "auto", risk: "疲労管理" },
  { stage: 17, name: "チームTT", type: "チームTT", defaultMode: "full", risk: "隊列崩壊" },
  { stage: 18, name: "終盤丘陵", type: "丘陵", defaultMode: "key", risk: "ボーナスタイム" },
  { stage: 19, name: "最終山岳", type: "山岳", defaultMode: "full", risk: "総合逆転" },
  { stage: 20, name: "最終TT/決戦", type: "個人TT", defaultMode: "full", risk: "最終順位" },
  { stage: 21, name: "凱旋平坦", type: "平坦", defaultMode: "key", risk: "スプリント決着" },
];

function getStageImportance(stage, objectiveId = state.teamObjective) {
  const name = stage.name;
  const type = stage.type;
  const risk = stage.risk;

  if (objectiveId === "gc") {
    if (["総合タイム差", "エース変更", "総合逆転", "最終順位", "横風分断"].includes(risk)) return "S";
    if (["山岳", "個人TT", "チームTT"].includes(type) || ["石畳/グラベル", "山岳入口"].includes(name)) return "A";
    if (type === "丘陵" || risk === "位置取り") return "B";
    return "C";
  }

  if (objectiveId === "sprint") {
    if (name.includes("集団スプリント") || name.includes("凱旋") || name.includes("開幕平坦")) return "S";
    if (type === "平坦" || name.includes("丘陵スプリント")) return "A";
    if (risk === "横風分断" || type === "チームTT") return "B";
    return "C";
  }

  if (objectiveId === "mountain") {
    if (type === "山岳" && ["総合タイム差", "エース変更", "総合逆転"].includes(risk)) return "S";
    if (type === "山岳" || name.includes("山岳入口")) return "A";
    if (type === "丘陵" || type === "個人TT") return "B";
    return "C";
  }

  if (objectiveId === "classic") {
    if (name.includes("石畳") || name.includes("グラベル")) return "S";
    if (type === "丘陵" || risk === "横風分断" || risk === "位置取り") return "A";
    if (type === "平坦") return "B";
    return "C";
  }

  if (objectiveId === "breakaway") {
    if (name.includes("逃げ") || name.includes("移動") || name.includes("休養日前")) return "S";
    if (type === "丘陵" || risk === "疲労管理" || risk === "補給失敗") return "A";
    if (type === "山岳" || type === "平坦") return "B";
    return "C";
  }

  if (objectiveId === "tt") {
    if (type === "個人TT" || type === "チームTT") return "S";
    if (risk === "ペース配分" || risk === "隊列崩壊") return "S";
    if (type === "平坦" || risk === "横風分断") return "B";
    return "C";
  }

  return "B";
}

function getObjectiveStageSummary(objectiveId) {
  return grandTourStagePlan.reduce(
    (summary, stage) => {
      const rank = getStageImportance(stage, objectiveId);
      summary[rank] += 1;
      return summary;
    },
    { S: 0, A: 0, B: 0, C: 0 },
  );
}
const battleModes = {
  cpu: {
    label: "対CPU",
    turnStyle: "重要地点ターン制",
    realtime: false,
  },
  versus: {
    label: "対人",
    turnStyle: "重要地点同時選択制",
    realtime: false,
  },
};
const sectorTargetKm = 10;
const actionCards = [
  { id: "position", name: "位置取り", cpuAction: "牽制", focus: ["technique", "teamwork"] },
  { id: "tempo", name: "牽引", cpuAction: "温存", focus: ["stamina", "teamwork"] },
  { id: "attack", name: "アタック", cpuAction: "追走", focus: ["climb", "ego", "fighting"] },
  { id: "protect", name: "エース保護", cpuAction: "揺さぶり", focus: ["stamina", "technique", "teamwork"] },
  { id: "sprint", name: "スプリント準備", cpuAction: "発射台", focus: ["sprint", "ego", "teamwork"] },
];
const statLabels = {
  sprint: "瞬発力",
  climb: "登坂力",
  stamina: "持久力",
  technique: "技術",
  teamwork: "チームワーク",
  ego: "エゴ",
  fighting: "負けん気",
};
const state = {
  week: 1,
  stats: { ...baseStats },
  selectedSupports: ["coach", "domestique"],
  selectedTeam: ["ace", "leadout", "climber", "rouleur", "captain"],
  selectedEquipment: { frame: "allround_race", wheel: "pave_guard", tire: "pave_endure" },
  raceAce: "ace",
  selectedStage: "roubaix_one_day",
  battleMode: "cpu",
  teamObjective: "gc",
  log: ["育成を開始。対CPU/対人ともに重要地点ターン制のレースバトルで挑め。"],
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

function getEquipmentBonus() {
  const selectedItems = [
    equipmentCatalog.frames.find((item) => item.id === state.selectedEquipment.frame),
    equipmentCatalog.wheels.find((item) => item.id === state.selectedEquipment.wheel),
    equipmentCatalog.tires.find((item) => item.id === state.selectedEquipment.tire),
  ].filter(Boolean);

  return selectedItems.reduce((total, item) => {
    Object.entries(item.bonus).forEach(([stat, value]) => {
      total[stat] = (total[stat] || 0) + value;
    });
    return total;
  }, {});
}

function getSelectedEquipmentItems() {
  return [
    equipmentCatalog.frames.find((item) => item.id === state.selectedEquipment.frame),
    equipmentCatalog.wheels.find((item) => item.id === state.selectedEquipment.wheel),
    equipmentCatalog.tires.find((item) => item.id === state.selectedEquipment.tire),
  ].filter(Boolean);
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
  const equipment = getEquipmentBonus();
  return Object.keys(baseStats).reduce((finalStats, stat) => {
    finalStats[stat] = clamp((state.stats[stat] || 0) + (support[stat] || 0) + (team[stat] || 0) + (equipment[stat] || 0), 0, 160);
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

function getRaceDistance(stage) {
  if (stage.type === "個人TT") return 40;
  if (stage.type === "チームTT") return 50;
  if (stage.format === "ワンデーレース") return 200;
  return stage.type === "山岳" ? 180 : 200;
}

function getSectorKeyPoints(stage, distance) {
  const points = new Map();
  const add = (km, phase, card, priority = 1) => {
    const normalized = clamp(Math.round(km), 0, distance);
    const existing = points.get(normalized);
    if (!existing || priority >= existing.priority) {
      points.set(normalized, { km: normalized, phase, card, priority });
    }
  };

  add(0, "スタート直後の位置取り", actionCards[0], 3);
  add(distance * 0.18, "序盤の隊列形成", actionCards[0], 2);
  add(distance * 0.38, stage.condition.includes("横風") ? "横風区間前" : "中間ポイント前", stage.condition.includes("横風") ? actionCards[0] : actionCards[1], 3);
  add(distance * 0.55, "補給後の展開選択", actionCards[1], 2);
  add(distance * 0.72, "勝負所前", stage.type === "山岳" || stage.type === "丘陵" ? actionCards[2] : actionCards[3], 3);
  add(distance * 0.88, "残り局面の隊列再編", actionCards[3], 2);
  add(distance, "フィニッシュ", stage.type.includes("TT") ? actionCards[1] : actionCards[4], 3);

  if (stage.type === "山岳") {
    add(distance * 0.58, "山岳入口", actionCards[3], 4);
    add(distance * 0.76, "山岳中腹アタック地点", actionCards[2], 4);
  }
  if (stage.type === "丘陵") {
    add(distance * 0.62, "短坂連続区間前", actionCards[2], 4);
  }
  if (stage.condition.includes("石畳")) {
    add(distance * 0.42, "石畳セクター入口", actionCards[0], 4);
    add(distance * 0.68, "石畳終盤セクター前", actionCards[3], 4);
  }
  if (stage.condition.includes("グラベル")) {
    add(distance * 0.45, "グラベル入口", actionCards[0], 4);
    add(distance * 0.7, "未舗装路の勝負所", actionCards[2], 4);
  }
  if (stage.type.includes("TT")) {
    add(distance * 0.25, "前半ペース確認", actionCards[1], 4);
    add(distance * 0.5, "中間計測前", actionCards[1], 4);
    add(distance * 0.75, "終盤出力判断", actionCards[2], 4);
  }

  for (let km = sectorTargetKm; km < distance; km += sectorTargetKm) {
    const tooCloseToKeyPoint = [...points.keys()].some((point) => Math.abs(point - km) <= 3);
    if (!tooCloseToKeyPoint) {
      add(km, "巡航判断", actionCards[1], 0);
    }
  }

  return [...points.values()].sort((a, b) => a.km - b.km);
}

function buildRaceSectors(stage) {
  const distance = getRaceDistance(stage);
  const keyPoints = getSectorKeyPoints(stage, distance);
  return keyPoints.map((point, index) => {
    const next = keyPoints[index + 1];
    return {
      index: index + 1,
      km: point.km,
      kmTo: next ? next.km : distance,
      phase: point.phase,
      card: point.card,
      isKeyPoint: point.priority >= 3,
    };
  });
}
function getCpuPower(stage) {
  const base = stage.difficulty * 0.88;
  const formatBonus = stage.format === "ワンデーレース" ? 12 : 18;
  const conditionBonus = stage.condition.includes("石畳") || stage.condition.includes("グラベル") ? 16 : 10;
  return Math.round(base + formatBonus + conditionBonus);
}

function calculatePhaseScore(stats, sector, stage, side) {
  const focusScore = sector.card.focus.reduce((sum, stat) => sum + (stats[stat] || 0), 0) / sector.card.focus.length;
  const stageScore = Object.entries(stage.weights).reduce((sum, [stat, weight]) => sum + (stats[stat] || 0) * weight, 0) / 7;
  const variance = side === "player" ? Math.random() * 14 : Math.random() * 18;
  return Math.round(focusScore * 0.65 + stageScore * 0.35 + variance);
}

function getPhaseResultText(diff) {
  if (diff >= 12) return "主導権を大きく奪う";
  if (diff >= 4) return "わずかに優勢";
  if (diff <= -12) return "大きく崩される";
  if (diff <= -4) return "やや劣勢";
  return "互角";
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

function getRaceRole(riderId) {
  if (!state.selectedTeam.includes(riderId)) return "候補";
  return state.raceAce === riderId ? "当日エース" : "アシスト";
}

function getBestStat(stats) {
  const [stat] = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
  return statLabels[stat];
}

function renderGrandTourPlan() {
  const node = document.querySelector("#grandTourPlan");
  const objectiveNode = document.querySelector("#teamObjectiveSummary");
  if (!node) return;

  const objective = teamObjectives.find((item) => item.id === state.teamObjective) || teamObjectives[0];
  if (objectiveNode) {
    const summaries = teamObjectives
      .map((item) => {
        const summary = getObjectiveStageSummary(item.id);
        const active = item.id === objective.id ? " active" : "";
        return `<button class="objective-chip${active}" type="button" data-objective="${item.id}"><strong>${item.name}</strong><span>主導${summary.S} / 重点${summary.A}</span></button>`;
      })
      .join("");
    objectiveNode.innerHTML = `
      <div class="objective-heading">
        <strong>${objective.name}</strong>
        <span>${objective.detail}</span>
      </div>
      <div class="objective-chip-list">${summaries}</div>
    `;
  }

  node.innerHTML = grandTourStagePlan
    .map((stage) => {
      const mode = grandTourOperationModes.find((item) => item.id === stage.defaultMode);
      const rank = getStageImportance(stage, objective.id);
      const importance = importanceLabels[rank];
      const compactRanks = teamObjectives
        .slice(0, 4)
        .map((item) => `${item.short}:${getStageImportance(stage, item.id)}`)
        .join(" / ");
      return `
        <article class="world-team-card grand-tour-stage-card rank-${rank.toLowerCase()}">
          <div class="card-meta"><strong>Stage ${stage.stage}</strong><span>${mode.name}</span></div>
          <p>${stage.name} / ${stage.type}</p>
          <span>リスク: ${stage.risk}</span>
          <span class="importance-line">${objective.short}: ${importance.label} (${importance.note})</span>
          <span class="objective-ranks">${compactRanks}</span>
        </article>
      `;
    })
    .join("");
}
function renderEquipment() {
  const node = document.querySelector("#equipmentList");
  if (!node) return;
  const items = getSelectedEquipmentItems();
  node.innerHTML = items
    .map(
      (item) => `
        <article class="world-team-card">
          <div class="card-meta"><strong>${item.name}</strong><span>${item.fit}</span></div>
          <p>${item.motif}</p>
          <span>${Object.entries(item.bonus).map(([stat, value]) => `${statLabels[stat]} +${value}`).join(" / ")}</span>
        </article>
      `,
    )
    .join("");
}

function renderWearDesign() {
  const node = document.querySelector("#wearDesign");
  if (!node) return;
  node.innerHTML = `
    <article class="world-team-card">
      <div class="card-meta"><strong>${wearDesign.baseColor}</strong><span>${wearDesign.accentColor}</span></div>
      <p>${wearDesign.pattern}</p>
      <span>${wearDesign.sponsorStyle} / ${wearDesign.performanceNote}</span>
    </article>
  `;
}

function renderMonetization() {
  const node = document.querySelector("#monetizationPlan");
  const ruleNode = document.querySelector("#gachaRules");
  if (node) {
    node.innerHTML = monetizationPlan
      .map(
        (item) => `
          <article class="world-team-card monetization-card">
            <div class="card-meta"><strong>${item.name}</strong><span>${item.share}</span></div>
            <p>${item.target}</p>
            <span>${item.policy}</span>
          </article>
        `,
      )
      .join("");
  }
  if (ruleNode) {
    ruleNode.innerHTML = gachaRules.map((rule) => `<li>${rule}</li>`).join("");
  }
}
function renderWorldTeams() {
  const node = document.querySelector("#worldTeams");
  if (!node) return;
  node.innerHTML = worldTeams
    .map(
      (team) => `
        <article class="world-team-card">
          <div class="card-meta"><strong>${team.name}</strong><span>${team.era}</span></div>
          <p>${team.identity} / ${team.country}</p>
          <span>${team.motif}</span>
        </article>
      `,
    )
    .join("");
}
function renderStages() {
  const node = document.querySelector("#stageSelector");
  node.innerHTML = stages
    .map((stage) => {
      const selected = stage.id === state.selectedStage;
      return `
        <button class="card-button ${selected ? "selected" : ""}" type="button" data-stage="${stage.id}">
          <div class="card-meta"><strong>${stage.name}</strong><span>難度 ${stage.difficulty}</span></div>
          <span>${stage.type} / ${stage.condition} / ${stage.tactic}</span>
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
    roubaix_one_day: [0.58, 0.56, 0.57, 0.55, 0.58, 0.54, 0.56, 0.55],
    flanders_one_day: [0.65, 0.5, 0.58, 0.42, 0.55, 0.39, 0.62, 0.5],
    strade_one_day: [0.66, 0.53, 0.6, 0.38, 0.52, 0.43, 0.64, 0.51],
    grand_tour_flat: [0.62, 0.59, 0.61, 0.56, 0.6, 0.58, 0.55, 0.57],
    grand_tour_mountain: [0.74, 0.66, 0.52, 0.42, 0.28, 0.2, 0.34, 0.48],
    grand_tour_itt: [0.58, 0.55, 0.57, 0.52, 0.54, 0.5, 0.53, 0.51],
    team_ttt: [0.6, 0.57, 0.58, 0.55, 0.57, 0.54, 0.56, 0.53],
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

function setRaceAce(id) {
  if (!state.selectedTeam.includes(id)) {
    state.log.unshift("当日エースはチーム内の選手から指名する。");
    render();
    return;
  }
  state.raceAce = id;
  const rider = riders.find((item) => item.id === id);
  state.log.unshift(`${rider.name}をこの日の当日エースに指名。残りはアシストとして走る。`);
  render();
}

function toggleRider(id) {
  if (state.selectedTeam.includes(id)) {
    state.selectedTeam = state.selectedTeam.filter((item) => item !== id);
    if (state.raceAce === id) state.raceAce = state.selectedTeam[0] || null;
  } else if (state.selectedTeam.length < 8) {
    state.selectedTeam.push(id);
    if (!state.raceAce) state.raceAce = id;
  } else {
    state.log.unshift("チームは8人まで。役割を入れ替えて編成する。");
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
  const finalStats = getFinalStats();
  const ace = riders.find((item) => item.id === state.raceAce);
  const playerBasePower = calculatePower();
  const cpuBasePower = getCpuPower(stage);
  const sectors = buildRaceSectors(stage);
  let momentum = playerBasePower - cpuBasePower + (ace ? ace.stats.ego + ace.stats.fighting : 0);
  const sectorLogs = [];

  sectors.forEach((sector) => {
    const playerScore = calculatePhaseScore(finalStats, sector, stage, "player") + momentum * 0.05;
    const cpuScore = cpuBasePower / 7 + Math.random() * 18;
    const diff = Math.round(playerScore - cpuScore);
    momentum += diff;
    sectorLogs.push(
      `${sector.index}. ${sector.km}km地点 ${sector.phase}${sector.isKeyPoint ? " *" : ""}: こちらは${sector.card.name}、${battleModes[state.battleMode].label}は${sector.card.cpuAction}。${getPhaseResultText(diff)}。次の展開は${sector.kmTo}km地点へ。`,
    );
  });

  const winRate = clamp(Math.round(50 + momentum / sectors.length), 5, 95);
  const roll = Math.floor(Math.random() * 100) + 1;
  const result = roll <= winRate ? "勝利" : "敗北";
  const detail =
    result === "勝利"
      ? "セクターごとのカード選択で脚と位置取りを残し、勝負所を取り切った。"
      : "セクターのどこかで主導権を失い、最後の局面で届かなかった。";

  state.log.unshift(
    `${stage.name} [${stage.format} / ${stage.type} / ${stage.condition}]: ${result}。当日エース ${ace ? ace.name : "未指名"} / ${getRaceDistance(stage)}km / 約${sectorTargetKm}km間隔+重要地点 ${sectors.length}ターン / 戦力${playerBasePower} / ${battleModes[state.battleMode].label}${cpuBasePower} / 判定${roll} / 勝率${winRate}%。${detail}`,
    ...sectorLogs.reverse(),
  );
  render();
}

function resetGame() {
  state.week = 1;
  state.stats = { ...baseStats };
  state.selectedSupports = ["coach", "domestique"];
  state.selectedTeam = ["ace", "leadout", "climber", "rouleur", "captain"];
  state.selectedEquipment = { frame: "allround_race", wheel: "pave_guard", tire: "pave_endure" };
  state.raceAce = "ace";
  state.selectedStage = "roubaix_one_day";
  state.battleMode = "cpu";
  state.log = ["育成をリセット。初期デッキから再開。"];
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const trainButton = event.target.closest("[data-train]");
    const supportButton = event.target.closest("[data-support]");
    const riderButton = event.target.closest("[data-rider]");
    const stageButton = event.target.closest("[data-stage]");
    const objectiveButton = event.target.closest("[data-objective]");

    if (objectiveButton) {
      state.teamObjective = objectiveButton.dataset.objective;
      renderGrandTourPlan();
      return;
    }

    if (trainButton) train(trainButton.dataset.train);
    if (supportButton) toggleSupport(supportButton.dataset.support);
    if (riderButton && event.detail >= 2) setRaceAce(riderButton.dataset.rider);
    else if (riderButton) toggleRider(riderButton.dataset.rider);
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
  renderGrandTourPlan();
  renderEquipment();
  renderWearDesign();
  renderMonetization();
  renderWorldTeams();
  renderStages();
  renderRaceSummary();
  renderLog();
  renderCourse();
}

bindEvents();
render();
