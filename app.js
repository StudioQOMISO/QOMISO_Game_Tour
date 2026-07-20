const ucrOrganization = {
  code: "UCR",
  name: "国際ロードサイクル連合",
  englishName: "Union Cycliste Routière",
  circuit: "UCR World Circuit",
  rankings: [
    { label: "年間ポイント", value: "UCR Points", detail: "公認レースの着順、各賞、チーム貢献を年間集計" },
    { label: "ライダー順位", value: "Rider Ranking", detail: "個人の総合成績とステージ成績を評価" },
    { label: "チーム順位", value: "Team Ranking", detail: "各レース上位3名とチーム総合を集計" },
    { label: "対人実力値", value: "UCR Rating", detail: "年間ポイントと分離し、対戦相手を考慮して増減" },
  ],
  versusRule: "週5戦を年間ポイント対象とし、対人由来はマネージャー年間ポイントの20%を上限とする。",
};

const baseStats = {
  sprint: 0,
  acceleration: 0,
  punch: 0,
  cruise: 0,
  climb: 0,
  stamina: 0,
  resistance: 0,
  technique: 0,
  bikeControl: 0,
  pave: 0,
  recovery: 0,
  dailyRecovery: 0,
  teamwork: 0,
  ego: 0,
  fighting: 0,
};

const supportCards = [
  { id: "coach", name: "冷静な監督", type: "作戦", bonus: { technique: 2, teamwork: 3, ego: -1 }, skill: "位置取り補正" },
  { id: "sprinter", name: "黄金の発射台", type: "速度", bonus: { sprint: 3, acceleration: 2, teamwork: 1 }, skill: "最終直線加速" },
  { id: "climber", name: "山岳王の助言", type: "登坂", bonus: { climb: 3, punch: 1, resistance: 2, fighting: 1 }, skill: "峠アタック" },
  { id: "mechanic", name: "精密メカニック", type: "安定", bonus: { technique: 2, bikeControl: 3 }, skill: "落車回避" },
  { id: "domestique", name: "献身の牽引役", type: "連携", bonus: { teamwork: 3, cruise: 2, stamina: 1 }, skill: "風よけ" },
  { id: "nutrition", name: "補給プランナー", type: "持久", bonus: { stamina: 2, resistance: 1, recovery: 3 }, skill: "終盤回復" },
  { id: "rival", name: "宿敵の存在", type: "精神", bonus: { acceleration: 1, fighting: 3, ego: 1 }, skill: "闘争本能" },
];

