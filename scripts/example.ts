const hubot = require("hubot");

type stamp = string;

module.exports = (robot: Hubot.Robot<any>): void => {
    robot.hear(/ping/i, (res: Hubot.Response<Hubot.Robot<any>>) => {
        res.send("pong", {
            type: "stamp",
            name: "thumbsup"
        } as any as stamp);
    });
};