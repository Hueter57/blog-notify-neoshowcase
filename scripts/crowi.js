"use strict";
// Description:
//
// Commands:
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrowiPageBody = getCrowiPageBody;
const axios_1 = __importDefault(require("axios"));
async function getCrowiPageBody({ host, pagePath, token, }) {
    const encodedPath = encodeURI(pagePath);
    const options = {
        url: `https://${host}/_api/pages.get?access_token=${token}&path=${encodedPath}`,
        method: "GET",
    };
    var body = "";
    await (0, axios_1.default)(options)
        .then((res) => {
        const { data, status } = res;
        console.log("axios status:" + status);
        if (data.ok) {
            console.log("data.ok is true");
            body = data.page.revision.body;
        }
        else {
            console.log("data.ok is false");
        }
    })
        .catch((e) => {
        console.log(e.message);
    });
    return body;
}
