// Description:
//
// Commands:
//

import hubot from "hubot";
import { calcDateDiff, getMessages } from "./schedule";
import { envData } from "./init";

const corn = require("node-cron");

module.exports = (robot: hubot.Robot): void => {
  startCorn(robot);
};

function startCorn(robot: hubot.Robot): void {
  if (!envData.validData) {
    return;
  }
  const { crowi, blogRelay, noticeMessage } = envData;
  const dateDiff = calcDateDiff(blogRelay);
  if (dateDiff >= blogRelay.days) {
    console.log("blogRelay have already ended");
    return;
  }
  const mainCorn = corn.schedule(
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
      Scheduled: true,
      timezone: "Asia/Tokyo",
    }
  );
  console.log("start corn");
}

function getCornScheduleString(date: Date): string {
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
