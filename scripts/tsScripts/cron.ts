// Description:
//
// Commands:
//

import hubot from "hubot";
import { calcDateDiff, getMessages } from "./schedule";
import { envData } from "./init";
import cron from "node-cron";

module.exports = (robot: hubot.Robot): void => {
  let mainCorn = startCron(robot);

  robot.hear(/cronStart$/i, async (res: hubot.Response): Promise<void> => {
    if (mainCorn === null) {
      mainCorn = startCron(robot);
      if (mainCorn !== null) {
        console.log("new corn start");
        res.send("new cron Start");
      } else {
        console.log("cronStart failed");
        res.send("cronStart failed");
      }
    } else {
      mainCorn.start();
      console.log("cron start");
      res.send("corn start");
    }
  });

  robot.hear(/cronStop$/i, async (res: hubot.Response): Promise<void> => {
    if (mainCorn !== null) {
      mainCorn.stop();
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
