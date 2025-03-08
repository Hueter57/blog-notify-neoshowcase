// Description:
//
// Commands:
//

import hubot from "hubot";

module.exports = (robot: hubot.Robot): void => {
  robot.hear(/ping$/i, (res: hubot.Response) => {
    res.reply("pong");
  });
};
