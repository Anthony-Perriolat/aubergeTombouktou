/*
  Warnings:

  - Made the column `personNumberPerRoom` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Room` MODIFY `personNumberPerRoom` INTEGER NOT NULL DEFAULT 1;
