"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.JapaneseDate = JapaneseDate;
const schedule_1 = require("./schedule");
const init_1 = require("./init");
const cron = require("node-cron");
module.exports = (robot) => {
    startCron(robot);
};
function startCron(robot) {
    if (!init_1.envData.validData) {
        return;
    }
    const { crowi, blogRelay, noticeMessage } = init_1.envData;
    const dateDiff = (0, schedule_1.calcDateDiff)(blogRelay);
    if (dateDiff >= blogRelay.days) {
        console.log("blogRelay have already ended");
        return;
    }
    const mainCron = cron.schedule("0 0 8 * * *", async () => {
        const messages = await (0, schedule_1.getMessages)(crowi, blogRelay, noticeMessage);
        if (messages.length === 0) {
            return;
        }
        console.log(messages);
        robot.send({ channelID: init_1.envData.traQ.channelId }, messages[0]);
        robot.send({ channelID: init_1.envData.traQ.logChannelId }, messages[1]);
    }, {
        Scheduled: true,
        timezone: "Asia/Tokyo",
    });
    console.log("start cron");
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
