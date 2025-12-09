// Description:
//
// Commands:
//

import { Apis, Configuration } from "@traptitech/traq";
import { envData } from "./init";
import { error } from "console";

const traqApi = new Apis(
  new Configuration({
    accessToken: envData.traQ.traqBotToken,
  })
);

export async function getChannelName(channelid: string): Promise<string> {
  let name: string[] = [];
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

export async function getUserName(userid: string): Promise<string> {
  try {
    const response = await traqApi.getUser(userid);
    if (response.statusText !== "OK") {
      return response.statusText;
    }
    return response.data.name;
  } catch (error) {
    console.error(error);
    return `Error: ${error}`;
  }
}
