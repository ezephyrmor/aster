/*
  Warnings:

  - A unique constraint covering the columns `[template_id,code]` on the table `feature_navigation_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `feature_navigation_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `feature_navigation_items` ADD COLUMN `code` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `uq_nav_item_template_code` ON `feature_navigation_items`(`template_id`, `code`);
