"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
module.exports = (robot) => {
    robot.respond(/ping$/i, async (res) => {
        await res.reply("pong");
    });
    robot.hear(/checkEnvData$/i, async (res) => {
        const envStatusList = await (0, init_1.checkEnvData)();
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
