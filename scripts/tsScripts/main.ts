// Description:
//
// Commands:
//

import hubot from "hubot";
import { envData } from "./init";

module.exports = (robot: hubot.Robot): void => {
  robot.respond(/ping$/i, async (res: hubot.Response): Promise<void> => {
    await res.reply("pong");
  });
};
