// Description:
//
// Commands:
//

import hubot from "hubot";
import { calcDateDiff, getMessages, dateOffset } from "./schedule";
import { envData } from "./init";
import cron from "node-cron";

module.exports = (robot: hubot.Robot): void => {
  let mainCron = startCron(robot);

  robot.hear(/cronStart$/i, async (res: hubot.Response): Promise<void> => {
    if (mainCron === null) {
      mainCron = startCron(robot);
      if (mainCron !== null) {
        console.log("new cron start");
        res.send("new cron Start");
      } else {
        console.log("cronStart failed");
        res.send("cronStart failed");
      }
    } else {
      mainCron.start();
      console.log("cron start");
      res.send("cron start");
    }
  });

  robot.hear(/cronStop$/i, async (res: hubot.Response): Promise<void> => {
    if (mainCron !== null) {
      mainCron.stop();
      console.log("cron stop");
      res.send("cron stop");
    } else {
      console.log("cron is null");
      res.send("cron is null");
    }
  });
};

function startCron(robot: hubot.Robot): cron.ScheduledTask | null {
  if (!envData.validData) {
    return null;
  }
  const { crowi, blogRelay, noticeMessage } = envData;
  const dateDiff = calcDateDiff(blogRelay);
  if (dateDiff >= blogRelay.days) {
    console.log("blogRelay have already ended");
    return null;
  }
  let mainCron = cron.schedule(
    "0 0 8 * * *",
    async () => {
      const messages = await getMessages(crowi, blogRelay, noticeMessage);
      if (messages.length === 0) {
        return;
      }
      console.log(messages);
      robot.send({ channelID: envData.traQ.channelId }, messages[0]);
      robot.send({ channelID: envData.traQ.logChannelId }, messages[1]);
    },
    {
      scheduled: true,
      timezone: "Asia/Tokyo",
    }
  );
  console.log("start cron");
  const endDate = dateOffset(
    JapaneseDate(blogRelay.startDate),
    blogRelay.days - 1
  );
  endDate.setHours(12, 0, 0, 0);
  cron.schedule(
    getCronScheduleString(endDate),
    () => {
      if (mainCron !== null) {
        mainCron.stop();
        console.log("cron stop");
        robot.send(
          { channelID: envData.traQ.logChannelId },
          `blogRelay end
cron stop`
        );
      } else {
        console.log("cron is null");
        robot.send({ channelID: envData.traQ.logChannelId }, "cron is null");
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Tokyo",
    }
  );
  console.log("set end cron at ", endDate);
  return mainCron;
}

function getCronScheduleString(date: Date): string {
  const second = date.getSeconds();
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return second + " " + minute + " " + hour + " " + day + " " + month + " *";
}

export function JapaneseDate(date?: string): Date {
  const dateMs =
    date === undefined ? new Date().getTime() : new Date(date).getTime();
  const offsetMs = 9 * 60 * 60 * 1000; // 9hours
  return new Date(dateMs + offsetMs);
}
