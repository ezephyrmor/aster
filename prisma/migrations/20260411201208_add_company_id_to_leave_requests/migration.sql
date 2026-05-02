-- AlterTable
ALTER TABLE `leave_requests` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `leave_requests_company_id_idx` ON `leave_requests`(`company_id`);

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
