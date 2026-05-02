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
