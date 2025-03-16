"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
module.exports = (robot) => {
    (0, init_1.checkEnvData)();
    robot.respond(/ping$/i, async (res) => {
        await res.reply("pong");
    });
};
