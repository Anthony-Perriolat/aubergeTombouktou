/*
  Warnings:

  - Made the column `categorieId` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `articleId` on table `ImageArticle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_categorieId_fkey`;

-- DropForeignKey
ALTER TABLE `ImageArticle` DROP FOREIGN KEY `ImageArticle_articleId_fkey`;

-- AlterTable
ALTER TABLE `Article` MODIFY `categorieId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ImageArticle` MODIFY `articleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `CategorieArticle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageArticle` ADD CONSTRAINT `ImageArticle_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
