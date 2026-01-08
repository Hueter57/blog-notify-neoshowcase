// Description:
//
// Commands:
//

import * as hubot from "hubot";
import { envData } from "./lib/init";
import { calcDateDiff, getMessages, dateOffset } from "./lib/schedule";
import * as DB from "./lib/db";
import * as cron from "node-cron";

module.exports = (robot: hubot.Robot): void => {
  let mainCron: cron.ScheduledTask | null = null;


  robot.respond(/preview (.*)$/i, async (res: hubot.Response): Promise<void> => {
    const scheduleId = Number(res.match[1]);
    if (isNaN(scheduleId)) {
      console.log(`Invalid schedule ID: ${res.match[1]}`);
      res.send("Please provide a valid schedule ID.");
      return;
    }

    const crowi = envData.crowi;
    const schedule: DB.Schedule | null = await DB.getScheduleById(scheduleId);
    if (schedule === null) {
      console.log(`Schedule not found: id=${scheduleId}`);
      return;
    }
    const messages = await getMessages(crowi, schedule);
    if (messages.length === 0) {
      console.log("can not get messages");
      return;
    }
    console.log(messages);
    res.send("```\n" + messages[0] + "```\n");
    res.send("```\n" + messages[1] + "```\n");
  });

  robot.hear(/cronStart (.*)$/i, async (res: hubot.Response): Promise<void> => {
    const scheduleId = Number(res.match[1]);
    if (isNaN(scheduleId)) {
      console.log(`Invalid schedule ID: ${res.match[1]}`);
      res.send("Please provide a valid schedule ID.");
      return;
    }

    if (mainCron === null) {
      mainCron = await startCron(robot, scheduleId);
      if (mainCron !== null) {
        console.log("new cron start");
        res.send("new cron Start");
      } else {
        console.log("cronStart failed");
        res.send("cronStart failed");
      }
    } else {
      const scheduleStatus = await DB.getScheduleStatus();
      if (scheduleStatus === null) {
        console.log("can not get schedule status");
      } else if (scheduleStatus.id !== scheduleId) {
        mainCron.start();
        console.log("cron start");
        res.send("cron start");
      } else {
        console.log("cron is already running. scheduleID : " + scheduleStatus.id);
      }
    }
  });

  robot.hear(/cronStop (.*)$/i, async (res: hubot.Response): Promise<void> => {
    const scheduleId = Number(res.match[1]);
    if (isNaN(scheduleId)) {
      console.log(`Invalid schedule ID: ${res.match[1]}`);
      res.send("Please provide a valid schedule ID.");
      return;
    }

    if (mainCron !== null) {
      mainCron.stop();
      console.log("cron stop");
      res.send("cron stop");
    } else {
      console.log("cron is null");
      res.send("cron is null");
    }
  });

  robot.hear(/deleteCron$/i, async (res: hubot.Response): Promise<void> => {
    mainCron = null;
    const count = await DB.updateBlogScheduleStatusStop();
    console.log(`set ${count} schedule status to 'checked'`);
    res.send("delete cron instance");
  });
};

async function startCron(robot: hubot.Robot, scheduleId: number): Promise<cron.ScheduledTask | null> {
  const schedule: DB.Schedule | null = await DB.getScheduleById(scheduleId);
  if (schedule === null) {
    console.log(`Schedule not found: id=${scheduleId}`);
    return null;
  }
  if (envData.validData === undefined || !envData.validData) {
    console.log("env data is invalid");
    return null;
  }
  const crowi = envData.crowi;

  const dateDiff = calcDateDiff(schedule.startDate);
  if (dateDiff >= schedule.blogDays) {
    console.log("blogRelay have already ended");
    return null;
  }

  let mainCron = cron.schedule(
    "0 0 8 * * *",
    async () => {
      const messages = await getMessages(crowi, schedule);
      if (messages.length === 0) {
        console.log("can not get messages");
        return;
      }
      console.log(messages);
      robot.send({ channelID: schedule.channelId }, messages[0]);
      robot.send({ channelID: schedule.logChannelId }, messages[1]);
    },
    {
      scheduled: dateDiff > -5 ? true : false,
      timezone: "Asia/Tokyo",
    }
  );

  if (dateDiff > -5) {
    console.log("start cron");
  } else {
    const startDate = dateOffset(schedule.startDate, -5);
    startDate.setHours(0, 0, 0, 0);
    cron.schedule(
      getCronScheduleString(startDate),
      () => {
        if (mainCron !== null) {
          mainCron.start();
          console.log("start cron");
          robot.send(
            { channelID: schedule.logChannelId },
            "blogRelay start"
          );
        } else {
          console.log("cron is null");
          robot.send({ channelID: schedule.logChannelId }, "cron is null");
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Tokyo",
      }
    );
    console.log("set satrt cron at ", startDate);
    robot.send(
      { channelID: schedule.logChannelId },
      "set satrt cron at " + startDate
    );
  }
  const endDate = dateOffset(schedule.startDate, schedule.blogDays);
  endDate.setHours(0, 0, 0, 0);
  cron.schedule(
    getCronScheduleString(endDate),
    () => {
      if (mainCron !== null) {
        mainCron.stop();
        console.log("cron stop");
        robot.send(
          { channelID: schedule.channelId },
          `# ${schedule.title}:kan:
${schedule.title}に参加してくださった皆さんありがとうございました!!
今回ブログを書かなかった人も書きたいブログができれば、ブログリレー期間を問わずにブログを書いて出してみましょう！`
        );
        robot.send(
          { channelID: schedule.logChannelId },
          `blogRelay end
cron stop`
        );
      } else {
        console.log("cron is null");
        robot.send({ channelID: schedule.logChannelId }, "cron is null");
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Tokyo",
    }
  );
  console.log("set end cron at ", endDate);
  robot.send(
    { channelID: schedule.logChannelId },
    "set end cron at " + endDate
  );
  return mainCron;
}

function getCronScheduleString(date: Date): string {
  const regex = /^(\d{4})\/(\d{2})\/(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/;
  const match = date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).match(regex);
  const month = match ? match[2] : "01";
  const day = match ? match[3] : "01";
  const hour = match ? match[4] : "00";
  const minute = match ? match[5] : "00";
  const second = match ? match[6] : "00";
  return second + " " + minute + " " + hour + " " + day + " " + month + " *";
}

// 日本時間の日付オブジェクトを取得するために9時間足す
export function JapaneseDate(date?: string): Date {
  const dateMs =
    date === undefined ? new Date().getTime() : new Date(date).getTime();
  const offsetMs = 9 * 60 * 60 * 1000; // 9hours
  return new Date(dateMs + offsetMs);
}