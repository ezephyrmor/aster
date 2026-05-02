-- AlterTable
ALTER TABLE `brands` ADD COLUMN `manager_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `brands_manager_id_fkey` ON `brands`(`manager_id`);

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
