/*
  Warnings:

  - Made the column `messageId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `author` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serverId` on table `Server` required. This step will fail if there are existing NULL values in that column.
  - Made the column `channelId` on table `Server` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serverName` on table `Server` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `messageId` VARCHAR(191) NOT NULL,
    MODIFY `author` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Server` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `serverId` VARCHAR(191) NOT NULL,
    MODIFY `channelId` VARCHAR(191) NOT NULL,
    MODIFY `serverName` VARCHAR(191) NOT NULL;
