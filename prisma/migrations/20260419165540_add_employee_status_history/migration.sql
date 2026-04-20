-- CreateTable
CREATE TABLE `employee_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `status_id` INTEGER NOT NULL,
    `effective_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` TEXT NULL,
    `notes` TEXT NULL,
    `performed_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,

    INDEX `employee_status_history_user_id_fkey`(`user_id`),
    INDEX `employee_status_history_status_id_fkey`(`status_id`),
    INDEX `employee_status_history_performed_by_fkey`(`performed_by`),
    INDEX `employee_status_history_effective_date_idx`(`effective_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `employee_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `employee_statuses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
