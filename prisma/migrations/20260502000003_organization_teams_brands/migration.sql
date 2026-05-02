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
