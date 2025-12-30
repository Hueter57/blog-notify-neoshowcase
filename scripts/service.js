"use strict";
// Description:
//
// Commands:
//
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const DB = __importStar(require("./lib/db"));
const traqAPI = __importStar(require("./lib/traq"));
const traQidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
module.exports = (robot) => {
    robot.respond(/List (.+)$/i, async (res) => {
        const item = res.match[1];
        if (item.toLowerCase() === "schedules") {
            console.log("Listing schedules...");
            const message = await ScheduleList();
            res.send(message);
            console.log("send Schedule list");
        }
        else if (item.toLowerCase() === "admins") {
            console.log("Listing admins...");
            const message = await AdminList();
            res.send(message);
            console.log("send Admin list");
        }
        else {
            console.log(`Unknown list item: ${item}`);
            res.send(`I don't know how to list ${item}.`);
        }
    });
    // schedules
    robot.respond(/createSchedule (.+)/i, async (res) => {
        let message = [];
        const allItem = res.match[1].split('--').slice(1)
            .reduce((acc, item) => {
            const items = item.trim().split(' ');
            if (items.length !== 2) {
                console.log(`Invalid schedule data format: --${item}`);
                message.push(`Please provide valid schedule data format: --${item}\n`);
                return acc;
            }
            acc[items[0]] = items[1];
            return acc;
        }, {});
        if (message.length > 0) {
            res.send(message.join(''));
            return;
        }
        if (!allItem["crowiPath"] || !allItem["channelId"] || !allItem["logChannelId"] || !allItem["title"]
            || !allItem["tag"] || !allItem["startDate"] || !allItem["blogDays"]) {
            console.log("Missing required schedule data.");
            res.send("Please provide all required schedule data: crowiPath, channelId, logChannelId, title, tag, startDate, blogDays.");
            return;
        }
        const sData = {
            crowiPath: allItem["crowiPath"] === undefined ? "" : allItem["crowiPath"],
            channelId: allItem["channelId"] === undefined ? "" : allItem["channelId"],
            logChannelId: allItem["logChannelId"] === undefined ? "" : allItem["logChannelId"],
            title: allItem["title"] === undefined ? "" : allItem["title"],
            tag: allItem["tag"] === undefined ? "" : allItem["tag"],
            startDate: allItem["startDate"] === undefined ? new Date() : new Date(allItem["startDate"]),
            blogDays: allItem["blogDays"] === undefined ? 0 : parseInt(allItem["blogDays"]),
        };
        DB.CreateBlogSchedule(sData).then((schedule) => {
            console.log(`Schedule created: id=${schedule.id}, title=${schedule.title}`);
            res.send(`Schedule created: id=${schedule.id}, title=${schedule.title}`);
        }).catch((err) => {
            console.error("createSchedule error: " + err);
            res.send("Error creating schedule.");
        });
    });
    robot.respond(/Show schedule (.+)/i, async (res) => {
        const scheduleId = Number(res.match[1]);
        if (isNaN(scheduleId)) {
            console.log(`Invalid schedule ID: ${res.match[1]}`);
            res.send("Please provide a valid schedule ID.");
            return;
        }
        console.log(`Showing schedule with id: ${scheduleId}`);
        const schedule = await DB.getScheduleById(scheduleId);
        if (schedule === null) {
            console.log(`Schedule not found: id=${scheduleId}`);
            res.send(`Schedule not found: id=${scheduleId}`);
            return;
        }
        let message = `| Schedule Details | |
|---|---|
| id | ${schedule.id}|
| title | ${schedule.title}|
| tag | ${schedule.tag}|
| crowiPath | ${schedule.crowiPath}|
| channelId | ${schedule.channelId}|
| logChannelId | ${schedule.logChannelId}|
| startDate | ${schedule.startDate.toISOString()}|
| blogDays | ${schedule.blogDays}|
| status | ${schedule.status}|`;
        console.log("send Schedule details:\n" + message);
        res.send(message);
    });
    // admins
    robot.respond(/createAdmin (.+)/i, async (res) => {
        const userid = res.match[1];
        if (!traQidRegex.test(userid)) {
            console.log(`Invalid userid format: ${userid}`);
            res.send("Please provide a valid userid.");
            return;
        }
        DB.createAdmin(userid).then((admin) => {
            console.log(`Admin created: id=${admin.id}, userid=${admin.userid}`);
            res.send(`Admin created: id=${admin.id}, userid=${admin.userid}`);
        }).catch((err) => {
            console.error("createAdmin error: " + err);
            res.send("Error creating admin.");
        });
    });
};
async function ScheduleList() {
    let schedules = await DB.getScheduleList();
    if (schedules.length === 0) {
        return "No schedules found.";
    }
    let message = "| id | title |\n|---|---|\n";
    message += schedules.map((schedule) => {
        return `| ${schedule.id} | ${schedule.title} |`;
    }).join('\n');
    console.log("created schedule list:\n" + message);
    return message;
}
async function AdminList() {
    const admins = await DB.getAdminList();
    if (admins.length === 0) {
        return "No admins found.";
    }
    let message = "| id | userName |\n|---|---|\n";
    const rows = await Promise.all(admins.map(async (admin) => {
        let userName = await traqAPI.getUserName(admin.userid);
        return `| ${admin.id} | ${userName} |`;
    }));
    message += rows.join('\n');
    console.log("created admin list:\n" + message);
    return message;
}
