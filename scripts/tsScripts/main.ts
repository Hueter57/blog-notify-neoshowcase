// Description:
//
// Commands:
//

import hubot from "hubot";
import { checkEnvData, envData } from "./init";

module.exports = (robot: hubot.Robot): void => {
  robot.send({ channelID: envData.traQ.channelId },  "bot started");

  robot.respond(/ping$/i, async (res: hubot.Response): Promise<void> => {
    await res.reply("pong");
  });

  robot.hear(/checkEnvData$/i, async (res: hubot.Response): Promise<void> => {
    const envStatusList = await checkEnvData();
    const envStatusMessage = envStatusList
      .map((envStatus) => envStatus.join(" | "))
      .join("\n");
    const message = `env name | status
--- | ---
${envStatusMessage}`;
    console.log(message);
    res.send(message);
  });

  robot.respond(/help$/i, async (res: hubot.Response): Promise<void> => {
    await res.reply(`コマンド一覧\n
- \`ping\`: BOTの稼働確認\n
- \`help\`: ヘルプを表示\n
- \`checkEnvData\`: 環境変数の確認\n
- \`cronStart\`: cronの開始 (環境変数変更後一度\`checkEnvData\`の実行が必要)\n
- \`cronStop\`: cronの停止
- \`changeEnv <key>,<value>\`: 環境変数の変更 (例: \`changeEnv TITLE,新しいタイトル\`)
    - <key> \`TITLE\`, \`TAG\`, \`START_DATE\`, \`BLOG_DAYS\`, \`TRAQ_CHANNEL_ID\`, \`TRAQ_LOG_CHANNEL_ID\`, \`TRAQ_LOG_CHANNEL_PATH\`, \`TRAQ_REVIEW_CHANNEL_PATH\`, \`CROWI_PAGE_PATH\``);
  });
};
