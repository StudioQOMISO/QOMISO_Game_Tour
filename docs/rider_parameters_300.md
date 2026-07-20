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

旧「得意役割」「専門役割」は `役割・戦術特性` に統合します。実装上は `preferred_roles` を正本とし、互換列 `specialist_role` は空欄にします。1選手につき主なものから3項目で、エースとサブエースは原則として同時に付与しません。

| No. | カテゴリー | 役割・戦術特性 | ロードレース上の意味 | ゲーム内効果 | 主に参照する能力 | 実戦用語・英語 | 現役選手数 |
|---:|---|---|---|---|---|---|---:|
| 1 | 指揮・勝利 | 総合エース | ステージレースの総合順位で最終勝利を狙う中心選手。 | 複数日にわたるタイム管理と山岳・TTの総合判断を強化する。 | ace_aptitude、climb、cruise、recovery、dailyRecovery | GC leader / General classification leader | 13 |
| 2 | 指揮・勝利 | スプリントエース | 平坦ゴールの集団スプリントで勝利を狙う中心選手。 | スプリントトレインの支援を集中し最終直線の勝負を強化する。 | ace_aptitude、sprint、acceleration、technique | Sprint leader / Team sprinter | 10 |
| 3 | 指揮・勝利 | 丘陵エース | 丘陵、短い急坂、クラシックで勝利を狙う中心選手。 | 起伏区間の位置取りと短時間の決定的な攻撃を強化する。 | ace_aptitude、punch、acceleration、fighting | Hilly classics leader / Puncheur leader | 20 |
| 4 | 指揮・勝利 | 山岳エース | 長い登坂や山頂フィニッシュで勝利を狙う中心選手。 | 山岳支援を集中し登坂終盤の攻撃とペース維持を強化する。 | ace_aptitude、climb、stamina、recovery | Mountain leader / Climbing leader | 7 |
| 5 | 指揮・勝利 | サブエース | エースに次ぐ第二の勝利候補。 | エースの不調や脱落時に第二の勝利プランへ移行する。 | ace_aptitude、recovery、fighting | Co-leader / Backup leader | 4 |
| 6 | 指揮・勝利 | ロードキャプテン | 隊列、追走、補給、危険回避の判断をまとめる現場指揮役。 | 味方の位置取りと戦術判断を安定させる。 | teamwork、technique、recovery | Road captain | 30 |
| 7 | 指揮・勝利 | スーパー・ドメスティーク | エース級の能力で勝利候補を最後まで支える最上位アシスト。 | 高強度牽引と長時間護衛を終盤まで維持する。 | support_aptitude、stamina、recovery、teamwork | Super-domestique | 3 |
| 8 | 指揮・勝利 | ステージハンター | 総合順位より自分に合う特定ステージの勝利を狙う。 | コース適性が合う日の攻撃成功率を高める。 | course_fit、fighting、recovery | Stage hunter | 72 |
| 9 | 指揮・勝利 | 山岳賞ハンター | 山岳ポイントを積み上げ山岳賞を狙う。 | 山岳逃げと山頂通過争いを強化する。 | climb、acceleration、stamina、recovery | KOM hunter / Climber | 120 |
| 10 | 指揮・勝利 | TTスペシャリスト | 個人タイムトライアルで高い巡航速度を維持する。 | 単独走の速度効率とペース配分を高める。 | cruise、technique、stamina | Time-trialist | 25 |
| 11 | スプリント | リードアウト | スプリンターを好位置まで運び最後に加速させる。 | 味方スプリンターの位置取りと加速移行を補助する。 | acceleration、sprint、cruise、teamwork | Lead-out rider | 46 |
| 12 | スプリント | 最終発射台 | ゴール前200〜500mで最後の牽引を行う。 | 風よけを最後まで維持し発射タイミングを最適化する。 | acceleration、sprint、technique、teamwork | Final lead-out | 39 |
| 13 | スプリント | スプリントトレイン | 複数人の高速隊列でスプリンターを前方へ運ぶ。 | 終盤の隊列維持と速度の受け渡しを安定させる。 | cruise、acceleration、sprint、teamwork | Sprint train | 80 |
| 14 | 牽引・保護 | 平坦アシスト | 平坦路で補給、風よけ、位置取りを担当する。 | エースの消耗と集団内トラブルを軽減する。 | cruise、stamina、teamwork | Domestique | 57 |
| 15 | 牽引・保護 | 平坦ペースメーカー | 平坦路で一定の高速ペースを長く刻む。 | 逃げとの差と集団速度を安定させる。 | cruise、stamina、recovery | Pace-setter / Rouleur | 13 |
| 16 | 牽引・保護 | 山岳アシスト | 登りでエースの風よけ、補給、ペース維持を行う。 | エースの登坂時消耗を抑え孤立を遅らせる。 | climb、stamina、recovery、teamwork | Climbing domestique | 84 |
| 17 | 牽引・保護 | 山岳番手 | 山岳終盤までエースのそばに残る最後の山岳アシスト。 | 山頂付近の攻撃対応と最終発射を支援する。 | climb、acceleration、stamina、recovery | Last mountain domestique | 33 |
| 18 | 牽引・保護 | 山岳ペースメーカー | 登りで高い一定ペースを刻みライバルの余力を削る。 | 集団を絞り込み急なアタックを抑制する。 | climb、stamina、cruise | Mountain pace-setter | 14 |
| 19 | 牽引・保護 | TT牽引 | 空力姿勢で高速巡航し平坦の先頭交代を担う。 | 高速隊列の平均速度を引き上げる。 | cruise、stamina、technique | TT puller / Rouleur | 38 |
| 20 | 牽引・保護 | 石畳護衛 | 石畳区間でエースを前方に置きトラブル損失を抑える。 | パヴェ進入時の位置取りとトラブル耐性を補助する。 | pave、fighting、technique、cruise | Cobbled classics protector | 51 |
| 21 | 牽引・保護 | 下り牽引 | 下りで速いラインを示し味方を集団へ導く。 | 下り速度と隊列安定性を高める。 | bikeControl、technique、fighting | Descending guide | 20 |
| 22 | 牽引・保護 | 集団コントローラー | 逃げとの差や集団速度を調整し展開を管理する。 | 追走強度とタイムギャップを安定させる。 | cruise、stamina、teamwork | Peloton controller | 53 |
| 23 | 牽引・保護 | ブレイクアウェイキラー | 逃げ集団を長時間追いゴール前までに吸収する。 | 逃げとのタイム差を効率よく削る。 | cruise、stamina、teamwork | Breakaway killer / Chaser | 8 |
| 24 | 牽引・保護 | 横風要員 | 横風区間でエースを守り分断されない位置へ運ぶ。 | 横風消耗と集団分断リスクを軽減する。 | cruise、fighting、technique、teamwork | Crosswind domestique | 18 |
| 25 | 牽引・保護 | トラブル復帰牽引 | パンクなどで遅れたエースを集団へ連れ戻す。 | 復帰速度を上げエースの消耗を抑える。 | cruise、stamina、teamwork | Chase-back domestique | 0 |
| 26 | 攻撃・逃げ | 逃げ屋 | 序盤から逃げ集団へ入り先行して勝利や露出を狙う。 | 逃げ参加、先頭交代、逃げ残り判断を強化する。 | stamina、cruise、fighting、recovery | Baroudeur / Breakaway specialist | 32 |
| 27 | 攻撃・逃げ | サテライトライダー | 先に逃げへ入り後から追いつくエースを前方で待つ。 | 合流後に補給、牽引、風よけを提供する。 | climb、stamina、recovery、teamwork | Satellite rider | 1 |
| 28 | 駆け引き・位置取り | ポジションキーパー | 重要区間の手前から集団前方の位置を維持する。 | 渋滞、落車、分断に巻き込まれる確率を下げる。 | technique、acceleration、fighting | Positioning specialist | 9 |

詳細な付与ルールの正本は `docs/rider_role_taxonomy.md`、機械可読の正本は `data/rider_role_definitions.json` です。

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

- 主役割が総合・スプリント・丘陵・山岳エースの現役50名には、原則として二つ名と固有勝負手を付与する。
- それ以外はCredit・主要実績・個別選定により付与する。史実上の正式な異名ではなくゲーム内演出名とする。

