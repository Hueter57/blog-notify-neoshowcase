import 'dotenv/config'
import { prisma } from './prisma';


export type ScheduleOverview = {
  id: number;
  title: string;
};

export type Schedule = {
  id: number;
  status: string;
  crowiPath: string;
  channelId: string;
  logChannelId: string;
  title: string;
  tag: string;
  startDate: Date;
  blogDays: number;
};

export type ScheduleStatus = {
  id: number;
  status: string;
};

export type CreateScheduleData = {
  crowiPath: string;
  channelId: string;
  logChannelId: string;
  title: string;
  tag: string;
  startDate: Date;
  blogDays: number;
};

export type Admin = {
  id: number;
  userid: string;
};


// schedule

export async function getScheduleList(): Promise<ScheduleOverview[]> {
  const schedules: ScheduleOverview[] = await prisma.schedule.findMany({
    select: {
      id: true,
      title: true,
    },
  });
  return schedules
}

export async function getScheduleById(scheduleId: number): Promise<Schedule | null> {
  const schedule: Schedule | null = await prisma.schedule.findUnique({
    where: {
      id: scheduleId,
    },
  });
  return schedule;
}

export async function getScheduleStatus(): Promise<ScheduleStatus | null> {
  const scheduleStatus: ScheduleStatus | null = await prisma.schedule.findFirst({
    select: {
      id: true,
      status: true,
    },
    where: {
      status: 'running',
    },
  });
  return scheduleStatus;
}

export async function CreateBlogSchedule(sData: CreateScheduleData): Promise<Schedule> {
  const schedule: Schedule = await prisma.schedule.create({
    data: {
      status: 'unChecked',
      crowiPath: sData.crowiPath,
      channelId: sData.channelId,
      logChannelId: sData.logChannelId,
      title: sData.title,
      tag: sData.tag,
      startDate: sData.startDate,
      blogDays: sData.blogDays,
    },
  });
  console.log(schedule);
  return schedule;
}

export async function updateBlogScheduleStatus(scheduleId: number, status: string): Promise<Schedule> {
  const schedule: Schedule = await prisma.schedule.update({
    where: {
      id: scheduleId,
    },
    data: {
      status: status,
    },
  });
  console.log(schedule);
  return schedule;
}

export async function updateBlogScheduleStatusStop(): Promise<number> {
  const result = await prisma.schedule.updateMany({
    where: {
      status: 'running',
    },
    data: {
      status: 'checked',
    },
  });
  console.log(result);
  return result.count;
}

// admin

export async function getAdminList(): Promise<Admin[]> {
  const admins: Admin[] = await prisma.admin.findMany({
    select: {
      id: true,
      userid: true,
    },
  });
  console.log(`get ${admins.length} admins.`);
  return admins
}

export async function createAdmin(userid: string): Promise<Admin> {
  const admin: Admin = await prisma.admin.create({
    data: {
      userid: userid,
    },
  });
  console.log(admin);
  return admin;
}