-- CreateTable
CREATE TABLE `positions` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `positions_company_id_idx`(`company_id`),
    UNIQUE INDEX `positions_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `departments_company_id_idx`(`company_id`),
    UNIQUE INDEX `departments_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `roles_company_id_idx`(`company_id`),
    UNIQUE INDEX `roles_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_statuses` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT 'gray',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `archived_at` DATETIME(3) NULL,
    `archived_by` VARCHAR(191) NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `employee_statuses_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `industries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `industries_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended', 'trial') NOT NULL DEFAULT 'active',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Manila',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `companies_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `legal_name` VARCHAR(200) NULL,
    `tax_id` VARCHAR(50) NULL,
    `email` VARCHAR(200) NULL,
    `phone` VARCHAR(50) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `settings` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `company_profiles_company_id_key`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `salt` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_company_id_fkey`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `hire_date` DATETIME(3) NULL,
    `emergency_contact_name` VARCHAR(200) NULL,
    `emergency_contact_number` VARCHAR(50) NULL,
    `emergency_contact_relation` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `department_id` VARCHAR(191) NULL,
    `position_id` VARCHAR(191) NULL,
    `status_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `role_id` VARCHAR(191) NOT NULL DEFAULT '3',

    UNIQUE INDEX `employee_profiles_user_id_key`(`user_id`),
    INDEX `employee_profiles_department_id_fkey`(`department_id`),
    INDEX `employee_profiles_position_id_fkey`(`position_id`),
    INDEX `employee_profiles_status_id_fkey`(`status_id`),
    INDEX `employee_profiles_role_id_fkey`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(500) NULL,
    `website` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `manager_id` VARCHAR(191) NULL,
    `industry_id` VARCHAR(191) NULL,

    UNIQUE INDEX `brands_name_key`(`name`),
    INDEX `brands_industry_id_fkey`(`industry_id`),
    INDEX `brands_manager_id_fkey`(`manager_id`),
    INDEX `brands_company_id_fkey`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `teams` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `brand_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `teams_name_key`(`name`),
    INDEX `teams_brand_id_fkey`(`brand_id`),
    INDEX `teams_company_id_fkey`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_members` (
    `id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `is_leader` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `left_at` DATETIME(3) NULL,

    INDEX `team_members_team_id_fkey`(`team_id`),
    INDEX `team_members_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_history` (
    `id` VARCHAR(191) NOT NULL,
    `team_id` VARCHAR(191) NOT NULL,
    `team_member_id` VARCHAR(191) NULL,
    `action` ENUM('joined', 'left', 'promoted', 'demoted', 'removed', 'created', 'updated') NOT NULL,
    `performed_by` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_history_team_id_fkey`(`team_id`),
    INDEX `team_history_team_member_id_fkey`(`team_member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `infraction_types` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(20) NOT NULL DEFAULT 'red',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `infraction_types_company_id_idx`(`company_id`),
    UNIQUE INDEX `infraction_types_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infraction_offenses` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `severity_level` INTEGER NOT NULL,
    `type_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `infraction_offenses_company_id_idx`(`company_id`),
    INDEX `infraction_offenses_type_id_fkey`(`type_id`),
    UNIQUE INDEX `infraction_offenses_company_id_name_key`(`company_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infractions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    `offense_id` VARCHAR(191) NOT NULL,
    `type_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `details` TEXT NULL,
    `comment` TEXT NULL,
    `acknowledged_by` VARCHAR(191) NULL,
    `acknowledged_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `infractions_company_id_idx`(`company_id`),
    INDEX `infractions_user_id_idx`(`user_id`),
    INDEX `infractions_type_id_idx`(`type_id`),
    INDEX `infractions_offense_id_idx`(`offense_id`),
    INDEX `infractions_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `features` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(150) NOT NULL,
    `kind` ENUM('page', 'api', 'action') NOT NULL,
    `http_method` VARCHAR(10) NULL,
    `path` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `domain` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_feature_code`(`code`),
    UNIQUE INDEX `uq_feature_path_method`(`path`, `http_method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_access_templates` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `domain` VARCHAR(50) NULL,
    `scope_level` ENUM('self', 'team', 'department', 'brand', 'company') NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_template_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_access_template_items` (
    `id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `feature_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(30) NOT NULL,
    `effect` ENUM('allow', 'deny') NOT NULL,
    `scope_level` ENUM('self', 'team', 'department', 'brand', 'company') NULL,
    `scope_override` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `item_template_id_fkey`(`template_id`),
    INDEX `item_feature_id_fkey`(`feature_id`),
    UNIQUE INDEX `uq_template_feature_action`(`template_id`, `feature_id`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_access` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_access_company_id_idx`(`company_id`),
    INDEX `role_access_role_id_idx`(`role_id`),
    INDEX `role_access_template_id_fkey`(`template_id`),
    UNIQUE INDEX `uq_role_template`(`company_id`, `role_id`, `template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_navigation_templates` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `company_id` VARCHAR(191) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `feature_navigation_templates_company_id_idx`(`company_id`),
    UNIQUE INDEX `uq_nav_template_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_navigation_items` (
    `id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `alias` VARCHAR(120) NULL,
    `icon` VARCHAR(50) NULL,
    `type` VARCHAR(20) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `feature_code` VARCHAR(150) NULL,
    `url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `feature_navigation_items_template_id_idx`(`template_id`),
    INDEX `feature_navigation_items_parent_id_idx`(`parent_id`),
    INDEX `feature_navigation_items_feature_code_idx`(`feature_code`),
    UNIQUE INDEX `uq_nav_item_template_code`(`template_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_navigations` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `navigation_template_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_navigations_company_id_idx`(`company_id`),
    INDEX `role_navigations_role_id_idx`(`role_id`),
    INDEX `role_navigations_navigation_template_id_idx`(`navigation_template_id`),
    UNIQUE INDEX `uq_role_navigation`(`company_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `positions` ADD CONSTRAINT `positions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_profiles` ADD CONSTRAINT `company_profiles_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `employee_statuses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `employee_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `employee_statuses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_status_history` ADD CONSTRAINT `employee_status_history_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_industry_id_fkey` FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_manager_history` ADD CONSTRAINT `brand_manager_history_performed_by_fkey` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_history` ADD CONSTRAINT `team_history_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_history` ADD CONSTRAINT `team_history_team_member_id_fkey` FOREIGN KEY (`team_member_id`) REFERENCES `team_members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_types` ADD CONSTRAINT `leave_types_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_statuses` ADD CONSTRAINT `leave_statuses_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_credits` ADD CONSTRAINT `leave_credits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_leave_type_id_fkey` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `leave_statuses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_usage` ADD CONSTRAINT `leave_usage_leave_request_id_fkey` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_usage` ADD CONSTRAINT `leave_usage_leave_credit_id_fkey` FOREIGN KEY (`leave_credit_id`) REFERENCES `leave_credits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_schedules` ADD CONSTRAINT `work_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_schedules` ADD CONSTRAINT `work_schedules_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `work_schedules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_types` ADD CONSTRAINT `infraction_types_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_offenses` ADD CONSTRAINT `infraction_offenses_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `infraction_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infraction_offenses` ADD CONSTRAINT `infraction_offenses_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_offense_id_fkey` FOREIGN KEY (`offense_id`) REFERENCES `infraction_offenses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `infraction_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infractions` ADD CONSTRAINT `infractions_acknowledged_by_fkey` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_access_template_items` ADD CONSTRAINT `feature_access_template_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `feature_access_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_access_template_items` ADD CONSTRAINT `feature_access_template_items_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_access` ADD CONSTRAINT `role_access_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `feature_access_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_navigation_templates` ADD CONSTRAINT `feature_navigation_templates_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_navigation_items` ADD CONSTRAINT `feature_navigation_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `feature_navigation_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_navigation_items` ADD CONSTRAINT `feature_navigation_items_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `feature_navigation_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_navigation_items` ADD CONSTRAINT `feature_navigation_items_feature_code_fkey` FOREIGN KEY (`feature_code`) REFERENCES `features`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_navigations` ADD CONSTRAINT `role_navigations_navigation_template_id_fkey` FOREIGN KEY (`navigation_template_id`) REFERENCES `feature_navigation_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_navigations` ADD CONSTRAINT `role_navigations_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_navigations` ADD CONSTRAINT `role_navigations_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
