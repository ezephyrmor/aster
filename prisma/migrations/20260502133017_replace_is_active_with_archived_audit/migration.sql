/*
  Warnings:

  - You are about to drop the column `is_active` on the `employee_statuses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee_statuses` DROP COLUMN `is_active`,
    ADD COLUMN `archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;
