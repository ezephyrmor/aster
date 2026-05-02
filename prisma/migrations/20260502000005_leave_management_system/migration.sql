-- CreateTable
CREATE TABLE `leave_types` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `default_days_limit` INTEGER NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT 'purple',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_types_company_id_idx`(`company_id`),
    UNIQUE INDEX `leave_types_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_statuses` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT 'gray',
    `is_final` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_statuses_company_id_idx`(`company_id`),
    UNIQUE INDEX `leave_statuses_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_credits` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `earned_date` DATETIME(3) NOT NULL,
    `used_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_credits_user_id_idx`(`user_id`),
    INDEX `leave_credits_earned_date_idx`(`earned_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_requests` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `user_id` VARCHAR(191) NOT NULL,
    `leave_type_id` VARCHAR(191) NOT NULL,
    `status_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `reason` TEXT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT true,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `review_comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leave_requests_company_id_idx`(`company_id`),
    INDEX `leave_requests_user_id_idx`(`user_id`),
    INDEX `leave_requests_status_id_idx`(`status_id`),
    INDEX `leave_requests_leave_type_id_idx`(`leave_type_id`),
    INDEX `leave_requests_start_date_idx`(`start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_usage` (
    `id` VARCHAR(191) NOT NULL,
    `leave_request_id` VARCHAR(191) NOT NULL,
    `leave_credit_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_usage_leave_request_id_idx`(`leave_request_id`),
    INDEX `leave_usage_leave_credit_id_idx`(`leave_credit_id`),
    UNIQUE INDEX `leave_usage_leave_request_id_leave_credit_id_key`(`leave_request_id`, `leave_credit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