| No. | 選手名 | 二つ名 | 付与区分 | 根拠 |
|---:|---|---|---|---|
| 1 | Tadej Pogacar | 新時代の皇帝 | エース固有枠 | 総合エース／エース適性100／固有勝負手「皇帝のカウンター」 |
| 2 | Miguel Indurain | 静かなる大機関 | Credit 10,000以上 | Credit 10,850／総合型／クライマー／世界ITT金1 |
| 3 | Chris Froome | 高地の計算王 | Credit 10,000以上 | Credit 10,550／総合型／クライマー |
| 4 | Roberto Heras | 赤き山岳王 | Credit 10,000以上 | Credit 10,500／総合型／クライマー |
| 5 | Alberto Contador | 山岳の射手 | Credit 10,000以上 | Credit 10,300／総合型／クライマー |
| 6 | Vincenzo Nibali | 海峡の鮫 | Credit 10,000以上 | Credit 10,100／総合型／クライマー |
| 7 | Mathieu van der Poel | 虹色の暴君 | エース固有枠 | 丘陵エース／エース適性97／固有勝負手「暴君の射程」 |
| 9 | Jan Ullrich | ドイツの巨砲 | Credit 10,000以上 | Credit 10,700／総合型／クライマー／世界ITT金2 |
| 10 | Alex Zulle | スイスのクロノ砲 | Credit 10,000以上 | Credit 10,600／総合型／TT・ルーラー型／世界ITT金1 |
| 11 | Denis Menchov | 沈黙の総合屋 | Credit 10,000以上 | Credit 10,250／総合型／TT・ルーラー型 |
| 12 | Gilberto Simoni | ジロの山鷲 | Credit 10,000以上 | Credit 10,250／総合型／クライマー |
| 13 | Marco Pantani | 山岳の海賊 | Credit 10,000以上 | Credit 10,000／クライマー／パンチャー |
| 14 | Simon Yates | 赤き山岳の切り札 | 二つ名選定枠 | Credit 9,950／総合型／クライマー |
| 15 | Ivan Basso | 静かなる山岳貴公子 | 二つ名選定枠 | Credit 9,900／総合型／クライマー |
| 16 | Alessandro Petacchi | アドリアの超特急 | 二つ名選定枠 | Credit 9,500／スプリンター／クラシック型 |
| 17 | Mario Cipollini | 伊達男の獅子 | Credit 10,000以上 | Credit 10,050／スプリンター／クラシック型／世界ロード金1 |
| 18 | Mark Cavendish | 最速の島風 | Credit 10,000以上 | Credit 10,150／スプリンター／クラシック型／世界ロード金1 |
| 19 | Paul Seixas | 三色の新星 | エース固有枠 | 総合エース／エース適性94／固有勝負手「新星の飛躍」 |
| 22 | Peter Sagan | 虹のショーマン | Credit 10,000以上 | Credit 11,000／クラシック型／スプリンター／世界ロード金3／パリ〜ルーベ優勝1 |
| 23 | Fabian Cancellara | クロノの剣闘士 | Credit 10,000以上 | Credit 10,950／クラシック型／TT・ルーラー型／世界ITT金4／パリ〜ルーベ優勝3 |
| 24 | Mads Pedersen | 北欧の暴風 | Credit 10,000以上 | Credit 10,800／クラシック型／スプリンター／世界ロード金1 |
| 25 | Michele Bartoli | トスカーナの獅子 | 二つ名選定枠 | Credit 9,750／パンチャー／クライマー |
| 27 | Isaac del Toro | メキシコの火花 | エース固有枠 | 総合エース／エース適性93／固有勝負手「火花の噴出」 |
| 28 | Jonas Vingegaard | 北海の山岳王 | エース固有枠 | 総合エース／エース適性92／固有勝負手「山岳王の封鎖」 |
| 29 | Wout van Aert | 万能の銀弾 | エース固有枠 | 丘陵エース／エース適性92／固有勝負手「銀弾の献身」 |
| 30 | Remco Evenepoel | 弾丸の天才 | エース固有枠 | 総合エース／エース適性92／固有勝負手「弾丸の独走」 |
| 31 | Primoz Roglic | 不屈の跳躍者 | エース固有枠 | 総合エース／エース適性92／固有勝負手「跳躍者の逆転」 |
| 32 | Erik Zabel | ベルリンの鷹 | Credit 10,000以上 | Credit 10,150／クラシック型／パンチャー |
| 33 | Cadel Evans | 豪州の不屈王 | 著名実績枠 | Credit 9,700／パンチャー／クライマー／世界ロード金1 |
| 35 | Paolo Bettini | 黄金のコオロギ | Credit 10,000以上 | Credit 10,300／パンチャー／クライマー／世界ロード金2 |
| 36 | Julian Alaphilippe | 虹色の踊り子 | エース固有枠 | 丘陵エース／エース適性91／固有勝負手「踊り子の一撃」 |
| 40 | Tom Boonen | 石畳の竜巻 | Credit 10,000以上 | Credit 10,800／クラシック型／パンチャー／世界ロード金1／パリ〜ルーベ優勝4 |
| 41 | Franco Ballerini | ルーベの紳士 | Credit 10,000以上 | Credit 10,600／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝2 |
| 42 | Chris Boardman | クロノの教授 | Credit 10,000以上 | Credit 10,450／TT・ルーラー型／クラシック型／世界ITT金1 |
| 43 | Alejandro Valverde | 不沈の緑弾 | Credit 10,000以上 | Credit 10,200／パンチャー／クライマー／世界ロード金1 |
| 45 | Rui Costa | 雨中の世界王者 | 著名実績枠 | Credit 9,550／パンチャー／総合型／世界ロード金1 |
| 46 | Maurizio Fondriest | 虹の伊達男 | 著名実績枠 | Credit 9,400／パンチャー／クライマー／世界ロード金1 |
| 48 | Jasper Philipsen | 低地の快速王 | エース固有枠 | スプリントエース／エース適性90／固有勝負手「快速王の進路」 |
| 55 | Johan Museeuw | フランドルの獅子 | Credit 10,000以上 | Credit 10,750／クラシック型／パンチャー／世界ロード金1／パリ〜ルーベ優勝3 |
| 56 | Andrea Tafi | 石畳の剣闘士 | Credit 10,000以上 | Credit 10,450／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 57 | Niki Terpstra | 北海の逃亡者 | Credit 10,000以上 | Credit 10,350／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 58 | Tom Dumoulin | 低地のクロノバタフライ | 著名実績枠 | Credit 9,950／総合型／TT・ルーラー型／世界ITT金1 |
| 59 | Laurent Jalabert | 変幻のクラシック王 | 著名実績枠 | Credit 9,850／クラシック型／パンチャー／世界ITT金1 |
| 61 | Philippe Gilbert | アルデンヌの王 | 著名実績枠 | Credit 9,700／パンチャー／クライマー／世界ロード金1／パリ〜ルーベ優勝1 |
| 62 | Thor Hushovd | 北欧の雷神 | 著名実績枠 | Credit 9,600／スプリンター／クラシック型／世界ロード金1 |
| 74 | Tony Martin | クロノの装甲車 | Credit 10,000以上 | Credit 10,700／TT・ルーラー型／クラシック型／世界ITT金4 |
| 75 | Filippo Ganna | 蒼きトップギア | エース固有枠 | 丘陵エース／エース適性88／固有勝負手「トップギアの巡航」 |
| 76 | Andrei Tchmil | 北方の鉄人 | Credit 10,000以上 | Credit 10,400／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 77 | Johan Vansummeren | 石畳の長槍 | Credit 10,000以上 | Credit 10,100／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 78 | Oscar Freire | 虹のスナイパー | Credit 10,000以上 | Credit 10,050／スプリンター／クラシック型／世界ロード金3 |
| 79 | Egan Bernal | アンデスの若き王 | エース固有枠 | 総合エース／エース適性88／固有勝負手「若き王の帰還」 |
| 82 | Jonathan Milan | アドリアの大砲 | エース固有枠 | スプリントエース／エース適性88／固有勝負手「大砲の直線」 |
| 84 | Biniam Girmay | アフリカの疾風 | エース固有枠 | スプリントエース／エース適性88／固有勝負手「疾風の突破」 |
| 90 | Peter Van Petegem | フランドルの黒豹 | Credit 10,000以上 | Credit 10,650／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 91 | Bradley Wiggins | 英国のクロノ騎士 | Credit 10,000以上 | Credit 10,350／TT・ルーラー型／総合型／世界ITT金1 |
| 92 | Servais Knaven | ルーベの脱走者 | 著名実績枠 | Credit 9,900／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 98 | Arnaud De Lie | ワロンの猛牛 | エース固有枠 | 丘陵エース／エース適性87／固有勝負手「猛牛の突進」 |
| 101 | Juan Ayuso | イベリアの野心家 | エース固有枠 | 総合エース／エース適性87／固有勝負手「野心家の主導権」 |
| 102 | Olav Kooij | 低地の若き矢 | エース固有枠 | スプリントエース／エース適性87／固有勝負手「若き矢の最短路」 |
| 107 | Rohan Dennis | 豪州の時計砕き | Credit 10,000以上 | Credit 10,400／TT・ルーラー型／総合型／世界ITT金2 |
| 108 | Magnus Backstedt | 北欧の巨人 | 著名実績枠 | Credit 9,750／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |
| 109 | Sonny Colbrelli | 泥雨の王 | 著名実績枠 | Credit 9,650／クラシック型／スプリンター／パリ〜ルーベ優勝1 |
| 111 | Alberto Bettiol | トスカーナの剛脚 | エース固有枠 | 丘陵エース／エース適性86／固有勝負手「剛脚の突破口」 |
| 113 | Tim Wellens | 雨天の狩人 | エース固有枠 | 丘陵エース／エース適性86／固有勝負手「狩人の勝負勘」 |
| 114 | Mattias Skjelmose | 北欧の鋭刃 | エース固有枠 | 丘陵エース／エース適性86／固有勝負手「鋭刃の勾配」 |
| 116 | Kaden Groves | 豪州の快速車 | エース固有枠 | スプリントエース／エース適性86／固有勝負手「快速車の巡航」 |
| 119 | Fabio Jakobsen | 不屈の疾走者 | エース固有枠 | スプリントエース／エース適性86／固有勝負手「疾走者の復活」 |
| 120 | Tom Pidcock | 英国の曲芸師 | エース固有枠 | 丘陵エース／エース適性86／固有勝負手「曲芸師の悪路」 |
| 122 | Jasper Stuyven | ルーヴェンの石畳槍 | エース固有枠 | 丘陵エース／エース適性85／固有勝負手「石畳槍の射程」 |
| 125 | Warren Barguil | ブルターニュの山猫 | エース固有枠 | 山岳エース／エース適性85／固有勝負手「山猫の頂上」 |
| 127 | Maxim Van Gils | 低地のパンチ砲 | エース固有枠 | 丘陵エース／エース適性85／固有勝負手「パンチ砲の一閃」 |
| 128 | Pascal Ackermann | ドイツの急行 | エース固有枠 | スプリントエース／エース適性85／固有勝負手「急行の最終便」 |
| 129 | Giulio Ciccone | 青き山岳狩人 | エース固有枠 | 山岳エース／エース適性84／固有勝負手「山岳狩人の牙」 |
| 130 | Jai Hindley | 豪州の山岳航海士 | エース固有枠 | 総合エース／エース適性84／固有勝負手「航海士の登坂路」 |
| 131 | Matej Mohoric | 下りの異端児 | エース固有枠 | 丘陵エース／エース適性84／固有勝負手「異端児の下降線」 |
| 132 | David Gaudu | ブルターニュの山岳剣 | エース固有枠 | 山岳エース／エース適性84／固有勝負手「山岳剣の頂上戦」 |
| 133 | Tiesj Benoot | 石畳の闘犬 | エース固有枠 | 丘陵エース／エース適性84／固有勝負手「闘犬の追走」 |
| 134 | Valentin Madouas | 丘陵の青い閃光 | エース固有枠 | 丘陵エース／エース適性84／固有勝負手「閃光の残像」 |
| 135 | Florian Lipowitz | ドイツの山岳新星 | エース固有枠 | 総合エース／エース適性84／固有勝負手「新星の登攀」 |
| 136 | Pello Bilbao | バスクの急降下 | エース固有枠 | 丘陵エース／エース適性84／固有勝負手「急降下の勝負線」 |
| 137 | Romain Gregoire | フランスの若き拳 | エース固有枠 | 丘陵エース／エース適性84／固有勝負手「若き拳の連打」 |
| 138 | Juan Sebastian Molano | コロンビアの快速弾 | エース固有枠 | スプリントエース／エース適性84／固有勝負手「快速弾の発射」 |
| 141 | Jhonatan Narvaez | アンデスのパンチ砲 | エース固有枠 | 丘陵エース／エース適性83／固有勝負手「パンチ砲の連撃」 |
| 142 | Felix Gall | アルプスの登坂者 | エース固有枠 | 山岳エース／エース適性83／固有勝負手「登坂者の耐久戦」 |
| 143 | Jordi Meeus | 低地の突風 | エース固有枠 | スプリントエース／エース適性83／固有勝負手「突風の直線」 |
| 144 | Tim Merlier | 石畳の快速王 | エース固有枠 | スプリントエース／エース適性83／固有勝負手「石畳王の号砲」 |
| 145 | Antonio Tiberi | ローマの計算者 | エース固有枠 | 総合エース／エース適性83／固有勝負手「計算者の方程式」 |
| 146 | Oscar Onley | 英国の山岳拳 | エース固有枠 | 丘陵エース／エース適性83／固有勝負手「山岳拳の一撃」 |
| 147 | Benoit Cosnefroy | ノルマンディーの速射砲 | エース固有枠 | 丘陵エース／エース適性83／固有勝負手「速射砲の連射」 |
| 149 | Guillaume Martin | 哲学する山岳者 | エース固有枠 | 山岳エース／エース適性82／固有勝負手「哲学者の選択」 |
| 150 | Giulio Pellizzari | アペニンの新星 | エース固有枠 | 山岳エース／エース適性82／固有勝負手「新星の上昇」 |
| 151 | Enric Mas | 静かなる山岳騎士 | エース固有枠 | 総合エース／エース適性82／固有勝負手「山岳騎士の圧力」 |
| 155 | John Degenkolb | 石畳の重戦車 | エース固有枠 | 丘陵エース／エース適性80／固有勝負手「重戦車の粉砕」 |
| 156 | Michal Kwiatkowski | ポーランドの虹 | 著名実績枠 | Credit 9,350／クライマー／総合型／世界ロード金1 |
| 160 | Richard Carapaz | アンデスの機関車 | エース固有枠 | 総合エース／エース適性80／固有勝負手「機関車の奇襲」 |
| 164 | Nairo Quintana | アンデスの鷹 | エース固有枠 | 山岳エース／エース適性77／固有勝負手「鷹の飛翔」 |
| 175 | Tobias Foss | 北欧のクロノ王 | 著名実績枠 | Credit 4,950／TT・ルーラー型／総合型／世界ITT金1 |
| 184 | Greg Van Avermaet | 黄金のクラシックハンター | 著名実績枠 | Credit 5,700／クラシック型／パンチャー／パリ〜ルーベ優勝1 |
| 262 | Vasil Kiryienka | 鉄壁のクロノ職人 | 著名実績枠 | Credit 4,850／TT・ルーラー型／総合型／世界ITT金1 |
| 276 | Stuart O'Grady | 豪州の石畳魂 | 著名実績枠 | Credit 3,600／TT・ルーラー型／クラシック型／パリ〜ルーベ優勝1 |
| 283 | Alessandro Ballan | 虹を掴んだ石畳屋 | 著名実績枠 | Credit 4,200／クラシック型／TT・ルーラー型／世界ロード金1 |
| 284 | Michael Rogers | 三冠のクロノマン | 著名実績枠 | Credit 3,700／クラシック型／TT・ルーラー型／世界ITT金3 |
| 292 | Mathew Hayman | 石畳の伏兵 | 著名実績枠 | Credit 3,550／クラシック型／TT・ルーラー型／パリ〜ルーベ優勝1 |

## 勝負・走行能力

