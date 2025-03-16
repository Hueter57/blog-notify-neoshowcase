// Description:
//
// Commands:
//

import hubot from "hubot";
import { checkEnvData } from "./init";

module.exports = (robot: hubot.Robot): void => {
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
};
