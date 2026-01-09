// Description:
//
// Commands:
//

import * as traqAPI from "./traq";
import * as DB from "./db";

export type CrowiInfo = {
  host: string;
  token: string;
};


export type EnvData = {
  crowi: CrowiInfo;
  traqBotToken: string;
  botLogChannelId: string;
  validData: boolean;
};

export let envData: EnvData = init();


function init(): EnvData {
  const crowiHost =
    process.env.CROWI_HOST === undefined ? "" : process.env.CROWI_HOST;
  // const crowiPath =
  //   process.env.CROWI_PAGE_PATH === undefined
  //     ? ""
  //     : process.env.CROWI_PAGE_PATH;
  const crowiToken =
    process.env.CROWI_ACCESS_TOKEN === undefined
      ? ""
      : process.env.CROWI_ACCESS_TOKEN;

  const traQBotToken =
    process.env.HUBOT_TRAQ_ACCESS_TOKEN === undefined
      ? ""
      : process.env.HUBOT_TRAQ_ACCESS_TOKEN;
  const botLogChannelId =
    process.env.TRAQ_LOG_CHANNEL_ID === undefined
      ? ""
      : process.env.TRAQ_LOG_CHANNEL_ID;

  //   const url = `https://${crowiHost}${crowiPath}`;
  //   const noticeMessage = `
  // ## 注意事項
  // - \`${blogRelayTag}\`のタグをつけてください
  // - 記事の初めにブログリレー何日目の記事かを明記してください
  // - 記事の最後に次の日の担当者を紹介してください
  // - **post imageを設定して**ください
  // - わからないことがあれば気軽に ${traQLogChannelPath} まで
  // - 記事内容の添削や相談は、気軽に #random/review へ
  // - 詳細は ${url}`;

  traqAPI.setTraQApi(traQBotToken);
  return {
    crowi: {
      host: crowiHost,
      token: crowiToken,
    },
    traqBotToken: traQBotToken,
    botLogChannelId: botLogChannelId,
    validData: false,
  };
}

export async function checkEnvData(): Promise<string[][]> {
  const { crowi, traqBotToken, botLogChannelId } = envData;
  envData.validData = true;
  let envStatus: string[][] = [];
  if (crowi.host === "") {
    envStatus.push(["CROWI_HOST", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["CROWI_HOST", crowi.host]);
  }
  if (crowi.token === "") {
    envStatus.push(["CROWI_ACCESS_TOKEN", "undefined"]);
    envData.validData = false;
  }

  if (traqBotToken === "") {
    envStatus.push(["HUBOT_TRAQ_ACCESS_TOKEN", "undefined"]);
    envData.validData = false;
  }
  if (botLogChannelId === "") {
    envStatus.push(["BOT_LOG_CHANNEL_ID", "undefined"]);
    envData.validData = false;
  } else {
    const logChannelName = await traqAPI.getChannelName(botLogChannelId);
    envStatus.push(["BOT_LOG_CHANNEL_ID", logChannelName]);
  }

  return envStatus;
}

export async function checkScheduleData(scheduleId: number): Promise<string[][]> {
  const { crowi, validData } = envData;
  if (validData === false) {
    console.log(`Invalid environment data`);
    return [["environment", "Invalid"]];
  }
  const schedule: DB.Schedule | null = await DB.getScheduleById(scheduleId);
  if (schedule === null) {
    console.log(`Schedule not found: id=${scheduleId}`);
    return [["Schedule", "not found"]];
  }

  let status = true;
  let scheduleStatus: string[][] = [];
  if (schedule.crowiPath === "") {
    scheduleStatus.push(["CROWI_PAGE_PATH", "undefined"]);
    status = false;
  }
  if (crowi.host !== "" && schedule.crowiPath !== "") {
    scheduleStatus.push(["CROWI_URL", `https://${crowi.host}${schedule.crowiPath}`]);
  }

  if (schedule.channelId === "") {
    scheduleStatus.push(["TRAQ_CHANNEL_ID", "undefined"]);
    status = false;
  } else {
    const channelName = await traqAPI.getChannelName(schedule.channelId);
    if (channelName.includes("Error")) {
      status = false;
    }
    scheduleStatus.push(["TRAQ_CHANNEL_ID", channelName]);
  }
  if (schedule.logChannelId === "") {
    scheduleStatus.push(["TRAQ_LOG_CHANNEL_ID", "undefined"]);
    status = false;
  } else {
    const logChannelName = await traqAPI.getChannelName(schedule.logChannelId);
    if (logChannelName.includes("Error")) {
      status = false;
    }
    scheduleStatus.push(["TRAQ_LOG_CHANNEL_ID", logChannelName]);
  }

  if (schedule.title === "") {
    scheduleStatus.push(["TITLE", "undefined"]);
    status = false;
  } else {
    scheduleStatus.push(["TITLE", schedule.title]);
  }
  if (schedule.tag === "") {
    scheduleStatus.push(["TAG", "undefined"]);
    status = false;
  } else {
    scheduleStatus.push(["TAG", schedule.tag]);
  }
  if (schedule.startDate === undefined) {
    scheduleStatus.push(["START_DATE", "undefined"]);
    status = false;
  } else {
    scheduleStatus.push(["START_DATE", schedule.startDate.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })]);
  }
  if (schedule.blogDays === 0) {
    scheduleStatus.push(["BLOG_DAYS", "undefined"]);
    status = false;
  } else {
    scheduleStatus.push(["BLOG_DAYS", schedule.blogDays.toString()]);
  }
  if (status && schedule.status !== "running") {
    DB.updateBlogScheduleStatus(scheduleId, "checked");
  }else if (!status && schedule.status !== "running") {
    DB.updateBlogScheduleStatus(scheduleId, "unChecked");
  }
  return scheduleStatus;
}