| No. | 選手名 | スプリント | 加速力 | パンチ力 | 巡航力 | 登坂力 |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Tadej Pogacar | 66 | 80 | 85 | 82 | 88 |
| 2 | Miguel Indurain | 58 | 71 | 76 | 73 | 84 |
| 3 | Chris Froome | 58 | 71 | 76 | 73 | 84 |
| 4 | Roberto Heras | 59 | 71 | 75 | 71 | 83 |
| 5 | Alberto Contador | 58 | 71 | 76 | 72 | 84 |
| 6 | Vincenzo Nibali | 59 | 71 | 77 | 71 | 83 |
| 7 | Mathieu van der Poel | 78 | 76 | 79 | 79 | 68 |
| 8 | Andre Greipel | 82 | 82 | 70 | 73 | 57 |
| 9 | Jan Ullrich | 58 | 71 | 75 | 73 | 84 |
| 10 | Alex Zulle | 61 | 70 | 73 | 73 | 79 |
| 11 | Denis Menchov | 62 | 70 | 73 | 73 | 83 |
| 12 | Gilberto Simoni | 59 | 70 | 75 | 71 | 83 |
| 13 | Marco Pantani | 57 | 74 | 75 | 65 | 80 |
| 14 | Simon Yates | 58 | 70 | 75 | 71 | 82 |
| 15 | Ivan Basso | 58 | 70 | 75 | 71 | 82 |
| 16 | Alessandro Petacchi | 85 | 85 | 70 | 73 | 57 |
| 17 | Mario Cipollini | 85 | 85 | 70 | 73 | 57 |
| 18 | Mark Cavendish | 84 | 83 | 67 | 73 | 55 |
| 19 | Paul Seixas | 62 | 71 | 76 | 69 | 77 |
| 20 | Robbie McEwen | 82 | 82 | 70 | 72 | 57 |
| 21 | Andy Schleck | 59 | 72 | 74 | 65 | 81 |
| 22 | Peter Sagan | 77 | 77 | 78 | 77 | 72 |
| 23 | Fabian Cancellara | 75 | 74 | 79 | 84 | 67 |
| 24 | Mads Pedersen | 79 | 76 | 77 | 79 | 64 |
| 25 | Michele Bartoli | 68 | 78 | 82 | 67 | 74 |
| 26 | Joaquim Rodriguez | 69 | 78 | 82 | 67 | 74 |
| 27 | Isaac del Toro | 62 | 70 | 76 | 69 | 77 |
| 28 | Jonas Vingegaard | 58 | 71 | 75 | 72 | 85 |
| 29 | Wout van Aert | 76 | 75 | 78 | 83 | 69 |
| 30 | Remco Evenepoel | 61 | 70 | 74 | 85 | 80 |
| 31 | Primoz Roglic | 64 | 72 | 76 | 73 | 84 |
| 32 | Erik Zabel | 77 | 76 | 78 | 78 | 68 |
| 33 | Cadel Evans | 69 | 77 | 82 | 67 | 73 |
| 34 | Carlos Sastre | 59 | 72 | 72 | 65 | 82 |
| 35 | Paolo Bettini | 71 | 78 | 82 | 67 | 74 |
| 36 | Julian Alaphilippe | 69 | 76 | 80 | 66 | 73 |
| 37 | Simon Gerrans | 69 | 77 | 81 | 66 | 73 |
| 38 | Djamolidine Abdoujaparov | 83 | 83 | 70 | 73 | 58 |
| 39 | Arnaud Demare | 83 | 82 | 70 | 72 | 58 |
| 40 | Tom Boonen | 75 | 75 | 78 | 79 | 68 |
| 41 | Franco Ballerini | 74 | 73 | 76 | 80 | 67 |
| 42 | Chris Boardman | 69 | 68 | 68 | 84 | 69 |
| 43 | Alejandro Valverde | 72 | 77 | 82 | 67 | 74 |
| 44 | Stijn Devolder | 74 | 73 | 77 | 81 | 67 |
| 45 | Rui Costa | 70 | 77 | 81 | 68 | 73 |
| 46 | Maurizio Fondriest | 69 | 77 | 81 | 66 | 73 |
| 47 | Marc Hirschi | 74 | 78 | 84 | 68 | 73 |
| 48 | Jasper Philipsen | 83 | 83 | 70 | 73 | 58 |
| 49 | Chris Horner | 58 | 70 | 74 | 69 | 79 |
| 50 | Aleksandr Vlasov | 58 | 69 | 74 | 69 | 77 |
| 51 | Thibaut Pinot | 59 | 72 | 73 | 64 | 80 |
| 52 | Andreas Kloden | 61 | 68 | 72 | 70 | 76 |
| 53 | Tom Steels | 82 | 81 | 70 | 72 | 58 |
| 54 | Dylan Groenewegen | 80 | 80 | 69 | 72 | 58 |
| 55 | Johan Museeuw | 75 | 75 | 78 | 79 | 68 |
| 56 | Andrea Tafi | 74 | 73 | 77 | 81 | 68 |
| 57 | Niki Terpstra | 74 | 73 | 76 | 80 | 67 |
| 58 | Tom Dumoulin | 61 | 68 | 72 | 73 | 76 |
| 59 | Laurent Jalabert | 76 | 75 | 78 | 78 | 72 |
| 60 | Alexander Kristoff | 76 | 75 | 76 | 76 | 64 |
| 61 | Philippe Gilbert | 68 | 78 | 82 | 66 | 73 |
| 62 | Thor Hushovd | 82 | 83 | 70 | 72 | 58 |
| 63 | Romain Bardet | 59 | 72 | 73 | 65 | 80 |
| 64 | Nick Nuyens | 75 | 75 | 77 | 75 | 68 |
| 65 | Danilo Di Luca | 70 | 77 | 84 | 69 | 73 |
| 66 | Michael Woods | 69 | 76 | 80 | 66 | 73 |
| 67 | Esteban Chaves | 60 | 71 | 73 | 65 | 78 |
| 68 | Rigoberto Uran | 58 | 69 | 73 | 68 | 77 |
| 69 | Levi Leipheimer | 61 | 68 | 72 | 70 | 76 |
| 70 | Dylan Teuns | 69 | 76 | 81 | 66 | 73 |
| 71 | Nacer Bouhanni | 83 | 82 | 70 | 71 | 61 |
| 72 | Elia Viviani | 80 | 79 | 68 | 72 | 59 |
| 73 | Davide Rebellin | 68 | 76 | 80 | 66 | 73 |
| 74 | Tony Martin | 69 | 69 | 68 | 84 | 69 |
| 75 | Filippo Ganna | 69 | 68 | 68 | 85 | 69 |
| 76 | Andrei Tchmil | 75 | 73 | 77 | 80 | 67 |
| 77 | Johan Vansummeren | 74 | 73 | 75 | 79 | 67 |
| 78 | Oscar Freire | 83 | 83 | 70 | 73 | 58 |
| 79 | Egan Bernal | 58 | 70 | 74 | 69 | 81 |
| 80 | Joao Almeida | 61 | 70 | 72 | 72 | 77 |
| 81 | Evgeni Berzin | 61 | 68 | 72 | 70 | 76 |
| 82 | Jonathan Milan | 82 | 81 | 69 | 73 | 59 |
| 83 | Fabio Aru | 58 | 69 | 73 | 69 | 79 |
| 84 | Biniam Girmay | 79 | 84 | 71 | 71 | 61 |
| 85 | Jakob Fuglsang | 70 | 77 | 82 | 68 | 73 |
| 86 | Marcel Kittel | 81 | 81 | 70 | 72 | 57 |
| 87 | Sam Bennett | 81 | 81 | 70 | 72 | 58 |
| 88 | Tyler Farrar | 80 | 80 | 69 | 71 | 58 |
| 89 | Fernando Gaviria | 80 | 79 | 68 | 72 | 59 |
| 90 | Peter Van Petegem | 75 | 75 | 78 | 76 | 68 |
| 91 | Bradley Wiggins | 65 | 67 | 68 | 83 | 72 |
| 92 | Servais Knaven | 74 | 73 | 75 | 79 | 67 |
| 93 | Damiano Cunego | 69 | 78 | 85 | 67 | 75 |
| 94 | Claudio Chiappucci | 61 | 72 | 72 | 65 | 81 |
| 95 | Luis Leon Sanchez | 69 | 68 | 68 | 82 | 70 |
| 96 | Filippo Pozzato | 76 | 74 | 75 | 75 | 64 |
| 97 | Michael Rasmussen | 57 | 69 | 71 | 65 | 80 |
| 98 | Arnaud De Lie | 75 | 83 | 80 | 68 | 72 |
| 99 | Ben Healy | 69 | 76 | 80 | 66 | 73 |
| 100 | Pavel Tonkov | 58 | 69 | 73 | 69 | 78 |
| 101 | Juan Ayuso | 62 | 71 | 76 | 69 | 77 |
| 102 | Olav Kooij | 81 | 80 | 69 | 73 | 59 |
| 103 | Caleb Ewan | 84 | 84 | 70 | 71 | 61 |
| 104 | Samuel Sanchez | 62 | 70 | 75 | 68 | 75 |
| 105 | Daniel Martin | 69 | 77 | 82 | 66 | 73 |
| 106 | Daniele Bennati | 81 | 80 | 69 | 72 | 58 |
| 107 | Rohan Dennis | 65 | 68 | 69 | 83 | 72 |
| 108 | Magnus Backstedt | 74 | 72 | 75 | 74 | 67 |
| 109 | Sonny Colbrelli | 76 | 74 | 75 | 74 | 64 |
| 110 | Steffen Wesemann | 74 | 72 | 76 | 74 | 67 |
| 111 | Alberto Bettiol | 75 | 75 | 77 | 75 | 68 |
| 112 | Carlos Rodriguez | 58 | 70 | 74 | 68 | 78 |
| 113 | Tim Wellens | 74 | 78 | 85 | 69 | 72 |
| 114 | Mattias Skjelmose | 70 | 77 | 81 | 69 | 73 |
| 115 | Oscar Pereiro | 61 | 68 | 72 | 71 | 76 |
| 116 | Kaden Groves | 83 | 82 | 70 | 72 | 58 |
| 117 | Jose Rujano | 60 | 71 | 72 | 64 | 78 |
| 118 | Ryder Hesjedal | 61 | 68 | 72 | 70 | 76 |
| 119 | Fabio Jakobsen | 81 | 81 | 70 | 72 | 58 |
| 120 | Tom Pidcock | 75 | 75 | 78 | 77 | 68 |
| 121 | Michael Albasini | 75 | 79 | 79 | 67 | 72 |
| 122 | Jasper Stuyven | 76 | 74 | 76 | 75 | 64 |
| 123 | Richard Virenque | 59 | 71 | 72 | 64 | 81 |
| 124 | Lenny Martinez | 60 | 71 | 73 | 65 | 78 |
| 125 | Warren Barguil | 60 | 71 | 72 | 65 | 79 |
| 126 | Iban Mayo | 60 | 70 | 72 | 64 | 77 |
| 127 | Maxim Van Gils | 69 | 76 | 80 | 66 | 73 |
| 128 | Pascal Ackermann | 80 | 79 | 68 | 73 | 59 |
| 129 | Giulio Ciccone | 60 | 71 | 73 | 65 | 81 |
| 130 | Jai Hindley | 58 | 69 | 73 | 69 | 78 |
| 131 | Matej Mohoric | 75 | 74 | 77 | 75 | 68 |
| 132 | David Gaudu | 57 | 70 | 71 | 65 | 79 |
| 133 | Tiesj Benoot | 74 | 74 | 77 | 75 | 68 |
| 134 | Valentin Madouas | 74 | 76 | 82 | 67 | 72 |
| 135 | Florian Lipowitz | 58 | 69 | 73 | 68 | 77 |
| 136 | Pello Bilbao | 70 | 76 | 79 | 67 | 73 |
| 137 | Romain Gregoire | 75 | 80 | 79 | 68 | 72 |
| 138 | Juan Sebastian Molano | 80 | 79 | 68 | 72 | 59 |
| 139 | Derek Gee | 65 | 67 | 67 | 81 | 72 |
| 140 | Thomas De Gendt | 68 | 67 | 67 | 81 | 69 |
| 141 | Jhonatan Narvaez | 74 | 78 | 84 | 68 | 72 |
| 142 | Felix Gall | 57 | 69 | 71 | 64 | 79 |
| 143 | Jordi Meeus | 79 | 80 | 69 | 71 | 58 |
| 144 | Tim Merlier | 79 | 79 | 69 | 71 | 58 |
| 145 | Antonio Tiberi | 61 | 68 | 71 | 70 | 75 |
| 146 | Oscar Onley | 69 | 76 | 79 | 65 | 73 |
| 147 | Benoit Cosnefroy | 75 | 79 | 79 | 67 | 72 |
| 148 | Gustav Erik Larsson | 69 | 67 | 67 | 83 | 69 |
| 149 | Guillaume Martin | 57 | 69 | 71 | 65 | 80 |
| 150 | Giulio Pellizzari | 57 | 69 | 71 | 64 | 78 |
| 151 | Enric Mas | 58 | 68 | 73 | 67 | 76 |
| 152 | David Zabriskie | 65 | 67 | 67 | 82 | 72 |
| 153 | Joshua Tarling | 69 | 68 | 67 | 83 | 69 |
| 154 | Soren Waerenskjold | 72 | 69 | 67 | 80 | 67 |
| 155 | John Degenkolb | 75 | 75 | 77 | 75 | 68 |
| 156 | Michal Kwiatkowski | 58 | 68 | 70 | 64 | 78 |
| 157 | Victor Campenaerts | 69 | 67 | 67 | 82 | 69 |
| 158 | Tobias Ludvigsson | 65 | 66 | 67 | 82 | 72 |
| 159 | Jose Azevedo | 65 | 66 | 67 | 81 | 72 |
| 160 | Richard Carapaz | 57 | 68 | 72 | 67 | 79 |
| 161 | Stefan Bissegger | 69 | 67 | 67 | 83 | 69 |
| 162 | Wout Poels | 57 | 68 | 71 | 64 | 77 |
| 163 | Richie Porte | 57 | 68 | 70 | 64 | 77 |
| 164 | Nairo Quintana | 59 | 71 | 72 | 65 | 80 |
| 165 | Sepp Kuss | 57 | 70 | 70 | 66 | 76 |
| 166 | Michael Matthews | 65 | 64 | 67 | 80 | 71 |
| 167 | Rafal Majka | 56 | 67 | 69 | 63 | 76 |
| 168 | Aime De Gendt | 72 | 72 | 74 | 70 | 67 |
| 169 | Laurens De Plus | 56 | 67 | 69 | 64 | 76 |
| 170 | Daniel Oss | 74 | 72 | 75 | 72 | 67 |
| 171 | Ben O'Connor | 56 | 65 | 67 | 60 | 75 |
| 172 | Luke Plapp | 64 | 64 | 66 | 78 | 71 |
| 173 | Adam Yates | 56 | 67 | 69 | 63 | 76 |
| 174 | Amund Grondahl Jansen | 72 | 72 | 74 | 70 | 67 |
| 175 | Tobias Foss | 64 | 62 | 65 | 77 | 70 |
| 176 | Stefan Kung | 68 | 65 | 64 | 79 | 68 |
| 177 | Jens Keukeleire | 73 | 72 | 75 | 72 | 67 |
| 178 | Marco Haller | 73 | 72 | 74 | 71 | 67 |
| 179 | Sep Vanmarcke | 72 | 72 | 74 | 70 | 67 |
| 180 | Jonathan Castroviejo | 64 | 62 | 66 | 78 | 70 |
| 181 | Damiano Caruso | 56 | 67 | 69 | 63 | 75 |
| 182 | Carlos Verona | 56 | 67 | 69 | 63 | 75 |
| 183 | Mike Teunissen | 79 | 75 | 66 | 69 | 58 |
| 184 | Greg Van Avermaet | 74 | 72 | 74 | 71 | 67 |
| 185 | Heinrich Haussler | 73 | 72 | 74 | 71 | 67 |
| 186 | Bob Jungels | 64 | 63 | 67 | 77 | 71 |
| 187 | Santiago Buitrago | 56 | 67 | 69 | 63 | 75 |
| 188 | Wilco Kelderman | 56 | 67 | 69 | 63 | 75 |
| 189 | Mark Renshaw | 76 | 75 | 66 | 69 | 58 |
| 190 | Boy van Poppel | 78 | 74 | 66 | 68 | 58 |
| 191 | Lawson Craddock | 64 | 63 | 66 | 76 | 70 |
| 192 | Winner Anacona | 56 | 66 | 68 | 61 | 74 |
| 193 | Thymen Arensman | 56 | 66 | 68 | 61 | 74 |
| 194 | Jacopo Guarnieri | 77 | 73 | 65 | 67 | 58 |
| 195 | Taco van der Hoorn | 73 | 72 | 74 | 71 | 67 |
| 196 | Sebastian Langeveld | 73 | 72 | 74 | 71 | 67 |
| 197 | Zdenek Stybar | 73 | 72 | 74 | 71 | 67 |
| 198 | Stijn Vandenbergh | 72 | 71 | 73 | 70 | 67 |
| 199 | Tao Geoghegan Hart | 56 | 67 | 69 | 64 | 76 |
| 200 | Cameron Wurf | 64 | 63 | 66 | 76 | 70 |
| 201 | Frederik Frison | 72 | 71 | 73 | 69 | 67 |
| 202 | Remi Cavagna | 64 | 62 | 65 | 75 | 70 |
| 203 | Brandon McNulty | 56 | 66 | 68 | 62 | 74 |
| 204 | Pavel Sivakov | 56 | 66 | 68 | 62 | 74 |
| 205 | Luka Mezgec | 79 | 75 | 66 | 69 | 58 |
| 206 | Danny van Poppel | 79 | 75 | 66 | 68 | 58 |
| 207 | Simone Consonni | 78 | 74 | 66 | 68 | 58 |
| 208 | Davide Ballerini | 78 | 74 | 65 | 67 | 58 |
| 209 | Florian Vermeersch | 72 | 71 | 73 | 70 | 67 |
| 210 | Dylan van Baarle | 68 | 65 | 64 | 79 | 68 |
| 211 | Edoardo Affini | 64 | 62 | 65 | 78 | 70 |
| 212 | Kanstantsin Siutsou | 64 | 64 | 66 | 77 | 70 |
| 213 | Matteo Trentin | 68 | 63 | 61 | 77 | 67 |
| 214 | Haimar Zubeldia | 56 | 66 | 69 | 62 | 75 |
| 215 | Sergio Henao | 56 | 66 | 68 | 62 | 75 |
| 216 | Maarten Wynants | 72 | 71 | 73 | 70 | 67 |
| 217 | Nils Politt | 68 | 65 | 65 | 78 | 68 |
| 218 | Magnus Sheffield | 64 | 62 | 65 | 75 | 70 |
| 219 | Christophe Laporte | 76 | 73 | 61 | 67 | 57 |
| 220 | Marc Soler | 56 | 66 | 68 | 62 | 74 |
| 221 | Edward Theuns | 78 | 74 | 66 | 68 | 58 |
| 222 | Leif Hoste | 72 | 71 | 73 | 70 | 67 |
| 223 | Bert Van Lerberghe | 78 | 74 | 66 | 68 | 58 |
| 224 | Nikias Arndt | 77 | 73 | 64 | 67 | 58 |
| 225 | Roger Kluge | 77 | 73 | 64 | 66 | 58 |
| 226 | Roman Kreuziger | 56 | 66 | 69 | 63 | 75 |
| 227 | Daniel Navarro | 56 | 66 | 68 | 62 | 75 |
| 228 | Chad Haga | 64 | 61 | 64 | 75 | 70 |
| 229 | Yves Lampaert | 68 | 64 | 64 | 76 | 68 |
| 230 | Jan Tratnik | 64 | 61 | 64 | 75 | 70 |
| 231 | Tim Declercq | 61 | 57 | 57 | 76 | 67 |
| 232 | Mikel Landa | 56 | 65 | 67 | 57 | 74 |
| 233 | Salvatore Puccio | 68 | 64 | 63 | 76 | 68 |
| 234 | Nelson Oliveira | 64 | 61 | 63 | 75 | 69 |
| 235 | Jasper De Buyst | 76 | 73 | 63 | 66 | 58 |
| 236 | Lars Boom | 72 | 72 | 74 | 70 | 67 |
| 237 | Domenico Pozzovivo | 56 | 67 | 69 | 63 | 75 |
| 238 | Jose Luis Rubiera | 56 | 66 | 69 | 62 | 75 |
| 239 | Nathan Van Hooydonck | 68 | 65 | 65 | 77 | 68 |
| 240 | Fabio Sabatini | 77 | 74 | 65 | 68 | 58 |
| 241 | Jack Bauer | 68 | 64 | 63 | 76 | 68 |
| 242 | Michael Hepburn | 68 | 64 | 63 | 76 | 68 |
| 243 | Mikkel Bjerg | 67 | 63 | 60 | 74 | 67 |
| 244 | Andrey Amador | 56 | 66 | 68 | 61 | 74 |
| 245 | Pierre Rolland | 56 | 65 | 68 | 63 | 74 |
| 246 | Robert Gesink | 56 | 65 | 67 | 59 | 74 |
| 247 | Maximiliano Richeze | 77 | 74 | 65 | 68 | 58 |
| 248 | Luke Durbridge | 68 | 64 | 63 | 76 | 68 |
| 249 | Vegard Stake Laengen | 68 | 63 | 61 | 74 | 67 |
| 250 | Luke Rowe | 67 | 67 | 71 | 70 | 65 |
| 251 | Mikel Nieve | 56 | 66 | 68 | 61 | 75 |
| 252 | Eros Poli | 68 | 65 | 66 | 78 | 68 |
| 253 | Igor Anton | 56 | 66 | 68 | 61 | 74 |
| 254 | Maarten Tjallingii | 68 | 65 | 65 | 77 | 68 |
| 255 | Tanel Kangert | 56 | 65 | 67 | 60 | 74 |
| 256 | Iljo Keisse | 78 | 74 | 66 | 68 | 58 |
| 257 | Alex Dowsett | 64 | 60 | 62 | 74 | 69 |
| 258 | Roy Curvers | 77 | 73 | 64 | 67 | 58 |
| 259 | Rein Taaramae | 56 | 65 | 67 | 58 | 74 |
| 260 | Kasper Asgreen | 68 | 63 | 65 | 75 | 67 |
| 261 | Gert Steegmans | 76 | 73 | 63 | 66 | 58 |
| 262 | Vasil Kiryienka | 64 | 61 | 63 | 78 | 70 |
| 263 | Matthew Goss | 76 | 73 | 62 | 67 | 58 |
| 264 | Jos van Emden | 68 | 65 | 65 | 77 | 68 |
| 265 | Michael Morkov | 78 | 74 | 66 | 68 | 58 |
| 266 | Jan Barta | 64 | 60 | 62 | 74 | 69 |
| 267 | Viatcheslav Ekimov | 68 | 63 | 62 | 75 | 67 |
| 268 | Ramon Sinkeldam | 77 | 73 | 64 | 68 | 58 |
| 269 | Jurgen Roelandts | 77 | 73 | 63 | 66 | 58 |
| 270 | Greg Henderson | 76 | 73 | 62 | 66 | 58 |
| 271 | Maciej Bodnar | 68 | 65 | 65 | 77 | 68 |
| 272 | Dries Devenyns | 68 | 63 | 62 | 74 | 67 |
| 273 | Brent Bookwalter | 64 | 58 | 61 | 74 | 69 |
| 274 | Yukiya Arashiro | 65 | 67 | 70 | 69 | 68 |
| 275 | Simon Geschke | 71 | 69 | 71 | 70 | 66 |
| 276 | Stuart O'Grady | 68 | 64 | 64 | 76 | 68 |
| 277 | Tejay van Garderen | 64 | 59 | 61 | 74 | 69 |
| 278 | Daryl Impey | 72 | 70 | 72 | 72 | 66 |
| 279 | Ian Stannard | 67 | 62 | 59 | 74 | 67 |
| 280 | Jens Voigt | 68 | 64 | 64 | 76 | 68 |
| 281 | Lars Bak | 68 | 64 | 62 | 75 | 67 |
| 282 | Marcus Burghardt | 67 | 62 | 60 | 74 | 67 |
| 283 | Alessandro Ballan | 71 | 69 | 72 | 71 | 66 |
| 284 | Michael Rogers | 71 | 70 | 71 | 74 | 66 |
| 285 | Manuel Quinziato | 71 | 70 | 72 | 72 | 66 |
| 286 | Bernhard Eisel | 71 | 69 | 71 | 70 | 66 |
| 287 | Christian Vande Velde | 71 | 69 | 71 | 70 | 65 |
| 288 | Bram Tankink | 71 | 69 | 71 | 70 | 65 |
| 289 | Juan Antonio Flecha | 71 | 69 | 71 | 71 | 66 |
| 290 | George Hincapie | 71 | 69 | 71 | 70 | 66 |
| 291 | Matteo Tosatto | 67 | 61 | 58 | 74 | 66 |
| 292 | Mathew Hayman | 71 | 69 | 71 | 70 | 65 |
| 293 | Luca Paolini | 71 | 70 | 71 | 71 | 66 |
| 294 | Sylvain Chavanel | 71 | 68 | 71 | 70 | 64 |
| 295 | Fumiyuki Beppu | 66 | 66 | 69 | 69 | 69 |
| 296 | Geraint Thomas | 72 | 70 | 72 | 73 | 67 |
| 297 | Gregory Rast | 71 | 69 | 71 | 69 | 65 |
| 298 | Koen de Kort | 71 | 68 | 70 | 69 | 64 |
| 299 | Nicolas Roche | 71 | 68 | 71 | 69 | 64 |
| 300 | David Millar | 71 | 70 | 72 | 74 | 66 |

