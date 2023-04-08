/*
  Warnings:

  - You are about to drop the column `name` on the `CategorieArticle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ImageArticle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `CategorieArticle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `ImageArticle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `CategorieArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ImageArticle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `CategorieArticle_name_key` ON `CategorieArticle`;

-- DropIndex
DROP INDEX `ImageArticle_name_key` ON `ImageArticle`;

-- AlterTable
ALTER TABLE `CategorieArticle` DROP COLUMN `name`,
    ADD COLUMN `title` VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE `ImageArticle` DROP COLUMN `name`,
    ADD COLUMN `title` VARCHAR(128) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CategorieArticle_title_key` ON `CategorieArticle`(`title`);

-- CreateIndex
CREATE UNIQUE INDEX `ImageArticle_title_key` ON `ImageArticle`(`title`);
