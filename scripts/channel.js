"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelName = getChannelName;
const init_1 = require("./init");
async function getChannelName(channelid) {
    let name = [];
    try {
        for (let i = 0; i < 5; i++) {
            const response = await init_1.traqApi.getChannel(channelid);
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
