/*
  Warnings:

  - You are about to drop the column `is_active` on the `feature_access_templates` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `feature_navigation_templates` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `features` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `infraction_offenses` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `infraction_types` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `leave_types` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `role_navigations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `feature_access_templates` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `feature_navigation_templates` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `features` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `infraction_offenses` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `infraction_types` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `leave_types` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `role_navigations` DROP COLUMN `is_active`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_by` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `feature_access_templates_archived_by_idx` ON `feature_access_templates`(`archived_by`);

-- CreateIndex
CREATE INDEX `feature_navigation_templates_archived_by_idx` ON `feature_navigation_templates`(`archived_by`);

-- CreateIndex
CREATE INDEX `features_archived_by_idx` ON `features`(`archived_by`);

-- CreateIndex
CREATE INDEX `infraction_offenses_archived_by_idx` ON `infraction_offenses`(`archived_by`);

-- CreateIndex
CREATE INDEX `infraction_types_archived_by_idx` ON `infraction_types`(`archived_by`);

-- CreateIndex
CREATE INDEX `leave_types_archived_by_idx` ON `leave_types`(`archived_by`);

-- CreateIndex
CREATE INDEX `role_navigations_archived_by_idx` ON `role_navigations`(`archived_by`);

-- AddForeignKey
ALTER TABLE `leave_types` ADD CONSTRAINT `leave_types_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_types` ADD CONSTRAINT `infraction_types_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_offenses` ADD CONSTRAINT `infraction_offenses_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `features` ADD CONSTRAINT `features_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_access_templates` ADD CONSTRAINT `feature_access_templates_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_navigation_templates` ADD CONSTRAINT `feature_navigation_templates_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_navigations` ADD CONSTRAINT `role_navigations_archived_by_fkey` FOREIGN KEY (`archived_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
