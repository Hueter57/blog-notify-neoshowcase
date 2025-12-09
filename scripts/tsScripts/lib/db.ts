import 'dotenv/config'
import { prisma } from './prisma';
import { schedule } from 'node-cron';


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

export type CreateScheduleData = {
  crowiPath: string;
  channelId: string;
  logChannelId: string;
  reviewChannelId: string;
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