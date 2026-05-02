-- CreateTable
CREATE TABLE `calendar_events` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT 'blue',
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_events_company_id_idx`(`company_id`),
    INDEX `calendar_events_start_date_idx`(`start_date`),
    INDEX `calendar_events_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `work_schedules` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `day_of_week` INTEGER NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `break_minutes` INTEGER NOT NULL DEFAULT 60,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `work_schedules_company_id_idx`(`company_id`),
    INDEX `work_schedules_user_id_idx`(`user_id`),
    INDEX `work_schedules_day_of_week_idx`(`day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `schedule_id` VARCHAR(191) NULL,
    `date` DATE NOT NULL,
    `clock_in` DATETIME(3) NULL,
    `clock_out` DATETIME(3) NULL,
    `status` ENUM('present', 'absent', 'late', 'undertime', 'on_leave', 'holiday') NOT NULL DEFAULT 'present',
    `late_minutes` INTEGER NOT NULL DEFAULT 0,
    `undertime_minutes` INTEGER NOT NULL DEFAULT 0,
    `early_clock_out_reason` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attendance_user_id_idx`(`user_id`),
    INDEX `attendance_date_idx`(`date`),
    INDEX `attendance_status_idx`(`status`),
    UNIQUE INDEX `attendance_user_id_date_key`(`user_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
