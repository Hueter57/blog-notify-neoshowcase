"use strict";
// Description:
//
// Commands:
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
exports.getMainMessage = getMainMessage;
exports.getLogMessage = getLogMessage;
exports.calcDateDiff = calcDateDiff;
const cron_1 = require("./cron");
const crowi_1 = require("./crowi");
const WRITER_REGEXP = /@[a-zA-Z0-9_-]+/g;
async function getMessages(crowi, blogRelay, noticeMessage) {
    const pageBody = await (0, crowi_1.getCrowiPageBody)(crowi);
    if (pageBody === "") {
        return [];
    }
    const schedules = extractSchedule(pageBody);
    const dateDiff = calcDateDiff(blogRelay);
    const messageHead = dateDiff < 0
        ? getBeforeMessage(blogRelay.title, -dateDiff)
        : getDuringMessage(blogRelay.title, dateDiff, schedules);
    const logMessage = schedulesToCalendar(blogRelay, schedules);
    return [messageHead + noticeMessage, logMessage];
}
async function getMainMessage(crowi, blogRelay, noticeMessage) {
    const pageBody = await (0, crowi_1.getCrowiPageBody)(crowi);
    if (pageBody === "") {
        return "";
    }
    const schedules = extractSchedule(pageBody);
    const dateDiff = calcDateDiff(blogRelay);
    const messageHead = dateDiff < 0
        ? getBeforeMessage(blogRelay.title, -dateDiff)
        : getDuringMessage(blogRelay.title, dateDiff, schedules);
    return messageHead + noticeMessage;
}
async function getLogMessage(crowi, blogRelay) {
    const pageBody = await (0, crowi_1.getCrowiPageBody)(crowi);
    if (pageBody === "") {
        return "";
    }
    const schedules = extractSchedule(pageBody);
    return schedulesToCalendar(blogRelay, schedules);
}
function extractScheduleStr(pageBody) {
    const lines = pageBody.split(/\r\n|\r|\n/);
    const startIndex = lines.findIndex((l) => /^\|\s*日付.*/.test(l));
    let table = "";
    for (let i = startIndex; i < lines.length; ++i) {
        const l = lines[i];
        if (/^\s*\|.*/.test(l)) {
            table += l + "\n";
        }
        else {
            break;
        }
    }
    return table;
}
function extractSchedule(pageBody) {
    const tableStr = extractScheduleStr(pageBody);
    const lines = tableStr
        .split("\n")
        .filter((l) => l.startsWith("|"));
    const table = [];
    for (let i = 2; i < lines.length; ++i) {
        // | 日付 | 日目 | 担当者 | タイトル(内容) |
        const cells = lines[i]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
        const s = {
            date: cells[0],
            day: parseInt(cells[1]),
            writer: cells[2],
            summary: cells[3],
        };
        if (s.writer.length === 0) {
            continue;
        }
        if (s.date === "同上") {
            s.date = table[table.length - 1].date;
        }
        table.push(s);
    }
    return table;
}
// START_DATEとの差分を取得する
// now - date
function calcDateDiff({ startDate }) {
    const date = (0, cron_1.JapaneseDate)(startDate);
    const dateUtcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
    const today = (0, cron_1.JapaneseDate)();
    const nowUtcTime = today.getTime() + today.getTimezoneOffset() * 60 * 1000;
    const diff = nowUtcTime - dateUtcTime;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
// ブログリレー期間前のメッセージを取得する関数
// diff > 0
function getBeforeMessage(title, diff) {
    return `# ${title}まであと ${diff}日`;
}
// ブログリレー期間中のメッセージを取得する関数
// diff >= 0
function getDuringMessage(title, diff, schedules) {
    const d = diff + 1;
    const ss = schedules.filter((s) => d <= s.day && s.day <= d + 1);
    if (ss.length > 0) {
        return `# ${title} ${d}日目\n${schedulesToTable(ss)}`;
    }
    return `# ${title} ${d}日目\n担当者はいません`;
}
function schedulesToTable(schedules) {
    return `\
| 日付 | 日目 | 担当者 | タイトル(内容) |
| :-: | :-: | :-: | :-- |
${schedules.map(scheduleToString).join("\n")}`;
}
function scheduleToString(s) {
    const writers = Array.from(s.writer.matchAll(WRITER_REGEXP))
        .map((match) => match[0])
        .join(", ");
    return `| ${s.date} | ${s.day} | ${writers} | ${s.summary} |`;
}
// scheduleからカレンダーを生成する(log用)
function schedulesToCalendar(blogRelayInfo, schedules) {
    const weeks = [];
    let i = 0;
    const scheduleLength = schedules.length;
    const startDate = (0, cron_1.JapaneseDate)(blogRelayInfo.startDate);
    const calendarStartDate = dateOffset(startDate, -startDate.getDay());
    while (i < scheduleLength) {
        const week = [];
        const weekStartDate = dateOffset(calendarStartDate, weeks.length * 7);
        for (let weekDay = 0; weekDay < 7; weekDay++) {
            const day = [];
            const date = dateOffset(weekStartDate, weekDay);
            while (i < scheduleLength &&
                actualDateOfSchedule(blogRelayInfo, schedules[i]).getDay() === weekDay) {
                day.push(schedules[i]);
                i++;
            }
            week.push([date, day]);
        }
        weeks.push(week);
    }
    const calendarBody = weeks
        .map((week) => week
        .map((dayInfo) => {
        const date = dayInfo[0];
        const day = dayInfo[1];
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        const dayStr = day
            .map((schedule) => scheduleToStringInCalendar(schedule))
            .join(" ");
        return `**${dateStr}**${dayStr}`;
    })
        .join(" | "))
        .join("\n");
    return `\
:day0_sunday: | :day1_monday: | :day2_tuesday: | :day3_wednesday: | :day4_thursday: | :day5_friday: | :day6_saturday:
--- | --- | --- | --- | --- | --- | ---
${calendarBody}`;
}
function dateOffset(date, offset) {
    const dateMs = date.getTime();
    const offsetMs = offset * 24 * 60 * 60 * 1000;
    return new Date(dateMs + offsetMs);
}
function actualDateOfSchedule({ startDate }, schedule) {
    // UNIXタイムスタンプ
    const startDateParsed = (0, cron_1.JapaneseDate)(startDate);
    // 経過日数のms
    const offset = schedule.day - 1;
    return dateOffset(startDateParsed, offset);
}
function scheduleToStringInCalendar(schedule) {
    const writerIcons = Array.from(schedule.writer.matchAll(WRITER_REGEXP))
        .map((match) => `:${match[0]}:`)
        .join("");
    return writerIcons;
}
