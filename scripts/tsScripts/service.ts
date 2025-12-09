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
      const message: string = await ScheduleList();
      res.send(message);
      console.log("send Schedule list");
    } else if (item.toLowerCase() === "admins") {
      console.log("Listing admins...");
      const message: string = await AdminList();
      res.send(message);
      console.log("send Admin list");
    } else {
      console.log(`Unknown list item: ${item}`);
      res.send(`I don't know how to list ${item}.`);
    }
  });

  // schedules

  robot.respond(/createSchedule (.+)/i, async (res: hubot.Response): Promise<void> => {
    let message: string[] = [];
    const allItem = res.match[1].split('--').slice(1)
      .reduce((acc: { [data: string]: string }, item: string): { [data: string]: string } => {
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

    const sData: DB.CreateScheduleData = {
      crowiPath: allItem["crowiPath"] === undefined ? "" : allItem["crowiPath"],
      channelId: allItem["channelId"] === undefined ? "" : allItem["channelId"],
      logChannelId: allItem["logChannelId"] === undefined ? "" : allItem["logChannelId"],
      reviewChannelId: allItem["reviewChannelId"] === undefined ? "" : allItem["reviewChannelId"],
      title: allItem["title"] === undefined ? "" : allItem["title"],
      tag: allItem["tag"] === undefined ? "" : allItem["tag"],
      startDate: allItem["startDate"] === undefined ? new Date() : new Date(allItem["startDate"]),
      blogDays: allItem["blogDays"] === undefined ? 0 : parseInt(allItem["blogDays"]),
    };

    DB.CreateBlogSchedule(sData).then((schedule: DB.Schedule) => {
      console.log(`Schedule created: id=${schedule.id}, title=${schedule.title}`);
      res.send(`Schedule created: id=${schedule.id}, title=${schedule.title}`);
    }).catch((err: Error) => {
      console.error("createSchedule error: " + err);
      res.send("Error creating schedule.");
    });
  });

  robot.respond(/Show schedule (.+)/i, async (res: hubot.Response): Promise<void> => {
    const scheduleId = Number(res.match[1]);
    if (isNaN(scheduleId)) {
      console.log(`Invalid schedule ID: ${res.match[1]}`);
      res.send("Please provide a valid schedule ID.");
      return;
    }
    console.log(`Showing schedule with id: ${scheduleId}`);
    const schedule: DB.Schedule | null =  await DB.getScheduleById(scheduleId);
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
  let schedules: DB.ScheduleOverview[] = await DB.getScheduleList()
  if (schedules.length === 0) {
    return "No schedules found.";
  }
  let message = "| id | title |\n|---|---|\n";
  message += schedules.map((schedule: DB.ScheduleOverview) => {
    return `| ${schedule.id} | ${schedule.title} |`;
  }).join('\n');
  console.log("created schedule list:\n" + message);
  return message;
}


async function AdminList(): Promise<string> {
  const admins: DB.Admin[] = await DB.getAdminList();
  if (admins.length === 0) {
    return "No admins found.";
  }
  let message: string = "| id | userName |\n|---|---|\n";
  const rows: string[] = await Promise.all(admins.map(async (admin: DB.Admin): Promise<string> => {
    let userName: string = await traqAPI.getUserName(admin.userid);
    return `| ${admin.id} | ${userName} |`;
  }));
  message += rows.join('\n');
  console.log("created admin list:\n" + message);
  return message;
}
