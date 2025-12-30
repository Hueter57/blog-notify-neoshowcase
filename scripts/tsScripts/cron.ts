// Description:
//
// Commands:
//

import * as hubot from "hubot";
import { envData } from "./lib/init";
import { calcDateDiff, getMessages, dateOffset } from "./lib/schedule";
import * as cron from "node-cron";

module.exports = (robot: hubot.Robot): void => {
  let mainCron = startCron(robot);


  robot.respond(/preview$/i, async (res: hubot.Response): Promise<void> => {
    const { crowi, blogRelay, noticeMessage } = envData;
    const messages = await getMessages(crowi, blogRelay, noticeMessage);
    if (messages.length === 0) {
      console.log("can not get messages");
      return;
    }
    console.log(messages);
    res.send("```\n" + messages[0] + "```\n");
    res.send("```\n" + messages[1] + "```\n");
  });

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
  if (envData.validData === undefined || !envData.validData) {
    console.log("env data is invalid");
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
        console.log("can not get messages");
        return;
      }
      console.log(messages);
      robot.send({ channelID: envData.traQ.channelId }, messages[0]);
      robot.send({ channelID: envData.traQ.logChannelId }, messages[1]);
    },
    {
      scheduled: dateDiff > -5 ? true : false,
      timezone: "Asia/Tokyo",
    }
  );

  if (dateDiff > -5) {
    console.log("start cron");
  } else {
    const startDate = dateOffset(JapaneseDate(blogRelay.startDate), -5);
    startDate.setHours(0, 0, 0, 0);
    cron.schedule(
      getCronScheduleString(startDate),
      () => {
        if (mainCron !== null) {
          mainCron.start();
          console.log("start cron");
          robot.send(
            { channelID: envData.traQ.logChannelId },
            "blogRelay start"
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
    console.log("set satrt cron at ", startDate);
    robot.send(
      { channelID: envData.traQ.logChannelId },
      "set satrt cron at " + startDate
    );
  }
  const endDate = dateOffset(JapaneseDate(blogRelay.startDate), blogRelay.days);
  endDate.setHours(0, 0, 0, 0);
  cron.schedule(
    getCronScheduleString(endDate),
    () => {
      if (mainCron !== null) {
        mainCron.stop();
        console.log("cron stop");
        robot.send(
          { channelID: envData.traQ.channelId },
          `# ${envData.blogRelay.title}:kan:
${envData.blogRelay.title}に参加してくださった皆さんありがとうございました!!
今回ブログを書かなかった人も書きたいブログができれば、ブログリレー期間を問わずにブログを書いて出してみましょう！`
        );
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
  robot.send(
    { channelID: envData.traQ.logChannelId },
    "set end cron at " + endDate
  );
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