## 持久・技術・路面能力

| No. | 選手名 | 持久力 | 耐性 | 技術 | バイクコントロール | パヴェ | パヴェ確認 |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Tadej Pogacar | 88 | 86 | 84 | 83 | 82 | 結果照合済 |
| 2 | Miguel Indurain | 81 | 81 | 72 | 72 | 50 | 要出走確認 |
| 3 | Chris Froome | 80 | 76 | 71 | 72 | 50 | 要出走確認 |
| 4 | Roberto Heras | 81 | 79 | 70 | 72 | 50 | 要出走確認 |
| 5 | Alberto Contador | 80 | 76 | 71 | 71 | 50 | 要出走確認 |
| 6 | Vincenzo Nibali | 80 | 76 | 70 | 71 | 50 | 要出走確認 |
| 7 | Mathieu van der Poel | 83 | 85 | 81 | 85 | 85 | 結果照合済 |
| 8 | Andre Greipel | 67 | 68 | 69 | 73 | 69 | 結果照合済 |
| 9 | Jan Ullrich | 81 | 79 | 70 | 72 | 50 | 要出走確認 |
| 10 | Alex Zulle | 81 | 79 | 73 | 72 | 50 | 要出走確認 |
| 11 | Denis Menchov | 81 | 79 | 72 | 72 | 50 | 要出走確認 |
| 12 | Gilberto Simoni | 81 | 79 | 69 | 71 | 50 | 要出走確認 |
| 13 | Marco Pantani | 77 | 79 | 69 | 73 | 50 | 手動検証済 |
| 14 | Simon Yates | 80 | 76 | 69 | 71 | 50 | 要出走確認 |
| 15 | Ivan Basso | 80 | 76 | 69 | 71 | 50 | 要出走確認 |
| 16 | Alessandro Petacchi | 68 | 69 | 69 | 73 | 50 | 要出走確認 |
| 17 | Mario Cipollini | 69 | 69 | 70 | 73 | 50 | 要出走確認 |
| 18 | Mark Cavendish | 67 | 69 | 77 | 72 | 69 | 手動検証済 |
| 19 | Paul Seixas | 74 | 75 | 68 | 70 | 50 | 要出走確認 |
| 20 | Robbie McEwen | 66 | 68 | 69 | 73 | 50 | 要出走確認 |
| 21 | Andy Schleck | 75 | 74 | 67 | 70 | 50 | 要出走確認 |
| 22 | Peter Sagan | 83 | 84 | 85 | 83 | 84 | 手動検証済 |
| 23 | Fabian Cancellara | 83 | 83 | 85 | 85 | 84 | 結果照合済 |
| 24 | Mads Pedersen | 75 | 81 | 82 | 80 | 76 | 結果照合済 |
| 25 | Michele Bartoli | 71 | 69 | 76 | 78 | 76 | 要出走確認 |
| 26 | Joaquim Rodriguez | 72 | 71 | 75 | 78 | 50 | 要出走確認 |
| 27 | Isaac del Toro | 74 | 74 | 68 | 70 | 50 | 要出走確認 |
| 28 | Jonas Vingegaard | 80 | 76 | 70 | 71 | 50 | 要出走確認 |
| 29 | Wout van Aert | 80 | 83 | 84 | 82 | 82 | 結果照合済 |
| 30 | Remco Evenepoel | 85 | 82 | 76 | 71 | 50 | 要出走確認 |
| 31 | Primoz Roglic | 85 | 82 | 71 | 71 | 50 | 要出走確認 |
| 32 | Erik Zabel | 81 | 84 | 82 | 84 | 50 | 要出走確認 |
| 33 | Cadel Evans | 68 | 69 | 75 | 77 | 50 | 要出走確認 |
| 34 | Carlos Sastre | 77 | 76 | 66 | 70 | 50 | 要出走確認 |
| 35 | Paolo Bettini | 74 | 75 | 77 | 78 | 50 | 要出走確認 |
| 36 | Julian Alaphilippe | 71 | 70 | 74 | 75 | 50 | 要出走確認 |
| 37 | Simon Gerrans | 67 | 67 | 75 | 76 | 50 | 要出走確認 |
| 38 | Djamolidine Abdoujaparov | 66 | 67 | 69 | 73 | 50 | 要出走確認 |
| 39 | Arnaud Demare | 66 | 66 | 72 | 73 | 73 | 結果照合済 |
| 40 | Tom Boonen | 81 | 85 | 81 | 83 | 84 | 結果照合済 |
| 41 | Franco Ballerini | 79 | 81 | 80 | 80 | 83 | 結果照合済 |
| 42 | Chris Boardman | 78 | 78 | 81 | 72 | 50 | 要出走確認 |
| 43 | Alejandro Valverde | 72 | 72 | 77 | 77 | 50 | 要出走確認 |
| 44 | Stijn Devolder | 79 | 81 | 82 | 83 | 78 | 要出走確認 |
| 45 | Rui Costa | 66 | 67 | 76 | 76 | 50 | 要出走確認 |
| 46 | Maurizio Fondriest | 67 | 67 | 74 | 76 | 50 | 要出走確認 |
| 47 | Marc Hirschi | 67 | 70 | 77 | 80 | 50 | 要出走確認 |
| 48 | Jasper Philipsen | 68 | 67 | 73 | 73 | 50 | 要出走確認 |
| 49 | Chris Horner | 76 | 74 | 67 | 69 | 50 | 要出走確認 |
| 50 | Aleksandr Vlasov | 76 | 75 | 67 | 70 | 50 | 要出走確認 |
| 51 | Thibaut Pinot | 76 | 75 | 66 | 69 | 50 | 要出走確認 |
| 52 | Andreas Kloden | 76 | 75 | 68 | 70 | 50 | 要出走確認 |
| 53 | Tom Steels | 65 | 65 | 72 | 73 | 50 | 要出走確認 |
| 54 | Dylan Groenewegen | 64 | 64 | 73 | 72 | 69 | 結果照合済 |
| 55 | Johan Museeuw | 81 | 84 | 81 | 83 | 84 | 結果照合済 |
| 56 | Andrea Tafi | 79 | 83 | 80 | 82 | 83 | 結果照合済 |
| 57 | Niki Terpstra | 78 | 81 | 80 | 82 | 83 | 結果照合済 |
| 58 | Tom Dumoulin | 79 | 77 | 72 | 71 | 50 | 要出走確認 |
| 59 | Laurent Jalabert | 80 | 83 | 82 | 84 | 50 | 要出走確認 |
| 60 | Alexander Kristoff | 77 | 80 | 82 | 80 | 77 | 結果照合済 |
| 61 | Philippe Gilbert | 70 | 68 | 75 | 78 | 79 | 結果照合済 |
| 62 | Thor Hushovd | 66 | 66 | 70 | 73 | 73 | 結果照合済 |
| 63 | Romain Bardet | 76 | 77 | 67 | 70 | 50 | 要出走確認 |
| 64 | Nick Nuyens | 74 | 79 | 78 | 81 | 76 | 要出走確認 |
| 65 | Danilo Di Luca | 67 | 66 | 75 | 77 | 50 | 要出走確認 |
| 66 | Michael Woods | 65 | 67 | 74 | 76 | 50 | 要出走確認 |
| 67 | Esteban Chaves | 73 | 72 | 67 | 70 | 50 | 要出走確認 |
| 68 | Rigoberto Uran | 75 | 75 | 67 | 69 | 50 | 要出走確認 |
| 69 | Levi Leipheimer | 75 | 75 | 68 | 70 | 50 | 要出走確認 |
| 70 | Dylan Teuns | 66 | 65 | 73 | 74 | 64 | 結果照合済 |
| 71 | Nacer Bouhanni | 64 | 64 | 68 | 71 | 50 | 要出走確認 |
| 72 | Elia Viviani | 64 | 64 | 71 | 71 | 50 | 要出走確認 |
| 73 | Davide Rebellin | 66 | 65 | 73 | 75 | 50 | 要出走確認 |
| 74 | Tony Martin | 78 | 78 | 82 | 72 | 64 | 結果照合済 |
| 75 | Filippo Ganna | 78 | 78 | 81 | 72 | 69 | 結果照合済 |
| 76 | Andrei Tchmil | 79 | 82 | 81 | 82 | 83 | 結果照合済 |
| 77 | Johan Vansummeren | 77 | 81 | 79 | 80 | 82 | 結果照合済 |
| 78 | Oscar Freire | 68 | 68 | 76 | 73 | 50 | 要出走確認 |
| 79 | Egan Bernal | 80 | 75 | 68 | 70 | 50 | 要出走確認 |
| 80 | Joao Almeida | 76 | 76 | 70 | 71 | 50 | 要出走確認 |
| 81 | Evgeni Berzin | 77 | 76 | 69 | 70 | 50 | 要出走確認 |
| 82 | Jonathan Milan | 66 | 66 | 72 | 73 | 64 | 結果照合済 |
| 83 | Fabio Aru | 78 | 73 | 67 | 69 | 50 | 要出走確認 |
| 84 | Biniam Girmay | 65 | 65 | 68 | 72 | 50 | 要出走確認 |
| 85 | Jakob Fuglsang | 66 | 67 | 75 | 76 | 50 | 要出走確認 |
| 86 | Marcel Kittel | 65 | 66 | 68 | 73 | 50 | 要出走確認 |
| 87 | Sam Bennett | 64 | 65 | 71 | 72 | 64 | 結果照合済 |
| 88 | Tyler Farrar | 64 | 64 | 70 | 72 | 64 | 結果照合済 |
| 89 | Fernando Gaviria | 64 | 64 | 70 | 71 | 50 | 要出走確認 |
| 90 | Peter Van Petegem | 79 | 82 | 81 | 83 | 84 | 結果照合済 |
| 91 | Bradley Wiggins | 80 | 78 | 80 | 70 | 76 | 結果照合済 |
| 92 | Servais Knaven | 77 | 80 | 79 | 79 | 82 | 結果照合済 |
| 93 | Damiano Cunego | 72 | 70 | 75 | 78 | 50 | 要出走確認 |
| 94 | Claudio Chiappucci | 80 | 78 | 67 | 69 | 50 | 要出走確認 |
| 95 | Luis Leon Sanchez | 76 | 77 | 77 | 72 | 50 | 要出走確認 |
| 96 | Filippo Pozzato | 73 | 75 | 82 | 79 | 69 | 結果照合済 |
| 97 | Michael Rasmussen | 77 | 74 | 66 | 68 | 50 | 要出走確認 |
| 98 | Arnaud De Lie | 66 | 66 | 75 | 77 | 50 | 要出走確認 |
| 99 | Ben Healy | 65 | 66 | 74 | 75 | 50 | 要出走確認 |
| 100 | Pavel Tonkov | 76 | 76 | 67 | 69 | 50 | 要出走確認 |
| 101 | Juan Ayuso | 75 | 75 | 68 | 70 | 50 | 要出走確認 |
| 102 | Olav Kooij | 65 | 65 | 73 | 72 | 50 | 要出走確認 |
| 103 | Caleb Ewan | 63 | 63 | 71 | 71 | 50 | 要出走確認 |
| 104 | Samuel Sanchez | 74 | 74 | 67 | 71 | 50 | 要出走確認 |
| 105 | Daniel Martin | 66 | 65 | 73 | 74 | 50 | 要出走確認 |
| 106 | Daniele Bennati | 64 | 65 | 71 | 72 | 50 | 要出走確認 |
| 107 | Rohan Dennis | 77 | 77 | 80 | 71 | 50 | 要出走確認 |
| 108 | Magnus Backstedt | 75 | 78 | 79 | 79 | 81 | 結果照合済 |
| 109 | Sonny Colbrelli | 73 | 75 | 79 | 79 | 81 | 結果照合済 |
| 110 | Steffen Wesemann | 76 | 80 | 79 | 81 | 76 | 要出走確認 |
| 111 | Alberto Bettiol | 75 | 80 | 78 | 81 | 76 | 要出走確認 |
| 112 | Carlos Rodriguez | 75 | 74 | 67 | 71 | 50 | 要出走確認 |
| 113 | Tim Wellens | 66 | 67 | 76 | 78 | 50 | 要出走確認 |
| 114 | Mattias Skjelmose | 66 | 65 | 76 | 76 | 50 | 要出走確認 |
| 115 | Oscar Pereiro | 79 | 77 | 68 | 70 | 50 | 要出走確認 |
| 116 | Kaden Groves | 65 | 66 | 68 | 73 | 50 | 要出走確認 |
| 117 | Jose Rujano | 73 | 72 | 66 | 69 | 50 | 要出走確認 |
| 118 | Ryder Hesjedal | 78 | 73 | 68 | 70 | 50 | 要出走確認 |
| 119 | Fabio Jakobsen | 65 | 65 | 70 | 72 | 50 | 要出走確認 |
| 120 | Tom Pidcock | 74 | 79 | 81 | 83 | 50 | 要出走確認 |
| 121 | Michael Albasini | 65 | 63 | 73 | 74 | 50 | 要出走確認 |
| 122 | Jasper Stuyven | 73 | 76 | 80 | 80 | 82 | 結果照合済 |
| 123 | Richard Virenque | 78 | 77 | 67 | 69 | 50 | 要出走確認 |
| 124 | Lenny Martinez | 73 | 72 | 66 | 69 | 50 | 要出走確認 |
| 125 | Warren Barguil | 73 | 72 | 66 | 70 | 50 | 要出走確認 |
| 126 | Iban Mayo | 73 | 71 | 66 | 69 | 50 | 要出走確認 |
| 127 | Maxim Van Gils | 66 | 65 | 73 | 74 | 50 | 要出走確認 |
| 128 | Pascal Ackermann | 64 | 64 | 68 | 71 | 50 | 要出走確認 |
| 129 | Giulio Ciccone | 75 | 75 | 67 | 70 | 50 | 要出走確認 |
| 130 | Jai Hindley | 76 | 76 | 67 | 69 | 50 | 要出走確認 |
| 131 | Matej Mohoric | 74 | 78 | 80 | 81 | 64 | 結果照合済 |
| 132 | David Gaudu | 76 | 76 | 66 | 69 | 50 | 要出走確認 |
| 133 | Tiesj Benoot | 73 | 78 | 78 | 79 | 64 | 結果照合済 |
| 134 | Valentin Madouas | 65 | 65 | 75 | 77 | 50 | 要出走確認 |
| 135 | Florian Lipowitz | 74 | 73 | 67 | 69 | 50 | 要出走確認 |
| 136 | Pello Bilbao | 65 | 65 | 75 | 77 | 50 | 要出走確認 |
| 137 | Romain Gregoire | 65 | 64 | 74 | 75 | 50 | 要出走確認 |
| 138 | Juan Sebastian Molano | 64 | 64 | 71 | 71 | 50 | 要出走確認 |
| 139 | Derek Gee | 75 | 76 | 76 | 69 | 50 | 要出走確認 |
| 140 | Thomas De Gendt | 75 | 75 | 77 | 70 | 50 | 要出走確認 |
| 141 | Jhonatan Narvaez | 65 | 66 | 75 | 76 | 50 | 要出走確認 |
| 142 | Felix Gall | 75 | 73 | 66 | 68 | 50 | 要出走確認 |
| 143 | Jordi Meeus | 64 | 64 | 72 | 72 | 73 | 結果照合済 |
| 144 | Tim Merlier | 63 | 64 | 70 | 72 | 69 | 結果照合済 |
| 145 | Antonio Tiberi | 74 | 73 | 68 | 69 | 50 | 要出走確認 |
| 146 | Oscar Onley | 64 | 65 | 72 | 74 | 50 | 要出走確認 |
| 147 | Benoit Cosnefroy | 65 | 64 | 73 | 75 | 50 | 要出走確認 |
| 148 | Gustav Erik Larsson | 74 | 73 | 79 | 70 | 50 | 要出走確認 |
| 149 | Guillaume Martin | 76 | 73 | 66 | 68 | 50 | 要出走確認 |
| 150 | Giulio Pellizzari | 74 | 72 | 66 | 68 | 50 | 要出走確認 |
| 151 | Enric Mas | 75 | 74 | 67 | 68 | 50 | 要出走確認 |
| 152 | David Zabriskie | 73 | 73 | 77 | 69 | 50 | 要出走確認 |
| 153 | Joshua Tarling | 74 | 74 | 79 | 71 | 69 | 結果照合済 |
| 154 | Soren Waerenskjold | 73 | 71 | 78 | 69 | 50 | 要出走確認 |
| 155 | John Degenkolb | 75 | 79 | 78 | 82 | 82 | 結果照合済 |
| 156 | Michal Kwiatkowski | 78 | 75 | 66 | 68 | 50 | 要出走確認 |
| 157 | Victor Campenaerts | 73 | 73 | 78 | 70 | 50 | 要出走確認 |
| 158 | Tobias Ludvigsson | 74 | 76 | 77 | 69 | 50 | 要出走確認 |
| 159 | Jose Azevedo | 74 | 76 | 75 | 69 | 50 | 要出走確認 |
| 160 | Richard Carapaz | 77 | 72 | 67 | 68 | 50 | 要出走確認 |
| 161 | Stefan Bissegger | 74 | 73 | 77 | 70 | 75 | 結果照合済 |
| 162 | Wout Poels | 75 | 73 | 66 | 68 | 50 | 要出走確認 |
| 163 | Richie Porte | 74 | 73 | 65 | 68 | 50 | 要出走確認 |
| 164 | Nairo Quintana | 77 | 74 | 66 | 69 | 50 | 要出走確認 |
| 165 | Sepp Kuss | 73 | 71 | 66 | 69 | 50 | 手動検証済 |
| 166 | Michael Matthews | 73 | 74 | 74 | 68 | 50 | 要出走確認 |
| 167 | Rafal Majka | 73 | 71 | 63 | 64 | 50 | 要出走確認 |
| 168 | Aime De Gendt | 67 | 72 | 72 | 75 | 69 | 結果照合済 |
| 169 | Laurens De Plus | 72 | 69 | 64 | 66 | 50 | 要出走確認 |
| 170 | Daniel Oss | 71 | 74 | 74 | 78 | 69 | 結果照合済 |
| 171 | Ben O'Connor | 72 | 70 | 63 | 63 | 50 | 要出走確認 |
| 172 | Luke Plapp | 72 | 71 | 72 | 68 | 50 | 要出走確認 |
| 173 | Adam Yates | 72 | 69 | 63 | 66 | 50 | 要出走確認 |
| 174 | Amund Grondahl Jansen | 68 | 72 | 73 | 75 | 50 | 要出走確認 |
| 175 | Tobias Foss | 72 | 70 | 71 | 66 | 50 | 要出走確認 |
| 176 | Stefan Kung | 72 | 71 | 74 | 68 | 73 | 結果照合済 |
| 177 | Jens Keukeleire | 70 | 74 | 74 | 78 | 76 | 結果照合済 |
| 178 | Marco Haller | 69 | 73 | 73 | 76 | 73 | 結果照合済 |
| 179 | Sep Vanmarcke | 67 | 72 | 72 | 75 | 79 | 結果照合済 |
| 180 | Jonathan Castroviejo | 72 | 70 | 71 | 67 | 50 | 要出走確認 |
| 181 | Damiano Caruso | 71 | 69 | 63 | 64 | 50 | 要出走確認 |
| 182 | Carlos Verona | 71 | 68 | 63 | 64 | 50 | 要出走確認 |
| 183 | Mike Teunissen | 63 | 63 | 66 | 68 | 76 | 結果照合済 |
| 184 | Greg Van Avermaet | 70 | 75 | 73 | 76 | 80 | 結果照合済 |
| 185 | Heinrich Haussler | 70 | 74 | 73 | 77 | 73 | 結果照合済 |
| 186 | Bob Jungels | 72 | 70 | 71 | 68 | 50 | 要出走確認 |
| 187 | Santiago Buitrago | 71 | 69 | 63 | 64 | 50 | 要出走確認 |
| 188 | Wilco Kelderman | 71 | 68 | 63 | 64 | 50 | 要出走確認 |
| 189 | Mark Renshaw | 63 | 63 | 67 | 71 | 57 | 手動検証済 |
| 190 | Boy van Poppel | 63 | 63 | 65 | 67 | 69 | 結果照合済 |
| 191 | Lawson Craddock | 72 | 70 | 70 | 66 | 50 | 要出走確認 |
| 192 | Winner Anacona | 69 | 66 | 60 | 61 | 50 | 要出走確認 |
| 193 | Thymen Arensman | 69 | 67 | 61 | 62 | 50 | 要出走確認 |
| 194 | Jacopo Guarnieri | 61 | 61 | 65 | 65 | 64 | 結果照合済 |
| 195 | Taco van der Hoorn | 69 | 73 | 73 | 75 | 50 | 要出走確認 |
| 196 | Sebastian Langeveld | 70 | 74 | 74 | 77 | 77 | 結果照合済 |
| 197 | Zdenek Stybar | 70 | 73 | 73 | 76 | 80 | 結果照合済 |
| 198 | Stijn Vandenbergh | 67 | 72 | 72 | 74 | 73 | 結果照合済 |
| 199 | Tao Geoghegan Hart | 73 | 70 | 64 | 66 | 50 | 要出走確認 |
| 200 | Cameron Wurf | 72 | 70 | 70 | 66 | 50 | 要出走確認 |
| 201 | Frederik Frison | 66 | 71 | 71 | 73 | 69 | 結果照合済 |
| 202 | Remi Cavagna | 71 | 70 | 69 | 65 | 50 | 要出走確認 |
| 203 | Brandon McNulty | 70 | 67 | 61 | 62 | 50 | 要出走確認 |
| 204 | Pavel Sivakov | 69 | 67 | 61 | 62 | 50 | 要出走確認 |
| 205 | Luka Mezgec | 63 | 63 | 65 | 68 | 50 | 要出走確認 |
| 206 | Danny van Poppel | 63 | 63 | 65 | 67 | 69 | 結果照合済 |
| 207 | Simone Consonni | 62 | 62 | 65 | 65 | 64 | 結果照合済 |
| 208 | Davide Ballerini | 62 | 62 | 65 | 65 | 69 | 結果照合済 |
| 209 | Florian Vermeersch | 67 | 71 | 72 | 74 | 50 | 要出走確認 |
| 210 | Dylan van Baarle | 72 | 71 | 72 | 67 | 74 | 結果照合済 |
| 211 | Edoardo Affini | 72 | 70 | 71 | 66 | 64 | 結果照合済 |
| 212 | Kanstantsin Siutsou | 72 | 70 | 71 | 68 | 50 | 要出走確認 |
| 213 | Matteo Trentin | 72 | 71 | 71 | 66 | 69 | 結果照合済 |
| 214 | Haimar Zubeldia | 70 | 68 | 62 | 63 | 50 | 要出走確認 |
| 215 | Sergio Henao | 70 | 67 | 61 | 63 | 50 | 要出走確認 |
| 216 | Maarten Wynants | 67 | 71 | 72 | 74 | 69 | 結果照合済 |
| 217 | Nils Politt | 70 | 70 | 71 | 68 | 76 | 結果照合済 |
| 218 | Magnus Sheffield | 71 | 70 | 69 | 65 | 50 | 要出走確認 |
| 219 | Christophe Laporte | 62 | 61 | 64 | 64 | 76 | 結果照合済 |
| 220 | Marc Soler | 70 | 67 | 62 | 62 | 50 | 要出走確認 |
| 221 | Edward Theuns | 63 | 63 | 65 | 67 | 70 | 結果照合済 |
| 222 | Leif Hoste | 67 | 72 | 72 | 75 | 50 | 要出走確認 |
| 223 | Bert Van Lerberghe | 63 | 63 | 65 | 67 | 69 | 結果照合済 |
| 224 | Nikias Arndt | 61 | 61 | 64 | 63 | 69 | 結果照合済 |
| 225 | Roger Kluge | 59 | 59 | 64 | 61 | 69 | 結果照合済 |
| 226 | Roman Kreuziger | 70 | 68 | 63 | 63 | 50 | 要出走確認 |
| 227 | Daniel Navarro | 70 | 68 | 62 | 63 | 50 | 要出走確認 |
| 228 | Chad Haga | 71 | 69 | 69 | 65 | 50 | 要出走確認 |
| 229 | Yves Lampaert | 69 | 69 | 71 | 67 | 76 | 結果照合済 |
| 230 | Jan Tratnik | 71 | 69 | 69 | 65 | 64 | 結果照合済 |
| 231 | Tim Declercq | 71 | 70 | 68 | 67 | 69 | 手動検証済 |
| 232 | Mikel Landa | 71 | 67 | 58 | 58 | 50 | 要出走確認 |
| 233 | Salvatore Puccio | 69 | 69 | 70 | 67 | 64 | 結果照合済 |
| 234 | Nelson Oliveira | 70 | 69 | 69 | 64 | 64 | 結果照合済 |
| 235 | Jasper De Buyst | 57 | 57 | 64 | 57 | 50 | 要出走確認 |
| 236 | Lars Boom | 69 | 72 | 72 | 75 | 78 | 結果照合済 |
| 237 | Domenico Pozzovivo | 71 | 68 | 63 | 64 | 50 | 要出走確認 |
| 238 | Jose Luis Rubiera | 70 | 68 | 62 | 63 | 50 | 要出走確認 |
| 239 | Nathan Van Hooydonck | 71 | 70 | 71 | 67 | 69 | 結果照合済 |
| 240 | Fabio Sabatini | 61 | 62 | 65 | 65 | 50 | 要出走確認 |
| 241 | Jack Bauer | 69 | 69 | 70 | 67 | 64 | 結果照合済 |
| 242 | Michael Hepburn | 68 | 69 | 70 | 66 | 64 | 結果照合済 |
| 243 | Mikkel Bjerg | 68 | 68 | 69 | 66 | 50 | 要出走確認 |
| 244 | Andrey Amador | 69 | 67 | 61 | 62 | 50 | 要出走確認 |
| 245 | Pierre Rolland | 69 | 66 | 60 | 61 | 50 | 要出走確認 |
| 246 | Robert Gesink | 69 | 66 | 59 | 60 | 50 | 要出走確認 |
| 247 | Maximiliano Richeze | 62 | 62 | 65 | 66 | 50 | 要出走確認 |
| 248 | Luke Durbridge | 69 | 69 | 70 | 67 | 64 | 結果照合済 |
| 249 | Vegard Stake Laengen | 68 | 68 | 69 | 66 | 50 | 要出走確認 |
| 250 | Luke Rowe | 68 | 72 | 76 | 78 | 78 | 手動検証済 |
| 251 | Mikel Nieve | 72 | 68 | 62 | 62 | 50 | 要出走確認 |
| 252 | Eros Poli | 71 | 70 | 72 | 68 | 50 | 要出走確認 |
| 253 | Igor Anton | 69 | 66 | 62 | 61 | 50 | 要出走確認 |
| 254 | Maarten Tjallingii | 70 | 70 | 71 | 67 | 64 | 結果照合済 |
| 255 | Tanel Kangert | 69 | 66 | 62 | 61 | 50 | 要出走確認 |
| 256 | Iljo Keisse | 62 | 62 | 65 | 67 | 69 | 結果照合済 |
| 257 | Alex Dowsett | 70 | 67 | 68 | 64 | 50 | 要出走確認 |
| 258 | Roy Curvers | 61 | 61 | 64 | 65 | 64 | 結果照合済 |
| 259 | Rein Taaramae | 68 | 66 | 57 | 59 | 50 | 要出走確認 |
| 260 | Kasper Asgreen | 71 | 69 | 69 | 67 | 75 | 結果照合済 |
| 261 | Gert Steegmans | 58 | 58 | 64 | 60 | 50 | 要出走確認 |
| 262 | Vasil Kiryienka | 72 | 71 | 72 | 66 | 50 | 要出走確認 |
| 263 | Matthew Goss | 62 | 62 | 65 | 65 | 50 | 要出走確認 |
| 264 | Jos van Emden | 70 | 70 | 71 | 68 | 73 | 結果照合済 |
| 265 | Michael Morkov | 62 | 62 | 65 | 67 | 69 | 結果照合済 |
| 266 | Jan Barta | 70 | 68 | 68 | 64 | 64 | 結果照合済 |
| 267 | Viatcheslav Ekimov | 68 | 68 | 70 | 66 | 50 | 要出走確認 |
| 268 | Ramon Sinkeldam | 61 | 61 | 64 | 65 | 69 | 結果照合済 |
| 269 | Jurgen Roelandts | 60 | 60 | 64 | 63 | 69 | 結果照合済 |
| 270 | Greg Henderson | 60 | 60 | 64 | 62 | 50 | 要出走確認 |
| 271 | Maciej Bodnar | 71 | 70 | 71 | 68 | 69 | 結果照合済 |
| 272 | Dries Devenyns | 68 | 68 | 69 | 66 | 50 | 要出走確認 |
| 273 | Brent Bookwalter | 69 | 66 | 68 | 63 | 50 | 要出走確認 |
| 274 | Yukiya Arashiro | 71 | 72 | 69 | 73 | 57 | 手動検証済 |
| 275 | Simon Geschke | 68 | 71 | 74 | 74 | 50 | 要出走確認 |
| 276 | Stuart O'Grady | 69 | 69 | 70 | 67 | 76 | 結果照合済 |
| 277 | Tejay van Garderen | 69 | 68 | 68 | 64 | 50 | 要出走確認 |
| 278 | Daryl Impey | 70 | 73 | 76 | 77 | 50 | 要出走確認 |
| 279 | Ian Stannard | 67 | 68 | 69 | 65 | 69 | 結果照合済 |
| 280 | Jens Voigt | 69 | 69 | 70 | 67 | 50 | 要出走確認 |
| 281 | Lars Bak | 68 | 69 | 70 | 66 | 64 | 結果照合済 |
| 282 | Marcus Burghardt | 67 | 68 | 69 | 65 | 69 | 結果照合済 |
| 283 | Alessandro Ballan | 73 | 74 | 77 | 79 | 76 | 要出走確認 |
| 284 | Michael Rogers | 73 | 74 | 78 | 75 | 50 | 要出走確認 |
| 285 | Manuel Quinziato | 70 | 72 | 76 | 76 | 69 | 結果照合済 |
| 286 | Bernhard Eisel | 68 | 72 | 75 | 74 | 73 | 結果照合済 |
| 287 | Christian Vande Velde | 68 | 71 | 74 | 74 | 50 | 要出走確認 |
| 288 | Bram Tankink | 68 | 71 | 74 | 74 | 69 | 結果照合済 |
| 289 | Juan Antonio Flecha | 69 | 72 | 75 | 75 | 50 | 要出走確認 |
| 290 | George Hincapie | 68 | 72 | 75 | 75 | 50 | 要出走確認 |
| 291 | Matteo Tosatto | 67 | 67 | 68 | 65 | 64 | 結果照合済 |
| 292 | Mathew Hayman | 68 | 71 | 74 | 74 | 80 | 結果照合済 |
| 293 | Luca Paolini | 71 | 73 | 76 | 75 | 69 | 結果照合済 |
| 294 | Sylvain Chavanel | 67 | 71 | 73 | 73 | 64 | 結果照合済 |
| 295 | Fumiyuki Beppu | 66 | 67 | 72 | 74 | 64 | 手動検証済 |
| 296 | Geraint Thomas | 71 | 72 | 76 | 77 | 76 | 結果照合済 |
| 297 | Gregory Rast | 68 | 71 | 74 | 74 | 73 | 結果照合済 |
| 298 | Koen de Kort | 67 | 71 | 73 | 73 | 69 | 結果照合済 |
| 299 | Nicolas Roche | 67 | 71 | 74 | 74 | 50 | 要出走確認 |
| 300 | David Millar | 72 | 73 | 78 | 76 | 64 | 結果照合済 |

