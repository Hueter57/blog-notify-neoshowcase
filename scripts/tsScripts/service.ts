// Description:
//
// Commands:
//

import * as hubot from "hubot";
import * as DB from "./lib/db";
import * as traqAPI from "./lib/traq";

const traQidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = (robot: hubot.Robot): void => {
  robot.respond(/List (.+)$/i, async (res: hubot.Response): Promise<void> => {
    const item = res.match[1];
    if (item.toLowerCase() === "schedules") {
      console.log("Listing schedules...");
      await ScheduleList().then((message: string) => {
        res.send(message);
      });
      console.log("send Schedule list");
    } else if (item.toLowerCase() === "admins") {
      console.log("Listing admins...");
      await AdminList().then((message: string) => {
        res.send(message);
      });
      console.log("send Admin list");
    } else {
      console.log(`Unknown list item: ${item}`);
      res.send(`I don't know how to list ${item}.`);
    }
  });

  robot.respond(/createAdmin (.+)/i, async (res: hubot.Response): Promise<void> => {
    const userid = res.match[1];
    if (!traQidRegex.test(userid)) {
      console.log(`Invalid userid format: ${userid}`);
      res.send("Please provide a valid userid.");
      return;
    }

    DB.createAdmin(userid).then((admin: DB.Admin) => {
      console.log(`Admin created: id=${admin.id}, userid=${admin.userid}`);
      res.send(`Admin created: id=${admin.id}, userid=${admin.userid}`);
    }).catch((err: Error) => {
      console.error("createAdmin error: " + err);
      res.send("Error creating admin.");
    });
  });
};


async function ScheduleList(): Promise<string> {
  let message: string = "";
  await DB.getScheduleList()
    .then((schedules: DB.ScheduleOverview[]) => {
      if (schedules.length === 0) {
        return "No schedules found.";
      }
      message = "| id | title |\n|---|---|\n";
      message += schedules.map((schedule: DB.ScheduleOverview) => {
        return `| ${schedule.id} | ${schedule.title} |`;
      }).join('\n');
      console.log("created schedule list:\n" + message);
      return message;
    }).catch((err: Error) => {
      console.error("getScheduleList error: " + err);
      return "Error retrieving schedules.";
    })
  return message;
}


async function AdminList(): Promise<string> {
  let message: string = "";
  await DB.getAdminList()
    .then((admins: DB.Admin[]) => {
      if (admins.length === 0) {
        return "No admins found.";
      }
      message = "| id | userName |\n|---|---|\n";
      Promise.all(admins.map(async (admin: DB.Admin): Promise<string> => {
        let userName: string = await traqAPI.getUserName(admin.userid);
        return `| ${admin.id} | ${userName} |`;
      })).then((rows: string[]) => {
        message += rows.join('\n');
        console.log("created admin list:\n" + message);
      }).catch((err: Error) => {
        console.error("getAdminList error: " + err);
        return "Error processing admin list.";
      });
    }).catch((err: Error) => {
      console.error("getAdminList error: " + err);
      return "Error retrieving admins.";
    });
  return message;
}
