// Description:
//
// Commands:
//

import * as hubot from "hubot";
import * as DB from "./db";

const traQidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = (robot: hubot.Robot): void => {
  robot.respond(/List (.+)$/i, async (res: hubot.Response): Promise<void> => {
    const item = res.match[1];
    if (item.toLowerCase() === "schedules") {
      console.log("Listing schedules...");
      const message = await ScheduleList();
      console.log(message);
      res.send(message);
    } else if (item.toLowerCase() === "admins") {
      console.log("Listing admins...");
      const message = await AdminList();
      console.log(message);
      res.send(message);
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
      console.error(err);
      res.send("Error creating admin.");
    });
  });
};


async function ScheduleList(): Promise<string> {
  await DB.getScheduleList()
    .then((schedules: DB.ScheduleOverview[]) => {
      if (schedules.length === 0) {
        return "No schedules found.";
      }
      let message = "| id | title |\n|---|---|\n";
      message += schedules.map((schedule: DB.ScheduleOverview) => {
        return `| ${schedule.id} | ${schedule.title} |`;
      }).join('\n');
      return message;
    }).catch((err: Error) => {
      console.error(err);
      return "Error retrieving schedules.";
    })
  return "";
}


async function AdminList(): Promise<string> {
  await DB.getAdminList()
    .then((admins: DB.Admin[]) => {
      if (admins.length === 0) {
        return "No admins found.";
      }
      let message = "| id | userid |\n|---|---|\n";
      message += admins.map((admin: DB.Admin) => {
        return `| ${admin.id} | ${admin.userid} |`;
      }).join('\n');
      return message;
    }).catch((err: Error) => {
      console.error(err);
      return "Error retrieving admins.";
    })
  return "";
}