## 回復・連携・精神能力

| No. | 選手名 | 回復力 | 日間回復力 | チームワーク | エゴ | 負けん気 |
|---:|---|---:|---:|---:|---:|---:|
| 1 | Tadej Pogacar | 88 | 88 | 75 | 79 | 87 |
| 2 | Miguel Indurain | 85 | 84 | 69 | 80 | 74 |
| 3 | Chris Froome | 83 | 85 | 69 | 80 | 73 |
| 4 | Roberto Heras | 84 | 83 | 71 | 78 | 72 |
| 5 | Alberto Contador | 83 | 85 | 69 | 80 | 72 |
| 6 | Vincenzo Nibali | 83 | 83 | 68 | 80 | 72 |
| 7 | Mathieu van der Poel | 75 | 75 | 74 | 74 | 85 |
| 8 | Andre Greipel | 71 | 70 | 62 | 83 | 70 |
| 9 | Jan Ullrich | 84 | 84 | 68 | 79 | 72 |
| 10 | Alex Zulle | 82 | 82 | 71 | 77 | 71 |
| 11 | Denis Menchov | 83 | 83 | 71 | 77 | 72 |
| 12 | Gilberto Simoni | 83 | 83 | 71 | 77 | 72 |
| 13 | Marco Pantani | 76 | 77 | 65 | 74 | 81 |
| 14 | Simon Yates | 82 | 82 | 70 | 78 | 72 |
| 15 | Ivan Basso | 82 | 82 | 70 | 78 | 71 |
| 16 | Alessandro Petacchi | 71 | 71 | 62 | 85 | 71 |
| 17 | Mario Cipollini | 71 | 70 | 62 | 85 | 71 |
| 18 | Mark Cavendish | 68 | 68 | 59 | 84 | 74 |
| 19 | Paul Seixas | 79 | 79 | 68 | 76 | 70 |
| 20 | Robbie McEwen | 70 | 70 | 61 | 82 | 70 |
| 21 | Andy Schleck | 78 | 77 | 68 | 73 | 75 |
| 22 | Peter Sagan | 75 | 74 | 70 | 74 | 83 |
| 23 | Fabian Cancellara | 74 | 74 | 76 | 73 | 82 |
| 24 | Mads Pedersen | 73 | 72 | 77 | 73 | 83 |
| 25 | Michele Bartoli | 73 | 73 | 62 | 82 | 78 |
| 26 | Joaquim Rodriguez | 73 | 73 | 61 | 81 | 82 |
| 27 | Isaac del Toro | 79 | 79 | 68 | 76 | 70 |
| 28 | Jonas Vingegaard | 83 | 83 | 68 | 80 | 73 |
| 29 | Wout van Aert | 74 | 73 | 79 | 72 | 83 |
| 30 | Remco Evenepoel | 81 | 81 | 68 | 78 | 74 |
| 31 | Primoz Roglic | 85 | 84 | 67 | 81 | 72 |
| 32 | Erik Zabel | 74 | 73 | 72 | 73 | 83 |
| 33 | Cadel Evans | 74 | 73 | 61 | 81 | 78 |
| 34 | Carlos Sastre | 77 | 78 | 68 | 73 | 75 |
| 35 | Paolo Bettini | 73 | 73 | 62 | 82 | 82 |
| 36 | Julian Alaphilippe | 72 | 72 | 58 | 80 | 80 |
| 37 | Simon Gerrans | 72 | 72 | 60 | 81 | 79 |
| 38 | Djamolidine Abdoujaparov | 71 | 70 | 66 | 80 | 69 |
| 39 | Arnaud Demare | 70 | 70 | 65 | 79 | 68 |
| 40 | Tom Boonen | 74 | 74 | 74 | 73 | 85 |
| 41 | Franco Ballerini | 72 | 72 | 77 | 72 | 80 |
| 42 | Chris Boardman | 71 | 71 | 79 | 71 | 69 |
| 43 | Alejandro Valverde | 73 | 73 | 61 | 80 | 84 |
| 44 | Stijn Devolder | 72 | 72 | 77 | 72 | 80 |
| 45 | Rui Costa | 73 | 73 | 64 | 76 | 79 |
| 46 | Maurizio Fondriest | 72 | 72 | 60 | 79 | 76 |
| 47 | Marc Hirschi | 72 | 72 | 64 | 77 | 79 |
| 48 | Jasper Philipsen | 71 | 71 | 64 | 84 | 70 |
| 49 | Chris Horner | 81 | 81 | 68 | 75 | 71 |
| 50 | Aleksandr Vlasov | 80 | 78 | 68 | 75 | 70 |
| 51 | Thibaut Pinot | 77 | 76 | 69 | 72 | 75 |
| 52 | Andreas Kloden | 78 | 78 | 69 | 74 | 69 |
| 53 | Tom Steels | 70 | 70 | 65 | 79 | 68 |
| 54 | Dylan Groenewegen | 69 | 69 | 64 | 78 | 68 |
| 55 | Johan Museeuw | 74 | 74 | 74 | 73 | 84 |
| 56 | Andrea Tafi | 72 | 72 | 78 | 72 | 81 |
| 57 | Niki Terpstra | 72 | 72 | 77 | 71 | 79 |
| 58 | Tom Dumoulin | 80 | 80 | 69 | 74 | 69 |
| 59 | Laurent Jalabert | 73 | 73 | 73 | 73 | 82 |
| 60 | Alexander Kristoff | 71 | 71 | 74 | 72 | 79 |
| 61 | Philippe Gilbert | 72 | 73 | 62 | 80 | 80 |
| 62 | Thor Hushovd | 70 | 70 | 65 | 77 | 69 |
| 63 | Romain Bardet | 78 | 77 | 68 | 73 | 76 |
| 64 | Nick Nuyens | 71 | 72 | 73 | 72 | 79 |
| 65 | Danilo Di Luca | 73 | 73 | 65 | 76 | 76 |
| 66 | Michael Woods | 72 | 72 | 63 | 75 | 77 |
| 67 | Esteban Chaves | 77 | 77 | 70 | 72 | 75 |
| 68 | Rigoberto Uran | 79 | 79 | 68 | 74 | 70 |
| 69 | Levi Leipheimer | 78 | 78 | 69 | 74 | 69 |
| 70 | Dylan Teuns | 72 | 72 | 63 | 75 | 77 |
| 71 | Nacer Bouhanni | 69 | 69 | 62 | 77 | 68 |
| 72 | Elia Viviani | 69 | 69 | 66 | 75 | 67 |
| 73 | Davide Rebellin | 71 | 71 | 57 | 78 | 76 |
| 74 | Tony Martin | 71 | 71 | 80 | 71 | 69 |
| 75 | Filippo Ganna | 71 | 71 | 80 | 71 | 70 |
| 76 | Andrei Tchmil | 72 | 72 | 79 | 72 | 80 |
| 77 | Johan Vansummeren | 71 | 71 | 79 | 71 | 78 |
| 78 | Oscar Freire | 70 | 70 | 66 | 77 | 71 |
| 79 | Egan Bernal | 82 | 82 | 65 | 80 | 70 |
| 80 | Joao Almeida | 80 | 81 | 70 | 75 | 71 |
| 81 | Evgeni Berzin | 80 | 80 | 69 | 73 | 69 |
| 82 | Jonathan Milan | 70 | 70 | 69 | 78 | 68 |
| 83 | Fabio Aru | 80 | 80 | 68 | 74 | 69 |
| 84 | Biniam Girmay | 70 | 70 | 66 | 79 | 68 |
| 85 | Jakob Fuglsang | 73 | 73 | 67 | 76 | 77 |
| 86 | Marcel Kittel | 70 | 70 | 61 | 81 | 68 |
| 87 | Sam Bennett | 69 | 69 | 64 | 77 | 68 |
| 88 | Tyler Farrar | 69 | 69 | 63 | 76 | 67 |
| 89 | Fernando Gaviria | 69 | 69 | 65 | 75 | 67 |
| 90 | Peter Van Petegem | 72 | 73 | 77 | 72 | 84 |
| 91 | Bradley Wiggins | 73 | 73 | 80 | 69 | 68 |
| 92 | Servais Knaven | 71 | 71 | 78 | 71 | 77 |
| 93 | Damiano Cunego | 74 | 73 | 66 | 75 | 80 |
| 94 | Claudio Chiappucci | 77 | 76 | 70 | 72 | 78 |
| 95 | Luis Leon Sanchez | 71 | 71 | 80 | 70 | 70 |
| 96 | Filippo Pozzato | 70 | 70 | 75 | 72 | 76 |
| 97 | Michael Rasmussen | 77 | 77 | 71 | 71 | 76 |
| 98 | Arnaud De Lie | 70 | 70 | 66 | 77 | 76 |
| 99 | Ben Healy | 72 | 72 | 63 | 74 | 78 |
| 100 | Pavel Tonkov | 81 | 80 | 68 | 74 | 70 |
| 101 | Juan Ayuso | 80 | 80 | 67 | 78 | 71 |
| 102 | Olav Kooij | 70 | 70 | 67 | 78 | 68 |
| 103 | Caleb Ewan | 69 | 69 | 64 | 78 | 68 |
| 104 | Samuel Sanchez | 78 | 78 | 67 | 74 | 70 |
| 105 | Daniel Martin | 73 | 73 | 65 | 74 | 76 |
| 106 | Daniele Bennati | 69 | 69 | 66 | 76 | 68 |
| 107 | Rohan Dennis | 73 | 73 | 85 | 70 | 69 |
| 108 | Magnus Backstedt | 71 | 71 | 78 | 70 | 77 |
| 109 | Sonny Colbrelli | 69 | 70 | 74 | 72 | 76 |
| 110 | Steffen Wesemann | 71 | 71 | 78 | 70 | 78 |
| 111 | Alberto Bettiol | 72 | 72 | 74 | 72 | 81 |
| 112 | Carlos Rodriguez | 81 | 81 | 69 | 75 | 70 |
| 113 | Tim Wellens | 72 | 72 | 64 | 77 | 78 |
| 114 | Mattias Skjelmose | 73 | 73 | 64 | 76 | 77 |
| 115 | Oscar Pereiro | 79 | 79 | 69 | 73 | 70 |
| 116 | Kaden Groves | 70 | 70 | 65 | 79 | 69 |
| 117 | Jose Rujano | 77 | 76 | 71 | 71 | 75 |
| 118 | Ryder Hesjedal | 79 | 79 | 69 | 73 | 69 |
| 119 | Fabio Jakobsen | 70 | 70 | 64 | 78 | 68 |
| 120 | Tom Pidcock | 72 | 72 | 74 | 73 | 81 |
| 121 | Michael Albasini | 70 | 69 | 63 | 75 | 75 |
| 122 | Jasper Stuyven | 70 | 71 | 75 | 72 | 78 |
| 123 | Richard Virenque | 77 | 76 | 70 | 72 | 77 |
| 124 | Lenny Martinez | 76 | 76 | 71 | 72 | 74 |
| 125 | Warren Barguil | 76 | 76 | 70 | 72 | 76 |
| 126 | Iban Mayo | 76 | 76 | 71 | 71 | 75 |
| 127 | Maxim Van Gils | 72 | 72 | 63 | 75 | 76 |
| 128 | Pascal Ackermann | 69 | 69 | 66 | 76 | 67 |
| 129 | Giulio Ciccone | 78 | 77 | 71 | 71 | 77 |
| 130 | Jai Hindley | 81 | 80 | 68 | 74 | 70 |
| 131 | Matej Mohoric | 71 | 71 | 75 | 72 | 79 |
| 132 | David Gaudu | 77 | 78 | 71 | 71 | 74 |
| 133 | Tiesj Benoot | 71 | 71 | 75 | 72 | 81 |
| 134 | Valentin Madouas | 71 | 71 | 66 | 75 | 76 |
| 135 | Florian Lipowitz | 79 | 79 | 68 | 73 | 69 |
| 136 | Pello Bilbao | 73 | 72 | 66 | 74 | 77 |
| 137 | Romain Gregoire | 70 | 70 | 63 | 76 | 75 |
| 138 | Juan Sebastian Molano | 69 | 69 | 66 | 75 | 67 |
| 139 | Derek Gee | 71 | 71 | 80 | 69 | 67 |
| 140 | Thomas De Gendt | 70 | 70 | 75 | 71 | 68 |
| 141 | Jhonatan Narvaez | 71 | 71 | 65 | 75 | 77 |
| 142 | Felix Gall | 77 | 77 | 71 | 71 | 74 |
| 143 | Jordi Meeus | 69 | 69 | 65 | 76 | 67 |
| 144 | Tim Merlier | 69 | 69 | 65 | 76 | 67 |
| 145 | Antonio Tiberi | 78 | 78 | 69 | 73 | 68 |
| 146 | Oscar Onley | 72 | 72 | 63 | 74 | 75 |
| 147 | Benoit Cosnefroy | 70 | 69 | 63 | 75 | 75 |
| 148 | Gustav Erik Larsson | 69 | 69 | 81 | 69 | 67 |
| 149 | Guillaume Martin | 76 | 77 | 71 | 70 | 75 |
| 150 | Giulio Pellizzari | 76 | 77 | 71 | 70 | 73 |
| 151 | Enric Mas | 78 | 79 | 68 | 73 | 69 |
| 152 | David Zabriskie | 70 | 70 | 81 | 69 | 67 |
| 153 | Joshua Tarling | 69 | 70 | 80 | 69 | 67 |
| 154 | Soren Waerenskjold | 69 | 69 | 80 | 69 | 67 |
| 155 | John Degenkolb | 72 | 71 | 72 | 73 | 82 |
| 156 | Michal Kwiatkowski | 76 | 76 | 72 | 69 | 74 |
| 157 | Victor Campenaerts | 69 | 69 | 81 | 69 | 67 |
| 158 | Tobias Ludvigsson | 70 | 71 | 81 | 68 | 67 |
| 159 | Jose Azevedo | 70 | 71 | 80 | 68 | 67 |
| 160 | Richard Carapaz | 79 | 81 | 67 | 74 | 71 |
| 161 | Stefan Bissegger | 69 | 69 | 81 | 69 | 67 |
| 162 | Wout Poels | 76 | 76 | 72 | 69 | 73 |
| 163 | Richie Porte | 76 | 76 | 71 | 69 | 73 |
| 164 | Nairo Quintana | 77 | 78 | 68 | 73 | 74 |
| 165 | Sepp Kuss | 76 | 77 | 85 | 58 | 72 |
| 166 | Michael Matthews | 69 | 69 | 83 | 65 | 67 |
| 167 | Rafal Majka | 75 | 76 | 71 | 68 | 72 |
| 168 | Aime De Gendt | 67 | 67 | 72 | 69 | 74 |
| 169 | Laurens De Plus | 76 | 75 | 71 | 68 | 71 |
| 170 | Daniel Oss | 68 | 68 | 73 | 69 | 75 |
| 171 | Ben O'Connor | 74 | 75 | 69 | 66 | 71 |
| 172 | Luke Plapp | 69 | 69 | 76 | 65 | 66 |
| 173 | Adam Yates | 75 | 75 | 71 | 68 | 71 |
| 174 | Amund Grondahl Jansen | 67 | 67 | 72 | 69 | 74 |
| 175 | Tobias Foss | 68 | 68 | 78 | 63 | 65 |
| 176 | Stefan Kung | 65 | 66 | 79 | 65 | 66 |
| 177 | Jens Keukeleire | 68 | 68 | 74 | 69 | 75 |
| 178 | Marco Haller | 67 | 67 | 73 | 69 | 74 |
| 179 | Sep Vanmarcke | 67 | 67 | 72 | 68 | 74 |
| 180 | Jonathan Castroviejo | 68 | 68 | 75 | 64 | 65 |
| 181 | Damiano Caruso | 75 | 75 | 70 | 68 | 71 |
| 182 | Carlos Verona | 75 | 75 | 70 | 68 | 71 |
| 183 | Mike Teunissen | 64 | 65 | 68 | 71 | 65 |
| 184 | Greg Van Avermaet | 68 | 68 | 72 | 69 | 75 |
| 185 | Heinrich Haussler | 68 | 68 | 72 | 69 | 74 |
| 186 | Bob Jungels | 68 | 68 | 78 | 65 | 66 |
| 187 | Santiago Buitrago | 75 | 75 | 71 | 68 | 71 |
| 188 | Wilco Kelderman | 75 | 75 | 71 | 68 | 71 |
| 189 | Mark Renshaw | 67 | 67 | 73 | 63 | 61 |
| 190 | Boy van Poppel | 63 | 63 | 67 | 71 | 64 |
| 191 | Lawson Craddock | 68 | 68 | 75 | 64 | 66 |
| 192 | Winner Anacona | 74 | 74 | 69 | 66 | 69 |
| 193 | Thymen Arensman | 74 | 74 | 69 | 66 | 69 |
| 194 | Jacopo Guarnieri | 61 | 61 | 66 | 70 | 61 |
| 195 | Taco van der Hoorn | 67 | 67 | 73 | 69 | 75 |
| 196 | Sebastian Langeveld | 68 | 68 | 73 | 69 | 74 |
| 197 | Zdenek Stybar | 68 | 68 | 72 | 69 | 74 |
| 198 | Stijn Vandenbergh | 67 | 66 | 72 | 68 | 73 |
| 199 | Tao Geoghegan Hart | 76 | 76 | 71 | 68 | 71 |
| 200 | Cameron Wurf | 68 | 68 | 77 | 64 | 65 |
| 201 | Frederik Frison | 66 | 64 | 72 | 68 | 73 |
| 202 | Remi Cavagna | 68 | 68 | 76 | 63 | 64 |
| 203 | Brandon McNulty | 75 | 74 | 70 | 67 | 70 |
| 204 | Pavel Sivakov | 74 | 74 | 70 | 67 | 69 |
| 205 | Luka Mezgec | 64 | 64 | 68 | 71 | 65 |
| 206 | Danny van Poppel | 64 | 64 | 67 | 71 | 64 |
| 207 | Simone Consonni | 62 | 62 | 67 | 71 | 62 |
| 208 | Davide Ballerini | 62 | 62 | 67 | 70 | 62 |
| 209 | Florian Vermeersch | 66 | 65 | 72 | 68 | 73 |
| 210 | Dylan van Baarle | 66 | 66 | 80 | 65 | 66 |
| 211 | Edoardo Affini | 68 | 68 | 81 | 64 | 65 |
| 212 | Kanstantsin Siutsou | 68 | 68 | 78 | 65 | 66 |
| 213 | Matteo Trentin | 64 | 64 | 77 | 63 | 66 |
| 214 | Haimar Zubeldia | 75 | 75 | 70 | 67 | 69 |
| 215 | Sergio Henao | 74 | 75 | 70 | 67 | 69 |
| 216 | Maarten Wynants | 66 | 65 | 72 | 68 | 73 |
| 217 | Nils Politt | 66 | 66 | 74 | 65 | 66 |
| 218 | Magnus Sheffield | 68 | 68 | 76 | 63 | 64 |
| 219 | Christophe Laporte | 61 | 61 | 64 | 70 | 62 |
| 220 | Marc Soler | 75 | 74 | 70 | 67 | 70 |
| 221 | Edward Theuns | 63 | 63 | 67 | 71 | 64 |
| 222 | Leif Hoste | 67 | 66 | 72 | 68 | 73 |
| 223 | Bert Van Lerberghe | 63 | 63 | 67 | 71 | 63 |
| 224 | Nikias Arndt | 61 | 61 | 66 | 70 | 61 |
| 225 | Roger Kluge | 60 | 60 | 66 | 70 | 60 |
| 226 | Roman Kreuziger | 75 | 75 | 70 | 67 | 71 |
| 227 | Daniel Navarro | 75 | 75 | 70 | 67 | 70 |
| 228 | Chad Haga | 67 | 67 | 74 | 63 | 64 |
| 229 | Yves Lampaert | 65 | 65 | 74 | 64 | 65 |
| 230 | Jan Tratnik | 67 | 67 | 76 | 62 | 65 |
| 231 | Tim Declercq | 68 | 68 | 82 | 60 | 66 |
| 232 | Mikel Landa | 73 | 74 | 69 | 65 | 69 |
| 233 | Salvatore Puccio | 65 | 65 | 77 | 64 | 65 |
| 234 | Nelson Oliveira | 67 | 67 | 76 | 62 | 63 |
| 235 | Jasper De Buyst | 57 | 57 | 65 | 70 | 57 |
| 236 | Lars Boom | 67 | 67 | 73 | 68 | 74 |
| 237 | Domenico Pozzovivo | 75 | 75 | 70 | 67 | 71 |
| 238 | Jose Luis Rubiera | 75 | 75 | 70 | 67 | 70 |
| 239 | Nathan Van Hooydonck | 66 | 66 | 78 | 65 | 66 |
| 240 | Fabio Sabatini | 62 | 62 | 67 | 70 | 62 |
| 241 | Jack Bauer | 65 | 65 | 77 | 64 | 66 |
| 242 | Michael Hepburn | 64 | 64 | 76 | 64 | 65 |
| 243 | Mikkel Bjerg | 63 | 63 | 73 | 62 | 64 |
| 244 | Andrey Amador | 74 | 74 | 69 | 66 | 69 |
| 245 | Pierre Rolland | 74 | 74 | 69 | 66 | 70 |
| 246 | Robert Gesink | 73 | 74 | 69 | 66 | 68 |
| 247 | Maximiliano Richeze | 62 | 62 | 67 | 70 | 63 |
| 248 | Luke Durbridge | 65 | 65 | 79 | 64 | 65 |
| 249 | Vegard Stake Laengen | 63 | 63 | 75 | 62 | 64 |
| 250 | Luke Rowe | 68 | 68 | 83 | 59 | 73 |
| 251 | Mikel Nieve | 74 | 75 | 70 | 67 | 70 |
| 252 | Eros Poli | 66 | 67 | 76 | 65 | 67 |
| 253 | Igor Anton | 74 | 74 | 70 | 66 | 68 |
| 254 | Maarten Tjallingii | 66 | 66 | 74 | 65 | 66 |
| 255 | Tanel Kangert | 73 | 74 | 70 | 66 | 68 |
| 256 | Iljo Keisse | 62 | 62 | 67 | 70 | 63 |
| 257 | Alex Dowsett | 66 | 66 | 74 | 61 | 63 |
| 258 | Roy Curvers | 61 | 61 | 67 | 70 | 61 |
| 259 | Rein Taaramae | 73 | 74 | 69 | 66 | 68 |
| 260 | Kasper Asgreen | 64 | 64 | 76 | 63 | 64 |
| 261 | Gert Steegmans | 58 | 58 | 66 | 70 | 58 |
| 262 | Vasil Kiryienka | 67 | 67 | 79 | 62 | 64 |
| 263 | Matthew Goss | 61 | 61 | 64 | 70 | 62 |
| 264 | Jos van Emden | 66 | 66 | 77 | 65 | 66 |
| 265 | Michael Morkov | 63 | 63 | 67 | 71 | 63 |
| 266 | Jan Barta | 67 | 66 | 75 | 61 | 63 |
| 267 | Viatcheslav Ekimov | 64 | 64 | 76 | 63 | 65 |
| 268 | Ramon Sinkeldam | 62 | 62 | 67 | 70 | 62 |
| 269 | Jurgen Roelandts | 60 | 60 | 66 | 70 | 60 |
| 270 | Greg Henderson | 59 | 59 | 65 | 70 | 59 |
| 271 | Maciej Bodnar | 66 | 66 | 78 | 65 | 66 |
| 272 | Dries Devenyns | 64 | 64 | 76 | 63 | 66 |
| 273 | Brent Bookwalter | 65 | 65 | 74 | 61 | 61 |
| 274 | Yukiya Arashiro | 69 | 69 | 79 | 57 | 72 |
| 275 | Simon Geschke | 65 | 66 | 73 | 66 | 72 |
| 276 | Stuart O'Grady | 65 | 65 | 77 | 64 | 65 |
| 277 | Tejay van Garderen | 65 | 65 | 74 | 61 | 62 |
| 278 | Daryl Impey | 67 | 67 | 74 | 68 | 73 |
| 279 | Ian Stannard | 63 | 63 | 75 | 62 | 63 |
| 280 | Jens Voigt | 65 | 65 | 80 | 64 | 66 |
| 281 | Lars Bak | 64 | 64 | 79 | 63 | 65 |
| 282 | Marcus Burghardt | 63 | 63 | 75 | 62 | 64 |
| 283 | Alessandro Ballan | 66 | 66 | 73 | 67 | 73 |
| 284 | Michael Rogers | 67 | 67 | 73 | 67 | 73 |
| 285 | Manuel Quinziato | 67 | 67 | 75 | 68 | 73 |
| 286 | Bernhard Eisel | 66 | 66 | 72 | 67 | 72 |
| 287 | Christian Vande Velde | 65 | 65 | 72 | 66 | 72 |
| 288 | Bram Tankink | 65 | 65 | 72 | 66 | 72 |
| 289 | Juan Antonio Flecha | 66 | 67 | 73 | 67 | 72 |
| 290 | George Hincapie | 66 | 66 | 73 | 67 | 72 |
| 291 | Matteo Tosatto | 62 | 62 | 75 | 61 | 63 |
| 292 | Mathew Hayman | 65 | 66 | 72 | 66 | 72 |
| 293 | Luca Paolini | 66 | 67 | 73 | 67 | 73 |
| 294 | Sylvain Chavanel | 64 | 64 | 73 | 66 | 72 |
| 295 | Fumiyuki Beppu | 68 | 68 | 80 | 58 | 68 |
| 296 | Geraint Thomas | 68 | 68 | 76 | 68 | 73 |
| 297 | Gregory Rast | 65 | 65 | 73 | 66 | 72 |
| 298 | Koen de Kort | 63 | 63 | 72 | 65 | 71 |
| 299 | Nicolas Roche | 64 | 64 | 73 | 66 | 71 |
| 300 | David Millar | 67 | 67 | 75 | 67 | 73 |

