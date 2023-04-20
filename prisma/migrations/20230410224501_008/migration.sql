/*
  Warnings:

  - You are about to drop the column `nationaliy` on the `User` table. All the data in the column will be lost.
  - Added the required column `nationality` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `nationaliy`,
    ADD COLUMN `nationality` VARCHAR(191) NOT NULL;
