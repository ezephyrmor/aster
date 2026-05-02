-- CreateTable
CREATE TABLE `brand_manager_history` (
    `id` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` ENUM('ASSIGNED', 'REMOVED') NOT NULL,
    `performed_by` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `previous_manager_id` VARCHAR(191) NULL,
    `reason` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,

    INDEX `brand_manager_history_brand_id_fkey`(`brandId`),
    INDEX `brand_manager_history_user_id_fkey`(`user_id`),
    INDEX `brand_manager_history_performed_by_fkey`(`performed_by`),
    INDEX `brand_manager_history_timestamp_fkey`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