const equipmentCatalog = {
  frames: [
    { id: "aero_italia", name: "Veloce Aero X", motif: "イタリアン・エアロフレーム系", bonus: { sprint: 1, cruise: 2, technique: 1 }, fit: "平坦/TT" },
    { id: "climb_classic", name: "Corsa Leggera", motif: "伝統系軽量クライミングフレーム", bonus: { climb: 2, acceleration: 1 }, fit: "山岳" },
    { id: "allround_race", name: "Universal Race Pro", motif: "万能レーシングフレーム系", bonus: { cruise: 1, climb: 1, technique: 1, bikeControl: 1 }, fit: "総合" },
  ],
  wheels: [
    { id: "deep_aero", name: "Nordwind Deep 60", motif: "ディープリム高速巡航系", bonus: { sprint: 1, cruise: 2 }, fit: "平坦/横風注意" },
    { id: "light_climb", name: "Alto Light 32", motif: "軽量山岳ホイール系", bonus: { climb: 2, bikeControl: 1 }, fit: "山岳/下り" },
    { id: "pave_guard", name: "Pave Shield Wheel", motif: "石畳耐久ホイール系", bonus: { bikeControl: 2, resistance: 1 }, fit: "石畳" },
  ],
  tires: [
    { id: "race_slick", name: "Corsa Slick", motif: "高速ロードタイヤ系", bonus: { sprint: 1, cruise: 1 }, fit: "平坦" },
    { id: "gravel_guard", name: "GravelGuard 40", motif: "グラベル対応タイヤ系", bonus: { bikeControl: 2, resistance: 1 }, fit: "グラベル" },
    { id: "pave_endure", name: "Pave Endure", motif: "石畳耐パンクタイヤ系", bonus: { bikeControl: 2, resistance: 1 }, fit: "石畳" },
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
    id: "soft_scout",
    name: "緩い選手スカウト",
    share: "35%",
    target: "選手カード / サポートカード / スタッフ / Credit年俸",
    policy: "Credit年俸で価値を表す。高年俸エースは強いが、総年俸上限とアシスト不足で制約する。100連天井と毎週無料配布を前提にする。",
  },
  {
    id: "season_pass",
    name: "シーズンパス",
    share: "40%",
    target: "年間報酬 / カードスリーブ / 称号",
    policy: "1年シーズン進行に合わせた主収益。能力強化素材は販売せず、カード入手と外見報酬を中心にする。",
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

const scoutRules = [
  "排出確率を購入前に明示する",
  "同名選手の重複は汎用契約ポイントへ変換する",
  "レベル上げ、限界突破、重複カードによる能力強化は実装しない",
  "低年俸カードも脚質、役割適性、固有パッシブ、デッキ相性で価値を持たせる",
  "8人チームは総Credit年俸上限内で編成する",
];
const creditCapRules = {
  standard: { label: "通常", cap: 42000 },
  upper: { label: "上位", cap: 45000 },
  pinnacle: { label: "最高峰", cap: 48000 },
};

const riders = [
  { id: "ace", name: "Peter Sagan", country: "スロバキア", era: "2010年代", motif: "Peter Sagan", primaryArchetype: "クラシック型", secondaryArchetype: "スプリンター", aptitudeTags: ["パンチ力", "ステージハンター", "逃げ屋"], aceAptitude: 93, supportAptitude: 70, preferredRoles: ["エース", "ステージハンター"], creditSalary: 7600, paveBasis: "パリ〜ルーベ2018優勝、2019年5位、2014年6位", stats: { sprint: 81, acceleration: 83, punch: 84, cruise: 80, climb: 74, stamina: 82, resistance: 83, technique: 84, bikeControl: 84, pave: 84, recovery: 81, dailyRecovery: 81, teamwork: 70, ego: 82, fighting: 84 } },
  { id: "leadout", name: "Mark Renshaw", country: "オーストラリア", era: "2000-2010年代", motif: "Mark Renshaw", primaryArchetype: "スプリンター", secondaryArchetype: "TT・ルーラー型", aptitudeTags: ["リードアウト", "最高速", "隊列維持"], aceAptitude: 63, supportAptitude: 93, preferredRoles: ["リードアウト", "最終発射台", "スプリントトレイン"], creditSalary: 4800, paveBasis: "パリ〜ルーベ2回出走、完走なし", stats: { sprint: 78, acceleration: 81, punch: 69, cruise: 80, climb: 58, stamina: 77, resistance: 79, technique: 83, bikeControl: 80, pave: 57, recovery: 76, dailyRecovery: 76, teamwork: 85, ego: 63, fighting: 74 } },
  { id: "climber", name: "Marco Pantani", country: "イタリア", era: "1990年代", motif: "Marco Pantani", primaryArchetype: "クライマー", secondaryArchetype: "パンチャー", aptitudeTags: ["山岳アタック", "下り", "ステージハンター"], aceAptitude: 96, supportAptitude: 66, preferredRoles: ["エース", "ステージハンター", "山岳賞ハンター"], creditSalary: 10800, paveBasis: "パリ〜ルーベ未出走", stats: { sprint: 57, acceleration: 83, punch: 82, cruise: 68, climb: 85, stamina: 82, resistance: 84, technique: 76, bikeControl: 84, pave: 50, recovery: 78, dailyRecovery: 78, teamwork: 66, ego: 82, fighting: 85 } },
  { id: "rouleur", name: "Tim Declercq", country: "ベルギー", era: "2010-2020年代", motif: "Tim Declercq", primaryArchetype: "TT・ルーラー型", secondaryArchetype: "クラシック型", aptitudeTags: ["巡航力", "横風", "逃げ屋"], aceAptitude: 56, supportAptitude: 95, preferredRoles: ["平坦ペースメーカー", "集団コントローラー", "TT牽引", "逃げ屋"], creditSalary: 3900, paveBasis: "パリ〜ルーベ最高39位", stats: { sprint: 61, acceleration: 66, punch: 65, cruise: 84, climb: 67, stamina: 84, resistance: 83, technique: 78, bikeControl: 80, pave: 69, recovery: 80, dailyRecovery: 80, teamwork: 84, ego: 60, fighting: 80 } },
  { id: "captain", name: "Fumiyuki Beppu", country: "日本", era: "2000-2010年代", motif: "Fumiyuki Beppu", primaryArchetype: "クラシック型", secondaryArchetype: "TT・ルーラー型", aptitudeTags: ["ロードキャプテン", "補給支援", "位置取り"], aceAptitude: 49, supportAptitude: 98, preferredRoles: ["ロードキャプテン", "TT牽引", "横風要員"], creditSalary: 4400, paveBasis: "パリ〜ルーベ最高71位、5回出走1回完走", stats: { sprint: 66, acceleration: 70, punch: 72, cruise: 80, climb: 70, stamina: 80, resistance: 80, technique: 82, bikeControl: 82, pave: 64, recovery: 80, dailyRecovery: 80, teamwork: 85, ego: 58, fighting: 78 } },
  { id: "sprinter", name: "Mark Cavendish", country: "イギリス", era: "2000-2020年代", motif: "Mark Cavendish", primaryArchetype: "スプリンター", secondaryArchetype: "クラシック型", aptitudeTags: ["最高速", "位置取り", "集団スプリント"], aceAptitude: 96, supportAptitude: 58, preferredRoles: ["エース"], creditSalary: 9000, paveBasis: "パリ〜ルーベ最高30位、2回出走1回完走", stats: { sprint: 85, acceleration: 84, punch: 68, cruise: 78, climb: 55, stamina: 75, resistance: 80, technique: 84, bikeControl: 75, pave: 69, recovery: 74, dailyRecovery: 74, teamwork: 68, ego: 84, fighting: 83 } },
  { id: "mountain_domestique", name: "Sepp Kuss", country: "アメリカ", era: "2010-2020年代", motif: "Sepp Kuss", primaryArchetype: "クライマー", secondaryArchetype: "総合型", aptitudeTags: ["山岳牽引", "サブエース", "日別回復"], aceAptitude: 78, supportAptitude: 92, preferredRoles: ["サブエース", "山岳アシスト", "山岳番手", "スーパー・ドメスティーク"], creditSalary: 3600, paveBasis: "パリ〜ルーベ未出走", stats: { sprint: 57, acceleration: 76, punch: 77, cruise: 75, climb: 82, stamina: 82, resistance: 82, technique: 76, bikeControl: 80, pave: 50, recovery: 83, dailyRecovery: 85, teamwork: 85, ego: 58, fighting: 80 } },
  { id: "road_guard", name: "Yukiya Arashiro", country: "日本", era: "2000-2020年代", motif: "Yukiya Arashiro", primaryArchetype: "クラシック型", secondaryArchetype: "パンチャー", aptitudeTags: ["耐久力", "逃げ屋", "悪路対応"], aceAptitude: 50, supportAptitude: 97, preferredRoles: ["平坦アシスト", "ロードキャプテン", "逃げ屋"], creditSalary: 3200, paveBasis: "パリ〜ルーベ1回出走、完走なし", stats: { sprint: 65, acceleration: 71, punch: 74, cruise: 80, climb: 68, stamina: 84, resistance: 84, technique: 79, bikeControl: 82, pave: 57, recovery: 82, dailyRecovery: 82, teamwork: 85, ego: 57, fighting: 82 } },
  { id: "wind_captain", name: "Luke Rowe", country: "イギリス", era: "2010-2020年代", motif: "Luke Rowe", primaryArchetype: "クラシック型", secondaryArchetype: "TT・ルーラー型", aptitudeTags: ["横風", "石畳", "ロードキャプテン"], aceAptitude: 55, supportAptitude: 97, preferredRoles: ["ロードキャプテン", "石畳護衛", "横風要員"], creditSalary: 4200, paveBasis: "パリ〜ルーベ2015年8位、2016年14位、10回出走8回完走", stats: { sprint: 67, acceleration: 72, punch: 76, cruise: 81, climb: 65, stamina: 82, resistance: 84, technique: 83, bikeControl: 85, pave: 78, recovery: 80, dailyRecovery: 80, teamwork: 85, ego: 60, fighting: 83 } },
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
  { id: "french_rooster", name: "トリコロール・ルースター", era: "現代", motif: "フランス若手発掘名門", country: "France", identity: "若手発掘と逃げ", style: "若手カードを発掘し、逃げと山岳賞で存在感を出す。" },
  { id: "agri_mondiale", name: "アグリ・モンディアル", era: "現代", motif: "フランスの堅実な総合/ステージチーム", country: "France", identity: "堅実な総合力", style: "ステージレースで崩れず、チーム総合も強い。" },
  { id: "education_pink", name: "エデュケーション・ピンク", era: "現代", motif: "米国系自由派チーム", country: "USA", identity: "逃げと個性", style: "奇襲、逃げ、個性的なエースで流れを壊す。" },
  { id: "bahrain_pearl", name: "バーレーン・パール", era: "現代", motif: "湾岸系ステージハンター", country: "Bahrain", identity: "山岳ステージ", style: "山岳と中級山岳でステージ勝利を狙う。" },
  { id: "kangaroo_green", name: "カンガルー・グリーン", era: "現代", motif: "オーストラリア系ワールドチーム", country: "Australia", identity: "スプリントと逃げ", style: "スプリント、逃げ、TTを柔軟に切り替える。" },
  { id: "nordic_flame", name: "ノルディック・フレイム", era: "現代", motif: "北欧新興チーム", country: "Norway", identity: "若手と登坂", style: "発掘力と粘りでトップカテゴリに食い込む。" },
  { id: "kazakh_steppe", name: "ステップ・ブルー", era: "現代", motif: "カザフ系長寿チーム", country: "Kazakhstan", identity: "逃げと耐久", style: "厳しい展開でも粘って逃げ切りを狙う。" },
  { id: "sun_post", name: "サンポスト・オレンジ", era: "現代", motif: "オランダ系若手発掘/スプリントチーム", country: "Netherlands", identity: "若手発掘", style: "若手カードを前面に出し、スプリントと逃げで勝負する。" },
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
    creditTier: "pinnacle",
    name: "北方石畳クラシック",
    format: "ワンデーレース",
    inspiredBy: "パリ〜ルーベ系",
    type: "平坦",
    condition: "石畳",
    tactic: "位置取り耐久戦",
    difficulty: 455,
    weights: { sprint: 0.8, acceleration: 0.55, punch: 0.45, cruise: 1.0, climb: 0.1, stamina: 0.9, resistance: 0.9, technique: 0.75, bikeControl: 0.5, pave: 2.4, recovery: 0.25, teamwork: 0.8, fighting: 1.0 },
  },
  {
    id: "flanders_one_day",
    creditTier: "pinnacle",
    name: "石畳丘陵クラシック",
    format: "ワンデーレース",
    inspiredBy: "ロンド・ファン・フラーンデレン系",
    type: "丘陵",
    condition: "石畳 + 横風",
    tactic: "短坂アタック",
    difficulty: 465,
    weights: { sprint: 0.75, acceleration: 1.1, punch: 1.35, cruise: 0.8, climb: 1.0, stamina: 0.85, resistance: 1.0, technique: 0.8, bikeControl: 0.55, pave: 1.2, recovery: 0.45, teamwork: 0.9, fighting: 0.95 },
  },
  {
    id: "strade_one_day",
    creditTier: "upper",
    name: "白い道グラベルクラシック",
    format: "ワンデーレース",
    inspiredBy: "ストラーデ・ビアンケ系",
    type: "丘陵",
    condition: "グラベル",
    tactic: "未舗装路アタック",
    difficulty: 445,
    weights: { sprint: 0.6, acceleration: 1.0, punch: 1.25, cruise: 0.85, climb: 0.95, stamina: 0.85, resistance: 1.15, technique: 1.0, bikeControl: 0.8, recovery: 0.4, teamwork: 0.75, fighting: 0.9 },
  },
  {
    id: "grand_tour_flat",
    creditTier: "pinnacle",
    name: "大周回 第3ステージ 海岸平坦",
    format: "ステージレース",
    inspiredBy: "ツール・ド・フランス平坦ステージ系",
    type: "平坦",
    condition: "横風",
    tactic: "高速隊列",
    difficulty: 400,
    weights: { sprint: 2.5, acceleration: 1.6, punch: 0.1, cruise: 1.0, climb: 0, stamina: 0.4, resistance: 0.6, technique: 0.6, bikeControl: 0.1, recovery: 0, teamwork: 1.0, fighting: 0.1 },
  },
  {
    id: "grand_tour_mountain",
    creditTier: "pinnacle",
    name: "大周回 第15ステージ 超級山岳",
    format: "ステージレース",
    inspiredBy: "アルプス/ピレネー山岳ステージ系",
    type: "山岳",
    condition: "向かい風",
    tactic: "峠決戦",
    difficulty: 485,
    weights: { sprint: 0.05, acceleration: 0.8, punch: 0.4, cruise: 0.15, climb: 2.5, stamina: 1.0, resistance: 1.3, technique: 0.2, bikeControl: 0.2, recovery: 0.3, teamwork: 0.5, fighting: 0.3 },
  },
  {
    id: "grand_tour_itt",
    creditTier: "pinnacle",
    name: "大周回 最終個人タイムトライアル",
    format: "ステージレース",
    inspiredBy: "グランツール最終TT系",
    type: "個人TT",
    condition: "石畳セクター",
    tactic: "単独巡航",
    difficulty: 455,
    weights: { sprint: 0, acceleration: 0.1, punch: 0, cruise: 3.0, climb: 0.3, stamina: 1.0, resistance: 1.0, technique: 1.0, bikeControl: 0.1, pave: 0.3, recovery: 0.1, teamwork: 0, fighting: 0.1 },
  },
  {
    id: "team_ttt",
    creditTier: "standard",
    name: "海岸線チームタイムトライアル",
    format: "ステージレース",
    inspiredBy: "グランツール序盤TTT系",
    type: "チームTT",
    condition: "横風ローテーション",
    tactic: "隊列同期",
    difficulty: 470,
    weights: { sprint: 0.5, acceleration: 0.6, punch: 0.25, cruise: 1.45, climb: 0.35, stamina: 1.0, resistance: 1.0, technique: 1.0, bikeControl: 0.25, recovery: 0.25, teamwork: 1.6, fighting: 0.5 },
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
  { id: "position", name: "位置取り", cpuAction: "牽制", focus: ["technique", "acceleration", "teamwork"], fatigue: 0.7, sprintCost: 2, fuelCost: 0.4, lactateCost: 2 },
  { id: "tempo", name: "牽引", cpuAction: "温存", focus: ["cruise", "stamina", "resistance", "teamwork"], fatigue: 1.1, sprintCost: 3, fuelCost: 0.7, lactateCost: 1 },
  { id: "attack", name: "アタック", cpuAction: "追走", focus: ["punch", "climb", "acceleration", "resistance"], fatigue: 2.8, sprintCost: 12, fuelCost: 1.5, lactateCost: 16 },
  { id: "protect", name: "エース保護", cpuAction: "揺さぶり", focus: ["stamina", "resistance", "teamwork"], fatigue: 0.8, sprintCost: 2, fuelCost: 0.5, lactateCost: 1 },
  { id: "sprint", name: "スプリント準備", cpuAction: "発射台", focus: ["sprint", "acceleration", "technique", "teamwork"], fatigue: 2.2, sprintCost: 18, fuelCost: 1.2, lactateCost: 22 },
  { id: "feed", name: "補給", cpuAction: "補給地点の位置取り", focus: ["technique", "teamwork", "recovery"], fatigue: 0.4, sprintCost: 0, fuelCost: 0, lactateCost: 0 },
  { id: "descent", name: "高速ダウンヒル", cpuAction: "下りで加速", focus: ["bikeControl", "technique", "resistance"], fatigue: 1.2, sprintCost: 1, fuelCost: 0.6, lactateCost: 2 },
];

const passiveAbilities = {
  ace: { name: "万能型", detail: "第3分野を示す適性タグの補正を副脚質に近い水準まで引き上げる", versatile: true },
  leadout: { name: "黄金の発射台", detail: "終盤のスプリント消費を軽減し、フィニッシュを強化", sprintCostRate: -0.1, finishBonus: 5 },
  climber: { name: "山岳リズム", detail: "エース時、山岳で疲労増加を軽減", aceOnly: true, condition: "mountain", mountainFatigueRate: -0.14, phaseBonus: 4 },
  rouleur: { name: "巡航耐性", detail: "牽引と長距離巡航で疲労増加を軽減", fatigueRate: -0.05, tempoFatigueRate: -0.1 },
  captain: { name: "ロードキャプテン", detail: "補給効率を上げ、健康度低下を軽減", feedBonus: 4, healthWearRate: -0.1 },
  sprinter: { name: "スプリント温存", detail: "エース時、スプリント残量を維持", aceOnly: true, sprintCostRate: -0.16, finishBonus: 10 },
  mountain_domestique: { name: "山岳ガード", detail: "山岳でエースの疲労増加を軽減", condition: "mountain", mountainFatigueRate: -0.09 },
  road_guard: { name: "風よけ職人", detail: "全セクターの疲労増加を軽減", fatigueRate: -0.07 },
  wind_captain: { name: "エシュロン指揮", detail: "横風区間の疲労と健康度低下を軽減", condition: "wind", windFatigueRate: -0.16, healthWearRate: -0.05 },
};

const activeAbilities = [
  { id: "all_out_attack", name: "全開アタック", detail: "最初のアタックで出力+16。疲労とスプリントを大きく消費", triggerCard: "attack", phaseBonus: 16, fatigueDelta: 6, sprintDelta: -12, lactateDelta: 18 },
  { id: "protect_ace", name: "エース完全保護", detail: "最初のエース保護で疲労-7、健康度+2", triggerCard: "protect", phaseBonus: 9, fatigueDelta: -7, healthDelta: 2 },
  { id: "team_feed", name: "チーム補給", detail: "補給地点で補給+18、健康度+3", triggerCard: "feed", phaseBonus: 5, nutritionDelta: 18, healthDelta: 3 },
  { id: "final_launch", name: "最終発射", detail: "フィニッシュでスプリント残量を出力へ変換", triggerCard: "sprint", phaseBonus: 19, sprintDelta: -16, lactateDelta: 22 },
  { id: "crosswind_split", name: "横風分断", detail: "横風区間で集団を割る。疲労+4、補給-4", triggerPhase: "横風", phaseBonus: 17, fatigueDelta: 4, nutritionDelta: -4 },
];

const raceMetricLabels = {
  fatigue: { label: "疲労", goodWhenHigh: false, detail: "高強度走・登坂・悪路で増加" },
  sprint: { label: "スプリント", goodWhenHigh: true, detail: "アタックと加速で消費" },
  nutrition: { label: "補給", goodWhenHigh: true, detail: "糖質・水分の残量" },
  health: { label: "健康度", goodWhenHigh: true, detail: "体調・転倒リスク・脱水耐性" },
  lactate: { label: "乳酸負荷", goodWhenHigh: false, detail: "高いほど再加速とスプリントが鈍る" },
};
const statLabels = {
  sprint: "スプリント",
  acceleration: "加速力",
  punch: "パンチ力",
  cruise: "巡航力",
  climb: "登坂力",
  stamina: "持久力",
  resistance: "耐性",
  technique: "技術",
  bikeControl: "バイクコントロール",
  pave: "パヴェ",
  recovery: "回復力",
  dailyRecovery: "日間回復力",
  teamwork: "チームワーク",
  ego: "エゴ",
  fighting: "負けん気",
};
const archetypeStatBonuses = {
  "総合型": { climb: 1, stamina: 1, resistance: 0.5, recovery: 0.5, dailyRecovery: 1 },
  "スプリンター": { sprint: 1.4, acceleration: 0.8, technique: 0.3 },
  "クライマー": { climb: 1.4, stamina: 0.6, resistance: 0.5 },
  "パンチャー": { punch: 1.4, acceleration: 0.6, resistance: 0.3 },
  "クラシック型": { bikeControl: 1, stamina: 0.6, resistance: 0.5, technique: 0.4 },
  "TT・ルーラー型": { cruise: 1.2, technique: 0.4, stamina: 0.4, resistance: 0.5 },
};
const aptitudeTagStatBonuses = {
  "パンチ力": { punch: 1 }, "ステージハンター": { fighting: 0.6, recovery: 0.4 }, "逃げ屋": { cruise: 0.6, stamina: 0.4 },
  "リードアウト": { sprint: 0.4, acceleration: 0.3, teamwork: 0.3 }, "最高速": { sprint: 0.7, acceleration: 0.3 }, "隊列維持": { teamwork: 0.6, technique: 0.4 },
  "山岳アタック": { climb: 0.4, punch: 0.3, acceleration: 0.3 }, "下り": { bikeControl: 1 }, "巡航力": { cruise: 1 }, "横風": { technique: 0.5, stamina: 0.5 },
  "ロードキャプテン": { teamwork: 1 }, "補給支援": { teamwork: 0.5, recovery: 0.5 }, "位置取り": { technique: 1 },
  "集団スプリント": { sprint: 0.5, technique: 0.5 }, "山岳牽引": { climb: 0.5, teamwork: 0.5 }, "サブエース": { fighting: 0.5, teamwork: 0.5 },
  "日別回復": { dailyRecovery: 1 }, "耐久力": { stamina: 0.5, resistance: 0.5 }, "悪路対応": { bikeControl: 0.6, technique: 0.4 }, "石畳": { bikeControl: 0.5, stamina: 0.5 },
};

const state = {
  week: 1,
  stats: { ...baseStats },
  selectedActionCards: ["position", "tempo", "attack", "protect", "sprint"],
  selectedSupports: ["coach", "domestique"],
  selectedTeam: ["ace", "leadout", "climber", "rouleur", "captain", "mountain_domestique", "road_guard", "wind_captain"],
  selectedEquipment: { frame: "allround_race", wheel: "pave_guard", tire: "pave_endure" },
  raceAce: "ace",
  selectedStage: "roubaix_one_day",
  battleMode: "cpu",
  teamObjective: "gc",
  selectedActiveAbility: "protect_ace",
  raceMetrics: createInitialRaceMetrics(),
  stageRaceDay: 0,
  stageRaceCarryover: null,
  log: ["カードバトル開始。選手8枚、サポート4枚、戦術5枚でロードレースを制する。"],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function createInitialRaceMetrics() {
  return { fatigue: 4, sprint: 100, nutrition: Math.round(90 + Math.random() * 5), health: Math.round(94 + Math.random() * 5), lactate: 6, feeds: 0, crashes: 0, activeUsed: false, activeName: "" };
}

function calculateNextDayRecovery(metrics, dailyRecovery) {
  const recoveryRate = clamp((dailyRecovery - 50) / 35, 0, 1);
  const amounts = {
    fatigue: Math.round(8 + recoveryRate * 16),
    sprint: Math.round(20 + recoveryRate * 30),
    nutrition: 45,
    health: Math.round(3 + recoveryRate * 5),
    lactate: Math.round(18 + recoveryRate * 28),
  };
  return {
    amounts,
    metrics: {
      fatigue: clamp(metrics.fatigue - amounts.fatigue, 4, 100),
      sprint: clamp(metrics.sprint + amounts.sprint, 0, 100),
      nutrition: clamp(metrics.nutrition + amounts.nutrition, 0, 95),
      health: clamp(metrics.health + amounts.health, 0, 99),
      lactate: clamp(metrics.lactate - amounts.lactate, 4, 100),
      feeds: 0,
      crashes: 0,
      activeUsed: false,
      activeName: "",
    },
  };
}

function getRaceStartMetrics(stage) {
  if (stage.format === "ステージレース" && state.stageRaceCarryover) return { ...state.stageRaceCarryover };
  return createInitialRaceMetrics();
}
function refreshRacePreview() {
  state.raceMetrics = getRaceStartMetrics(getSelectedStage());
}


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
  const selected = state.selectedTeam.map((id) => riders.find((item) => item.id === id)).filter(Boolean);
  if (selected.length === 0) return {};
  const ace = selected.find((rider) => rider.id === state.raceAce) || selected[0];
  const supportRiders = selected.filter((rider) => rider.id !== ace.id);
  const teamAverage = (stat) => selected.reduce((sum, rider) => sum + rider.stats[stat], 0) / selected.length;

  return Object.keys(baseStats).reduce((total, stat) => {
    if (stat === "teamwork") {
      total[stat] = Math.round(teamAverage(stat));
      return total;
    }
    const strongestSupport = supportRiders
      .map((rider) => rider.stats[stat])
      .sort((a, b) => b - a)
      .slice(0, 2);
    const supportAverage = strongestSupport.length
      ? strongestSupport.reduce((sum, value) => sum + value, 0) / strongestSupport.length
      : ace.stats[stat];
    total[stat] = Math.round(ace.stats[stat] * 0.65 + supportAverage * 0.25 + teamAverage(stat) * 0.1);
    return total;
  }, {});
}

function getTeamPassiveEffects(stage) {
  const effects = {
    fatigueRate: 0,
    tempoFatigueRate: 0,
    mountainFatigueRate: 0,
    windFatigueRate: 0,
    sprintCostRate: 0,
    healthWearRate: 0,
    feedBonus: 0,
    phaseBonus: 0,
    finishBonus: 0,
    labels: [],
  };

  state.selectedTeam.forEach((riderId) => {
    const ability = passiveAbilities[riderId];
    if (!ability || (ability.aceOnly && state.raceAce !== riderId)) return;
    if (ability.condition === "mountain" && stage.type !== "山岳") return;
    if (ability.condition === "wind" && !stage.condition.includes("風")) return;
    effects.labels.push(ability.name);
    Object.keys(effects).forEach((key) => {
      if (key !== "labels" && Number.isFinite(ability[key])) effects[key] += ability[key];
    });
  });

  if (stage.type !== "山岳") effects.mountainFatigueRate = 0;
  if (!stage.condition.includes("風")) effects.windFatigueRate = 0;
  return effects;
}

function getSelectedActiveAbility() {
  return activeAbilities.find((ability) => ability.id === state.selectedActiveAbility) || activeAbilities[0];
}

function shouldTriggerActiveAbility(ability, sector) {
  if (ability.triggerCard && sector.card.id === ability.triggerCard) return true;
  if (ability.triggerPhase && sector.phase.includes(ability.triggerPhase)) return true;
  return false;
}

function applyActiveAbility(metrics, ability) {
  metrics.fatigue = clamp(metrics.fatigue + (ability.fatigueDelta || 0), 0, 100);
  metrics.sprint = clamp(metrics.sprint + (ability.sprintDelta || 0), 0, 100);
  metrics.nutrition = clamp(metrics.nutrition + (ability.nutritionDelta || 0), 0, 100);
  metrics.health = clamp(metrics.health + (ability.healthDelta || 0), 0, 100);
  metrics.lactate = clamp(metrics.lactate + (ability.lactateDelta || 0), 0, 100);
  metrics.activeUsed = true;
  metrics.activeName = ability.name;
}

function getSquadBalance() {
  const selected = state.selectedTeam.map((id) => riders.find((item) => item.id === id)).filter(Boolean);
  const supportRiders = selected.filter((rider) => rider.id !== state.raceAce);
  const supportCount = supportRiders.length;
  const supportCapableCount = selected.filter((rider) => rider.supportAptitude >= 75).length;
  const aceCount = selected.filter((rider) => rider.aceAptitude >= 75).length;
  const supportQuality = supportRiders.reduce((sum, rider) => sum + rider.supportAptitude, 0) / Math.max(1, supportRiders.length);
  const egoLoad = selected.reduce((sum, rider) => sum + rider.stats.ego, 0);
  const teamworkLoad = selected.reduce((sum, rider) => sum + rider.stats.teamwork, 0);
  const salaryTotal = selected.reduce((sum, rider) => sum + rider.creditSalary, 0);
  const creditRule = getSelectedCreditRule();
  const salaryCap = creditRule.cap;
  const salaryOver = Math.max(0, salaryTotal - salaryCap);
  const structureScore = supportQuality * 0.12 + teamworkLoad * 0.1 + Math.min(aceCount, 2) * 2 - egoLoad * 0.06;
  const penalty = Math.max(0, Math.max(0, 2 - aceCount) + Math.max(0, 6 - supportCapableCount) + Math.floor(Math.max(0, egoLoad - teamworkLoad) / 15) + Math.ceil(salaryOver / 3000));
  return { selected, supportCount, supportCapableCount, aceCount, egoLoad, teamworkLoad, salaryTotal, salaryCap, creditTierLabel: creditRule.label, salaryOver, structureScore, penalty };
}
function getSquadStructureBonus() {
  const balance = getSquadBalance();
  if (balance.selected.length === 0) return {};
  if (balance.penalty <= 0) {
    return { teamwork: Math.min(3, Math.floor(balance.supportCapableCount / 2)), technique: 1, stamina: 1, resistance: 1 };
  }
  return {
    teamwork: -balance.penalty * 3,
    technique: -balance.penalty,
    stamina: -balance.penalty,
    resistance: -balance.penalty,
  };
}

function getSquadStructureLabel() {
  const balance = getSquadBalance();
  if (balance.selected.length < 8) return `未完成 ${balance.selected.length}/8 / ${balance.salaryTotal}Cr`;
  if (balance.salaryOver > 0) return `年俸超過: +${balance.salaryOver}Cr`;
  if (balance.penalty > 0) return `適性不足: 連携-${balance.penalty}`;
  if (balance.aceCount >= 2 && balance.supportCapableCount >= 6) return `二軸バランス編成: ${balance.salaryTotal}/${balance.salaryCap}Cr`;
  return `標準カード編成: ${balance.salaryTotal}/${balance.salaryCap}Cr`;
}
function getRiderIdentityBonus() {
  const bonus = {};
  const add = (values, scale) => Object.entries(values || {}).forEach(([stat, value]) => {
    bonus[stat] = (bonus[stat] || 0) + value * scale;
  });
  riders.filter((rider) => state.selectedTeam.includes(rider.id)).forEach((rider) => {
    const roleScale = rider.id === state.raceAce ? 1 : 0.15;
    add(archetypeStatBonuses[rider.primaryArchetype], 0.7 * roleScale);
    add(archetypeStatBonuses[rider.secondaryArchetype], 0.35 * roleScale);
    const versatile = passiveAbilities[rider.id]?.versatile;
    const tagScale = (versatile ? 0.55 : 0.3) * roleScale;
    rider.aptitudeTags.forEach((tag) => add(aptitudeTagStatBonuses[tag], tagScale));
  });
  return Object.fromEntries(Object.entries(bonus).map(([stat, value]) => [stat, Math.round(value)]));
}

function getFinalStats() {
  const support = getSupportBonus();
  const team = getTeamBonus();
  const equipment = getEquipmentBonus();
  const structure = getSquadStructureBonus();
  const identity = getRiderIdentityBonus();
  return Object.keys(baseStats).reduce((finalStats, stat) => {
    finalStats[stat] = clamp((team[stat] || 50) + (state.stats[stat] || 0) + (support[stat] || 0) + (equipment[stat] || 0) + (structure[stat] || 0) + (identity[stat] || 0), 50, 90);
    return finalStats;
  }, {});
}

function getSelectedStage() {
  return stages.find((stage) => stage.id === state.selectedStage);
}

function getSelectedCreditRule() {
  const stage = getSelectedStage();
  return creditCapRules[stage?.creditTier] || creditCapRules.standard;
}

function calculatePower() {
  const finalStats = getFinalStats();
  const stage = getSelectedStage();
  const totalWeight = Object.values(stage.weights).reduce((sum, weight) => sum + weight, 0);
  const weightedPower = Object.entries(stage.weights).reduce((sum, [stat, weight]) => sum + finalStats[stat] * weight, 0);
  return Math.round((weightedPower / Math.max(1, totalWeight)) * 7);
}

function calculateWinRate() {
  const power = calculatePower();
  const opponentPower = getCpuPower(getSelectedStage());
  return clamp(Math.round(50 + (power - opponentPower) / 8), 8, 92);
}

function getRaceDistance(stage) {
  if (stage.type === "個人TT") return 40;
  if (stage.type === "チームTT") return 50;
  if (stage.format === "ワンデーレース") return 200;
  return stage.type === "山岳" ? 180 : 200;
}

function getDeckActionCard(defaultCard) {
  if (state.selectedActionCards.includes(defaultCard.id)) return defaultCard;
  const fallbackOrder = {
    position: ["protect", "tempo"],
    tempo: ["position", "protect"],
    attack: ["sprint", "tempo"],
    protect: ["position", "tempo"],
    sprint: ["attack", "tempo"],
    feed: ["protect", "tempo"],
    descent: ["position", "protect"],
  };
  const fallbackId = (fallbackOrder[defaultCard.id] || []).find((id) => state.selectedActionCards.includes(id));
  return actionCards.find((card) => card.id === fallbackId) || actionCards.find((card) => state.selectedActionCards.includes(card.id)) || defaultCard;
}
function getSectorKeyPoints(stage, distance) {
  const points = new Map();
  const add = (km, phase, card, priority = 1) => {
    const normalized = clamp(Math.round(km), 0, distance);
    const existing = points.get(normalized);
    if (!existing || priority >= existing.priority) {
      points.set(normalized, { km: normalized, phase, card: getDeckActionCard(card), priority });
    }
  };

  add(0, "スタート直後の位置取り", actionCards[0], 3);
  add(distance * 0.18, "序盤の隊列形成", actionCards[0], 2);
  add(distance * 0.38, stage.condition.includes("横風") ? "横風区間前" : "中間ポイント前", stage.condition.includes("横風") ? actionCards[0] : actionCards[1], 3);
  add(distance * 0.55, "補給地点", actionCards[5], 4);
  add(distance * 0.72, "勝負所前", stage.type === "山岳" || stage.type === "丘陵" ? actionCards[2] : actionCards[3], 3);
  add(distance * 0.88, "残り局面の隊列再編", actionCards[3], 2);
  add(distance, "フィニッシュ", stage.type.includes("TT") ? actionCards[1] : actionCards[4], 3);

  if (stage.type === "山岳") {
    add(distance * 0.58, "山岳入口", actionCards[3], 4);
    add(distance * 0.76, "山岳中腹アタック地点", actionCards[2], 4);
    add(distance * 0.84, "峠越え後の高速下り", actionCards[6], 5);
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
  const base = stage.difficulty * 1.38;
  const formatBonus = stage.format === "ワンデーレース" ? 12 : 18;
  const conditionBonus = stage.condition.includes("石畳") || stage.condition.includes("グラベル") ? 16 : 10;
  return Math.round(base + formatBonus + conditionBonus);
}

function updateRaceMetrics(metrics, sector, stage, stats, passiveEffects, activeAbility) {
  const distance = Math.max(0, sector.kmTo - sector.km);
  const terrainLoad = stage.type === "山岳" ? 0.9 : stage.type === "丘陵" ? 0.45 : 0.1;
  const surfaceLoad = stage.condition.includes("石畳") || stage.condition.includes("グラベル") ? 0.5 : 0;
  const surfaceSkill = stage.condition.includes("石畳")
    ? stats.pave * 0.7 + stats.bikeControl * 0.3
    : stats.bikeControl;
  const windLoad = stage.condition.includes("風") ? 0.35 : 0;
  const isDescent = sector.card.id === "descent" || sector.phase.includes("下り");
  const draftingRelief = clamp((stats.teamwork - 70) / 260, 0, 0.28);
  const enduranceRelief = clamp(stats.stamina / 900, 0.04, 0.18);
  const resistanceRelief = clamp((stats.resistance - 60) / 100, 0, 0.25);
  const notes = [];

  const passiveFatigueRate = passiveEffects.fatigueRate
    + passiveEffects.mountainFatigueRate
    + passiveEffects.windFatigueRate
    + (sector.card.id === "tempo" ? passiveEffects.tempoFatigueRate : 0);
  const highIntensityShare = ["attack", "sprint"].includes(sector.card.id) ? resistanceRelief : resistanceRelief * 0.35;
  const fatigueGain = (distance * 0.22 + sector.card.fatigue + terrainLoad + surfaceLoad + windLoad)
    * (1 - draftingRelief - enduranceRelief - highIntensityShare)
    * clamp(1 + passiveFatigueRate, 0.55, 1.25);
  metrics.fatigue = clamp(metrics.fatigue + fatigueGain, 0, 100);
  metrics.nutrition = clamp(metrics.nutrition - distance * 0.17 - sector.card.fuelCost - terrainLoad * 0.25, 0, 100);
  metrics.sprint = clamp(metrics.sprint - sector.card.sprintCost * clamp(1 + passiveEffects.sprintCostRate, 0.55, 1.2), 0, 100);

  const metabolicStress = ((sector.card.lactateCost || 0) + terrainLoad * (sector.card.id === "attack" ? 4 : 1.4)) * (1 - resistanceRelief);
  const stressMultiplier = clamp(1 + metrics.fatigue / 180 + Math.max(0, 50 - metrics.nutrition) / 100, 0.85, 1.75);
  metrics.lactate = clamp(metrics.lactate + metabolicStress * stressMultiplier, 0, 100);

  const recoveryActions = ["position", "tempo", "protect", "feed", "descent"];
  if (recoveryActions.includes(sector.card.id)) {
    const recoveryCapacity = clamp(stats.recovery / 18, 2.5, 9);
    const actionRecovery = sector.card.id === "feed" ? 1.35 : sector.card.id === "tempo" ? 1.15 : sector.card.id === "descent" ? 1.1 : sector.card.id === "protect" ? 1.05 : 0.9;
    const conditionRecovery = clamp((metrics.nutrition / 100) * (metrics.health / 100), 0.3, 1);
    const lactateBeforeRecovery = metrics.lactate;
    const lactateRecovery = Math.min(lactateBeforeRecovery, recoveryCapacity * actionRecovery * conditionRecovery);
    metrics.lactate = clamp(metrics.lactate - lactateRecovery, 0, 100);
    const sprintRecovery = recoveryCapacity * 0.55 * conditionRecovery * clamp(1 - metrics.lactate / 100, 0.15, 1);
    metrics.sprint = clamp(metrics.sprint + sprintRecovery, 0, 100);
    if (lactateRecovery >= 4) notes.push("回復力で乳酸負荷-" + Math.round(lactateRecovery) + " / スプリント+" + Math.round(sprintRecovery));
  }
  const healthWear = (distance * 0.012 + surfaceLoad * (1 - clamp(surfaceSkill / 180, 0, 0.85)) * 0.45 + Math.max(0, metrics.fatigue - 60) * 0.006)
    * clamp(1 + passiveEffects.healthWearRate, 0.55, 1.2);
  metrics.health = clamp(metrics.health - healthWear, 0, 100);

  if (["tempo", "protect", "feed"].includes(sector.card.id) && metrics.nutrition >= 50) {
    metrics.sprint = clamp(metrics.sprint + 2.5 + draftingRelief * 8, 0, 100);
  }

  if (sector.card.id === "feed") {
    const hasNutritionSupport = state.selectedSupports.includes("nutrition");
    const feedQuality = 21 + (hasNutritionSupport ? 9 : 0) + passiveEffects.feedBonus + clamp((stats.teamwork + stats.technique - 150) / 12, 0, 7);
    metrics.nutrition = clamp(metrics.nutrition + feedQuality, 0, 100);
    metrics.health = clamp(metrics.health + 1.5, 0, 100);
    metrics.feeds += 1;
    notes.push(`補給成功 +${Math.round(feedQuality)}（糖質・水分）`);
  }

  if (metrics.nutrition < 35) {
    const bonkDamage = (35 - metrics.nutrition) * 0.08;
    metrics.fatigue = clamp(metrics.fatigue + bonkDamage, 0, 100);
    metrics.health = clamp(metrics.health - bonkDamage * 0.45, 0, 100);
    notes.push("補給不足でハンガーノック域");
  }

  if (metrics.fatigue > 78) {
    metrics.health = clamp(metrics.health - (metrics.fatigue - 78) * 0.035, 0, 100);
  }

  if (surfaceLoad > 0 && surfaceSkill < 85) {
    metrics.health = clamp(metrics.health - 0.5, 0, 100);
    notes.push("バイクコントロール不足で悪路消耗");
  }

  let incidentPenalty = 0;
  if (isDescent) {
    const crashRisk = clamp(18 - surfaceSkill * 0.11 + metrics.fatigue * 0.07 + Math.max(0, 100 - metrics.health) * 0.03, 1, 22);
    if (Math.random() * 100 < crashRisk) {
      metrics.health = clamp(metrics.health - 12, 0, 100);
      metrics.fatigue = clamp(metrics.fatigue + 8, 0, 100);
      metrics.crashes += 1;
      incidentPenalty = 16;
      notes.push("下りで落車。健康度-12 / 疲労+8");
    } else {
      notes.push("バイクコントロールで下りを攻略（落車リスク " + Math.round(crashRisk) + "%）");
    }
  }

  let activeBonus = 0;
  if (!metrics.activeUsed && shouldTriggerActiveAbility(activeAbility, sector)) {
    applyActiveAbility(metrics, activeAbility);
    activeBonus = activeAbility.phaseBonus || 0;
    notes.push(`アクティブ「${activeAbility.name}」発動`);
  }

  return { notes, activeBonus, incidentPenalty };
}

function calculatePhaseScore(stats, sector, stage, metrics, passiveEffects, activeBonus = 0) {
  const focusScore = sector.card.focus.reduce((sum, stat) => sum + (stats[stat] || 0), 0) / sector.card.focus.length;
  const stageWeightTotal = Object.values(stage.weights).reduce((sum, weight) => sum + weight, 0);
  const stageScore = Object.entries(stage.weights).reduce((sum, [stat, weight]) => sum + (stats[stat] || 0) * weight, 0) / Math.max(1, stageWeightTotal);
  const fatiguePenalty = metrics.fatigue * (sector.card.id === "sprint" ? 0.24 : 0.17);
  const nutritionPenalty = Math.max(0, 45 - metrics.nutrition) * 0.42;
  const healthPenalty = Math.max(0, 100 - metrics.health) * 0.22;
  const lactateSprintFactor = clamp(1 - metrics.lactate / 140, 0.35, 1);
  const sprintBonus = sector.card.id === "sprint" ? metrics.sprint * 0.18 * lactateSprintFactor : 0;
  const lactatePenaltyRate = sector.card.id === "sprint" ? 0.18 : sector.card.id === "attack" ? 0.12 : 0.04;
  const lactatePenalty = metrics.lactate * lactatePenaltyRate;
  const descentBonus = sector.card.id === "descent" ? stats.bikeControl * 0.16 : 0;
  const variance = Math.random() * 12;
  const abilityBonus = passiveEffects.phaseBonus + (sector.card.id === "sprint" ? passiveEffects.finishBonus : 0) + activeBonus;
  return Math.round(focusScore * 0.65 + stageScore * 0.35 + sprintBonus + descentBonus + abilityBonus - fatiguePenalty - nutritionPenalty - healthPenalty - lactatePenalty + variance);
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
      const width = clamp(Math.round(((value - 50) / 40) * 100), 4, 100);
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

function renderActionDeck() {
  const node = document.querySelector("#actionCardDeck");
  node.innerHTML = actionCards
    .map(
      (card) => `
        <button class="choice-button ${state.selectedActionCards.includes(card.id) ? "selected" : ""}" type="button" data-action-card="${card.id}">
          <strong>${card.name}</strong>
          <span>疲労 ${card.fatigue} / SP ${card.sprintCost} / 乳酸 ${card.lactateCost}</span>
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
          <div class="card-meta"><strong>${rider.name}</strong><span>${rider.primaryArchetype} / ${rider.secondaryArchetype}</span></div>
          <span>タグ: ${rider.aptitudeTags.join(" / ")}</span>
          <span>SP${rider.stats.sprint} / 加速${rider.stats.acceleration} / 登坂${rider.stats.climb} / 巡航${rider.stats.cruise} / 持久${rider.stats.stamina} / パヴェ${rider.stats.pave} / 日間${rider.stats.dailyRecovery}</span>
          <span class="rider-record">${rider.paveBasis}</span>
          <span>A${rider.aceAptitude} / S${rider.supportAptitude} / P: ${passiveAbilities[rider.id]?.name || "なし"}</span>
        </button>
      `;
    })
    .join("");
  document.querySelector("#teamCount").textContent = state.selectedTeam.length;
}

function getRaceRole(riderId) {
  if (!state.selectedTeam.includes(riderId)) return "候補";
  if (state.raceAce === riderId) return "エース";
  const rider = riders.find((item) => item.id === riderId);
  return rider?.preferredRoles[0] || "平坦アシスト";
}

function getBestStat(stats) {
  const [stat] = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
  return statLabels[stat];
}

function renderUcrOrganization() {
  const node = document.querySelector("#ucrSummary");
  if (!node) return;
  node.innerHTML = ucrOrganization.rankings
    .map(
      (ranking) => `
        <article class="world-team-card ucr-ranking-card">
          <div class="card-meta"><strong>${ranking.label}</strong><span>${ranking.value}</span></div>
          <p>${ranking.detail}</p>
        </article>
      `,
    )
    .join("");
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
  const ruleNode = document.querySelector("#scoutRules");
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
    ruleNode.innerHTML = scoutRules.map((rule) => `<li>${rule}</li>`).join("");
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
function renderAbilities() {
  const passiveNode = document.querySelector("#passiveAbilitySummary");
  const activeNode = document.querySelector("#activeAbilityList");
  const stage = getSelectedStage();
  const passiveEffects = getTeamPassiveEffects(stage);

  if (passiveNode) {
    passiveNode.innerHTML = `
      <div><span>自動発動パッシブ</span><strong>${passiveEffects.labels.join(" / ") || "なし"}</strong></div>
      <small>編成、エース、コース条件に応じて疲労・補給・健康度・終盤出力を補正</small>
    `;
  }

  if (activeNode) {
    activeNode.innerHTML = activeAbilities
      .map((ability) => {
        const selected = ability.id === state.selectedActiveAbility;
        return `
          <button class="ability-button ${selected ? "selected" : ""}" type="button" data-active-ability="${ability.id}">
            <strong>${ability.name}</strong>
            <span>${ability.detail}</span>
          </button>
        `;
      })
      .join("");
  }
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
          <small>Credit枠: ${creditCapRules[stage.creditTier].label} ${creditCapRules[stage.creditTier].cap.toLocaleString("ja-JP")} Cr</small>
        </button>
      `;
    })
    .join("");
}

function renderRaceSummary() {
  const stage = getSelectedStage();
  const stageRaceLabel = stage.format === "ステージレース" ? ` / Day ${state.stageRaceDay + 1} / 日間回復${getFinalStats().dailyRecovery}` : "";
  document.querySelector("#seasonWeek").textContent = `${state.selectedActionCards.length} / 7`;
  document.querySelector("#teamPower").textContent = calculatePower();
  document.querySelector("#winRate").textContent = `${calculateWinRate()}%`;
  document.querySelector("#tacticLabel").textContent = `${stage.tactic} / ${getSquadStructureLabel()}${stageRaceLabel}`;
}

function renderRaceCondition() {
  const node = document.querySelector("#raceCondition");
  if (!node) return;
  node.innerHTML = Object.entries(raceMetricLabels)
    .map(([key, config]) => {
      const value = Math.round(state.raceMetrics[key]);
      const quality = config.goodWhenHigh ? value : 100 - value;
      const level = quality >= 70 ? "good" : quality >= 40 ? "warn" : "danger";
      return `
        <div class="condition-card ${level}">
          <div class="condition-heading"><span>${config.label}</span><strong>${value}</strong></div>
          <div class="condition-bar"><span style="width:${value}%"></span></div>
          <small>${config.detail}</small>
        </div>
      `;
    })
    .join("");
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

function toggleActionCard(id) {
  if (state.selectedActionCards.includes(id)) {
    if (state.selectedActionCards.length <= 3) {
      state.log.unshift("戦術カードは最低3枚必要。");
    } else {
      state.selectedActionCards = state.selectedActionCards.filter((item) => item !== id);
    }
  } else if (state.selectedActionCards.length < 5) {
    state.selectedActionCards.push(id);
  } else {
    state.log.unshift("戦術デッキは5枚まで。別カードを外してから選択。");
  }
  refreshRacePreview();
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
    state.log.unshift("エースはチーム内の選手から指名する。");
    render();
    return;
  }
  state.raceAce = id;
  const rider = riders.find((item) => item.id === id);
  state.log.unshift(`${rider.name}をこの日のエースに指名。ほかの選手は各自の役割・戦術特性を担当する。`);
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
  const metrics = getRaceStartMetrics(stage);
  const passiveEffects = getTeamPassiveEffects(stage);
  const activeAbility = getSelectedActiveAbility();
  let momentum = (playerBasePower - cpuBasePower) * 0.18 + (ace ? (ace.stats.fighting + ace.stats.acceleration) * 0.04 - Math.max(0, ace.stats.ego - ace.stats.teamwork) * 0.15 : 0);
  const sectorLogs = [];

  sectors.forEach((sector) => {
    const conditionUpdate = updateRaceMetrics(metrics, sector, stage, finalStats, passiveEffects, activeAbility);
    const playerScore = calculatePhaseScore(finalStats, sector, stage, metrics, passiveEffects, conditionUpdate.activeBonus - conditionUpdate.incidentPenalty) + momentum * 0.04;
    const cpuScore = cpuBasePower / 7 + Math.random() * 18;
    const diff = Math.round(playerScore - cpuScore);
    momentum += diff * 0.35;
    const conditionText = `疲労${Math.round(metrics.fatigue)} / SP${Math.round(metrics.sprint)} / 補給${Math.round(metrics.nutrition)} / 健康${Math.round(metrics.health)} / 乳酸負荷${Math.round(metrics.lactate)}`;
    const noteText = conditionUpdate.notes.length ? ` ${conditionUpdate.notes.join("。")}。` : "";
    sectorLogs.push(
      `${sector.index}. ${sector.km}km地点 ${sector.phase}${sector.isKeyPoint ? " *" : ""}: こちらは${sector.card.name}、${battleModes[state.battleMode].label}は${sector.card.cpuAction}。${getPhaseResultText(diff)}。${conditionText}。${noteText}次は${sector.kmTo}km地点。`,
    );
  });

  const finalCondition = (100 - metrics.fatigue) * 0.18 + metrics.sprint * 0.12 + metrics.nutrition * 0.08 + metrics.health * 0.12;
  const winRate = clamp(Math.round(32 + momentum / Math.max(8, sectors.length * 0.6) + finalCondition * 0.45), 5, 95);
  const roll = Math.floor(Math.random() * 100) + 1;
  const result = roll <= winRate ? "勝利" : "敗北";
  const detail =
    result === "勝利"
      ? "セクターごとのカード選択で脚と位置取りを残し、勝負所を取り切った。"
      : "セクターのどこかで主導権を失い、最後の局面で届かなかった。";
  let stageDayText = "";
  let recoveryText = "";
  if (stage.format === "ステージレース") {
    const overnight = calculateNextDayRecovery(metrics, finalStats.dailyRecovery);
    state.stageRaceDay += 1;
    state.stageRaceCarryover = overnight.metrics;
    stageDayText = ` / Day ${state.stageRaceDay}`;
    recoveryText = ` 翌日回復（日間回復力${finalStats.dailyRecovery}）: 疲労-${overnight.amounts.fatigue}、SP+${overnight.amounts.sprint}、補給+${overnight.amounts.nutrition}、健康+${overnight.amounts.health}、乳酸負荷-${overnight.amounts.lactate}。翌日開始: 疲労${Math.round(overnight.metrics.fatigue)}、SP${Math.round(overnight.metrics.sprint)}、補給${Math.round(overnight.metrics.nutrition)}、健康${Math.round(overnight.metrics.health)}、乳酸負荷${Math.round(overnight.metrics.lactate)}。`;
  } else {
    state.stageRaceDay = 0;
    state.stageRaceCarryover = null;
  }

  state.log.unshift(
    `${stage.name} [${stage.format} / ${stage.type} / ${stage.condition}${stageDayText}]: ${result}。エース ${ace ? ace.name : "未指名"} / ${getSquadStructureLabel()} / ${getRaceDistance(stage)}km / ${sectors.length}セクター / 戦力${playerBasePower} / ${battleModes[state.battleMode].label}${cpuBasePower} / 判定${roll} / 勝率${winRate}%。最終状態: 疲労${Math.round(metrics.fatigue)}、スプリント${Math.round(metrics.sprint)}、補給${Math.round(metrics.nutrition)}、健康度${Math.round(metrics.health)}、乳酸負荷${Math.round(metrics.lactate)}、補給回数${metrics.feeds}、落車${metrics.crashes}回。パッシブ: ${passiveEffects.labels.join("・") || "なし"}。アクティブ: ${metrics.activeUsed ? metrics.activeName : `${activeAbility.name}（不発）`}。${detail}${recoveryText}`,
    ...sectorLogs.reverse(),
  );
  state.raceMetrics = metrics;
  render();
}

function resetGame() {

  state.stats = { ...baseStats };
  state.selectedActionCards = ["position", "tempo", "attack", "protect", "sprint"];
  state.selectedSupports = ["coach", "domestique"];
  state.selectedTeam = ["ace", "leadout", "climber", "rouleur", "captain", "mountain_domestique", "road_guard", "wind_captain"];
  state.selectedEquipment = { frame: "allround_race", wheel: "pave_guard", tire: "pave_endure" };
  state.raceAce = "ace";
  state.selectedStage = "roubaix_one_day";
  state.battleMode = "cpu";
  state.selectedActiveAbility = "protect_ace";
  state.raceMetrics = createInitialRaceMetrics();
  state.stageRaceDay = 0;
  state.stageRaceCarryover = null;
  state.log = ["カード編成を初期化。能力値の育成・レベル上げ・限界突破は行わない。"];
  render();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const actionCardButton = event.target.closest("[data-action-card]");
    const supportButton = event.target.closest("[data-support]");
    const riderButton = event.target.closest("[data-rider]");
    const stageButton = event.target.closest("[data-stage]");
    const objectiveButton = event.target.closest("[data-objective]");
    const activeAbilityButton = event.target.closest("[data-active-ability]");

    if (activeAbilityButton) {
      state.selectedActiveAbility = activeAbilityButton.dataset.activeAbility;
      refreshRacePreview();
      render();
      return;
    }

    if (objectiveButton) {
      state.teamObjective = objectiveButton.dataset.objective;
      renderGrandTourPlan();
      return;
    }

    if (actionCardButton) toggleActionCard(actionCardButton.dataset.actionCard);
    if (supportButton) toggleSupport(supportButton.dataset.support);
    if (riderButton && event.detail >= 2) setRaceAce(riderButton.dataset.rider);
    else if (riderButton) toggleRider(riderButton.dataset.rider);
    if (stageButton) {
      const previousStage = getSelectedStage();
      const nextStage = stages.find((stage) => stage.id === stageButton.dataset.stage);
      const continuesStageRace = previousStage?.format === "ステージレース" && nextStage?.format === "ステージレース" && state.stageRaceCarryover;
      state.selectedStage = stageButton.dataset.stage;
      if (continuesStageRace) {
        state.raceMetrics = { ...state.stageRaceCarryover };
      } else {
        state.stageRaceDay = 0;
        state.stageRaceCarryover = null;
        state.raceMetrics = createInitialRaceMetrics();
      }
      render();
    }
  });

  document.querySelector("#raceBtn").addEventListener("click", runRace);
  document.querySelector("#resetBtn").addEventListener("click", resetGame);
}

function render() {
  renderStats();
  renderActionDeck();
  renderSupportDeck();
  renderTeamList();
  renderUcrOrganization();
  renderGrandTourPlan();
  renderEquipment();
  renderWearDesign();
  renderMonetization();
  renderWorldTeams();
  renderAbilities();
  renderStages();
  renderRaceSummary();
  renderRaceCondition();
  renderLog();
  renderCourse();
}

bindEvents();
render();
