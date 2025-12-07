// Description:
//
// Commands:
//


import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { CrowiInfo } from "./init";

type CrowiGetPageResponse = {
  page: {
    revision: {
      body: string;
    };
  };
  ok: boolean;
};

export async function getCrowiPageBody({
  host,
  pagePath,
  token,
}: CrowiInfo): Promise<string> {
  const encodedPath = encodeURI(pagePath);
  const options: AxiosRequestConfig = {
    url: `https://${host}/_api/pages.get?access_token=${token}&path=${encodedPath}`,
    method: "GET",
  };
  var body: string = "";
  await axios(options)
    .then((res: AxiosResponse<CrowiGetPageResponse>) => {
      const { data, status } = res;
      console.log("axios status:" + status);
      if (data.ok) {
        console.log("data.ok is true");
        body = data.page.revision.body as string;
      } else {
        console.log("data.ok is false");
      }
    })
    .catch((e: AxiosError<{ error: string }>) => {
      console.log(e.message);
    });
  return body;
}