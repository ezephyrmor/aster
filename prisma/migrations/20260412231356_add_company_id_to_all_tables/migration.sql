-- AlterTable
ALTER TABLE `infractions` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `work_schedules` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `infractions_company_id_idx` ON `infractions`(`company_id`);

-- CreateIndex
CREATE INDEX `work_schedules_company_id_idx` ON `work_schedules`(`company_id`);

-- AddForeignKey
ALTER TABLE `work_schedules` ADD CONSTRAINT `work_schedules_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
