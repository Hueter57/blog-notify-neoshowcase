-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `crowiPath` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `logChannelId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `blogDays` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_userid_key`(`userid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
