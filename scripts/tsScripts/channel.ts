// Description:
//
// Commands:
//

import { envData } from "./init";
import { Apis, Configuration } from "@traptitech/traq";

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
