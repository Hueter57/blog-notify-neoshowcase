// Description:
//
// Commands:
//

import hubot from "hubot";

module.exports = (robot: hubot.Robot): void => {
  robot.respond(/ping$/i, async (res: hubot.Response): Promise<void> => {
    await res.reply("pong");
  });
};
