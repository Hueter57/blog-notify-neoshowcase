"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (robot) => {
    robot.hear(/ping$/i, (res) => {
        res.reply("pong");
    });
};
