/*
  Warnings:

  - A unique constraint covering the columns `[company_id,name]` on the table `leave_statuses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `leave_statuses_name_key` ON `leave_statuses`;

-- AlterTable
ALTER TABLE `leave_statuses` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `leave_statuses_company_id_idx` ON `leave_statuses`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `leave_statuses_company_id_name_key` ON `leave_statuses`(`company_id`, `name`);

-- AddForeignKey
ALTER TABLE `leave_statuses` ADD CONSTRAINT `leave_statuses_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
