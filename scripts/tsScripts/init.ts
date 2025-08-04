// Description:
//
// Commands:
//

import hubot from "hubot";
import { Apis, Configuration } from "@traptitech/traq";

export type CrowiInfo = {
  host: string;
  pagePath: string;
  token: string;
};

export type BlogRelayInfo = {
  tag: string;
  title: string;
  startDate: string;
  days: number;
};

type traQInfo = {
  channelId: string;
  logChannelId: string;
  logChannelPath: string;
  reviewChannelPath: string;
  traqBotToken: string;
};

export type EnvData = {
  crowi: CrowiInfo;
  traQ: traQInfo;
  blogRelay: BlogRelayInfo;
  noticeMessage: string;
  validData: boolean;
};

export let envData: EnvData = init();


function init(): EnvData {
  const crowiHost =
    process.env.CROWI_HOST === undefined ? "" : process.env.CROWI_HOST;
  const crowiPath =
    process.env.CROWI_PAGE_PATH === undefined
      ? ""
      : process.env.CROWI_PAGE_PATH;
  const crowiToken =
    process.env.CROWI_ACCESS_TOKEN === undefined
      ? ""
      : process.env.CROWI_ACCESS_TOKEN;

  const traQChannelId =
    process.env.TRAQ_CHANNEL_ID === undefined
      ? ""
      : process.env.TRAQ_CHANNEL_ID;
  const traQLogChannelId =
    process.env.TRAQ_LOG_CHANNEL_ID === undefined
      ? ""
      : process.env.TRAQ_LOG_CHANNEL_ID;
  const traQLogChannelPath =
    process.env.TRAQ_LOG_CHANNEL_PATH === undefined
      ? ""
      : process.env.TRAQ_LOG_CHANNEL_PATH;
  const traQReviewChannelPath =
    process.env.TRAQ_REVIEW_CHANNEL_PATH === undefined
      ? ""
      : process.env.TRAQ_REVIEW_CHANNEL_PATH;
  const traQBotToken =
    process.env.HUBOT_TRAQ_ACCESS_TOKEN === undefined
      ? ""
      : process.env.HUBOT_TRAQ_ACCESS_TOKEN;

  const blogRelayTag = process.env.TAG === undefined ? "" : process.env.TAG;
  const blogRelayTitle =
    process.env.TITLE === undefined ? "" : process.env.TITLE;
  const blogRelayStartDate =
    process.env.START_DATE === undefined ? "" : process.env.START_DATE;
  const blogRelayDays =
    process.env.BLOG_DAYS === undefined ? 0 : parseInt(process.env.BLOG_DAYS);

  const url = `https://${crowiHost}${crowiPath}`;
  const noticeMessage = `
## 注意事項
- \`${blogRelayTag}\`のタグをつけてください
- 記事の初めにブログリレー何日目の記事かを明記してください
- 記事の最後に次の日の担当者を紹介してください
- **post imageを設定して**ください
- わからないことがあれば気軽に ${traQLogChannelPath} まで
- 記事内容の添削や相談は、気軽に ${traQReviewChannelPath} へ
- 詳細は ${url}`;
  return {
    crowi: {
      host: crowiHost,
      pagePath: crowiPath,
      token: crowiToken,
    },
    traQ: {
      channelId: traQChannelId,
      logChannelId: traQLogChannelId,
      logChannelPath: traQLogChannelPath,
      reviewChannelPath: traQReviewChannelPath,
      traqBotToken: traQBotToken,
    },
    blogRelay: {
      tag: blogRelayTag,
      title: blogRelayTitle,
      startDate: blogRelayStartDate,
      days: blogRelayDays,
    },
    noticeMessage,
    validData: false,
  };
}

