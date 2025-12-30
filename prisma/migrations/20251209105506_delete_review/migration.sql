/*
  Warnings:

  - You are about to drop the column `Tag` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `reviewChannelId` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `tag` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `Tag`,
    DROP COLUMN `reviewChannelId`,
    ADD COLUMN `tag` VARCHAR(191) NOT NULL;
