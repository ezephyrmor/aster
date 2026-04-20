-- AlterTable
ALTER TABLE `employee_statuses` ADD COLUMN `color` VARCHAR(20) NOT NULL DEFAULT 'gray',
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;
