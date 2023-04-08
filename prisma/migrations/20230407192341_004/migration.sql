/*
  Warnings:

  - Added the required column `description` to the `CategorieArticle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CategorieArticle` ADD COLUMN `description` VARCHAR(255) NOT NULL;
