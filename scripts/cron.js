"use strict";
// Description:
//
// Commands:
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JapaneseDate = JapaneseDate;
const schedule_1 = require("./schedule");
const init_1 = require("./init");
const node_cron_1 = __importDefault(require("node-cron"));
module.exports = (robot) => {
    let mainCorn = startCron(robot);
    robot.hear(/cronStart$/i, async (res) => {
        if (mainCorn === null) {
            mainCorn = startCron(robot);
            if (mainCorn !== null) {
                console.log("new corn start");
                res.send("new cron Start");
            }
            else {
                console.log("cronStart failed");
                res.send("cronStart failed");
            }
        }
        else {
            mainCorn.start();
            console.log("cron start");
            res.send("corn start");
        }
    });
    robot.hear(/cronStop$/i, async (res) => {
        if (mainCorn !== null) {
            mainCorn.stop();
            console.log("cron stop");
            res.send("cron stop");
        }
        else {
            console.log("cron is null");
            res.send("cron is null");
        }
    });
};
function startCron(robot) {
    if (!init_1.envData.validData) {
        return null;
    }
    const { crowi, blogRelay, noticeMessage } = init_1.envData;
    const dateDiff = (0, schedule_1.calcDateDiff)(blogRelay);
    if (dateDiff >= blogRelay.days) {
        console.log("blogRelay have already ended");
        return null;
    }
    let mainCron = node_cron_1.default.schedule("0 0 8 * * *", async () => {
        const messages = await (0, schedule_1.getMessages)(crowi, blogRelay, noticeMessage);
        if (messages.length === 0) {
            return;
        }
        console.log(messages);
        robot.send({ channelID: init_1.envData.traQ.channelId }, messages[0]);
        robot.send({ channelID: init_1.envData.traQ.logChannelId }, messages[1]);
    }, {
        scheduled: true,
        timezone: "Asia/Tokyo",
    });
    console.log("start cron");
    return mainCron;
}
function getCronScheduleString(date) {
    const second = date.getSeconds();
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return second + " " + minute + " " + hour + " " + day + " " + month + " *";
}
function JapaneseDate(date) {
    const dateMs = date === undefined ? new Date().getTime() : new Date(date).getTime();
    const offsetMs = 9 * 60 * 60 * 1000; // 9hours
    return new Date(dateMs + offsetMs);
}
