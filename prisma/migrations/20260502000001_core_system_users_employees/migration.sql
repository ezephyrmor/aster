-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `salt` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee';

-- CreateTable
CREATE TABLE `employee_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `date_of_birth` DATETIME(3) NULL,
    `contact_number` VARCHAR(20) NULL,
    `personal_email` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `position` VARCHAR(100) NULL,
    `department` VARCHAR(100) NULL,
    `hire_date` DATETIME(3) NULL,
    `emergency_contact_name` VARCHAR(200) NULL,
    `emergency_contact_number` VARCHAR(20) NULL,
    `emergency_contact_relation` VARCHAR(50) NULL,
    `status` ENUM('active', 'on_leave', 'terminated', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- AlterTable
ALTER TABLE `employee_profiles` ADD COLUMN `emergency_contact_name` VARCHAR(200) NULL,
    ADD COLUMN `emergency_contact_number` VARCHAR(50) NULL,
    ADD COLUMN `emergency_contact_relation` VARCHAR(100) NULL;
-- CreateTable
CREATE TABLE `employee_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status_id` VARCHAR(191) NOT NULL,
    `effective_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` TEXT NULL,
    `notes` TEXT NULL,
    `performed_by` VARCHAR(191) NOT NULL,
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
-- AlterTable
ALTER TABLE `employee_statuses` ADD COLUMN `color` VARCHAR(20) NOT NULL DEFAULT 'gray',
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;
/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- AlterTable
ALTER TABLE `employee_profiles` ADD COLUMN `role_id` VARCHAR(191) NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role_id`;

-- CreateIndex
CREATE INDEX `employee_profiles_role_id_fkey` ON `employee_profiles`(`role_id`);

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
