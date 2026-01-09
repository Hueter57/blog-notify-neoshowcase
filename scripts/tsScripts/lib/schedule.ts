// Description:
//
// Commands:
//

import { CrowiInfo, envData } from "./init";
import { JapaneseDate } from "../cron";
import { getCrowiPageBody } from "./crowi";
import * as DB from "./db";
import * as traqAPI from "./traq";

const WRITER_REGEXP = /@[a-zA-Z0-9_-]+/g;

export async function getMessages(
  crowi: CrowiInfo,
  schedule: DB.Schedule
): Promise<string[]> {
  const pageBody = await getCrowiPageBody(crowi, schedule.crowiPath);
  if (pageBody === "") {
    console.log("pageBody is empty");
    return [];
  }

  const schedules = extractSchedule(pageBody);
  const dateDiff = calcDateDiff(schedule.startDate);
  const messageHead =
    dateDiff < 0
      ? getBeforeMessage(schedule.title, -dateDiff)
      : getDuringMessage(schedule.title, dateDiff, schedules);
  const logMessage = schedulesToCalendar(schedule, schedules);
  const url = `https://${crowi.host}${schedule.crowiPath}`;
  const logChannelName = await traqAPI.getChannelName(schedule.logChannelId);
  const noticeMessage = `
  ## 注意事項
  - \`${schedule.tag}\`のタグをつけてください
  - 記事の初めにブログリレー何日目の記事かを明記してください
  - 記事の最後に次の日の担当者を紹介してください
  - **post imageを設定して**ください
  - わからないことがあれば気軽に ${logChannelName} まで
  - 記事内容の添削や相談は、気軽に #random/review へ
  - 詳細は ${url}`;
  return [messageHead + noticeMessage, logMessage];
}


export async function getLogMessage(
  crowi: CrowiInfo,
  schedule: DB.Schedule
): Promise<string> {
  const pageBody = await getCrowiPageBody(crowi, schedule.crowiPath);
  if (pageBody === "") {
    return "";
  }
  const schedules = extractSchedule(pageBody);
  return schedulesToCalendar(schedule, schedules);
}

type Schedule = {
  date: string;
  day: number;
  writer: string;
  summary: string;
};

function extractScheduleStr(pageBody: string): string {
  const lines = pageBody.split(/\r\n|\r|\n/);
  const startIndex = lines.findIndex((l: string): boolean =>
    /^\|\s*日付.*/.test(l)
  );
  let table = "";
  for (let i = startIndex; i < lines.length; ++i) {
    const l = lines[i];
    if (/^\s*\|.*/.test(l)) {
      table += l + "\n";
    } else {
      break;
    }
  }
  console.log("success extract schedule String");
  return table;
}

function extractSchedule(pageBody: string): Schedule[] {
  const tableStr = extractScheduleStr(pageBody);
  const lines = tableStr
    .split("\n")
    .filter((l: string): boolean => l.startsWith("|"));
  const table: Schedule[] = [];
  for (let i = 2; i < lines.length; ++i) {
    // | 日付 | 日目 | 担当者 | タイトル(内容) |
    const cells = lines[i]
      .split("|")
      .slice(1, -1)
      .map((c: string): string => c.trim());

    const s: Schedule = {
      date: cells[0] === "同上"
        ? table[table.length - 1].date
        : cells[0],
      day: cells[1] === "同上"
        ? table[table.length - 1].day
        : parseInt(cells[1].match(/[0-9]+/)![0]),
      writer: cells[2],
      summary: cells[3],
    };
    if (s.writer.length === 0) {
      continue;
    }
    table.push(s);
  }
  console.log("success extract schedule");
  return table;
}

// START_DATEとの差分を取得する
// now - date
export function calcDateDiff(startDate: Date): number {
  const dateUtcTime = startDate.getTime();
  const nowUtcTime = new Date().getTime();
  const diff = nowUtcTime - dateUtcTime;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ブログリレー期間前のメッセージを取得する関数
// diff > 0
function getBeforeMessage(title: string, diff: number): string {
  return `# ${title}まであと ${diff}日`;
}

// ブログリレー期間中のメッセージを取得する関数
// diff >= 0
function getDuringMessage(
  title: string,
  diff: number,
  schedules: Schedule[]
): string {
  const d = diff + 1;
  const ss = schedules.filter(
    (s: Schedule): boolean => d <= s.day && s.day <= d + 1
  );
  if (ss.length > 0) {
    return `# ${title} ${d}日目\n${schedulesToTable(ss)}`;
  }
  return `# ${title} ${d}日目\n担当者はいません`;
}

function schedulesToTable(schedules: Schedule[]): string {
  return `\
| 日付 | 日目 | 担当者 | タイトル(内容) |
| :-: | :-: | :-: | :-- |
${schedules.map(scheduleToString).join("\n")}`;
}

function scheduleToString(s: Schedule): string {
  const writers = Array.from(s.writer.matchAll(WRITER_REGEXP))
    .map((match) => match[0])
    .join(", ");
  return `| ${s.date} | ${s.day} | ${writers} | ${s.summary} |`;
}

// scheduleからカレンダーを生成する(log用)
function schedulesToCalendar(
  blogSchedule: DB.Schedule,
  schedules: Schedule[]
): string {
  const weeks: Array<Array<[Date, Schedule[]]>> = [];
  let i = 0;
  const scheduleLength = schedules.length;
  const calendarStartDate = dateOffset(blogSchedule.startDate, -blogSchedule.startDate.getDay());
  while (i < scheduleLength) {
    const week: Array<[Date, Schedule[]]> = [];
    const weekStartDate = dateOffset(calendarStartDate, weeks.length * 7);
    for (let weekDay = 0; weekDay < 7; weekDay++) {
      const day: Schedule[] = [];
      const date = dateOffset(weekStartDate, weekDay);
      while (
        i < scheduleLength &&
        actualDateOfSchedule(blogSchedule.startDate, schedules[i]).getDay() === weekDay
      ) {
        day.push(schedules[i]);
        i++;
      }
      week.push([date, day]);
    }
    weeks.push(week);
  }
  const calendarBody = weeks
    .map((week) =>
      week
        .map((dayInfo) => {
          const date = dayInfo[0];
          const day = dayInfo[1];
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
          const dayStr = day
            .map((schedule) => scheduleToStringInCalendar(schedule))
            .join(" ");
          return `**${dateStr}**${dayStr}`;
        })
        .join(" | ")
    )
    .join("\n");
  return `\
:day0_sunday: | :day1_monday: | :day2_tuesday: | :day3_wednesday: | :day4_thursday: | :day5_friday: | :day6_saturday:
--- | --- | --- | --- | --- | --- | ---
${calendarBody}`;
}

export function dateOffset(date: Date, offset: number): Date {
  const dateMs = date.getTime();
  const offsetMs = offset * 24 * 60 * 60 * 1000;
  return new Date(dateMs + offsetMs);
}

function actualDateOfSchedule(
  startDate: Date,
  schedule: Schedule
): Date {
  // 経過日数のms
  const offset = schedule.day - 1;
  return dateOffset(startDate, offset);
}

function scheduleToStringInCalendar(schedule: Schedule): string {
  const writerIcons = Array.from(schedule.writer.matchAll(WRITER_REGEXP))
    .map((match) => `:${match[0]}:`)
    .join("");
  return writerIcons;
}