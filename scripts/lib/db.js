"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScheduleList = getScheduleList;
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
async function CreateBlogSchedule(sData) {
    const schedule = await prisma_1.prisma.schedule.create({
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
async function getAdminList() {
    const admins = await prisma_1.prisma.admin.findMany({
        select: {
            id: true,
            userid: true,
        },
    });
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
