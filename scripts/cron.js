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
const init_1 = require("./init");
const schedule_1 = require("./schedule");
const node_cron_1 = __importDefault(require("node-cron"));
module.exports = (robot) => {
    let mainCron = startCron(robot);
    robot.hear(/cronStart$/i, async (res) => {
        if (mainCron === null) {
            mainCron = startCron(robot);
            if (mainCron !== null) {
                console.log("new cron start");
                res.send("new cron Start");
            }
            else {
                console.log("cronStart failed");
                res.send("cronStart failed");
            }
        }
        else {
            mainCron.start();
            console.log("cron start");
            res.send("cron start");
        }
    });
    robot.hear(/cronStop$/i, async (res) => {
        if (mainCron !== null) {
            mainCron.stop();
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
        scheduled: dateDiff > -5 ? true : false,
        timezone: "Asia/Tokyo",
    });
    if (dateDiff > -5) {
        console.log("start cron");
    }
    else {
        const startDate = (0, schedule_1.dateOffset)(JapaneseDate(blogRelay.startDate), -5);
        startDate.setHours(0, 0, 0, 0);
        node_cron_1.default.schedule(getCronScheduleString(startDate), () => {
            if (mainCron !== null) {
                mainCron.start();
                console.log("start cron");
                robot.send({ channelID: init_1.envData.traQ.logChannelId }, "blogRelay start");
            }
            else {
                console.log("cron is null");
                robot.send({ channelID: init_1.envData.traQ.logChannelId }, "cron is null");
            }
        }, {
            scheduled: true,
            timezone: "Asia/Tokyo",
        });
        console.log("set satrt cron at ", startDate);
        robot.send({ channelID: init_1.envData.traQ.logChannelId }, "set satrt cron at " + startDate);
    }
    const endDate = (0, schedule_1.dateOffset)(JapaneseDate(blogRelay.startDate), blogRelay.days);
    endDate.setHours(0, 0, 0, 0);
    node_cron_1.default.schedule(getCronScheduleString(endDate), () => {
        if (mainCron !== null) {
            mainCron.stop();
            console.log("cron stop");
            robot.send({ channelID: init_1.envData.traQ.channelId }, `# ${init_1.envData.blogRelay.title}:kan:
${init_1.envData.blogRelay.title}に参加してくださった皆さんありがとうございました!!
今回ブログを書かなかった人も書きたいブログができれば、ブログリレー期間を問わずにブログを書いて出してみましょう！`);
            robot.send({ channelID: init_1.envData.traQ.logChannelId }, `blogRelay end
cron stop`);
        }
        else {
            console.log("cron is null");
            robot.send({ channelID: init_1.envData.traQ.logChannelId }, "cron is null");
        }
    }, {
        scheduled: true,
        timezone: "Asia/Tokyo",
    });
    console.log("set end cron at ", endDate);
    robot.send({ channelID: init_1.envData.traQ.logChannelId }, "set end cron at " + endDate);
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
