# 実在選手300名 全パラメーター

> 300名全員を固定値として管理する正本閲覧用Markdownです。架空選手は含みません。通常選手の全能力は50〜85。Tadej Pogacarのみ特別Tierとして上限88です。パヴェの成績確認状態は能力値の固定状態とは分離します。

## パラメーター15種類

| キー | 表示名 | 特徴 | ゲームへの影響 | 主な根拠 |
|---|---|---|---|---|
| sprint | スプリント | 5〜20秒の最高速 | ゴールスプリント、最高速維持 | スプリント勝利・ポイント賞・脚質 |
| acceleration | 加速力 | 速度変化の鋭さ | アタック開始、位置取り、再加速 | 脚質・スプリント/パンチ特性 |
| punch | パンチ力 | 30秒〜5分の高出力 | 短坂、丘陵アタック、集団からの飛び出し | 丘陵脚質・リエージュ/ロンド実績 |
| cruise | 巡航力 | 数分以上の高速維持 | 平坦牽引、逃げ、個人TT、チームTT | TT・ルーラー脚質・GT実績 |
| climb | 登坂力 | 長い登りでの速度 | 山岳、総合争い、山岳牽引 | 総合・山岳実績、クライマー脚質 |
| stamina | 持久力 | 長距離を走り切る容量 | 距離による疲労増加を軽減 | 長距離クラシック・GT実績 |
| resistance | 耐性 | 高強度を繰り返す力 | アタック・スプリント時の疲労と乳酸を軽減 | 脚質、反復勝負、長期実績 |
| technique | 技術 | 位置取り・判断・走行効率 | 隊列、補給、TT、トラブル回避 | 脚質・適性タグ・アシスト適性 |
| bikeControl | バイクコントロール | コーナー・下り・悪路の操作 | 下り速度、落車・悪路消耗を軽減 | 下り・悪路・複合競技特性 |
| pave | パヴェ | 石畳を速く安全に走る専門能力 | 石畳出力とトラブル耐性。グラベルとは分離 | パリ〜ルーベを主基準、ロンド優勝実績を副基準 |
| recovery | 回復力 | レース中の短時間回復 | 乳酸低下、SP回復、反復アタック | 脚質・ステージ実績・回復特性 |
| dailyRecovery | 日間回復力 | ステージ間の一晩の回復 | 翌日の疲労・SP・健康・乳酸開始値 | GT総合・長期安定性・適性タグ |
| teamwork | チームワーク | 役割遂行と連携 | 牽引、エース保護、補給、隊列維持 | アシスト適性・役割特性 |
| ego | エゴ | 自分で勝負したがる強さ | チームワーク超過分だけ編成リスク | エース適性とアシスト適性の差 |
| fighting | 負けん気 | 苦しい局面で勝負を続ける力 | 終盤、逃げ、悪条件、接戦 | 勝利実績・脚質・戦術特性 |

- 選手数: 300名
- 世界選手権表彰台実績あり: 68名
- 固定能力値: 4500個
- パヴェ成績照合済・手動検証済: 109名
- パヴェ出走確認待ち: 191名

## 役割・戦術特性

旧「得意役割」「専門役割」を単一カテゴリーへ統合。実装は preferred_roles を正本とし、specialist_role は互換用空欄。

| No. | カテゴリー | 役割名 | ロードレース上の意味 | ゲーム内効果 | 参照能力 | 実戦用語・英語 |
|---:|---|---|---|---|---|---|
| 1 | 指揮・勝利 | エース | チームが最優先で勝利を狙う中心選手。 | 支援を集中でき、終盤の勝負指示とチーム戦術の基準になる。 | ace_aptitude、course_fit、recovery | Team leader / GC leader |
| 2 | 指揮・勝利 | サブエース | エースに次ぐ第二の勝利候補。 | エースの不調や脱落時に第二の勝利プランへ移行する。 | ace_aptitude、recovery、fighting | Co-leader / Backup leader |
| 3 | 指揮・勝利 | ロードキャプテン | 隊列、追走、補給、危険回避の判断をまとめる現場指揮役。 | 味方の位置取りと戦術判断を安定させる。 | teamwork、technique、recovery | Road captain |
| 4 | 指揮・勝利 | スーパー・ドメスティーク | エース級の能力で勝利候補を最後まで支える最上位アシスト。 | 高強度牽引と長時間護衛を終盤まで維持する。 | support_aptitude、stamina、recovery、teamwork | Super-domestique |
| 5 | 指揮・勝利 | ステージハンター | 総合順位より自分に合う特定ステージの勝利を狙う。 | コース適性が合う日の攻撃成功率を高める。 | course_fit、fighting、recovery | Stage hunter |
| 6 | 指揮・勝利 | 山岳賞ハンター | 山岳ポイントを積み上げ山岳賞を狙う。 | 山岳逃げと山頂通過争いを強化する。 | climb、acceleration、stamina、recovery | KOM hunter / Climber |
| 7 | 指揮・勝利 | TTスペシャリスト | 個人タイムトライアルで高い巡航速度を維持する。 | 単独走の速度効率とペース配分を高める。 | cruise、technique、stamina | Time-trialist |
| 8 | スプリント | リードアウト | スプリンターを好位置まで運び最後に加速させる。 | 味方スプリンターの位置取りと加速移行を補助する。 | acceleration、sprint、cruise、teamwork | Lead-out rider |
| 9 | スプリント | 最終発射台 | ゴール前200〜500mで最後の牽引を行う。 | 風よけを最後まで維持し発射タイミングを最適化する。 | acceleration、sprint、technique、teamwork | Final lead-out |
| 10 | スプリント | スプリントトレイン | 複数人の高速隊列でスプリンターを前方へ運ぶ。 | 終盤の隊列維持と速度の受け渡しを安定させる。 | cruise、acceleration、sprint、teamwork | Sprint train |
| 11 | 牽引・保護 | 平坦アシスト | 平坦路で補給、風よけ、位置取りを担当する。 | エースの消耗と集団内トラブルを軽減する。 | cruise、stamina、teamwork | Domestique |
| 12 | 牽引・保護 | 平坦ペースメーカー | 平坦路で一定の高速ペースを長く刻む。 | 逃げとの差と集団速度を安定させる。 | cruise、stamina、recovery | Pace-setter / Rouleur |
| 13 | 牽引・保護 | 山岳アシスト | 登りでエースの風よけ、補給、ペース維持を行う。 | エースの登坂時消耗を抑え孤立を遅らせる。 | climb、stamina、recovery、teamwork | Climbing domestique |
| 14 | 牽引・保護 | 山岳番手 | 山岳終盤までエースのそばに残る最後の山岳アシスト。 | 山頂付近の攻撃対応と最終発射を支援する。 | climb、acceleration、stamina、recovery | Last mountain domestique |
| 15 | 牽引・保護 | 山岳ペースメーカー | 登りで高い一定ペースを刻みライバルの余力を削る。 | 集団を絞り込み急なアタックを抑制する。 | climb、stamina、cruise | Mountain pace-setter |
| 16 | 牽引・保護 | TT牽引 | 空力姿勢で高速巡航し平坦の先頭交代を担う。 | 高速隊列の平均速度を引き上げる。 | cruise、stamina、technique | TT puller / Rouleur |
| 17 | 牽引・保護 | 石畳護衛 | 石畳区間でエースを前方に置きトラブル損失を抑える。 | パヴェ進入時の位置取りとトラブル耐性を補助する。 | pave、fighting、technique、cruise | Cobbled classics protector |
| 18 | 牽引・保護 | 下り牽引 | 下りで速いラインを示し味方を集団へ導く。 | 下り速度と隊列安定性を高める。 | bikeControl、technique、fighting | Descending guide |
| 19 | 牽引・保護 | 集団コントローラー | 逃げとの差や集団速度を調整し展開を管理する。 | 追走強度とタイムギャップを安定させる。 | cruise、stamina、teamwork | Peloton controller |
| 20 | 牽引・保護 | ブレイクアウェイキラー | 逃げ集団を長時間追いゴール前までに吸収する。 | 逃げとのタイム差を効率よく削る。 | cruise、stamina、teamwork | Breakaway killer / Chaser |
| 21 | 牽引・保護 | 横風要員 | 横風区間でエースを守り分断されない位置へ運ぶ。 | 横風消耗と集団分断リスクを軽減する。 | cruise、fighting、technique、teamwork | Crosswind domestique |
| 22 | 牽引・保護 | トラブル復帰牽引 | パンクなどで遅れたエースを集団へ連れ戻す。 | 復帰速度を上げエースの消耗を抑える。 | cruise、stamina、teamwork | Chase-back domestique |
| 23 | 攻撃・逃げ | 逃げ屋 | 序盤から逃げ集団へ入り先行して勝利や露出を狙う。 | 逃げ参加、先頭交代、逃げ残り判断を強化する。 | stamina、cruise、fighting、recovery | Baroudeur / Breakaway specialist |
| 24 | 攻撃・逃げ | 超ロングスパート | 残り80〜100km級から単独または少人数で仕掛ける。 | 長距離単独走の維持力と攻撃判断を強化する。 | cruise、stamina、fighting、recovery | Long-range attacker / Solo raid |
| 25 | 攻撃・逃げ | ブリッジャー | 集団と先頭グループの間を一気に埋める。 | 短時間の高出力で前方グループへ合流しやすくする。 | acceleration、cruise、stamina、fighting | Bridger / Bridge the gap |
| 26 | 攻撃・逃げ | カウンターアタッカー | 他選手の攻撃が止まった直後の隙に反撃する。 | 攻撃直後の成功判定を強化する。 | acceleration、punch、technique、fighting | Counter-attacker |
| 27 | 攻撃・逃げ | サテライトライダー | 先に逃げへ入り後から追いつくエースを前方で待つ。 | 合流後に補給、牽引、風よけを提供する。 | climb、stamina、recovery、teamwork | Satellite rider |
| 28 | 攻撃・逃げ | 横風分断 | 横風区間でエシュロンを作り集団を意図的に分断する。 | ライバルを後方集団へ落とす成功率を高める。 | cruise、fighting、technique、teamwork | Echelon specialist |
| 29 | 駆け引き・位置取り | 無賃乗車 | 他チームのトレインや車輪を利用し先頭交代を抑える。 | スタミナを節約する一方で協調への貢献は下がる。 | technique、fighting、ego | Wheel-sucker / Sit-on |
| 30 | 駆け引き・位置取り | ポジションキーパー | 重要区間の手前から集団前方の位置を維持する。 | 渋滞、落車、分断に巻き込まれる確率を下げる。 | technique、acceleration、fighting | Positioning specialist |

## 世界選手権実績の反映

- 世界選手権エリート男子ロードは、金3・銀2・銅1の実績点を3段階化し、持久力・耐性・技術・負けん気へ補正する。
- 世界選手権エリート男子個人TTは、同じ実績点を巡航力・持久力・耐性・技術へ補正する。
- 2025年大会までの表彰台を対象とし、補正後に300名順位上限を適用する。

## 85希少化ルール

- 例外: Tadej Pogacarのみ特別Tier。エース適性100、Credit 20,000、主要能力上限88。
- 85は各能力最大2名、1選手最大2項目。世界選手権実績補正後の値を候補とする。
- 同点は関連能力、エース／アシスト適性、Creditで順位付けする。
- パヴェは順位正規化せず、パリ〜ルーベを主基準とし、ロンド優勝は1勝+1・2勝+2・3勝以上+3を加点し、最低保証76・78・80も適用して300名全員を再計算する。

## ゲーム内二つ名

- Credit 10,000以上、またはCredit未満でも世界選手権ロード／個人TT・パリ〜ルーベ優勝者に付与する。
- 史実上の正式な異名一覧ではなく、脚質と実績を短く表現したゲーム内演出名。