## 世界選手権ロード・個人TT実績

| No. | 選手名 | ロード金 | ロード銀 | ロード銅 | ITT金 | ITT銀 | ITT銅 | 評価根拠 |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Tadej Pogacar | 2 | 0 | 1 | 0 | 0 | 0 | ロード 金2/銀0/銅1、ITT 金0/銀0/銅0 |
| 2 | Miguel Indurain | 0 | 2 | 1 | 1 | 0 | 0 | ロード 金0/銀2/銅1、ITT 金1/銀0/銅0 |
| 3 | Chris Froome | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 7 | Mathieu van der Poel | 1 | 0 | 1 | 0 | 0 | 0 | ロード 金1/銀0/銅1、ITT 金0/銀0/銅0 |
| 8 | Andre Greipel | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 9 | Jan Ullrich | 0 | 0 | 0 | 2 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金2/銀0/銅1 |
| 10 | Alex Zulle | 0 | 0 | 0 | 1 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀0/銅0 |
| 13 | Marco Pantani | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 17 | Mario Cipollini | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 18 | Mark Cavendish | 1 | 1 | 0 | 0 | 0 | 0 | ロード 金1/銀1/銅0、ITT 金0/銀0/銅0 |
| 20 | Robbie McEwen | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 22 | Peter Sagan | 3 | 0 | 0 | 0 | 0 | 0 | ロード 金3/銀0/銅0、ITT 金0/銀0/銅0 |
| 23 | Fabian Cancellara | 0 | 0 | 0 | 4 | 0 | 3 | ロード 金0/銀0/銅0、ITT 金4/銀0/銅3 |
| 24 | Mads Pedersen | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 25 | Michele Bartoli | 0 | 0 | 2 | 0 | 0 | 0 | ロード 金0/銀0/銅2、ITT 金0/銀0/銅0 |
| 26 | Joaquim Rodriguez | 0 | 1 | 1 | 0 | 0 | 0 | ロード 金0/銀1/銅1、ITT 金0/銀0/銅0 |
| 29 | Wout van Aert | 0 | 2 | 0 | 0 | 2 | 0 | ロード 金0/銀2/銅0、ITT 金0/銀2/銅0 |
| 30 | Remco Evenepoel | 1 | 1 | 0 | 3 | 1 | 2 | ロード 金1/銀1/銅0、ITT 金3/銀1/銅2 |
| 31 | Primoz Roglic | 0 | 0 | 0 | 0 | 1 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅0 |
| 32 | Erik Zabel | 0 | 2 | 1 | 0 | 0 | 0 | ロード 金0/銀2/銅1、ITT 金0/銀0/銅0 |
| 33 | Cadel Evans | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 35 | Paolo Bettini | 2 | 1 | 0 | 0 | 0 | 0 | ロード 金2/銀1/銅0、ITT 金0/銀0/銅0 |
| 36 | Julian Alaphilippe | 2 | 0 | 0 | 0 | 0 | 0 | ロード 金2/銀0/銅0、ITT 金0/銀0/銅0 |
| 37 | Simon Gerrans | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 40 | Tom Boonen | 1 | 0 | 1 | 0 | 0 | 0 | ロード 金1/銀0/銅1、ITT 金0/銀0/銅0 |
| 42 | Chris Boardman | 0 | 0 | 0 | 1 | 1 | 2 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅2 |
| 43 | Alejandro Valverde | 1 | 2 | 4 | 0 | 0 | 0 | ロード 金1/銀2/銅4、ITT 金0/銀0/銅0 |
| 45 | Rui Costa | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 46 | Maurizio Fondriest | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 47 | Marc Hirschi | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 55 | Johan Museeuw | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 58 | Tom Dumoulin | 0 | 0 | 0 | 1 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅1 |
| 59 | Laurent Jalabert | 0 | 1 | 0 | 1 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金1/銀0/銅0 |
| 60 | Alexander Kristoff | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 61 | Philippe Gilbert | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 62 | Thor Hushovd | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 63 | Romain Bardet | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 66 | Michael Woods | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 74 | Tony Martin | 0 | 0 | 0 | 4 | 1 | 2 | ロード 金0/銀0/銅0、ITT 金4/銀1/銅2 |
| 75 | Filippo Ganna | 0 | 0 | 0 | 2 | 2 | 1 | ロード 金0/銀0/銅0、ITT 金2/銀2/銅1 |
| 78 | Oscar Freire | 3 | 0 | 1 | 0 | 0 | 0 | ロード 金3/銀0/銅1、ITT 金0/銀0/銅0 |
| 90 | Peter Van Petegem | 0 | 1 | 1 | 0 | 0 | 0 | ロード 金0/銀1/銅1、ITT 金0/銀0/銅0 |
| 91 | Bradley Wiggins | 0 | 0 | 0 | 1 | 2 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀2/銅0 |
| 93 | Damiano Cunego | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 94 | Claudio Chiappucci | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 99 | Ben Healy | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 107 | Rohan Dennis | 0 | 0 | 0 | 2 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金2/銀0/銅0 |
| 123 | Richard Virenque | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 148 | Gustav Erik Larsson | 0 | 0 | 0 | 0 | 1 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅0 |
| 152 | David Zabriskie | 0 | 0 | 0 | 0 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀1/銅1 |
| 153 | Joshua Tarling | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 156 | Michal Kwiatkowski | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 157 | Victor Campenaerts | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 166 | Michael Matthews | 0 | 1 | 2 | 0 | 0 | 0 | ロード 金0/銀1/銅2、ITT 金0/銀0/銅0 |
| 171 | Ben O'Connor | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 175 | Tobias Foss | 0 | 0 | 0 | 1 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金1/銀0/銅0 |
| 176 | Stefan Kung | 0 | 0 | 1 | 0 | 1 | 1 | ロード 金0/銀0/銅1、ITT 金0/銀1/銅1 |
| 180 | Jonathan Castroviejo | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 210 | Dylan van Baarle | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 211 | Edoardo Affini | 0 | 0 | 0 | 0 | 0 | 1 | ロード 金0/銀0/銅0、ITT 金0/銀0/銅1 |
| 213 | Matteo Trentin | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 219 | Christophe Laporte | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 262 | Vasil Kiryienka | 0 | 0 | 0 | 1 | 1 | 1 | ロード 金0/銀0/銅0、ITT 金1/銀1/銅1 |
| 263 | Matthew Goss | 0 | 1 | 0 | 0 | 0 | 0 | ロード 金0/銀1/銅0、ITT 金0/銀0/銅0 |
| 283 | Alessandro Ballan | 1 | 0 | 0 | 0 | 0 | 0 | ロード 金1/銀0/銅0、ITT 金0/銀0/銅0 |
| 284 | Michael Rogers | 0 | 0 | 0 | 3 | 0 | 0 | ロード 金0/銀0/銅0、ITT 金3/銀0/銅0 |
| 293 | Luca Paolini | 0 | 0 | 1 | 0 | 0 | 0 | ロード 金0/銀0/銅1、ITT 金0/銀0/銅0 |
| 300 | David Millar | 0 | 0 | 0 | 0 | 2 | 0 | ロード 金0/銀0/銅0、ITT 金0/銀2/銅0 |
