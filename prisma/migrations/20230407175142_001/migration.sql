/*
  Warnings:

  - You are about to drop the `_ArticleToCategoriesArticles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ArticleToCategoriesArticles` DROP FOREIGN KEY `_ArticleToCategoriesArticles_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ArticleToCategoriesArticles` DROP FOREIGN KEY `_ArticleToCategoriesArticles_B_fkey`;

-- AlterTable
ALTER TABLE `Article` ADD COLUMN `categorieId` INTEGER NULL;

-- DropTable
DROP TABLE `_ArticleToCategoriesArticles`;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `CategoriesArticles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
