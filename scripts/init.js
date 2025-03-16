"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.envData = void 0;
exports.getChannelName = getChannelName;
exports.envData = init();
console.log(exports.envData);
const traq_1 = require("@traptitech/traq");
checkEnvData();
module.exports = (robot) => {
    robot.hear(/checkEnvData$/i, async (res) => {
        const envStatusList = await checkEnvData();
        const envStatusMessage = envStatusList
            .map((envStatus) => envStatus.join(" | "))
            .join("\n");
        const message = `env name | status
--- | ---
${envStatusMessage}`;
        console.log(message);
        res.send(message);
    });
};
function init() {
    const crowiHost = process.env.CROWI_HOST === undefined ? "" : process.env.CROWI_HOST;
    const crowiPath = process.env.CROWI_PAGE_PATH === undefined
        ? ""
        : process.env.CROWI_PAGE_PATH;
    const crowiToken = process.env.CROWI_ACCESS_TOKEN === undefined
        ? ""
        : process.env.CROWI_ACCESS_TOKEN;
    const traQChannelId = process.env.TRAQ_CHANNEL_ID === undefined
        ? ""
        : process.env.TRAQ_CHANNEL_ID;
    const traQLogChannelId = process.env.TRAQ_LOG_CHANNEL_ID === undefined
        ? ""
        : process.env.TRAQ_LOG_CHANNEL_ID;
    const traQLogChannelPath = process.env.TRAQ_LOG_CHANNEL_PATH === undefined
        ? ""
        : process.env.TRAQ_LOG_CHANNEL_PATH;
    const traQReviewChannelPath = process.env.TRAQ_REVIEW_CHANNEL_PATH === undefined
        ? ""
        : process.env.TRAQ_REVIEW_CHANNEL_PATH;
    const traQBotToken = process.env.HUBOT_TRAQ_ACCESS_TOKEN === undefined
        ? ""
        : process.env.HUBOT_TRAQ_ACCESS_TOKEN;
    const blogRelayTag = process.env.TAG === undefined ? "" : process.env.TAG;
    const blogRelayTitle = process.env.TITLE === undefined ? "" : process.env.TITLE;
    const blogRelayStartDate = process.env.START_DATE === undefined ? "" : process.env.START_DATE;
    const blogRelayDays = process.env.BLOG_DAYS === undefined ? 0 : parseInt(process.env.BLOG_DAYS);
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
        validData: true,
    };
}
async function checkEnvData() {
    const { crowi, traQ, blogRelay } = exports.envData;
    exports.envData.validData = true;
    let envStatus = [];
    if (crowi.host === "") {
        envStatus.push(["CROWI_HOST", "undefined"]);
        exports.envData.validData = false;
    }
    if (crowi.pagePath === "") {
        envStatus.push(["CROWI_PAGE_PATH", "undefined"]);
        exports.envData.validData = false;
    }
    if (crowi.host !== "" && crowi.pagePath !== "") {
        envStatus.push(["CROWI_URL", `https://${crowi.host}${crowi.pagePath}`]);
    }
    if (crowi.token === "") {
        envStatus.push(["CROWI_ACCESS_TOKEN", "undefined"]);
        exports.envData.validData = false;
    }
    if (traQ.traqBotToken === "") {
        envStatus.push(["HUBOT_TRAQ_ACCESS_TOKEN", "undefined"]);
        exports.envData.validData = false;
    }
    if (traQ.channelId === "") {
        envStatus.push(["TRAQ_CHANNEL_ID", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        const channelName = await getChannelName(traQ.channelId);
        envStatus.push(["TRAQ_CHANNEL_ID", channelName]);
    }
    if (traQ.logChannelId === "") {
        envStatus.push(["TRAQ_LOG_CHANNEL_ID", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        const logChannelName = await getChannelName(traQ.logChannelId);
        envStatus.push(["TRAQ_LOG_CHANNEL_ID", logChannelName]);
    }
    if (traQ.logChannelPath === "") {
        envStatus.push(["TRAQ_LOG_CHANNEL_PATH", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["TRAQ_LOG_CHANNEL_PATH", traQ.logChannelPath]);
    }
    if (traQ.reviewChannelPath === "") {
        envStatus.push(["TRAQ_REVIEW_CHANNEL_PATH", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["TRAQ_REVIEW_CHANNEL_PATH", traQ.reviewChannelPath]);
    }
    if (blogRelay.title === "") {
        envStatus.push(["TITLE", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["TITLE", blogRelay.title]);
    }
    if (blogRelay.tag === "") {
        envStatus.push(["TAG", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["TAG", blogRelay.tag]);
    }
    if (blogRelay.startDate === "") {
        envStatus.push(["START_DATE", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["START_DATE", blogRelay.startDate]);
    }
    if (blogRelay.days === 0) {
        envStatus.push(["BLOG_DAYS", "undefined"]);
        exports.envData.validData = false;
    }
    else {
        envStatus.push(["BLOG_DAYS", blogRelay.days.toString()]);
    }
    return envStatus;
}
async function getChannelName(channelid) {
    let name = [];
    const traqApi = new traq_1.Apis(new traq_1.Configuration({
        accessToken: exports.envData.traQ.traqBotToken,
    }));
    try {
        for (let i = 0; i < 5; i++) {
            const response = await traqApi.getChannel(channelid);
            name.unshift(response.data.name);
            if (response.statusText !== "OK") {
                return response.statusText;
            }
            if (response.data.parentId === null) {
                break;
            }
            else {
                channelid = response.data.parentId;
            }
        }
        return `#${name.join("/")}`;
    }
    catch (error) {
        console.error(error);
        return `Error: ${error}`;
    }
}
