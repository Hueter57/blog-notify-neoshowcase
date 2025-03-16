// Description:
//
// Commands:
//

import hubot from "hubot";
import { checkEnvData } from "./init";

module.exports = (robot: hubot.Robot): void => {
  checkEnvData();
  robot.respond(/ping$/i, async (res: hubot.Response): Promise<void> => {
    await res.reply("pong");
  });
};