| No. | 選手名 | 二つ名 | 付与区分 | 根拠 |
|---:|---|---|---|---|
| 1 | Tadej Pogacar | 新時代の皇帝 | Credit 10,000以上 | Credit 20,000／総合型／パンチャー／世界ロード金2 |
| 2 | Miguel Indurain | 静かなる大機関 | Credit 10,000以上 | Credit 13,000／総合型／クライマー／世界ITT金1 |
| 3 | Chris Froome | 高地の計算王 | Credit 10,000以上 | Credit 13,000／総合型／クライマー |
| 4 | Alberto Contador | 山岳の射手 | Credit 10,000以上 | Credit 13,000／総合型／クライマー |
| 5 | Roberto Heras | 赤き山岳王 | Credit 10,000以上 | Credit 12,000／総合型／クライマー |
| 6 | Vincenzo Nibali | 海峡の鮫 | Credit 10,000以上 | Credit 12,000／総合型／クライマー |
| 7 | Jonas Vingegaard | 北海の山岳王 | Credit 10,000以上 | Credit 12,000／総合型／クライマー |
| 8 | Mathieu van der Poel | 虹色の暴君 | Credit 10,000以上 | Credit 13,000／クラシック型／パンチャー／世界ロード金1／パリ〜ルーベ優勝3 |
| 10 | Jan Ullrich | ドイツの巨砲 | Credit 10,000以上 | Credit 12,000／総合型／クライマー／世界ITT金2 |
| 11 | Alessandro Petacchi | アドリアの超特急 | Credit 10,000以上 | Credit 11,000／スプリンター／クラシック型 |
| 12 | Denis Menchov | 沈黙の総合屋 | Credit 10,000以上 | Credit 10,800／総合型／TT・ルーラー型 |
| 13 | Alex Zulle | スイスのクロノ砲 | Credit 10,000以上 | Credit 10,800／総合型／TT・ルーラー型／世界ITT金1 |
| 14 | Gilberto Simoni | ジロの山鷲 | Credit 10,000以上 | Credit 10,800／総合型／クライマー |
| 15 | Simon Yates | 赤き山岳の切り札 | Credit 10,000以上 | Credit 10,800／総合型／クライマー |
| 16 | Ivan Basso | 静かなる山岳貴公子 | Credit 10,000以上 | Credit 10,800／総合型／クライマー |
| 17 | Marco Pantani | 山岳の海賊 | Credit 10,000以上 | Credit 10,800／クライマー／パンチャー |
| 19 | Mario Cipollini | 伊達男の獅子 | Credit 10,000以上 | Credit 11,000／スプリンター／クラシック型／世界ロード金1 |
| 20 | Mark Cavendish | 最速の島風 | Credit 10,000以上 | Credit 11,000／スプリンター／クラシック型／世界ロード金1 |
| 21 | Mads Pedersen | 北欧の暴風 | Credit 10,000以上 | Credit 10,000／クラシック型／スプリンター／世界ロード金1 |
| 22 | Remco Evenepoel | 弾丸の天才 | 著名実績枠 | Credit 9,800／総合型／TT・ルーラー型／世界ロード金1／世界ITT金3 |
| 27 | Fabian Cancellara | クロノの剣闘士 | Credit 10,000以上 | Credit 12,000／クラシック型／TT・ルーラー型／世界ITT金4／パリ〜ルーベ優勝3 |
| 28 | Michele Bartoli | トスカーナの獅子 | Credit 10,000以上 | Credit 11,000／パンチャー／クライマー |
| 29 | Peter Sagan | 虹のショーマン | Credit 10,000以上 | Credit 10,500／クラシック型／スプリンター／世界ロード金3／パリ〜ルーベ優勝1 |
| 35 | Primoz Roglic | 不屈の跳躍者 | Credit 10,000以上 | Credit 12,500／総合型／パンチャー |
| 36 | Erik Zabel | ベルリンの鷹 | Credit 10,000以上 | Credit 10,500／クラシック型／パンチャー |
| 37 | Cadel Evans | 豪州の不屈王 | Credit 10,000以上 | Credit 10,000／パンチャー／クライマー／世界ロード金1 |
| 38 | Wout van Aert | 万能の銀弾 | 著名実績枠 | Credit 9,800／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 41 | Julian Alaphilippe | 虹色の踊り子 | 著名実績枠 | Credit 8,200／パンチャー／クライマー／世界ロード金2 |
| 42 | Paolo Bettini | 黄金のコオロギ | Credit 10,000以上 | Credit 11,000／パンチャー／クライマー／世界ロード金2 |
| 51 | Tom Boonen | 石畳の竜巻 | Credit 10,000以上 | Credit 12,000／クラシック型／パンチャー／世界ロード金1／パリ〜ルーベ優勝4 |
| 52 | Alejandro Valverde | 不沈の緑弾 | Credit 10,000以上 | Credit 10,500／パンチャー／クライマー／世界ロード金1 |
| 53 | Maurizio Fondriest | 虹の伊達男 | 著名実績枠 | Credit 9,300／パンチャー／クライマー／世界ロード金1 |
| 55 | Franco Ballerini | ルーベの紳士 | 著名実績枠 | Credit 8,500／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝2 |
| 58 | Chris Boardman | クロノの教授 | 著名実績枠 | Credit 8,200／TT・ルーラー型／クラシック型／世界ITT金1 |
| 66 | Rui Costa | 雨中の世界王者 | 著名実績枠 | Credit 7,600／パンチャー／総合型／世界ロード金1 |
| 70 | Johan Museeuw | フランドルの獅子 | Credit 10,000以上 | Credit 11,500／クラシック型／パンチャー／世界ロード金1／パリ〜ルーベ優勝3 |
| 71 | Philippe Gilbert | アルデンヌの王 | Credit 10,000以上 | Credit 11,000／パンチャー／クライマー／世界ロード金1／パリ〜ルーベ優勝1 |
| 72 | Laurent Jalabert | 変幻のクラシック王 | Credit 10,000以上 | Credit 10,500／クラシック型／パンチャー／世界ITT金1 |
| 73 | Andrea Tafi | 石畳の剣闘士 | 著名実績枠 | Credit 9,500／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 74 | Niki Terpstra | 北海の逃亡者 | 著名実績枠 | Credit 8,500／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 76 | Filippo Ganna | 蒼きトップギア | 著名実績枠 | Credit 8,500／TT・ルーラー型／クラシック型／世界ITT金2 |
| 78 | Thor Hushovd | 北欧の雷神 | 著名実績枠 | Credit 8,500／スプリンター／クラシック型／世界ロード金1 |
| 79 | Tom Dumoulin | 低地のクロノバタフライ | 著名実績枠 | Credit 8,500／総合型／TT・ルーラー型／世界ITT金1 |
| 92 | Egan Bernal | アンデスの若き王 | Credit 10,000以上 | Credit 10,800／総合型／クライマー |
| 93 | Andrei Tchmil | 北方の鉄人 | 著名実績枠 | Credit 9,500／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 94 | Oscar Freire | 虹のスナイパー | 著名実績枠 | Credit 9,500／スプリンター／クラシック型／世界ロード金3 |
| 96 | Tony Martin | クロノの装甲車 | 著名実績枠 | Credit 8,800／TT・ルーラー型／クラシック型／世界ITT金4 |
| 103 | Johan Vansummeren | 石畳の長槍 | 著名実績枠 | Credit 7,200／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 111 | Peter Van Petegem | フランドルの黒豹 | 著名実績枠 | Credit 9,500／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 114 | Bradley Wiggins | 英国のクロノ騎士 | 著名実績枠 | Credit 9,000／TT・ルーラー型／総合型／世界ITT金1 |
| 123 | Servais Knaven | ルーベの脱走者 | 著名実績枠 | Credit 7,000／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 133 | Rohan Dennis | 豪州の時計砕き | 著名実績枠 | Credit 9,400／TT・ルーラー型／総合型／世界ITT金2 |
| 139 | Magnus Backstedt | 北欧の巨人 | 著名実績枠 | Credit 6,800／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 140 | Sonny Colbrelli | 泥雨の王 | 著名実績枠 | Credit 6,800／クラシック型／スプリンター／パリ〜ルーベ優勝1 |
| 158 | John Degenkolb | 石畳の重戦車 | Credit 10,000以上 | Credit 10,000／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 164 | Nairo Quintana | アンデスの鷹 | Credit 10,000以上 | Credit 10,800／クライマー／パンチャー |
| 165 | Michal Kwiatkowski | ポーランドの虹 | 著名実績枠 | Credit 6,200／クライマー／総合型／世界ロード金1 |
| 173 | Greg Van Avermaet | 黄金のクラシックハンター | 著名実績枠 | Credit 5,500／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 234 | Tobias Foss | 北欧のクロノ王 | 著名実績枠 | Credit 5,600／TT・ルーラー型／総合型／世界ITT金1 |
| 252 | Vasil Kiryienka | 鉄壁のクロノ職人 | 著名実績枠 | Credit 4,700／TT・ルーラー型／総合型／世界ITT金1 |
| 270 | Stuart O'Grady | 豪州の石畳魂 | 著名実績枠 | Credit 5,300／TT・ルーラー型／クラシック型／パリ〜ルーベ優勝1 |
| 281 | Michael Rogers | 三冠のクロノマン | 著名実績枠 | Credit 6,350／クラシック型／TT・ルーラー型／世界ITT金3 |
| 282 | Alessandro Ballan | 虹を掴んだ石畳屋 | 著名実績枠 | Credit 5,450／クラシック型／TT・ルーラー型／世界ロード金1 |
| 292 | Mathew Hayman | 石畳の伏兵 | 著名実績枠 | Credit 5,000／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |

## 勝負・走行能力

