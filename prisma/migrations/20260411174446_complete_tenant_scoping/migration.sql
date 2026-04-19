/*
  Warnings:

  - A unique constraint covering the columns `[company_id,name]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `infraction_offenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `infraction_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `leave_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `positions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `departments_name_key` ON `departments`;

-- DropIndex
DROP INDEX `infraction_types_name_key` ON `infraction_types`;

-- DropIndex
DROP INDEX `leave_types_name_key` ON `leave_types`;

-- DropIndex
DROP INDEX `positions_name_key` ON `positions`;

-- DropIndex
DROP INDEX `roles_name_key` ON `roles`;

-- AlterTable
ALTER TABLE `calendar_events` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `departments` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `infraction_offenses` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `infraction_types` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `leave_types` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `positions` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `company_id` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `calendar_events_company_id_idx` ON `calendar_events`(`company_id`);

-- CreateIndex
CREATE INDEX `departments_company_id_idx` ON `departments`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `departments_company_id_name_key` ON `departments`(`company_id`, `name`);

-- CreateIndex
CREATE INDEX `infraction_offenses_company_id_idx` ON `infraction_offenses`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `infraction_offenses_company_id_name_key` ON `infraction_offenses`(`company_id`, `name`);

-- CreateIndex
CREATE INDEX `infraction_types_company_id_idx` ON `infraction_types`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `infraction_types_company_id_name_key` ON `infraction_types`(`company_id`, `name`);

-- CreateIndex
CREATE INDEX `leave_types_company_id_idx` ON `leave_types`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `leave_types_company_id_name_key` ON `leave_types`(`company_id`, `name`);

-- CreateIndex
CREATE INDEX `positions_company_id_idx` ON `positions`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `positions_company_id_name_key` ON `positions`(`company_id`, `name`);

-- CreateIndex
CREATE INDEX `roles_company_id_idx` ON `roles`(`company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_company_id_name_key` ON `roles`(`company_id`, `name`);

-- AddForeignKey
ALTER TABLE `positions` ADD CONSTRAINT `positions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_types` ADD CONSTRAINT `leave_types_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_types` ADD CONSTRAINT `infraction_types_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_offenses` ADD CONSTRAINT `infraction_offenses_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
