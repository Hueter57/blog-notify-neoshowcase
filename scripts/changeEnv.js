"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
module.exports = (robot) => {
    robot.respond(/changeEnv ([^,]+),([^,]+)$/i, async (res) => {
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
        let message = `${envName} を`;
        switch (envName) {
            case "TITLE":
                init_1.envData.blogRelay.title = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            case "TAG":
                init_1.envData.blogRelay.tag = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            case "START_DATE":
                if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}$/.test(newValue)) {
                    res.send("START_DATEはYYYY-MM-DDTHH:mm:ss+09:00形式でなければなりません");
                    return;
                }
                init_1.envData.blogRelay.startDate = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            case "BLOG_DAYS":
                const days = parseInt(newValue);
                if (isNaN(days) || days <= 0) {
                    res.send("BLOG_DAYSは0より大きな整数でなければなりません");
                    return;
                }
                init_1.envData.blogRelay.days = days;
                message += `「${newValue}」に変更しました`;
                break;
            case "TRAQ_CHANNEL_ID":
                const channelName = await (0, init_1.getChannelName)(newValue);
                if (channelName.startsWith("Error:")) {
                    res.send("IDが無効です" + channelName);
                    return;
                }
                init_1.envData.traQ.channelId = newValue;
                message += `「${newValue}(${channelName})」に変更しました`;
                break;
            case "TRAQ_LOG_CHANNEL_ID":
                const logChannelName = await (0, init_1.getChannelName)(newValue);
                if (logChannelName.startsWith("Error:")) {
                    res.send("IDが無効です" + logChannelName);
                    return;
                }
                init_1.envData.traQ.logChannelId = newValue;
                message += `「${newValue}(${logChannelName})」に変更しました`;
                break;
            case "TRAQ_LOG_CHANNEL_PATH":
                if (!/^#(\/[a-zA-Z0-9_-]+)$/.test(newValue)) {
                    res.send("TRAQ_LOG_CHANNEL_PATHの形式が正しくありません");
                    return;
                }
                init_1.envData.traQ.logChannelPath = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            case "TRAQ_REVIEW_CHANNEL_PATH":
                if (!/^#(\/[a-zA-Z0-9_-]+)$/.test(newValue)) {
                    res.send("TRAQ_REVIEW_CHANNEL_PATHの形式が正しくありません");
                    return;
                }
                init_1.envData.traQ.reviewChannelPath = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            case "CROWI_PAGE_PATH":
                if (!/^(\/[^\/]+)+$/.test(newValue)) {
                    res.send("CROWI_PAGE_PATHの形式が正しくありません");
                    return;
                }
                init_1.envData.crowi.pagePath = newValue;
                message += `「${newValue}」に変更しました`;
                break;
            default:
                res.send(`${envName} は無効なkeyです`);
                return;
        }
        init_1.envData.validData = false;
        console.log(message);
        res.send(message);
        robot.send({ userID: "236fe853-f208-477b-9f1f-0f42fe614d3b" }, `環境変数が変更されました: ${envName} = ${newValue}`);
    });
};