| No. | 選手名 | スプリント | 加速力 | パンチ力 | 巡航力 | 登坂力 |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Tadej Pogacar | 66 | 80 | 85 | 82 | 88 |
| 2 | Miguel Indurain | 58 | 74 | 77 | 78 | 85 |
| 3 | Chris Froome | 58 | 74 | 77 | 78 | 84 |
| 4 | Alberto Contador | 58 | 74 | 77 | 77 | 84 |
| 5 | Roberto Heras | 59 | 74 | 77 | 77 | 83 |
| 6 | Vincenzo Nibali | 59 | 74 | 79 | 77 | 83 |
| 7 | Jonas Vingegaard | 58 | 74 | 77 | 77 | 83 |
| 8 | Mathieu van der Poel | 80 | 80 | 81 | 79 | 68 |
| 9 | Andre Greipel | 82 | 82 | 72 | 76 | 57 |
| 10 | Jan Ullrich | 58 | 74 | 77 | 79 | 84 |
| 11 | Alessandro Petacchi | 84 | 83 | 72 | 76 | 57 |
| 12 | Denis Menchov | 62 | 73 | 74 | 80 | 83 |
| 13 | Alex Zulle | 61 | 73 | 74 | 81 | 80 |
| 14 | Gilberto Simoni | 59 | 74 | 77 | 77 | 83 |
| 15 | Simon Yates | 58 | 74 | 77 | 77 | 83 |
| 16 | Ivan Basso | 58 | 74 | 77 | 77 | 83 |
| 17 | Marco Pantani | 57 | 81 | 81 | 68 | 80 |
| 18 | Jasper Philipsen | 83 | 83 | 73 | 77 | 58 |
| 19 | Mario Cipollini | 84 | 83 | 72 | 76 | 57 |
| 20 | Mark Cavendish | 84 | 83 | 68 | 77 | 55 |
| 21 | Mads Pedersen | 82 | 81 | 78 | 79 | 64 |
| 22 | Remco Evenepoel | 61 | 73 | 76 | 83 | 82 |
| 23 | Robbie McEwen | 82 | 82 | 72 | 76 | 57 |
| 24 | Jonathan Milan | 82 | 81 | 71 | 78 | 59 |
| 25 | Andy Schleck | 59 | 78 | 80 | 71 | 81 |
| 26 | Paul Seixas | 62 | 76 | 80 | 77 | 80 |
| 27 | Fabian Cancellara | 75 | 77 | 81 | 85 | 67 |
| 28 | Michele Bartoli | 68 | 80 | 82 | 73 | 80 |
| 29 | Peter Sagan | 81 | 82 | 81 | 78 | 74 |
| 30 | Joaquim Rodriguez | 69 | 80 | 82 | 73 | 79 |
| 31 | Joao Almeida | 61 | 73 | 74 | 79 | 79 |
| 32 | Marcel Kittel | 82 | 81 | 72 | 76 | 57 |
| 33 | Olav Kooij | 82 | 81 | 71 | 77 | 59 |
| 34 | Isaac del Toro | 62 | 76 | 80 | 77 | 80 |
| 35 | Primoz Roglic | 64 | 76 | 79 | 79 | 84 |
| 36 | Erik Zabel | 81 | 81 | 81 | 79 | 68 |
| 37 | Cadel Evans | 69 | 80 | 82 | 74 | 79 |
| 38 | Wout van Aert | 80 | 81 | 81 | 85 | 69 |
| 39 | Juan Ayuso | 62 | 76 | 80 | 77 | 80 |
| 40 | Carlos Sastre | 59 | 78 | 79 | 71 | 82 |
| 41 | Julian Alaphilippe | 69 | 80 | 82 | 73 | 79 |
| 42 | Paolo Bettini | 71 | 80 | 82 | 73 | 80 |
| 43 | Djamolidine Abdoujaparov | 83 | 83 | 73 | 77 | 58 |
| 44 | Simon Gerrans | 69 | 80 | 82 | 73 | 79 |
| 45 | Tom Pidcock | 75 | 80 | 81 | 79 | 68 |
| 46 | Romain Bardet | 59 | 78 | 79 | 70 | 80 |
| 47 | Arnaud Demare | 83 | 82 | 73 | 77 | 58 |
| 48 | Arnaud De Lie | 77 | 85 | 82 | 76 | 72 |
| 49 | Kaden Groves | 83 | 82 | 73 | 77 | 58 |
| 50 | Fabio Jakobsen | 82 | 82 | 73 | 77 | 58 |
| 51 | Tom Boonen | 76 | 80 | 81 | 79 | 68 |
| 52 | Alejandro Valverde | 72 | 80 | 82 | 74 | 80 |
| 53 | Maurizio Fondriest | 69 | 80 | 82 | 73 | 79 |
| 54 | Stijn Devolder | 74 | 77 | 80 | 83 | 67 |
| 55 | Franco Ballerini | 74 | 77 | 78 | 82 | 67 |
| 56 | Chris Horner | 58 | 74 | 77 | 77 | 82 |
| 57 | Carlos Rodriguez | 58 | 74 | 77 | 76 | 81 |
| 58 | Chris Boardman | 69 | 73 | 71 | 84 | 69 |
| 59 | Thibaut Pinot | 59 | 78 | 80 | 70 | 81 |
| 60 | Tom Steels | 83 | 82 | 73 | 77 | 58 |
| 61 | Aleksandr Vlasov | 58 | 74 | 77 | 77 | 81 |
| 62 | Andreas Kloden | 61 | 73 | 74 | 79 | 79 |
| 63 | Alberto Bettiol | 75 | 80 | 81 | 79 | 68 |
| 64 | Marc Hirschi | 74 | 82 | 84 | 76 | 75 |
| 65 | Tim Wellens | 74 | 82 | 85 | 77 | 75 |
| 66 | Rui Costa | 70 | 81 | 83 | 76 | 78 |
| 67 | Mattias Skjelmose | 70 | 81 | 83 | 77 | 78 |
| 68 | Dylan Groenewegen | 82 | 82 | 73 | 77 | 58 |
| 69 | Pascal Ackermann | 82 | 81 | 71 | 78 | 59 |
| 70 | Johan Museeuw | 75 | 80 | 81 | 79 | 68 |
| 71 | Philippe Gilbert | 68 | 80 | 82 | 73 | 79 |
| 72 | Laurent Jalabert | 80 | 80 | 81 | 79 | 73 |
| 73 | Andrea Tafi | 74 | 77 | 80 | 82 | 68 |
| 74 | Niki Terpstra | 74 | 77 | 79 | 82 | 67 |
| 75 | Alexander Kristoff | 81 | 80 | 79 | 79 | 64 |
| 76 | Filippo Ganna | 69 | 73 | 71 | 84 | 69 |
| 77 | Danilo Di Luca | 70 | 81 | 84 | 77 | 79 |
| 78 | Thor Hushovd | 83 | 83 | 73 | 77 | 58 |
| 79 | Tom Dumoulin | 61 | 73 | 74 | 82 | 79 |
| 80 | Davide Rebellin | 68 | 80 | 82 | 73 | 79 |
| 81 | Rigoberto Uran | 58 | 74 | 77 | 76 | 81 |
| 82 | Levi Leipheimer | 61 | 73 | 74 | 79 | 79 |
| 83 | Nick Nuyens | 75 | 80 | 81 | 79 | 68 |
| 84 | Dylan Teuns | 69 | 81 | 83 | 74 | 79 |
| 85 | Michael Woods | 69 | 81 | 83 | 74 | 79 |
| 86 | Maxim Van Gils | 69 | 81 | 83 | 74 | 79 |
| 87 | Warren Barguil | 60 | 78 | 80 | 72 | 81 |
| 88 | Esteban Chaves | 60 | 78 | 81 | 71 | 80 |
| 89 | Nacer Bouhanni | 84 | 83 | 74 | 76 | 61 |
| 90 | Juan Sebastian Molano | 82 | 81 | 71 | 78 | 59 |
| 91 | Elia Viviani | 82 | 81 | 71 | 77 | 59 |
| 92 | Egan Bernal | 58 | 74 | 77 | 77 | 83 |
| 93 | Andrei Tchmil | 75 | 77 | 79 | 82 | 67 |
| 94 | Oscar Freire | 83 | 83 | 73 | 77 | 58 |
| 95 | Biniam Girmay | 80 | 85 | 76 | 76 | 61 |
| 96 | Tony Martin | 69 | 73 | 71 | 84 | 69 |
| 97 | Jakob Fuglsang | 70 | 81 | 83 | 76 | 79 |
| 98 | Evgeni Berzin | 61 | 73 | 75 | 79 | 80 |
| 99 | Jai Hindley | 58 | 74 | 77 | 77 | 82 |
| 100 | Fabio Aru | 58 | 74 | 77 | 77 | 82 |
| 101 | Sam Bennett | 83 | 82 | 73 | 77 | 58 |
| 102 | Florian Lipowitz | 58 | 74 | 77 | 76 | 81 |
| 103 | Johan Vansummeren | 74 | 77 | 78 | 82 | 67 |
| 104 | Jasper Stuyven | 79 | 79 | 78 | 79 | 64 |
| 105 | Tiesj Benoot | 75 | 80 | 81 | 79 | 68 |
| 106 | Romain Gregoire | 77 | 84 | 82 | 76 | 72 |
| 107 | David Gaudu | 57 | 75 | 78 | 71 | 81 |
| 108 | Lenny Martinez | 60 | 78 | 81 | 71 | 80 |
| 109 | Tyler Farrar | 82 | 82 | 73 | 77 | 58 |
| 110 | Fernando Gaviria | 82 | 81 | 71 | 77 | 59 |
| 111 | Peter Van Petegem | 75 | 80 | 82 | 79 | 68 |
| 112 | Damiano Cunego | 69 | 81 | 84 | 75 | 82 |
| 113 | Claudio Chiappucci | 61 | 78 | 79 | 70 | 82 |
| 114 | Bradley Wiggins | 65 | 71 | 71 | 83 | 74 |
| 115 | Luis Leon Sanchez | 69 | 73 | 71 | 82 | 70 |
| 116 | Daniel Martin | 69 | 81 | 83 | 74 | 79 |
| 117 | Giulio Ciccone | 60 | 78 | 80 | 71 | 82 |
| 118 | Pavel Tonkov | 58 | 74 | 77 | 77 | 82 |
| 119 | Caleb Ewan | 85 | 84 | 74 | 76 | 61 |
| 120 | Daniele Bennati | 83 | 82 | 73 | 77 | 58 |
| 121 | Samuel Sanchez | 62 | 76 | 80 | 77 | 79 |
| 122 | Antonio Tiberi | 61 | 73 | 74 | 79 | 79 |
| 123 | Servais Knaven | 74 | 77 | 78 | 82 | 67 |
| 124 | Matej Mohoric | 76 | 79 | 81 | 79 | 68 |
| 125 | Filippo Pozzato | 81 | 80 | 78 | 79 | 64 |
| 126 | Pello Bilbao | 70 | 81 | 82 | 76 | 78 |
| 127 | Valentin Madouas | 74 | 81 | 84 | 76 | 75 |
| 128 | Ben Healy | 69 | 81 | 83 | 75 | 79 |
| 129 | Michael Rasmussen | 57 | 75 | 78 | 72 | 82 |
| 130 | Felix Gall | 57 | 75 | 78 | 71 | 81 |
| 131 | Jordi Meeus | 82 | 82 | 73 | 77 | 58 |
| 132 | Tim Merlier | 82 | 82 | 73 | 77 | 58 |
| 133 | Rohan Dennis | 65 | 71 | 71 | 83 | 73 |
| 134 | Oscar Pereiro | 61 | 73 | 74 | 80 | 79 |
| 135 | Ryder Hesjedal | 61 | 73 | 74 | 79 | 79 |
| 136 | Enric Mas | 58 | 74 | 77 | 76 | 81 |
| 137 | Thomas De Gendt | 68 | 72 | 70 | 81 | 69 |
| 138 | Steffen Wesemann | 74 | 77 | 79 | 79 | 67 |
| 139 | Magnus Backstedt | 74 | 77 | 78 | 79 | 67 |
| 140 | Sonny Colbrelli | 80 | 80 | 78 | 78 | 64 |
| 141 | Jhonatan Narvaez | 76 | 83 | 85 | 77 | 75 |
| 142 | Oscar Onley | 69 | 81 | 83 | 74 | 79 |
| 143 | Benoit Cosnefroy | 77 | 84 | 81 | 76 | 72 |
| 144 | Michael Albasini | 77 | 84 | 81 | 76 | 72 |
| 145 | Jose Rujano | 60 | 78 | 80 | 71 | 81 |
| 146 | Richard Virenque | 59 | 78 | 79 | 70 | 82 |
| 147 | Guillaume Martin | 57 | 75 | 78 | 72 | 82 |
| 148 | Iban Mayo | 60 | 78 | 81 | 71 | 80 |
| 149 | Giulio Pellizzari | 57 | 75 | 78 | 71 | 81 |
| 150 | Soren Waerenskjold | 73 | 75 | 69 | 80 | 67 |
| 151 | Richard Carapaz | 57 | 73 | 76 | 76 | 83 |
| 152 | Joshua Tarling | 69 | 73 | 71 | 83 | 69 |
| 153 | Derek Gee | 65 | 71 | 71 | 81 | 73 |
| 154 | Stefan Bissegger | 69 | 73 | 71 | 83 | 69 |
| 155 | Gustav Erik Larsson | 69 | 73 | 71 | 83 | 69 |
| 156 | Victor Campenaerts | 69 | 73 | 71 | 83 | 69 |
| 157 | David Zabriskie | 65 | 71 | 71 | 82 | 73 |
| 158 | John Degenkolb | 77 | 80 | 81 | 79 | 68 |
| 159 | Tobias Ludvigsson | 65 | 71 | 71 | 82 | 73 |
| 160 | Jose Azevedo | 65 | 71 | 71 | 81 | 73 |
| 161 | Wout Poels | 57 | 75 | 79 | 71 | 81 |
| 162 | Sepp Kuss | 57 | 76 | 77 | 75 | 79 |
| 163 | Richie Porte | 57 | 75 | 78 | 71 | 81 |
| 164 | Nairo Quintana | 59 | 78 | 79 | 72 | 82 |
| 165 | Michal Kwiatkowski | 58 | 75 | 78 | 71 | 82 |
| 166 | Daniel Oss | 74 | 79 | 80 | 78 | 67 |
| 167 | Laurens De Plus | 56 | 74 | 77 | 70 | 81 |
| 168 | Jens Keukeleire | 74 | 79 | 80 | 78 | 67 |
| 169 | Mark Renshaw | 78 | 80 | 69 | 78 | 58 |
| 170 | Rafal Majka | 56 | 74 | 77 | 70 | 82 |
| 171 | Luke Plapp | 64 | 70 | 70 | 80 | 72 |
| 172 | Heinrich Haussler | 74 | 79 | 80 | 78 | 67 |
| 173 | Greg Van Avermaet | 75 | 79 | 80 | 78 | 67 |
| 174 | Aime De Gendt | 74 | 79 | 80 | 78 | 67 |
| 175 | Adam Yates | 56 | 74 | 77 | 70 | 81 |
| 176 | Sebastian Langeveld | 74 | 79 | 80 | 78 | 67 |
| 177 | Zdenek Stybar | 74 | 79 | 80 | 78 | 67 |
| 178 | Amund Grondahl Jansen | 74 | 79 | 80 | 78 | 67 |
| 179 | Stijn Vandenbergh | 74 | 79 | 80 | 78 | 67 |
| 180 | Mike Teunissen | 81 | 80 | 70 | 78 | 58 |
| 181 | Damiano Caruso | 56 | 74 | 77 | 70 | 81 |
| 182 | Kanstantsin Siutsou | 64 | 70 | 70 | 80 | 72 |
| 183 | Carlos Verona | 56 | 74 | 77 | 70 | 81 |
| 184 | Taco van der Hoorn | 74 | 79 | 80 | 78 | 67 |
| 185 | Haimar Zubeldia | 56 | 74 | 77 | 70 | 80 |
| 186 | Sergio Henao | 56 | 74 | 77 | 70 | 80 |
| 187 | Leif Hoste | 74 | 79 | 80 | 78 | 67 |
| 188 | Maarten Wynants | 74 | 79 | 80 | 78 | 67 |
| 189 | Santiago Buitrago | 56 | 74 | 77 | 70 | 81 |
| 190 | Wilco Kelderman | 56 | 74 | 77 | 70 | 81 |
| 191 | Bob Jungels | 64 | 70 | 71 | 80 | 73 |
| 192 | Marco Haller | 74 | 79 | 80 | 78 | 67 |
| 193 | Boy van Poppel | 81 | 79 | 70 | 78 | 58 |
| 194 | Roman Kreuziger | 56 | 74 | 77 | 70 | 80 |
| 195 | Lawson Craddock | 64 | 70 | 70 | 80 | 72 |
| 196 | Daniel Navarro | 56 | 74 | 77 | 70 | 80 |
| 197 | Jonathan Castroviejo | 64 | 70 | 70 | 81 | 72 |
| 198 | Sep Vanmarcke | 74 | 79 | 80 | 78 | 67 |
| 199 | Davide Ballerini | 81 | 79 | 70 | 77 | 58 |
| 200 | Jacopo Guarnieri | 81 | 79 | 70 | 77 | 58 |
| 201 | Chad Haga | 64 | 70 | 70 | 80 | 72 |
| 202 | Thymen Arensman | 56 | 74 | 77 | 70 | 80 |
| 203 | Luka Mezgec | 81 | 80 | 70 | 78 | 58 |
| 204 | Danny van Poppel | 81 | 80 | 70 | 78 | 58 |
| 205 | Domenico Pozzovivo | 56 | 74 | 77 | 70 | 80 |
| 206 | Cameron Wurf | 64 | 70 | 70 | 80 | 72 |
| 207 | Jose Luis Rubiera | 56 | 74 | 77 | 70 | 80 |
| 208 | Lars Boom | 74 | 79 | 80 | 78 | 67 |
| 209 | Simone Consonni | 81 | 79 | 70 | 78 | 58 |
| 210 | Fabio Sabatini | 81 | 79 | 70 | 78 | 58 |
| 211 | Remi Cavagna | 64 | 70 | 70 | 80 | 72 |
| 212 | Pavel Sivakov | 56 | 74 | 77 | 70 | 80 |
| 213 | Winner Anacona | 56 | 74 | 77 | 70 | 80 |
| 214 | Florian Vermeersch | 74 | 79 | 80 | 78 | 67 |
| 215 | Roger Kluge | 81 | 79 | 70 | 77 | 58 |
| 216 | Ben O'Connor | 56 | 74 | 77 | 70 | 81 |
| 217 | Tao Geoghegan Hart | 56 | 74 | 77 | 71 | 81 |
| 218 | Michael Matthews | 65 | 70 | 70 | 82 | 72 |
| 219 | Bert Van Lerberghe | 81 | 79 | 70 | 78 | 58 |
| 220 | Maximiliano Richeze | 81 | 79 | 70 | 78 | 58 |
| 221 | Brandon McNulty | 56 | 74 | 77 | 70 | 80 |
| 222 | Magnus Sheffield | 64 | 70 | 70 | 80 | 72 |
| 223 | Andrey Amador | 56 | 74 | 77 | 70 | 80 |
| 224 | Nikias Arndt | 81 | 79 | 70 | 77 | 58 |
| 225 | Pierre Rolland | 56 | 74 | 77 | 71 | 80 |
| 226 | Robert Gesink | 56 | 74 | 77 | 70 | 80 |
| 227 | Frederik Frison | 74 | 79 | 80 | 78 | 67 |
| 228 | Jasper De Buyst | 80 | 79 | 70 | 77 | 58 |
| 229 | Edward Theuns | 81 | 80 | 70 | 78 | 58 |
| 230 | Eros Poli | 68 | 72 | 70 | 81 | 68 |
| 231 | Iljo Keisse | 81 | 79 | 70 | 78 | 58 |
| 232 | Nils Politt | 68 | 72 | 70 | 81 | 68 |
| 233 | Marc Soler | 56 | 74 | 77 | 70 | 80 |
| 234 | Tobias Foss | 64 | 70 | 70 | 81 | 72 |
| 235 | Maarten Tjallingii | 68 | 72 | 70 | 81 | 68 |
| 236 | Mikel Nieve | 56 | 74 | 77 | 70 | 81 |
| 237 | Roy Curvers | 81 | 79 | 70 | 77 | 58 |
| 238 | Yves Lampaert | 68 | 72 | 70 | 81 | 68 |
| 239 | Igor Anton | 56 | 74 | 77 | 70 | 80 |
| 240 | Nelson Oliveira | 64 | 70 | 70 | 80 | 72 |
| 241 | Tanel Kangert | 56 | 74 | 77 | 70 | 80 |
| 242 | Gert Steegmans | 80 | 79 | 70 | 77 | 58 |
| 243 | Rein Taaramae | 56 | 74 | 77 | 70 | 80 |
| 244 | Alex Dowsett | 64 | 70 | 70 | 80 | 72 |
| 245 | Michael Morkov | 81 | 80 | 70 | 78 | 58 |
| 246 | Tim Declercq | 61 | 66 | 65 | 80 | 67 |
| 247 | Edoardo Affini | 64 | 70 | 70 | 81 | 72 |
| 248 | Jos van Emden | 68 | 72 | 70 | 81 | 68 |
| 249 | Ramon Sinkeldam | 81 | 79 | 70 | 78 | 58 |
| 250 | Stefan Kung | 68 | 72 | 70 | 82 | 68 |
| 251 | Jan Tratnik | 64 | 70 | 70 | 80 | 72 |
| 252 | Vasil Kiryienka | 64 | 70 | 70 | 82 | 72 |
| 253 | Salvatore Puccio | 68 | 72 | 70 | 81 | 68 |
| 254 | Jurgen Roelandts | 81 | 79 | 70 | 77 | 58 |
| 255 | Viatcheslav Ekimov | 68 | 72 | 70 | 81 | 68 |
| 256 | Greg Henderson | 81 | 79 | 70 | 77 | 58 |
| 257 | Jan Barta | 64 | 70 | 70 | 80 | 72 |
| 258 | Mikel Landa | 56 | 74 | 77 | 70 | 81 |
| 259 | Matthew Goss | 81 | 80 | 70 | 78 | 58 |
| 260 | Maciej Bodnar | 68 | 72 | 70 | 81 | 68 |
| 261 | Dylan van Baarle | 68 | 72 | 70 | 82 | 68 |
| 262 | Jack Bauer | 68 | 72 | 70 | 81 | 68 |
| 263 | Michael Hepburn | 68 | 72 | 70 | 81 | 68 |
| 264 | Dries Devenyns | 68 | 72 | 70 | 80 | 68 |
| 265 | Christophe Laporte | 80 | 79 | 70 | 78 | 58 |
| 266 | Brent Bookwalter | 64 | 70 | 70 | 80 | 72 |
| 267 | Mikkel Bjerg | 68 | 72 | 70 | 80 | 68 |
| 268 | Daryl Impey | 73 | 76 | 77 | 80 | 66 |
| 269 | Nathan Van Hooydonck | 68 | 72 | 70 | 81 | 68 |
| 270 | Stuart O'Grady | 68 | 72 | 70 | 81 | 68 |
| 271 | Matteo Trentin | 68 | 72 | 70 | 82 | 68 |
| 272 | Tejay van Garderen | 64 | 70 | 70 | 80 | 72 |
| 273 | Vegard Stake Laengen | 68 | 72 | 70 | 80 | 68 |
| 274 | Ian Stannard | 68 | 72 | 70 | 80 | 68 |
| 275 | Jens Voigt | 68 | 72 | 70 | 81 | 68 |
| 276 | Luke Durbridge | 68 | 72 | 70 | 81 | 68 |
| 277 | Lars Bak | 68 | 72 | 70 | 81 | 68 |
| 278 | Kasper Asgreen | 68 | 72 | 71 | 81 | 68 |
| 279 | Marcus Burghardt | 68 | 72 | 70 | 80 | 68 |
| 280 | Manuel Quinziato | 73 | 76 | 77 | 80 | 66 |
| 281 | Michael Rogers | 73 | 76 | 77 | 83 | 66 |
| 282 | Alessandro Ballan | 73 | 76 | 78 | 80 | 66 |
| 283 | Bernhard Eisel | 73 | 76 | 77 | 79 | 66 |
| 284 | Christian Vande Velde | 73 | 76 | 77 | 79 | 66 |
| 285 | Luke Rowe | 67 | 72 | 76 | 78 | 65 |
| 286 | Juan Antonio Flecha | 73 | 76 | 77 | 80 | 66 |
| 287 | George Hincapie | 73 | 76 | 77 | 79 | 66 |
| 288 | Bram Tankink | 73 | 76 | 77 | 79 | 66 |
| 289 | Matteo Tosatto | 68 | 72 | 70 | 80 | 68 |
| 290 | Luca Paolini | 73 | 76 | 77 | 80 | 66 |
| 291 | Yukiya Arashiro | 65 | 71 | 74 | 78 | 68 |
| 292 | Mathew Hayman | 73 | 76 | 77 | 79 | 66 |
| 293 | Fumiyuki Beppu | 66 | 70 | 72 | 78 | 70 |
| 294 | Simon Geschke | 73 | 76 | 77 | 79 | 66 |
| 295 | Sylvain Chavanel | 73 | 76 | 77 | 80 | 66 |
| 296 | Geraint Thomas | 73 | 76 | 77 | 81 | 67 |
| 297 | Gregory Rast | 73 | 76 | 77 | 79 | 66 |
| 298 | Nicolas Roche | 73 | 76 | 77 | 79 | 66 |
| 299 | Koen de Kort | 73 | 76 | 77 | 79 | 66 |
| 300 | David Millar | 73 | 76 | 77 | 84 | 66 |

