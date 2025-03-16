// Description:
//
// Commands:
//

import { traqApi } from "./init";

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
