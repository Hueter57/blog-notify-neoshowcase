import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type ScheduleOverview = {
  id: number;
  title: string;
};

export type CreateScheduleData = {
  crowiPath: string;
  channelId: string;
  logChannelId: string;
  reviewChannelId: string;
  title: string;
  Tag: string;
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

export async function CreateBlogSchedule(sData: CreateScheduleData) {
  const schedule = await prisma.schedule.create({
    data: {
      status: 'unChecked',
      crowiPath: sData.crowiPath,
      channelId: sData.channelId,
      logChannelId: sData.logChannelId,
      reviewChannelId: sData.reviewChannelId,
      title: sData.title,
      Tag: sData.Tag,
      startDate: sData.startDate,
      blogDays: sData.blogDays,
    },
  });
}



// admin

export async function getAdminList(): Promise<Admin[]> {
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      userid: true,
    },
  });
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