module.exports = (robot: hubot.Robot): void => {
  robot.respond(/changeEnv ([^,]+),([^,]+)$/i, async (res: hubot.Response): Promise<void> => {
    let envName = res.match[1];
    let newValue = res.match[2];


    if (envName === undefined) {
      res.send("環境変数のkeyを指定してください");
      return;
    }

    if (newValue === undefined || newValue === "") {
      res.send("新しい値を指定してください");
      return;
    }
    
    switch (envName) {
      case "TITLE":
        envData.blogRelay.title = newValue;
        break;
      case "TAG":
        envData.blogRelay.tag = newValue;
        break;
      case "START_DATE":
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/.test(newValue)) {
          res.send("START_DATEはYYYY-MM-DDTHH:mm:ss+09:00形式でなければなりません");
          return;
        }
        envData.blogRelay.startDate = newValue;
        break;
      case "BLOG_DAYS":
        const days = parseInt(newValue);
        if (isNaN(days) || days <= 0) {
          res.send("BLOG_DAYSは0より大きな整数でなければなりません");
          return;
        }
        envData.blogRelay.days = days;
        break;
      case "TRAQ_CHANNEL_ID":
        const channelName = await getChannelName(newValue);
        if (channelName.startsWith("Error:")) {
          res.send("IDが無効です" + channelName);
          return;
        }
        envData.traQ.channelId = newValue;
        break;
      case "TRAQ_LOG_CHANNEL_ID":
        const logChannelName = await getChannelName(newValue);
        if (logChannelName.startsWith("Error:")) {
          res.send("IDが無効です" + logChannelName);
          return;
        }
        envData.traQ.logChannelId = newValue;
        break;
      case "TRAQ_LOG_CHANNEL_PATH":
        if (!/^#(\/[a-zA-Z0-9_-]+)$/.test(newValue)) {
          res.send("TRAQ_LOG_CHANNEL_PATHの形式が正しくありません");
          return;
        }
        envData.traQ.logChannelPath = newValue;
        break;
      case "TRAQ_REVIEW_CHANNEL_PATH":
        if (!/^#(\/[a-zA-Z0-9_-]+)$/.test(newValue)) {
          res.send("TRAQ_REVIEW_CHANNEL_PATHの形式が正しくありません");
          return;
        }
        envData.traQ.reviewChannelPath = newValue;
        break;
      case "CROWI_PAGE_PATH":
        if (!/^\/[^\/]+$/.test(newValue)) {
          res.send("CROWI_PAGE_PATHの形式が正しくありません");
          return;
        }
        envData.crowi.pagePath = newValue;
        break;
      default:
        res.send(`${envName} は無効なkeyです`);
        return;
    }
    envData.validData = false;
    res.send(`${envName} を変更しました`);
  });
};

export async function checkEnvData(): Promise<string[][]> {
  const { crowi, traQ, blogRelay } = envData;
  envData.validData = true;
  let envStatus: string[][] = [];
  if (crowi.host === "") {
    envStatus.push(["CROWI_HOST", "undefined"]);
    envData.validData = false;
  }
  if (crowi.pagePath === "") {
    envStatus.push(["CROWI_PAGE_PATH", "undefined"]);
    envData.validData = false;
  }
  if (crowi.host !== "" && crowi.pagePath !== "") {
    envStatus.push(["CROWI_URL", `https://${crowi.host}${crowi.pagePath}`]);
  }
  if (crowi.token === "") {
    envStatus.push(["CROWI_ACCESS_TOKEN", "undefined"]);
    envData.validData = false;
  }

  if (traQ.traqBotToken === "") {
    envStatus.push(["HUBOT_TRAQ_ACCESS_TOKEN", "undefined"]);
    envData.validData = false;
  }
  if (traQ.channelId === "") {
    envStatus.push(["TRAQ_CHANNEL_ID", "undefined"]);
    envData.validData = false;
  } else {
    const channelName = await getChannelName(traQ.channelId);
    envStatus.push(["TRAQ_CHANNEL_ID", channelName]);
  }
  if (traQ.logChannelId === "") {
    envStatus.push(["TRAQ_LOG_CHANNEL_ID", "undefined"]);
    envData.validData = false;
  } else {
    const logChannelName = await getChannelName(traQ.logChannelId);
    envStatus.push(["TRAQ_LOG_CHANNEL_ID", logChannelName]);
  }
  if (traQ.logChannelPath === "") {
    envStatus.push(["TRAQ_LOG_CHANNEL_PATH", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["TRAQ_LOG_CHANNEL_PATH", traQ.logChannelPath]);
  }
  if (traQ.reviewChannelPath === "") {
    envStatus.push(["TRAQ_REVIEW_CHANNEL_PATH", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["TRAQ_REVIEW_CHANNEL_PATH", traQ.reviewChannelPath]);
  }

  if (blogRelay.title === "") {
    envStatus.push(["TITLE", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["TITLE", blogRelay.title]);
  }
  if (blogRelay.tag === "") {
    envStatus.push(["TAG", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["TAG", blogRelay.tag]);
  }
  if (blogRelay.startDate === "") {
    envStatus.push(["START_DATE", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["START_DATE", blogRelay.startDate]);
  }
  if (blogRelay.days === 0) {
    envStatus.push(["BLOG_DAYS", "undefined"]);
    envData.validData = false;
  } else {
    envStatus.push(["BLOG_DAYS", blogRelay.days.toString()]);
  }
  return envStatus;
}

export async function getChannelName(channelid: string): Promise<string> {
  let name: string[] = [];
  const traqApi = new Apis(
    new Configuration({
      accessToken: envData.traQ.traqBotToken,
    })
  );
  try {
    for (let i = 0; i < 5; i++) {
      const response = await traqApi.getChannel(channelid);
      name.unshift(response.data.name);
      if (response.statusText !== "OK") {
        return response.statusText;
      }
      if (response.data.parentId === null) {
        break;
      } else {
        channelid = response.data.parentId;
      }
    }
    return `#${name.join("/")}`;
  } catch (error) {
    console.error(error);
    return `Error: ${error}`;
  }
}