## 持久・技術・路面能力

| No. | 選手名 | 持久力 | 耐性 | 技術 | バイクコントロール | パヴェ | パヴェ確認 |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Tadej Pogacar | 88 | 86 | 84 | 83 | 82 | 結果照合済 |
| 2 | Miguel Indurain | 81 | 81 | 77 | 77 | 50 | 要出走確認 |
| 3 | Chris Froome | 80 | 76 | 76 | 77 | 50 | 要出走確認 |
| 4 | Alberto Contador | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 5 | Roberto Heras | 81 | 79 | 76 | 77 | 50 | 要出走確認 |
| 6 | Vincenzo Nibali | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 7 | Jonas Vingegaard | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 8 | Mathieu van der Poel | 83 | 85 | 81 | 84 | 85 | 結果照合済 |
| 9 | Andre Greipel | 75 | 76 | 77 | 77 | 69 | 結果照合済 |
| 10 | Jan Ullrich | 81 | 79 | 76 | 77 | 50 | 要出走確認 |
| 11 | Alessandro Petacchi | 75 | 76 | 76 | 77 | 50 | 要出走確認 |
| 12 | Denis Menchov | 81 | 79 | 78 | 78 | 50 | 要出走確認 |
| 13 | Alex Zulle | 81 | 79 | 79 | 78 | 50 | 要出走確認 |
| 14 | Gilberto Simoni | 81 | 79 | 76 | 77 | 50 | 要出走確認 |
| 15 | Simon Yates | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 16 | Ivan Basso | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 17 | Marco Pantani | 78 | 81 | 76 | 80 | 50 | 手動検証済 |
| 18 | Jasper Philipsen | 76 | 75 | 80 | 77 | 50 | 要出走確認 |
| 19 | Mario Cipollini | 76 | 76 | 77 | 77 | 50 | 要出走確認 |
| 20 | Mark Cavendish | 75 | 76 | 83 | 74 | 69 | 手動検証済 |
| 21 | Mads Pedersen | 78 | 81 | 82 | 80 | 76 | 結果照合済 |
| 22 | Remco Evenepoel | 84 | 83 | 82 | 78 | 50 | 要出走確認 |
| 23 | Robbie McEwen | 75 | 76 | 77 | 77 | 50 | 要出走確認 |
| 24 | Jonathan Milan | 75 | 75 | 80 | 76 | 64 | 結果照合済 |
| 25 | Andy Schleck | 77 | 77 | 74 | 76 | 50 | 要出走確認 |
| 26 | Paul Seixas | 76 | 76 | 76 | 77 | 50 | 要出走確認 |
| 27 | Fabian Cancellara | 83 | 83 | 84 | 85 | 85 | 結果照合済 |
| 28 | Michele Bartoli | 78 | 76 | 76 | 78 | 76 | 要出走確認 |
| 29 | Peter Sagan | 84 | 84 | 84 | 83 | 85 | 手動検証済 |
| 30 | Joaquim Rodriguez | 79 | 79 | 76 | 78 | 50 | 要出走確認 |
| 31 | Joao Almeida | 77 | 76 | 78 | 77 | 50 | 要出走確認 |
| 32 | Marcel Kittel | 74 | 75 | 76 | 77 | 50 | 要出走確認 |
| 33 | Olav Kooij | 75 | 75 | 81 | 76 | 50 | 要出走確認 |
| 34 | Isaac del Toro | 76 | 76 | 76 | 77 | 50 | 要出走確認 |
| 35 | Primoz Roglic | 85 | 82 | 77 | 77 | 50 | 要出走確認 |
| 36 | Erik Zabel | 83 | 84 | 82 | 85 | 50 | 要出走確認 |
| 37 | Cadel Evans | 76 | 77 | 76 | 78 | 50 | 要出走確認 |
| 38 | Wout van Aert | 83 | 83 | 84 | 82 | 82 | 結果照合済 |
| 39 | Juan Ayuso | 76 | 76 | 76 | 77 | 50 | 要出走確認 |
| 40 | Carlos Sastre | 80 | 79 | 74 | 76 | 50 | 要出走確認 |
| 41 | Julian Alaphilippe | 79 | 79 | 76 | 78 | 50 | 要出走確認 |
| 42 | Paolo Bettini | 83 | 83 | 77 | 78 | 50 | 要出走確認 |
| 43 | Djamolidine Abdoujaparov | 75 | 76 | 77 | 77 | 50 | 要出走確認 |
| 44 | Simon Gerrans | 76 | 76 | 76 | 78 | 50 | 要出走確認 |
| 45 | Tom Pidcock | 78 | 80 | 81 | 83 | 50 | 要出走確認 |
| 46 | Romain Bardet | 79 | 81 | 75 | 76 | 50 | 要出走確認 |
| 47 | Arnaud Demare | 76 | 76 | 80 | 77 | 73 | 結果照合済 |
| 48 | Arnaud De Lie | 76 | 76 | 77 | 79 | 50 | 要出走確認 |
| 49 | Kaden Groves | 75 | 76 | 77 | 78 | 50 | 要出走確認 |
| 50 | Fabio Jakobsen | 75 | 75 | 79 | 77 | 50 | 要出走確認 |
| 51 | Tom Boonen | 83 | 85 | 81 | 83 | 85 | 結果照合済 |
| 52 | Alejandro Valverde | 80 | 81 | 77 | 78 | 50 | 要出走確認 |
| 53 | Maurizio Fondriest | 76 | 76 | 76 | 78 | 50 | 要出走確認 |
| 54 | Stijn Devolder | 82 | 82 | 82 | 84 | 78 | 要出走確認 |
| 55 | Franco Ballerini | 82 | 82 | 80 | 80 | 83 | 結果照合済 |
| 56 | Chris Horner | 78 | 76 | 76 | 76 | 50 | 要出走確認 |
| 57 | Carlos Rodriguez | 77 | 76 | 76 | 78 | 50 | 要出走確認 |
| 58 | Chris Boardman | 82 | 82 | 83 | 80 | 50 | 要出走確認 |
| 59 | Thibaut Pinot | 79 | 79 | 74 | 76 | 50 | 要出走確認 |
| 60 | Tom Steels | 75 | 75 | 80 | 77 | 50 | 要出走確認 |
| 61 | Aleksandr Vlasov | 78 | 77 | 76 | 77 | 50 | 要出走確認 |
| 62 | Andreas Kloden | 78 | 77 | 77 | 78 | 50 | 要出走確認 |
| 63 | Alberto Bettiol | 79 | 81 | 79 | 81 | 76 | 要出走確認 |
| 64 | Marc Hirschi | 77 | 80 | 81 | 83 | 50 | 要出走確認 |
| 65 | Tim Wellens | 76 | 77 | 78 | 80 | 50 | 要出走確認 |
| 66 | Rui Costa | 76 | 77 | 78 | 79 | 50 | 要出走確認 |
| 67 | Mattias Skjelmose | 76 | 76 | 78 | 79 | 50 | 要出走確認 |
| 68 | Dylan Groenewegen | 75 | 75 | 82 | 77 | 69 | 結果照合済 |
| 69 | Pascal Ackermann | 75 | 75 | 77 | 76 | 50 | 要出走確認 |
| 70 | Johan Museeuw | 83 | 84 | 81 | 83 | 85 | 結果照合済 |
| 71 | Philippe Gilbert | 78 | 76 | 76 | 78 | 83 | 結果照合済 |
| 72 | Laurent Jalabert | 83 | 83 | 82 | 84 | 50 | 要出走確認 |
| 73 | Andrea Tafi | 82 | 83 | 80 | 82 | 83 | 結果照合済 |
| 74 | Niki Terpstra | 82 | 82 | 80 | 82 | 83 | 結果照合済 |
| 75 | Alexander Kristoff | 81 | 81 | 82 | 80 | 77 | 結果照合済 |
| 76 | Filippo Ganna | 82 | 82 | 83 | 80 | 69 | 結果照合済 |
| 77 | Danilo Di Luca | 77 | 76 | 77 | 79 | 50 | 要出走確認 |
| 78 | Thor Hushovd | 76 | 76 | 79 | 77 | 73 | 結果照合済 |
| 79 | Tom Dumoulin | 81 | 79 | 80 | 78 | 50 | 要出走確認 |
| 80 | Davide Rebellin | 76 | 75 | 76 | 78 | 50 | 要出走確認 |
| 81 | Rigoberto Uran | 78 | 77 | 76 | 76 | 50 | 要出走確認 |
| 82 | Levi Leipheimer | 77 | 77 | 77 | 78 | 50 | 要出走確認 |
| 83 | Nick Nuyens | 79 | 81 | 79 | 81 | 76 | 要出走確認 |
| 84 | Dylan Teuns | 76 | 76 | 76 | 78 | 64 | 結果照合済 |
| 85 | Michael Woods | 76 | 77 | 77 | 79 | 50 | 要出走確認 |
| 86 | Maxim Van Gils | 76 | 76 | 76 | 78 | 50 | 要出走確認 |
| 87 | Warren Barguil | 77 | 77 | 75 | 77 | 50 | 要出走確認 |
| 88 | Esteban Chaves | 76 | 77 | 75 | 77 | 50 | 要出走確認 |
| 89 | Nacer Bouhanni | 75 | 75 | 77 | 76 | 50 | 要出走確認 |
| 90 | Juan Sebastian Molano | 75 | 75 | 80 | 76 | 50 | 要出走確認 |
| 91 | Elia Viviani | 75 | 75 | 80 | 76 | 50 | 要出走確認 |
| 92 | Egan Bernal | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 93 | Andrei Tchmil | 82 | 83 | 81 | 82 | 83 | 結果照合済 |
| 94 | Oscar Freire | 77 | 77 | 83 | 77 | 50 | 要出走確認 |
| 95 | Biniam Girmay | 75 | 75 | 77 | 76 | 50 | 要出走確認 |
| 96 | Tony Martin | 82 | 82 | 84 | 80 | 64 | 結果照合済 |
| 97 | Jakob Fuglsang | 76 | 77 | 77 | 79 | 50 | 要出走確認 |
| 98 | Evgeni Berzin | 79 | 78 | 78 | 78 | 50 | 要出走確認 |
| 99 | Jai Hindley | 79 | 78 | 76 | 76 | 50 | 要出走確認 |
| 100 | Fabio Aru | 80 | 76 | 76 | 76 | 50 | 要出走確認 |
| 101 | Sam Bennett | 75 | 75 | 80 | 77 | 64 | 結果照合済 |
| 102 | Florian Lipowitz | 77 | 76 | 76 | 76 | 50 | 要出走確認 |
| 103 | Johan Vansummeren | 82 | 82 | 80 | 80 | 82 | 結果照合済 |
| 104 | Jasper Stuyven | 77 | 77 | 80 | 80 | 82 | 結果照合済 |
| 105 | Tiesj Benoot | 78 | 80 | 79 | 80 | 64 | 結果照合済 |
| 106 | Romain Gregoire | 76 | 75 | 77 | 79 | 50 | 要出走確認 |
| 107 | David Gaudu | 80 | 80 | 75 | 76 | 50 | 要出走確認 |
| 108 | Lenny Martinez | 76 | 77 | 75 | 77 | 50 | 要出走確認 |
| 109 | Tyler Farrar | 75 | 75 | 80 | 77 | 64 | 結果照合済 |
| 110 | Fernando Gaviria | 75 | 75 | 80 | 76 | 50 | 要出走確認 |
| 111 | Peter Van Petegem | 82 | 83 | 81 | 83 | 84 | 結果照合済 |
| 112 | Damiano Cunego | 80 | 79 | 77 | 79 | 50 | 要出走確認 |
| 113 | Claudio Chiappucci | 83 | 83 | 75 | 76 | 50 | 要出走確認 |
| 114 | Bradley Wiggins | 84 | 82 | 82 | 78 | 76 | 結果照合済 |
| 115 | Luis Leon Sanchez | 81 | 81 | 80 | 80 | 50 | 要出走確認 |
| 116 | Daniel Martin | 76 | 76 | 76 | 78 | 50 | 要出走確認 |
| 117 | Giulio Ciccone | 79 | 79 | 75 | 77 | 50 | 要出走確認 |
| 118 | Pavel Tonkov | 79 | 78 | 76 | 76 | 50 | 要出走確認 |
| 119 | Caleb Ewan | 74 | 74 | 80 | 76 | 50 | 要出走確認 |
| 120 | Daniele Bennati | 75 | 76 | 80 | 77 | 50 | 要出走確認 |
| 121 | Samuel Sanchez | 77 | 77 | 77 | 79 | 50 | 要出走確認 |
| 122 | Antonio Tiberi | 77 | 76 | 77 | 77 | 50 | 要出走確認 |
| 123 | Servais Knaven | 82 | 82 | 80 | 80 | 82 | 結果照合済 |
| 124 | Matej Mohoric | 79 | 81 | 81 | 83 | 64 | 結果照合済 |
| 125 | Filippo Pozzato | 77 | 77 | 83 | 80 | 69 | 結果照合済 |
| 126 | Pello Bilbao | 76 | 76 | 78 | 80 | 50 | 要出走確認 |
| 127 | Valentin Madouas | 76 | 76 | 78 | 80 | 50 | 要出走確認 |
| 128 | Ben Healy | 76 | 77 | 77 | 79 | 50 | 要出走確認 |
| 129 | Michael Rasmussen | 81 | 79 | 75 | 76 | 50 | 要出走確認 |
| 130 | Felix Gall | 79 | 78 | 75 | 76 | 50 | 要出走確認 |
| 131 | Jordi Meeus | 75 | 75 | 82 | 77 | 73 | 結果照合済 |
| 132 | Tim Merlier | 75 | 75 | 80 | 78 | 69 | 結果照合済 |
| 133 | Rohan Dennis | 81 | 81 | 82 | 78 | 50 | 要出走確認 |
| 134 | Oscar Pereiro | 81 | 79 | 77 | 77 | 50 | 要出走確認 |
| 135 | Ryder Hesjedal | 80 | 76 | 77 | 77 | 50 | 要出走確認 |
| 136 | Enric Mas | 78 | 77 | 76 | 76 | 50 | 要出走確認 |
| 137 | Thomas De Gendt | 80 | 79 | 79 | 79 | 50 | 要出走確認 |
| 138 | Steffen Wesemann | 82 | 82 | 80 | 82 | 76 | 要出走確認 |
| 139 | Magnus Backstedt | 80 | 81 | 80 | 80 | 82 | 結果照合済 |
| 140 | Sonny Colbrelli | 76 | 77 | 80 | 80 | 82 | 結果照合済 |
| 141 | Jhonatan Narvaez | 76 | 77 | 78 | 80 | 50 | 要出走確認 |
| 142 | Oscar Onley | 76 | 76 | 76 | 78 | 50 | 要出走確認 |
| 143 | Benoit Cosnefroy | 76 | 75 | 77 | 79 | 50 | 要出走確認 |
| 144 | Michael Albasini | 76 | 75 | 77 | 78 | 50 | 要出走確認 |
| 145 | Jose Rujano | 77 | 77 | 75 | 77 | 50 | 要出走確認 |
| 146 | Richard Virenque | 81 | 81 | 75 | 76 | 50 | 要出走確認 |
| 147 | Guillaume Martin | 81 | 79 | 75 | 76 | 50 | 要出走確認 |
| 148 | Iban Mayo | 76 | 77 | 75 | 77 | 50 | 要出走確認 |
| 149 | Giulio Pellizzari | 79 | 78 | 75 | 76 | 50 | 要出走確認 |
| 150 | Soren Waerenskjold | 77 | 76 | 82 | 78 | 50 | 要出走確認 |
| 151 | Richard Carapaz | 80 | 75 | 76 | 76 | 50 | 要出走確認 |
| 152 | Joshua Tarling | 80 | 79 | 83 | 80 | 69 | 結果照合済 |
| 153 | Derek Gee | 81 | 81 | 79 | 78 | 50 | 要出走確認 |
| 154 | Stefan Bissegger | 80 | 79 | 82 | 80 | 76 | 結果照合済 |
| 155 | Gustav Erik Larsson | 80 | 79 | 83 | 80 | 50 | 要出走確認 |
| 156 | Victor Campenaerts | 80 | 79 | 83 | 80 | 50 | 要出走確認 |
| 157 | David Zabriskie | 80 | 79 | 82 | 78 | 50 | 要出走確認 |
| 158 | John Degenkolb | 80 | 81 | 79 | 83 | 82 | 結果照合済 |
| 159 | Tobias Ludvigsson | 81 | 81 | 80 | 78 | 50 | 要出走確認 |
| 160 | Jose Azevedo | 81 | 81 | 79 | 78 | 50 | 要出走確認 |
| 161 | Wout Poels | 80 | 80 | 75 | 76 | 50 | 要出走確認 |
| 162 | Sepp Kuss | 76 | 76 | 76 | 78 | 50 | 手動検証済 |
| 163 | Richie Porte | 80 | 80 | 75 | 76 | 50 | 要出走確認 |
| 164 | Nairo Quintana | 81 | 79 | 74 | 76 | 50 | 要出走確認 |
| 165 | Michal Kwiatkowski | 84 | 82 | 76 | 76 | 50 | 要出走確認 |
| 166 | Daniel Oss | 77 | 80 | 78 | 81 | 69 | 結果照合済 |
| 167 | Laurens De Plus | 77 | 77 | 74 | 76 | 50 | 要出走確認 |
| 168 | Jens Keukeleire | 77 | 80 | 78 | 81 | 76 | 結果照合済 |
| 169 | Mark Renshaw | 74 | 74 | 80 | 79 | 57 | 手動検証済 |
| 170 | Rafal Majka | 81 | 79 | 74 | 75 | 50 | 要出走確認 |
| 171 | Luke Plapp | 79 | 78 | 78 | 78 | 50 | 要出走確認 |
| 172 | Heinrich Haussler | 77 | 80 | 78 | 81 | 73 | 結果照合済 |
| 173 | Greg Van Avermaet | 77 | 81 | 78 | 81 | 82 | 結果照合済 |
| 174 | Aime De Gendt | 76 | 79 | 78 | 81 | 69 | 結果照合済 |
| 175 | Adam Yates | 77 | 77 | 74 | 76 | 50 | 要出走確認 |
| 176 | Sebastian Langeveld | 77 | 80 | 78 | 81 | 77 | 結果照合済 |
| 177 | Zdenek Stybar | 77 | 80 | 78 | 81 | 82 | 結果照合済 |
| 178 | Amund Grondahl Jansen | 76 | 79 | 78 | 81 | 50 | 要出走確認 |
| 179 | Stijn Vandenbergh | 76 | 79 | 78 | 81 | 73 | 結果照合済 |
| 180 | Mike Teunissen | 74 | 74 | 77 | 74 | 77 | 結果照合済 |
| 181 | Damiano Caruso | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 182 | Kanstantsin Siutsou | 79 | 78 | 78 | 78 | 50 | 要出走確認 |
| 183 | Carlos Verona | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 184 | Taco van der Hoorn | 77 | 80 | 78 | 81 | 50 | 要出走確認 |
| 185 | Haimar Zubeldia | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 186 | Sergio Henao | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 187 | Leif Hoste | 76 | 79 | 78 | 81 | 50 | 要出走確認 |
| 188 | Maarten Wynants | 76 | 79 | 78 | 80 | 69 | 結果照合済 |
| 189 | Santiago Buitrago | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 190 | Wilco Kelderman | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 191 | Bob Jungels | 79 | 78 | 78 | 78 | 50 | 要出走確認 |
| 192 | Marco Haller | 77 | 80 | 78 | 81 | 73 | 結果照合済 |
| 193 | Boy van Poppel | 74 | 74 | 77 | 74 | 69 | 結果照合済 |
| 194 | Roman Kreuziger | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 195 | Lawson Craddock | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 196 | Daniel Navarro | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 197 | Jonathan Castroviejo | 80 | 79 | 79 | 78 | 50 | 要出走確認 |
| 198 | Sep Vanmarcke | 76 | 79 | 78 | 81 | 80 | 結果照合済 |
| 199 | Davide Ballerini | 73 | 73 | 77 | 73 | 69 | 結果照合済 |
| 200 | Jacopo Guarnieri | 73 | 73 | 77 | 73 | 64 | 結果照合済 |
| 201 | Chad Haga | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 202 | Thymen Arensman | 77 | 77 | 72 | 75 | 50 | 要出走確認 |
| 203 | Luka Mezgec | 74 | 74 | 77 | 74 | 50 | 要出走確認 |
| 204 | Danny van Poppel | 74 | 74 | 77 | 74 | 69 | 結果照合済 |
| 205 | Domenico Pozzovivo | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 206 | Cameron Wurf | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 207 | Jose Luis Rubiera | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 208 | Lars Boom | 77 | 79 | 78 | 81 | 78 | 結果照合済 |
| 209 | Simone Consonni | 73 | 73 | 77 | 73 | 64 | 結果照合済 |
| 210 | Fabio Sabatini | 73 | 73 | 77 | 73 | 50 | 要出走確認 |
| 211 | Remi Cavagna | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 212 | Pavel Sivakov | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 213 | Winner Anacona | 77 | 77 | 72 | 75 | 50 | 要出走確認 |
| 214 | Florian Vermeersch | 76 | 79 | 78 | 81 | 50 | 要出走確認 |
| 215 | Roger Kluge | 71 | 71 | 77 | 71 | 69 | 結果照合済 |
| 216 | Ben O'Connor | 79 | 80 | 75 | 76 | 50 | 要出走確認 |
| 217 | Tao Geoghegan Hart | 79 | 78 | 74 | 76 | 50 | 要出走確認 |
| 218 | Michael Matthews | 82 | 82 | 80 | 78 | 50 | 要出走確認 |
| 219 | Bert Van Lerberghe | 74 | 74 | 77 | 74 | 69 | 結果照合済 |
| 220 | Maximiliano Richeze | 74 | 74 | 77 | 74 | 50 | 要出走確認 |
| 221 | Brandon McNulty | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 222 | Magnus Sheffield | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 223 | Andrey Amador | 77 | 77 | 73 | 75 | 50 | 要出走確認 |
| 224 | Nikias Arndt | 72 | 72 | 77 | 72 | 69 | 結果照合済 |
| 225 | Pierre Rolland | 77 | 77 | 72 | 75 | 50 | 要出走確認 |
| 226 | Robert Gesink | 77 | 77 | 71 | 75 | 50 | 要出走確認 |
| 227 | Frederik Frison | 76 | 79 | 78 | 80 | 69 | 結果照合済 |
| 228 | Jasper De Buyst | 70 | 70 | 77 | 70 | 50 | 要出走確認 |
| 229 | Edward Theuns | 74 | 74 | 77 | 74 | 70 | 結果照合済 |
| 230 | Eros Poli | 79 | 78 | 79 | 79 | 50 | 要出走確認 |
| 231 | Iljo Keisse | 74 | 74 | 77 | 74 | 69 | 結果照合済 |
| 232 | Nils Politt | 78 | 78 | 79 | 79 | 82 | 結果照合済 |
| 233 | Marc Soler | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 234 | Tobias Foss | 80 | 79 | 79 | 78 | 50 | 要出走確認 |
| 235 | Maarten Tjallingii | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 236 | Mikel Nieve | 79 | 78 | 74 | 75 | 50 | 要出走確認 |
| 237 | Roy Curvers | 73 | 73 | 77 | 73 | 64 | 結果照合済 |
| 238 | Yves Lampaert | 78 | 78 | 79 | 79 | 82 | 結果照合済 |
| 239 | Igor Anton | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 240 | Nelson Oliveira | 79 | 78 | 78 | 77 | 64 | 結果照合済 |
| 241 | Tanel Kangert | 77 | 77 | 74 | 75 | 50 | 要出走確認 |
| 242 | Gert Steegmans | 71 | 71 | 77 | 71 | 50 | 要出走確認 |
| 243 | Rein Taaramae | 77 | 77 | 70 | 75 | 50 | 要出走確認 |
| 244 | Alex Dowsett | 79 | 77 | 78 | 77 | 50 | 要出走確認 |
| 245 | Michael Morkov | 74 | 74 | 77 | 74 | 69 | 結果照合済 |
| 246 | Tim Declercq | 79 | 78 | 76 | 78 | 69 | 手動検証済 |
| 247 | Edoardo Affini | 80 | 79 | 79 | 78 | 64 | 結果照合済 |
| 248 | Jos van Emden | 78 | 78 | 79 | 79 | 73 | 結果照合済 |
| 249 | Ramon Sinkeldam | 73 | 73 | 77 | 73 | 69 | 結果照合済 |
| 250 | Stefan Kung | 81 | 81 | 82 | 80 | 73 | 結果照合済 |
| 251 | Jan Tratnik | 79 | 78 | 78 | 77 | 64 | 結果照合済 |
| 252 | Vasil Kiryienka | 81 | 81 | 80 | 78 | 50 | 要出走確認 |
| 253 | Salvatore Puccio | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 254 | Jurgen Roelandts | 72 | 72 | 77 | 72 | 69 | 結果照合済 |
| 255 | Viatcheslav Ekimov | 78 | 78 | 79 | 79 | 50 | 要出走確認 |
| 256 | Greg Henderson | 72 | 72 | 77 | 72 | 50 | 要出走確認 |
| 257 | Jan Barta | 79 | 78 | 78 | 77 | 64 | 結果照合済 |
| 258 | Mikel Landa | 79 | 78 | 71 | 75 | 50 | 要出走確認 |
| 259 | Matthew Goss | 75 | 75 | 78 | 74 | 50 | 要出走確認 |
| 260 | Maciej Bodnar | 79 | 78 | 79 | 79 | 69 | 結果照合済 |
| 261 | Dylan van Baarle | 81 | 81 | 80 | 79 | 74 | 結果照合済 |
| 262 | Jack Bauer | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 263 | Michael Hepburn | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 264 | Dries Devenyns | 78 | 78 | 79 | 79 | 50 | 要出走確認 |
| 265 | Christophe Laporte | 75 | 74 | 78 | 74 | 78 | 結果照合済 |
| 266 | Brent Bookwalter | 79 | 77 | 78 | 77 | 50 | 要出走確認 |
| 267 | Mikkel Bjerg | 78 | 78 | 79 | 79 | 50 | 要出走確認 |
| 268 | Daryl Impey | 78 | 80 | 81 | 82 | 50 | 要出走確認 |
| 269 | Nathan Van Hooydonck | 79 | 78 | 79 | 79 | 69 | 結果照合済 |
| 270 | Stuart O'Grady | 78 | 78 | 79 | 79 | 82 | 結果照合済 |
| 271 | Matteo Trentin | 81 | 81 | 80 | 79 | 69 | 結果照合済 |
| 272 | Tejay van Garderen | 79 | 78 | 78 | 77 | 50 | 要出走確認 |
| 273 | Vegard Stake Laengen | 78 | 78 | 79 | 79 | 50 | 要出走確認 |
| 274 | Ian Stannard | 78 | 78 | 79 | 79 | 69 | 結果照合済 |
| 275 | Jens Voigt | 78 | 78 | 79 | 79 | 50 | 要出走確認 |
| 276 | Luke Durbridge | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 277 | Lars Bak | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 278 | Kasper Asgreen | 80 | 79 | 79 | 80 | 76 | 結果照合済 |
| 279 | Marcus Burghardt | 78 | 78 | 79 | 79 | 69 | 結果照合済 |
| 280 | Manuel Quinziato | 78 | 80 | 81 | 82 | 69 | 結果照合済 |
| 281 | Michael Rogers | 82 | 82 | 85 | 82 | 50 | 要出走確認 |
| 282 | Alessandro Ballan | 82 | 82 | 83 | 84 | 76 | 要出走確認 |
| 283 | Bernhard Eisel | 78 | 80 | 81 | 82 | 73 | 結果照合済 |
| 284 | Christian Vande Velde | 78 | 80 | 81 | 81 | 50 | 要出走確認 |
| 285 | Luke Rowe | 77 | 80 | 81 | 83 | 78 | 手動検証済 |
| 286 | Juan Antonio Flecha | 78 | 80 | 81 | 82 | 50 | 要出走確認 |
| 287 | George Hincapie | 78 | 80 | 81 | 82 | 50 | 要出走確認 |
| 288 | Bram Tankink | 78 | 80 | 81 | 81 | 69 | 結果照合済 |
| 289 | Matteo Tosatto | 78 | 78 | 79 | 79 | 64 | 結果照合済 |
| 290 | Luca Paolini | 80 | 81 | 82 | 82 | 69 | 結果照合済 |
| 291 | Yukiya Arashiro | 80 | 80 | 76 | 80 | 57 | 手動検証済 |
| 292 | Mathew Hayman | 78 | 80 | 81 | 81 | 82 | 結果照合済 |
| 293 | Fumiyuki Beppu | 76 | 75 | 79 | 80 | 64 | 手動検証済 |
| 294 | Simon Geschke | 78 | 80 | 81 | 82 | 50 | 要出走確認 |
| 295 | Sylvain Chavanel | 78 | 80 | 81 | 81 | 64 | 結果照合済 |
| 296 | Geraint Thomas | 79 | 80 | 81 | 82 | 76 | 結果照合済 |
| 297 | Gregory Rast | 78 | 80 | 81 | 81 | 73 | 結果照合済 |
| 298 | Nicolas Roche | 78 | 80 | 81 | 81 | 50 | 要出走確認 |
| 299 | Koen de Kort | 78 | 80 | 81 | 81 | 69 | 結果照合済 |
| 300 | David Millar | 81 | 81 | 85 | 82 | 64 | 結果照合済 |

