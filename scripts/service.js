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
const DB = __importStar(require("./db"));
const traQidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
module.exports = (robot) => {
    robot.respond(/List (.+)$/i, async (res) => {
        const item = res.match[1];
        if (item.toLowerCase() === "schedules") {
            console.log("Listing schedules...");
            const message = await ScheduleList();
            console.log(message);
            res.send(message);
        }
        else if (item.toLowerCase() === "admins") {
            console.log("Listing admins...");
            const message = await AdminList();
            console.log(message);
            res.send(message);
        }
        else {
            console.log(`Unknown list item: ${item}`);
            res.send(`I don't know how to list ${item}.`);
        }
    });
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
            console.error(err);
            res.send("Error creating admin.");
        });
    });
};
async function ScheduleList() {
    await DB.getScheduleList()
        .then((schedules) => {
        if (schedules.length === 0) {
            return "No schedules found.";
        }
        let message = "| id | title |\n|---|---|\n";
        message += schedules.map((schedule) => {
            return `| ${schedule.id} | ${schedule.title} |`;
        }).join('\n');
        return message;
    }).catch((err) => {
        console.error(err);
        return "Error retrieving schedules.";
    });
    return "";
}
async function AdminList() {
    await DB.getAdminList()
        .then((admins) => {
        if (admins.length === 0) {
            return "No admins found.";
        }
        let message = "| id | userid |\n|---|---|\n";
        message += admins.map((admin) => {
            return `| ${admin.id} | ${admin.userid} |`;
        }).join('\n');
        return message;
    }).catch((err) => {
        console.error(err);
        return "Error retrieving admins.";
    });
    return "";
}
