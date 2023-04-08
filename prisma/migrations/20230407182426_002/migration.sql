/*
  Warnings:

  - You are about to alter the column `title` on the `Article` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(128)`.
  - You are about to alter the column `name` on the `ImageArticle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(128)`.
  - You are about to drop the `CategoriesArticles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ImageArticle` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `Article` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_categorieId_fkey`;

-- AlterTable
ALTER TABLE `Article` MODIFY `title` VARCHAR(128) NOT NULL,
    MODIFY `description` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `ImageArticle` MODIFY `name` VARCHAR(128) NOT NULL,
    MODIFY `description` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `CategoriesArticles`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorieArticle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,

    UNIQUE INDEX `CategorieArticle_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `description` VARCHAR(255) NULL,
    `person_number_per_room` INTEGER NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,
    `bed` INTEGER NULL DEFAULT 1,

    UNIQUE INDEX `Room_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `date_check_in` DATETIME(3) NOT NULL,
    `date_check_out` DATETIME(3) NOT NULL,
    `person_number` INTEGER NOT NULL DEFAULT 0,
    `comment` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `has_paid` BOOLEAN NOT NULL DEFAULT false,
    `price` DOUBLE NOT NULL,
    `stripe_payment_intent` VARCHAR(191) NULL,
    `created_on` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_on` DATETIME(3) NOT NULL,
    `payment_date` DATETIME(3) NULL,

    UNIQUE INDEX `Booking_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ImageArticle_name_key` ON `ImageArticle`(`name`);

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `CategorieArticle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
