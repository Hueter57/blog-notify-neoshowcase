// Description:
//
// Commands:
//

import * as hubot from "hubot";
import { checkEnvData, checkScheduleData, envData } from "./lib/init";

async function setup(): Promise<void> {
  const envStatusList = await checkEnvData();
  if (envData.validData) {
    console.log("環境変数の設定に問題はありません。");
  } else {
    console.log("環境変数の設定に問題があります。");
  }
  const envStatusMessage = envStatusList
    .map((envStatus) => envStatus.join(" | "))
    .join("\n");
  const message = `env name | status
--- | ---
${envStatusMessage}`;
  console.log(message);
}

setup();

module.exports = (robot: hubot.Robot): void => {
  robot.send({ channelID: envData.botLogChannelId },  "bot started");

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

  robot.hear(/checkScheduleData (.*)$/i, async (res: hubot.Response): Promise<void> => {
    const scheduleId = Number(res.match[1]);
    if (isNaN(scheduleId)) {
      console.log(`Invalid schedule ID: ${res.match[1]}`);
      res.send("Please provide a valid schedule ID.");
      return;
    }
    // TODO: 続き実装
    const envStatusList = await checkScheduleData(scheduleId);
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
- \`preview\`: 今日表示するメッセージとログをBOTを呼んだ場所にコードブロックに埋め込んで出力\n
- \`checkEnvData\`: 環境変数の確認\n
- \`cronStart\`: cronの開始 (環境変数変更後一度\`checkEnvData\`の実行が必要)\n
- \`cronStop\`: cronの停止
- \`changeEnv <key>,<value>\`: 環境変数の変更 (例: \`changeEnv TITLE,新しいタイトル\`)
    - <key> \`TITLE\`, \`TAG\`, \`START_DATE\`, \`BLOG_DAYS\`, \`TRAQ_CHANNEL_ID\`, \`TRAQ_LOG_CHANNEL_ID\`, \`TRAQ_LOG_CHANNEL_PATH\`, \`TRAQ_REVIEW_CHANNEL_PATH\`, \`CROWI_PAGE_PATH\``);
  });
};