## 回復・連携・精神能力

| No. | 選手名 | 回復力 | 日間回復力 | チームワーク | エゴ | 負けん気 |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Tadej Pogacar | 88 | 88 | 75 | 79 | 87 |
| 2 | Miguel Indurain | 85 | 84 | 73 | 80 | 80 |
| 3 | Chris Froome | 83 | 85 | 73 | 80 | 79 |
| 4 | Alberto Contador | 83 | 85 | 73 | 80 | 77 |
| 5 | Roberto Heras | 84 | 83 | 75 | 78 | 78 |
| 6 | Vincenzo Nibali | 83 | 83 | 73 | 80 | 77 |
| 7 | Jonas Vingegaard | 83 | 83 | 73 | 80 | 78 |
| 8 | Mathieu van der Poel | 79 | 79 | 74 | 81 | 84 |
| 9 | Andre Greipel | 75 | 74 | 70 | 84 | 76 |
| 10 | Jan Ullrich | 84 | 84 | 73 | 79 | 78 |
| 11 | Alessandro Petacchi | 75 | 74 | 70 | 84 | 76 |
| 12 | Denis Menchov | 84 | 83 | 76 | 77 | 78 |
| 13 | Alex Zulle | 82 | 82 | 76 | 77 | 77 |
| 14 | Gilberto Simoni | 83 | 83 | 75 | 77 | 78 |
| 15 | Simon Yates | 83 | 83 | 75 | 78 | 78 |
| 16 | Ivan Basso | 82 | 83 | 75 | 78 | 77 |
| 17 | Marco Pantani | 77 | 77 | 66 | 82 | 83 |
| 18 | Jasper Philipsen | 75 | 75 | 71 | 84 | 76 |
| 19 | Mario Cipollini | 75 | 74 | 70 | 84 | 77 |
| 20 | Mark Cavendish | 70 | 70 | 68 | 84 | 82 |
| 21 | Mads Pedersen | 78 | 77 | 77 | 80 | 83 |
| 22 | Remco Evenepoel | 82 | 82 | 74 | 78 | 82 |
| 23 | Robbie McEwen | 75 | 74 | 70 | 84 | 77 |
| 24 | Jonathan Milan | 75 | 75 | 75 | 81 | 75 |
| 25 | Andy Schleck | 80 | 79 | 71 | 80 | 78 |
| 26 | Paul Seixas | 81 | 81 | 74 | 78 | 77 |
| 27 | Fabian Cancellara | 79 | 79 | 76 | 79 | 82 |
| 28 | Michele Bartoli | 77 | 78 | 69 | 82 | 79 |
| 29 | Peter Sagan | 80 | 80 | 70 | 82 | 83 |
| 30 | Joaquim Rodriguez | 78 | 78 | 69 | 82 | 82 |
| 31 | Joao Almeida | 81 | 82 | 76 | 76 | 77 |
| 32 | Marcel Kittel | 75 | 74 | 70 | 83 | 75 |
| 33 | Olav Kooij | 75 | 75 | 73 | 81 | 75 |
| 34 | Isaac del Toro | 81 | 81 | 74 | 78 | 77 |
| 35 | Primoz Roglic | 85 | 84 | 72 | 81 | 78 |
| 36 | Erik Zabel | 79 | 79 | 74 | 81 | 83 |
| 37 | Cadel Evans | 79 | 79 | 69 | 82 | 80 |
| 38 | Wout van Aert | 80 | 79 | 79 | 77 | 83 |
| 39 | Juan Ayuso | 81 | 81 | 73 | 79 | 78 |
| 40 | Carlos Sastre | 80 | 80 | 71 | 79 | 79 |
| 41 | Julian Alaphilippe | 78 | 78 | 69 | 82 | 82 |
| 42 | Paolo Bettini | 78 | 78 | 69 | 82 | 82 |
| 43 | Djamolidine Abdoujaparov | 76 | 75 | 72 | 82 | 76 |
| 44 | Simon Gerrans | 78 | 78 | 69 | 82 | 81 |
| 45 | Tom Pidcock | 78 | 78 | 76 | 79 | 81 |
| 46 | Romain Bardet | 80 | 79 | 71 | 79 | 81 |
| 47 | Arnaud Demare | 75 | 75 | 72 | 82 | 76 |
| 48 | Arnaud De Lie | 76 | 76 | 72 | 80 | 78 |
| 49 | Kaden Groves | 76 | 75 | 72 | 82 | 77 |
| 50 | Fabio Jakobsen | 75 | 75 | 72 | 82 | 76 |
| 51 | Tom Boonen | 79 | 79 | 75 | 80 | 84 |
| 52 | Alejandro Valverde | 79 | 79 | 69 | 81 | 85 |
| 53 | Maurizio Fondriest | 77 | 77 | 69 | 81 | 79 |
| 54 | Stijn Devolder | 78 | 78 | 78 | 77 | 81 |
| 55 | Franco Ballerini | 78 | 78 | 78 | 77 | 81 |
| 56 | Chris Horner | 82 | 82 | 75 | 77 | 78 |
| 57 | Carlos Rodriguez | 82 | 82 | 75 | 77 | 77 |
| 58 | Chris Boardman | 77 | 77 | 79 | 74 | 77 |
| 59 | Thibaut Pinot | 80 | 79 | 72 | 79 | 79 |
| 60 | Tom Steels | 75 | 75 | 72 | 82 | 76 |
| 61 | Aleksandr Vlasov | 82 | 81 | 75 | 77 | 78 |
| 62 | Andreas Kloden | 81 | 81 | 76 | 76 | 77 |
| 63 | Alberto Bettiol | 78 | 78 | 76 | 79 | 82 |
| 64 | Marc Hirschi | 78 | 78 | 72 | 80 | 82 |
| 65 | Tim Wellens | 78 | 78 | 72 | 80 | 81 |
| 66 | Rui Costa | 80 | 79 | 72 | 79 | 82 |
| 67 | Mattias Skjelmose | 79 | 79 | 72 | 79 | 80 |
| 68 | Dylan Groenewegen | 75 | 75 | 72 | 82 | 76 |
| 69 | Pascal Ackermann | 75 | 75 | 73 | 81 | 75 |
| 70 | Johan Museeuw | 79 | 79 | 75 | 80 | 84 |
| 71 | Philippe Gilbert | 77 | 78 | 69 | 81 | 81 |
| 72 | Laurent Jalabert | 79 | 79 | 75 | 80 | 83 |
| 73 | Andrea Tafi | 78 | 78 | 78 | 76 | 81 |
| 74 | Niki Terpstra | 78 | 78 | 78 | 76 | 81 |
| 75 | Alexander Kristoff | 77 | 77 | 76 | 79 | 81 |
| 76 | Filippo Ganna | 77 | 77 | 80 | 74 | 78 |
| 77 | Danilo Di Luca | 80 | 79 | 72 | 79 | 79 |
| 78 | Thor Hushovd | 76 | 75 | 72 | 81 | 77 |
| 79 | Tom Dumoulin | 82 | 82 | 76 | 76 | 77 |
| 80 | Davide Rebellin | 77 | 77 | 69 | 81 | 78 |
| 81 | Rigoberto Uran | 82 | 82 | 75 | 77 | 78 |
| 82 | Levi Leipheimer | 81 | 81 | 76 | 76 | 77 |
| 83 | Nick Nuyens | 78 | 78 | 76 | 78 | 81 |
| 84 | Dylan Teuns | 79 | 79 | 71 | 79 | 81 |
| 85 | Michael Woods | 79 | 79 | 71 | 79 | 81 |
| 86 | Maxim Van Gils | 79 | 79 | 71 | 79 | 79 |
| 87 | Warren Barguil | 80 | 79 | 73 | 77 | 81 |
| 88 | Esteban Chaves | 81 | 80 | 73 | 77 | 80 |
| 89 | Nacer Bouhanni | 75 | 75 | 71 | 82 | 76 |
| 90 | Juan Sebastian Molano | 75 | 75 | 73 | 80 | 75 |
| 91 | Elia Viviani | 75 | 75 | 73 | 80 | 75 |
| 92 | Egan Bernal | 83 | 83 | 72 | 80 | 77 |
| 93 | Andrei Tchmil | 78 | 78 | 79 | 76 | 81 |
| 94 | Oscar Freire | 76 | 75 | 72 | 81 | 79 |
| 95 | Biniam Girmay | 75 | 75 | 72 | 82 | 76 |
| 96 | Tony Martin | 77 | 77 | 80 | 74 | 77 |
| 97 | Jakob Fuglsang | 79 | 79 | 73 | 79 | 80 |
| 98 | Evgeni Berzin | 82 | 82 | 76 | 75 | 77 |
| 99 | Jai Hindley | 83 | 82 | 75 | 76 | 78 |
| 100 | Fabio Aru | 82 | 82 | 75 | 76 | 77 |
| 101 | Sam Bennett | 75 | 75 | 72 | 81 | 76 |
| 102 | Florian Lipowitz | 82 | 82 | 75 | 76 | 77 |
| 103 | Johan Vansummeren | 78 | 78 | 79 | 76 | 81 |
| 104 | Jasper Stuyven | 77 | 77 | 77 | 79 | 81 |
| 105 | Tiesj Benoot | 78 | 78 | 77 | 78 | 83 |
| 106 | Romain Gregoire | 76 | 76 | 72 | 80 | 78 |
| 107 | David Gaudu | 81 | 81 | 74 | 76 | 79 |
| 108 | Lenny Martinez | 80 | 79 | 74 | 77 | 79 |
| 109 | Tyler Farrar | 75 | 75 | 72 | 81 | 76 |
| 110 | Fernando Gaviria | 75 | 75 | 73 | 80 | 75 |
| 111 | Peter Van Petegem | 78 | 79 | 77 | 78 | 85 |
| 112 | Damiano Cunego | 80 | 80 | 72 | 78 | 82 |
| 113 | Claudio Chiappucci | 80 | 79 | 72 | 78 | 83 |
| 114 | Bradley Wiggins | 79 | 79 | 80 | 72 | 76 |
| 115 | Luis Leon Sanchez | 77 | 77 | 80 | 73 | 78 |
| 116 | Daniel Martin | 79 | 79 | 72 | 78 | 79 |
| 117 | Giulio Ciccone | 81 | 80 | 74 | 76 | 82 |
| 118 | Pavel Tonkov | 83 | 82 | 75 | 76 | 78 |
| 119 | Caleb Ewan | 75 | 75 | 72 | 82 | 76 |
| 120 | Daniele Bennati | 75 | 75 | 73 | 81 | 76 |
| 121 | Samuel Sanchez | 81 | 81 | 74 | 77 | 78 |
| 122 | Antonio Tiberi | 81 | 81 | 76 | 75 | 77 |
| 123 | Servais Knaven | 78 | 78 | 79 | 76 | 80 |
| 124 | Matej Mohoric | 78 | 78 | 77 | 78 | 82 |
| 125 | Filippo Pozzato | 76 | 77 | 77 | 79 | 79 |
| 126 | Pello Bilbao | 80 | 79 | 73 | 78 | 81 |
| 127 | Valentin Madouas | 78 | 78 | 73 | 79 | 80 |
| 128 | Ben Healy | 79 | 79 | 72 | 78 | 82 |
| 129 | Michael Rasmussen | 81 | 81 | 74 | 75 | 82 |
| 130 | Felix Gall | 81 | 81 | 74 | 75 | 79 |
| 131 | Jordi Meeus | 75 | 75 | 73 | 81 | 76 |
| 132 | Tim Merlier | 75 | 75 | 73 | 81 | 76 |
| 133 | Rohan Dennis | 79 | 79 | 80 | 72 | 77 |
| 134 | Oscar Pereiro | 82 | 82 | 76 | 75 | 78 |
| 135 | Ryder Hesjedal | 82 | 82 | 76 | 75 | 77 |
| 136 | Enric Mas | 82 | 82 | 75 | 76 | 78 |
| 137 | Thomas De Gendt | 76 | 76 | 78 | 75 | 77 |
| 138 | Steffen Wesemann | 78 | 78 | 79 | 75 | 81 |
| 139 | Magnus Backstedt | 78 | 78 | 79 | 75 | 80 |
| 140 | Sonny Colbrelli | 76 | 77 | 77 | 78 | 79 |
| 141 | Jhonatan Narvaez | 78 | 78 | 73 | 79 | 81 |
| 142 | Oscar Onley | 79 | 79 | 72 | 78 | 79 |
| 143 | Benoit Cosnefroy | 76 | 76 | 72 | 79 | 78 |
| 144 | Michael Albasini | 76 | 76 | 72 | 79 | 79 |
| 145 | Jose Rujano | 81 | 80 | 74 | 76 | 81 |
| 146 | Richard Virenque | 80 | 79 | 72 | 77 | 82 |
| 147 | Guillaume Martin | 81 | 81 | 74 | 75 | 81 |
| 148 | Iban Mayo | 81 | 80 | 74 | 76 | 80 |
| 149 | Giulio Pellizzari | 81 | 81 | 74 | 75 | 78 |
| 150 | Soren Waerenskjold | 76 | 76 | 80 | 72 | 75 |
| 151 | Richard Carapaz | 82 | 83 | 74 | 77 | 79 |
| 152 | Joshua Tarling | 76 | 77 | 80 | 71 | 77 |
| 153 | Derek Gee | 79 | 79 | 80 | 70 | 77 |
| 154 | Stefan Bissegger | 76 | 77 | 81 | 71 | 77 |
| 155 | Gustav Erik Larsson | 76 | 77 | 81 | 71 | 77 |
| 156 | Victor Campenaerts | 76 | 77 | 81 | 71 | 77 |
| 157 | David Zabriskie | 78 | 78 | 81 | 70 | 76 |
| 158 | John Degenkolb | 79 | 78 | 74 | 80 | 83 |
| 159 | Tobias Ludvigsson | 79 | 79 | 81 | 69 | 76 |
| 160 | Jose Azevedo | 79 | 79 | 80 | 69 | 76 |
| 161 | Wout Poels | 81 | 81 | 76 | 72 | 79 |
| 162 | Sepp Kuss | 81 | 81 | 84 | 58 | 76 |
| 163 | Richie Porte | 81 | 81 | 76 | 72 | 79 |
| 164 | Nairo Quintana | 81 | 81 | 71 | 80 | 78 |
| 165 | Michal Kwiatkowski | 81 | 81 | 76 | 72 | 80 |
| 166 | Daniel Oss | 77 | 77 | 78 | 73 | 80 |
| 167 | Laurens De Plus | 80 | 80 | 76 | 70 | 78 |
| 168 | Jens Keukeleire | 77 | 77 | 79 | 73 | 80 |
| 169 | Mark Renshaw | 76 | 76 | 85 | 63 | 70 |
| 170 | Rafal Majka | 80 | 81 | 76 | 70 | 79 |
| 171 | Luke Plapp | 78 | 78 | 80 | 67 | 75 |
| 172 | Heinrich Haussler | 77 | 77 | 78 | 73 | 80 |
| 173 | Greg Van Avermaet | 77 | 77 | 78 | 73 | 81 |
| 174 | Aime De Gendt | 77 | 76 | 78 | 73 | 80 |
| 175 | Adam Yates | 80 | 80 | 76 | 70 | 78 |
| 176 | Sebastian Langeveld | 77 | 77 | 79 | 73 | 80 |
| 177 | Zdenek Stybar | 77 | 77 | 78 | 73 | 80 |
| 178 | Amund Grondahl Jansen | 77 | 77 | 78 | 73 | 80 |
| 179 | Stijn Vandenbergh | 77 | 76 | 78 | 73 | 80 |
| 180 | Mike Teunissen | 74 | 74 | 77 | 74 | 74 |
| 181 | Damiano Caruso | 80 | 80 | 76 | 70 | 78 |
| 182 | Kanstantsin Siutsou | 78 | 78 | 81 | 67 | 75 |
| 183 | Carlos Verona | 80 | 80 | 76 | 70 | 78 |
| 184 | Taco van der Hoorn | 77 | 77 | 79 | 73 | 81 |
| 185 | Haimar Zubeldia | 80 | 80 | 76 | 70 | 77 |
| 186 | Sergio Henao | 79 | 80 | 76 | 70 | 77 |
| 187 | Leif Hoste | 77 | 76 | 79 | 73 | 80 |
| 188 | Maarten Wynants | 77 | 76 | 78 | 73 | 80 |
| 189 | Santiago Buitrago | 80 | 80 | 77 | 70 | 78 |
| 190 | Wilco Kelderman | 80 | 80 | 77 | 70 | 78 |
| 191 | Bob Jungels | 78 | 78 | 81 | 67 | 76 |
| 192 | Marco Haller | 77 | 77 | 79 | 73 | 80 |
| 193 | Boy van Poppel | 74 | 74 | 77 | 74 | 74 |
| 194 | Roman Kreuziger | 80 | 80 | 76 | 70 | 78 |
| 195 | Lawson Craddock | 78 | 78 | 80 | 67 | 76 |
| 196 | Daniel Navarro | 80 | 80 | 76 | 70 | 78 |
| 197 | Jonathan Castroviejo | 78 | 78 | 80 | 67 | 75 |
| 198 | Sep Vanmarcke | 77 | 77 | 79 | 73 | 80 |
| 199 | Davide Ballerini | 73 | 73 | 77 | 74 | 73 |
| 200 | Jacopo Guarnieri | 73 | 73 | 77 | 74 | 73 |
| 201 | Chad Haga | 78 | 78 | 80 | 67 | 75 |
| 202 | Thymen Arensman | 79 | 80 | 76 | 70 | 77 |
| 203 | Luka Mezgec | 74 | 74 | 77 | 74 | 74 |
| 204 | Danny van Poppel | 74 | 74 | 77 | 74 | 74 |
| 205 | Domenico Pozzovivo | 80 | 80 | 76 | 70 | 78 |
| 206 | Cameron Wurf | 78 | 78 | 81 | 67 | 75 |
| 207 | Jose Luis Rubiera | 80 | 80 | 76 | 70 | 78 |
| 208 | Lars Boom | 77 | 77 | 79 | 73 | 80 |
| 209 | Simone Consonni | 73 | 73 | 77 | 74 | 73 |
| 210 | Fabio Sabatini | 73 | 73 | 77 | 74 | 73 |
| 211 | Remi Cavagna | 78 | 78 | 81 | 67 | 75 |
| 212 | Pavel Sivakov | 79 | 80 | 76 | 70 | 77 |
| 213 | Winner Anacona | 79 | 80 | 76 | 70 | 77 |
| 214 | Florian Vermeersch | 77 | 76 | 79 | 73 | 80 |
| 215 | Roger Kluge | 72 | 72 | 77 | 74 | 72 |
| 216 | Ben O'Connor | 80 | 81 | 76 | 70 | 79 |
| 217 | Tao Geoghegan Hart | 81 | 81 | 76 | 70 | 78 |
| 218 | Michael Matthews | 78 | 78 | 83 | 67 | 78 |
| 219 | Bert Van Lerberghe | 74 | 74 | 77 | 74 | 74 |
| 220 | Maximiliano Richeze | 74 | 74 | 77 | 74 | 74 |
| 221 | Brandon McNulty | 80 | 80 | 76 | 70 | 78 |
| 222 | Magnus Sheffield | 78 | 78 | 81 | 67 | 75 |
| 223 | Andrey Amador | 79 | 80 | 76 | 70 | 77 |
| 224 | Nikias Arndt | 73 | 73 | 77 | 74 | 73 |
| 225 | Pierre Rolland | 79 | 80 | 76 | 70 | 78 |
| 226 | Robert Gesink | 79 | 80 | 76 | 70 | 77 |
| 227 | Frederik Frison | 77 | 76 | 79 | 73 | 80 |
| 228 | Jasper De Buyst | 71 | 71 | 77 | 74 | 71 |
| 229 | Edward Theuns | 74 | 74 | 77 | 74 | 74 |
| 230 | Eros Poli | 76 | 76 | 81 | 68 | 77 |
| 231 | Iljo Keisse | 74 | 74 | 77 | 74 | 74 |
| 232 | Nils Politt | 76 | 76 | 80 | 68 | 76 |
| 233 | Marc Soler | 80 | 80 | 77 | 70 | 78 |
| 234 | Tobias Foss | 78 | 78 | 82 | 67 | 75 |
| 235 | Maarten Tjallingii | 76 | 76 | 80 | 68 | 76 |
| 236 | Mikel Nieve | 80 | 81 | 77 | 70 | 78 |
| 237 | Roy Curvers | 73 | 73 | 77 | 74 | 73 |
| 238 | Yves Lampaert | 76 | 76 | 80 | 68 | 76 |
| 239 | Igor Anton | 79 | 80 | 77 | 70 | 77 |
| 240 | Nelson Oliveira | 78 | 78 | 81 | 67 | 75 |
| 241 | Tanel Kangert | 79 | 80 | 77 | 70 | 77 |
| 242 | Gert Steegmans | 71 | 71 | 77 | 74 | 71 |
| 243 | Rein Taaramae | 79 | 80 | 76 | 70 | 77 |
| 244 | Alex Dowsett | 77 | 77 | 81 | 67 | 75 |
| 245 | Michael Morkov | 74 | 74 | 77 | 74 | 74 |
| 246 | Tim Declercq | 79 | 79 | 84 | 60 | 77 |
| 247 | Edoardo Affini | 78 | 78 | 83 | 67 | 75 |
| 248 | Jos van Emden | 76 | 76 | 82 | 68 | 76 |
| 249 | Ramon Sinkeldam | 74 | 74 | 77 | 74 | 74 |
| 250 | Stefan Kung | 76 | 76 | 83 | 68 | 77 |
| 251 | Jan Tratnik | 78 | 78 | 81 | 67 | 76 |
| 252 | Vasil Kiryienka | 78 | 78 | 83 | 67 | 75 |
| 253 | Salvatore Puccio | 76 | 76 | 82 | 68 | 76 |
| 254 | Jurgen Roelandts | 72 | 72 | 77 | 74 | 72 |
| 255 | Viatcheslav Ekimov | 76 | 76 | 82 | 68 | 76 |
| 256 | Greg Henderson | 72 | 72 | 77 | 74 | 72 |
| 257 | Jan Barta | 78 | 77 | 81 | 67 | 75 |
| 258 | Mikel Landa | 79 | 81 | 76 | 70 | 78 |
| 259 | Matthew Goss | 74 | 74 | 77 | 74 | 75 |
| 260 | Maciej Bodnar | 76 | 76 | 82 | 68 | 76 |
| 261 | Dylan van Baarle | 76 | 76 | 83 | 68 | 77 |
| 262 | Jack Bauer | 76 | 76 | 82 | 68 | 77 |
| 263 | Michael Hepburn | 76 | 76 | 82 | 68 | 76 |
| 264 | Dries Devenyns | 76 | 76 | 82 | 68 | 77 |
| 265 | Christophe Laporte | 74 | 74 | 77 | 74 | 75 |
| 266 | Brent Bookwalter | 77 | 77 | 81 | 67 | 74 |
| 267 | Mikkel Bjerg | 76 | 76 | 80 | 68 | 76 |
| 268 | Daryl Impey | 77 | 77 | 80 | 71 | 79 |
| 269 | Nathan Van Hooydonck | 76 | 76 | 82 | 68 | 76 |
| 270 | Stuart O'Grady | 76 | 76 | 82 | 68 | 76 |
| 271 | Matteo Trentin | 76 | 76 | 83 | 68 | 77 |
| 272 | Tejay van Garderen | 77 | 77 | 81 | 67 | 75 |
| 273 | Vegard Stake Laengen | 76 | 76 | 82 | 68 | 76 |
| 274 | Ian Stannard | 76 | 76 | 82 | 68 | 76 |
| 275 | Jens Voigt | 76 | 76 | 83 | 68 | 77 |
| 276 | Luke Durbridge | 76 | 76 | 83 | 68 | 76 |
| 277 | Lars Bak | 76 | 76 | 83 | 68 | 76 |
| 278 | Kasper Asgreen | 76 | 76 | 82 | 68 | 76 |
| 279 | Marcus Burghardt | 76 | 76 | 82 | 68 | 76 |
| 280 | Manuel Quinziato | 77 | 77 | 81 | 71 | 79 |
| 281 | Michael Rogers | 77 | 77 | 80 | 71 | 79 |
| 282 | Alessandro Ballan | 77 | 77 | 80 | 71 | 80 |
| 283 | Bernhard Eisel | 77 | 77 | 80 | 71 | 79 |
| 284 | Christian Vande Velde | 77 | 77 | 80 | 71 | 79 |
| 285 | Luke Rowe | 79 | 79 | 85 | 60 | 80 |
| 286 | Juan Antonio Flecha | 77 | 77 | 80 | 71 | 79 |
| 287 | George Hincapie | 77 | 77 | 80 | 71 | 79 |
| 288 | Bram Tankink | 77 | 77 | 80 | 71 | 79 |
| 289 | Matteo Tosatto | 76 | 76 | 82 | 68 | 76 |
| 290 | Luca Paolini | 77 | 77 | 80 | 71 | 80 |
| 291 | Yukiya Arashiro | 81 | 81 | 84 | 57 | 79 |
| 292 | Mathew Hayman | 77 | 77 | 80 | 71 | 79 |
| 293 | Fumiyuki Beppu | 79 | 79 | 84 | 58 | 74 |
| 294 | Simon Geschke | 77 | 77 | 81 | 71 | 79 |
| 295 | Sylvain Chavanel | 77 | 77 | 81 | 71 | 80 |
| 296 | Geraint Thomas | 78 | 78 | 81 | 71 | 79 |
| 297 | Gregory Rast | 77 | 77 | 81 | 71 | 79 |
| 298 | Nicolas Roche | 77 | 77 | 81 | 71 | 79 |
| 299 | Koen de Kort | 77 | 77 | 80 | 71 | 79 |
| 300 | David Millar | 77 | 77 | 81 | 71 | 80 |

