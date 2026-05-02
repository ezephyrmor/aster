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
