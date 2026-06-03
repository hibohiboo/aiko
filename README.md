# 高森藍子bot

アイドルマスター シンデレラガールズの高森藍子に関する台詞データ管理・分析プロジェクト。

---

## プロジェクト概要

- **データソース:** [seesaawiki.jp/aiko_takamori](https://seesaawiki.jp/aiko_takamori)
- **ランタイム:** [Bun](https://bun.sh/)
- **主要ツール:** TypeScript スクレイパー + Claude Code スキル群

---

## ディレクトリ構成

```
高森藍子bot/
├── scraper/                  # スクレイピングスクリプト
│   ├── index.ts              # メインスクレイパー（Bun で実行）
│   └── pages.ts              # 取得対象ページ定義・カテゴリ定数
│
├── dialogues/                # スクレイプ済み台詞データ（Markdown）
│   ├── _log.json             # 取得ログ（name/url/status/savedAt）
│   ├── _debug/               # --debug 時の生HTML保存先
│   ├── 01_mobamas_card/      # モバイルシンデレラガールズ カードコミュ
│   ├── 02_deresute_card/     # スターライトステージ カード
│   ├── 03_anime/             # アニメ登場回
│   ├── 04_event_story/       # イベントストーリー（サブフォルダ = イベント名）
│   ├── 05_memorial/          # メモリアル
│   └── 06_other/             # その他
│
├── analysis/                 # /analyze-dialogue スキルの出力先
│   └── （dialogues/ と同じ構成でファイルが生成される）
│
├── analysis_gemini/          # Gemini による分析出力
│
├── docs/                     # 設計ドキュメント
│   └── dialogue_extraction_plan.md
│
├── prompts/                  # 生成AIへのシステムプロンプト
│   ├── system_prompt.md      # Claude 向けシステムプロンプト
│   └── system_prompt_gemini.md
│
├── work/                     # キャラクター分析メモ（プロンプト設計の素材）
│   ├── checklist_事実まとめ.md
│   ├── interests_and_habits.md
│   ├── personality_core.md
│   ├── relationship_producer.md
│   └── speech_patterns.md
│
├── tests/                    # Claude Code スキルの動作確認テスト
│   └── judge-dialogue/       # /judge-dialogue スキルのテストケース
│       └── 01_basic.md
│
├── .claude/
│   ├── settings.json
│   └── commands/             # Claude Code カスタムスキル定義
│       ├── analyze-dialogue.md   # 台詞解析スキル
│       └── judge-dialogue.md     # 台詞判定スキル
│
├── index.ts
├── package.json
└── tsconfig.json
```

---

## スクリプト

```bash
# 全ページをスクレイプ（既取得済みはスキップ）
bun run scrape

# デバッグモード（生HTMLを dialogues/_debug/ に保存）
bun run scrape:debug

# ドライラン（取得対象の確認のみ、実際には取得しない）
bun run scrape:dry

# オプション（上記スクリプトに追記して使用）
#   --category <name>   カテゴリを絞り込む（例: event_story）
#   --page <name>       ページ名で絞り込む（部分一致）
#   --no-skip           既取得済みでも強制再取得
```

---

## Claude Code スキル

### `/analyze-dialogue <path>`

`dialogues/` 以下のファイルを解析し、`analysis/` に解析ファイルを生成する。

```
/analyze-dialogue dialogues/01_mobamas_card/02_バレンタイン.md
```

出力先: `analysis/01_mobamas_card/02_バレンタイン.md`  
カード系・アニメ/イベントストーリー系でテンプレートが異なる（詳細: `.claude/commands/analyze-dialogue.md`）。

---

### `/judge-dialogue <台詞>`

渡した台詞が高森藍子の発言として自然かどうかを採点する。

```
/judge-dialogue 「ファンのみなさんが笑顔になってくれると嬉しいです」
```

- 採点項目: A.話し方(25) / B.価値観(35) / C.趣味(15) / D.感情表現(15) / E.総合(10)（合計100点）
- **80点以上 → 合格**（藍子の台詞として自然）
- 参照判例: 正例50件 + 負例20件（詳細: `.claude/commands/judge-dialogue.md`）
- テストケース: `tests/judge-dialogue/`

---

## ダイアログファイルのフォーマット

```markdown
---
name: "カード名またはエピソード名"
category: "mobamas_card | deresute_card | event_story | anime | memorial | other"
url: "https://seesaawiki.jp/aiko_takamori/..."
---

（本文）
```

イベントストーリーには追加フィールドあり（`event`, `unit`, `members`, `episode`）。

---

## 高森藍子 キャラクター要点

### 話し方
- 丁寧語（です・ます）基調
- 語尾の「っ」（頑張りますっ、お願いしますねっ）
- ためらい表現（えっと、あの、〜かな…）
- 柔らかい笑い声（ふふっ、ふふ♪）
- 婉曲表現（〜んですけど、〜気がします、〜かもしれません）

### 価値観
- ファンや周囲の人を「笑顔」「幸せ」にしたい
- 謙虚・自己評価低め、でも前向き
- 競争・対立が苦手、穏やかに
- プロデューサーへの淡い好意（さりげない）

### 趣味・関心
- 写真（トイカメラ、「一枚一枚が思い出」）
- お散歩・自然・猫・ひまわり
- 刺繍・日記・ミルクティー
- 日常の小さな幸せを大切に

### 苦手なもの
- 虫 / 露出の高い衣装 / 激しい競争

詳細分析は `work/` フォルダを参照。

---

## カテゴリ一覧

| ディレクトリ | Category 定数 | 内容 |
|---|---|---|
| `01_mobamas_card/` | `mobamas_card` | モバマス カードコミュ |
| `02_deresute_card/` | `deresute_card` | デレステ カードボイス |
| `03_anime/` | `anime` | アニメ登場回 |
| `04_event_story/` | `event_story` | イベントストーリー |
| `05_memorial/` | `memorial` | メモリアルコミュ |
| `06_other/` | `other` | その他（劇場など） |
