/*
  Warnings:

  - You are about to drop the column `created_on` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `date_check_in` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `date_check_out` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `has_paid` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `person_number` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_payment_intent` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `updated_on` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `person_number_per_room` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `dateCheckIn` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateCheckOut` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedOn` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationaliy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_room_id_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_user_id_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `created_on`,
    DROP COLUMN `date_check_in`,
    DROP COLUMN `date_check_out`,
    DROP COLUMN `has_paid`,
    DROP COLUMN `payment_date`,
    DROP COLUMN `person_number`,
    DROP COLUMN `room_id`,
    DROP COLUMN `stripe_payment_intent`,
    DROP COLUMN `updated_on`,
    DROP COLUMN `user_id`,
    ADD COLUMN `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dateCheckIn` DATETIME(3) NOT NULL,
    ADD COLUMN `dateCheckOut` DATETIME(3) NOT NULL,
    ADD COLUMN `hasPaid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentDate` DATETIME(3) NULL,
    ADD COLUMN `personNumber` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `roomId` INTEGER NOT NULL,
    ADD COLUMN `stripePaymentIntent` VARCHAR(191) NULL,
    ADD COLUMN `updatedOn` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Room` DROP COLUMN `person_number_per_room`,
    ADD COLUMN `personNumberPerRoom` INTEGER NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `name`,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `nationaliy` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
