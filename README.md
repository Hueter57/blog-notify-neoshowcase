# blog-notify-neoshowcase

crowi からブログリレーの情報を取得し、traQ に流す BOT
Neoshowcase で動かす

## コマンド

| コマンド       | 機能           | 備考                                         |
| -------------- | -------------- | -------------------------------------------- |
| `ping`         | BOT の稼働確認 | BOT が起動しているか確認する                 |
| `checkEnvData` | 環境変数の確認 | 環境変数の状態を確認する                     |
| `cronStart`    | cron の開始    | BOT 起動後に一度は`checkEnvData`の実行が必要 |
| `cronStop`     | cron の停止    |                                              |

## 環境変数

| key                          | value                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| HUBOT 関係                   |                                                                                              |
| `HUBOT_TRAQ_EMBED`           | メンション・チャンネルリンクの自動埋め込みの有無(TRUE にすると有効、省略時は無効)            |
| `HUBOT_TRAQ_MODE`            | BOT のモード (HTTP または WebSocket、省略時は HTTP)                                          |
| `HUBOT_TRAQ_NAME`            | traQ で動かす Hubot の traQ ID (例: @BOT_TEST なら BOT_TEST)                                 |
| `HUBOT_TRAQ_PATH`            | Bot サーバーエンドポイントのパス(直下で受け取るなら""、`/webhook/`で受け取るなら"/webhook/") |
| `HUBOT_TRAQ_ACCESS_TOKEN`    | traQ で動かす Hubot の Access Token                                                          |
| `HUBOT_TRAQ_VERIFY_TOKEN`    | traQ で動かす Hubot の Verification Code                                                     |
| `PORT` または `EXPRESS_PORT` | HTTP モードでのポート (省略時は 8080)                                                        |
| CROWI 関係                   |                                                                                              |
| `CROWI_ACCESS_TOKEN`         | Wiki の API アクセストークン                                                                 |
| `CROWI_HOST`                 | Wiki のサーバーの hostname (例 : wiki.trap.jp)                                               |
| `CROWI_PAGE_PATH`            | ブログリレーページのパス (例 : /Event/blog-relay/2025/welcome)                               |
| ブログリレー関係             |                                                                                              |
| `TITLE`                      | ブログリレーの名前                                                                           |
| `TAG`                        | ブログに付けるブログリレーのタグ名                                                           |
| `BLOG_DAYS`                  | ブログリレーの日数                                                                           |
| `START_DATE`                 | ブログリレー開始日(日本時間)　書式 : YYYY-MM-DDTHH:mm:ss+09:00                               |
| `TRAQ_CHANNEL_ID`            | リマインドを流す traQ のチャンネル ID                                                        |
| `TRAQ_LOG_CHANNEL_ID`        | ログを流す traQ のチャンネル ID                                                              |
| `TRAQ_LOG_CHANNEL_PATH`      | ログを流す traQ のチャンネルパス (例 : #event/welcome/blog/buri)                             |
| `TRAQ_REVIEW_CHANNEL_PATH`   | ブログのレビューをしてもらうチャンネルパス (例 : #random/review)                             |

## 参考

- [sapphi-red/hubot-traq](https://github.com/sapphi-red/hubot-traq)
- [H1rono/blog-notify](https://github.com/H1rono/blog-notify)
