"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (robot) => {
    robot.respond(/ping$/i, async (res) => {
        await res.reply("pong");
    });
};
