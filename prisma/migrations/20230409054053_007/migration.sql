-- CreateTable
CREATE TABLE `ImageRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(128) NOT NULL,
    `description` VARCHAR(255) NULL,
    `urlStorage` VARCHAR(191) NOT NULL,
    `roomId` INTEGER NULL,

    UNIQUE INDEX `ImageRoom_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImageRoom` ADD CONSTRAINT `ImageRoom_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
