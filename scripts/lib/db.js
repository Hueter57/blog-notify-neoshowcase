"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduleList = getScheduleList;
exports.getScheduleById = getScheduleById;
exports.CreateBlogSchedule = CreateBlogSchedule;
exports.getAdminList = getAdminList;
exports.createAdmin = createAdmin;
require("dotenv/config");
const prisma_1 = require("./prisma");
// schedule
async function getScheduleList() {
    const schedules = await prisma_1.prisma.schedule.findMany({
        select: {
            id: true,
            title: true,
        },
    });
    return schedules;
}
async function getScheduleById(scheduleId) {
    const schedule = await prisma_1.prisma.schedule.findUnique({
        where: {
            id: scheduleId,
        },
    });
    return schedule;
}
async function CreateBlogSchedule(sData) {
    const schedule = await prisma_1.prisma.schedule.create({
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
async function getAdminList() {
    const admins = await prisma_1.prisma.admin.findMany({
        select: {
            id: true,
            userid: true,
        },
    });
    console.log(`get ${admins.length} admins.`);
    return admins;
}
async function createAdmin(userid) {
    const admin = await prisma_1.prisma.admin.create({
        data: {
            userid: userid,
        },
    });
    console.log(admin);
    return admin;
}
