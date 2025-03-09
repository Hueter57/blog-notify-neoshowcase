"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.envData = void 0;
exports.envData = init();
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
    const traQLogChannelPath = process.env.TRAQ_BURI_CHANNEL_PATH === undefined
        ? ""
        : process.env.TRAQ_BURI_CHANNEL_PATH;
    const traQReviewChannelPath = process.env.TRAQ_REVIEW_CHANNEL_PATH === undefined
        ? ""
        : process.env.TRAQ_REVIEW_CHANNEL_PATH;
    const traQBotToken = process.env.TRAQ_BOT_ACCESS_TOKEN === undefined
        ? ""
        : process.env.TRAQ_BOT_ACCESS_TOKEN;
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
