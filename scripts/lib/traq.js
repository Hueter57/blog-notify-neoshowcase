"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTraQApi = setTraQApi;
exports.getChannelName = getChannelName;
exports.getUserName = getUserName;
const traq_1 = require("@traptitech/traq");
let traqApi;
function setTraQApi(traqBotToken) {
    traqApi = new traq_1.Apis(new traq_1.Configuration({
        accessToken: traqBotToken,
    }));
}
async function getChannelName(channelid) {
    let name = [];
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
async function getUserName(userid) {
    try {
        const response = await traqApi.getUser(userid);
        if (response.statusText !== "OK") {
            console.log("getUserName error: " + response.statusText);
            return response.statusText;
        }
        return response.data.name;
    }
    catch (error) {
        console.error("getUserName error: " + error);
        return `Error: ${error}`;
    }
}