## 世界選手権ロード・個人TT実績

| No. | 選手名 | ロード金 | ロード銀 | ロード銅 | ITT金 | ITT銀 | ITT銅 | 評価根拠 |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Tadej Pogacar | 2 | 0 | 1 | 0 | 0 | 0 | ロード 金2/銀0/銅1、ITT 金0/銀0/銅0 |
| 2 | Miguel Indurain | 0 | 2 | 1 | 1 | 0 | 0 | ロード 金0/銀2/銅1、ITT 金1/銀0/銅0 |
| 3 | Chris Froome | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 8 | Mathieu van der Poel | 1 | 0 | 1 | 0 | 0 | 0 | ロード 金1/銀0/銅1、ITT 金0/銀0/銅0 |
| 9 | Andre Greipel | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 10 | Jan Ullrich | 0 | 0 | 0 | 2 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金2/銀0/銅1 |
| 13 | Alex Zulle | 0 | 0 | 0 | 1 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀0/銅0 |
| 17 | Marco Pantani | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 19 | Mario Cipollini | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 20 | Mark Cavendish | 1 | 1 | 0 | 0 | 0 | 0 | ロード 金1/銀1/銅0、ITT 金0/銀0/銅0 |
| 21 | Mads Pedersen | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 22 | Remco Evenepoel | 1 | 1 | 0 | 3 | 1 | 2 | ロード 金1/銀1/銅0、ITT 金3/銀1/銅2 |
| 23 | Robbie McEwen | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 27 | Fabian Cancellara | 0 | 0 | 0 | 4 | 0 | 3 | ロード 金0/銀0/銅0、ITT 金4/銀0/銅3 |
| 28 | Michele Bartoli | 0 | 0 | 2 | 0 | 0 | 0 | ロード 金0/銀0/銅2、ITT 金0/銀0/銅0 |
| 29 | Peter Sagan | 3 | 0 | 0 | 0 | 0 | 0 | ロード 金3/銀0/銅0、ITT 金0/銀0/銅0 |
| 30 | Joaquim Rodriguez | 0 | 1 | 1 | 0 | 0 | 0 | ロード 金0/銀1/銅1、ITT 金0/銀0/銅0 |
| 35 | Primoz Roglic | 0 | 0 | 0 | 0 | 1 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅0 |
| 36 | Erik Zabel | 0 | 2 | 1 | 0 | 0 | 0 | ロード 金0/銀2/銅1、ITT 金0/銀0/銅0 |
| 37 | Cadel Evans | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 38 | Wout van Aert | 0 | 2 | 0 | 0 | 2 | 0 | ロード 金0/銀2/銅0、ITT 金0/銀2/銅0 |
| 41 | Julian Alaphilippe | 2 | 0 | 0 | 0 | 0 | 0 | ロード 金2/銀0/銅0、ITT 金0/銀0/銅0 |
| 42 | Paolo Bettini | 2 | 1 | 0 | 0 | 0 | 0 | ロード 金2/銀1/銅0、ITT 金0/銀0/銅0 |
| 44 | Simon Gerrans | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 46 | Romain Bardet | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 51 | Tom Boonen | 1 | 0 | 1 | 0 | 0 | 0 | ロード 金1/銀0/銅1、ITT 金0/銀0/銅0 |
| 52 | Alejandro Valverde | 1 | 2 | 4 | 0 | 0 | 0 | ロード 金1/銀2/銅4、ITT 金0/銀0/銅0 |
| 53 | Maurizio Fondriest | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 58 | Chris Boardman | 0 | 0 | 0 | 1 | 1 | 2 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅2 |
| 64 | Marc Hirschi | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 66 | Rui Costa | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 70 | Johan Museeuw | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 71 | Philippe Gilbert | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 72 | Laurent Jalabert | 0 | 1 | 0 | 1 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金1/銀0/銅0 |
| 75 | Alexander Kristoff | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 76 | Filippo Ganna | 0 | 0 | 0 | 2 | 2 | 1 | ロード 金0/銀0/銅0、ITT 金2/銀2/銅1 |
| 78 | Thor Hushovd | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 79 | Tom Dumoulin | 0 | 0 | 0 | 1 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅1 |
| 85 | Michael Woods | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 94 | Oscar Freire | 3 | 0 | 1 | 0 | 0 | 0 | ロード 金3/銀0/銅1、ITT 金0/銀0/銅0 |
| 96 | Tony Martin | 0 | 0 | 0 | 4 | 1 | 2 | ロード 金0/銀0/銅0、ITT 金4/銀1/銅2 |
| 111 | Peter Van Petegem | 0 | 1 | 1 | 0 | 0 | 0 | ロード 金0/銀1/銅1、ITT 金0/銀0/銅0 |
| 112 | Damiano Cunego | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 113 | Claudio Chiappucci | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 114 | Bradley Wiggins | 0 | 0 | 0 | 1 | 2 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀2/銅0 |
| 128 | Ben Healy | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 133 | Rohan Dennis | 0 | 0 | 0 | 2 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金2/銀0/銅0 |
| 146 | Richard Virenque | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 152 | Joshua Tarling | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 155 | Gustav Erik Larsson | 0 | 0 | 0 | 0 | 1 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅0 |
| 156 | Victor Campenaerts | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 157 | David Zabriskie | 0 | 0 | 0 | 0 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅1 |
| 165 | Michal Kwiatkowski | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 197 | Jonathan Castroviejo | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 216 | Ben O'Connor | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 218 | Michael Matthews | 0 | 1 | 2 | 0 | 0 | 0 | ロード 金0/銀1/銅2、ITT 金0/銀0/銅0 |
| 234 | Tobias Foss | 0 | 0 | 0 | 1 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀0/銅0 |
| 247 | Edoardo Affini | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 250 | Stefan Kung | 0 | 0 | 1 | 0 | 1 | 1 | ロード 金0/銀0/銅1、ITT 金0/銀1/銅1 |
| 252 | Vasil Kiryienka | 0 | 0 | 0 | 1 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅1 |
| 259 | Matthew Goss | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 261 | Dylan van Baarle | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 265 | Christophe Laporte | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 271 | Matteo Trentin | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 281 | Michael Rogers | 0 | 0 | 0 | 3 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金3/銀0/銅0 |
| 282 | Alessandro Ballan | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 290 | Luca Paolini | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 300 | David Millar | 0 | 0 | 0 | 0 | 2 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀2/銅0 |
