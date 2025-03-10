// Type definitions for hubot
// Definitions by: Hueter

type SendChannel = {
  channelID: string;
};

type SendDM = {
  userlID: string;
};

declare module "hubot" {
  export interface Robot {
    listen(
      regex: RegExp,
      options: { [key: string]: any } | Function,
      callback?: (res: Response) => void
    ): void;
    hear(
      regex: RegExp,
      options: { [key: string]: any } | Function,
      callback?: (res: Response) => void
    ): void;
    respond(
      regex: RegExp,
      options: { [key: string]: any } | Function,
      callback?: (res: Response) => void
    ): void;
    send(
      sendChannel: SendChannel | SendDM,
      user: string,
      ...string: string[]
    ): void;
    reply(user: string, ...string: string[]): void;
  }

  export interface Response {
    match: [string, string, { index: number }, { input: string }];

    message: {
      id: string;
      user: {
        id: string;
        name: string;
        displayName: string;
        iconID: string;
        bot: boolean;
      };
      room: {
        type: string;
        id: string;
      };
      text: string;
      plainText: string;
      embedded: [
        {
          raw: string;
          type: string;
          id: string;
        }
      ];
      createdAt: Date;
      updatedAt: Date;
    };

    send(...strings: string[]): void;
    emote(...strings: string[]): void;
    reply(...strings: string[]): void;
    topic(...strings: string[]): void;
    play(...strings: string[]): void;
    locked(...strings: string[]): void;
    random(items: any[]): any;
    finish(): void;
  }
}
