"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelName = getChannelName;
const init_1 = require("./init");
const traq_1 = require("@traptitech/traq");
async function getChannelName(channelid) {
    let name = [];
    const traqApi = new traq_1.Apis(new traq_1.Configuration({
        accessToken: init_1.envData.traQ.traqBotToken,
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
