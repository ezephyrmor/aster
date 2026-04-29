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

-- AddForeignKey
ALTER TABLE `feature_access_template_items` ADD CONSTRAINT `feature_access_template_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `feature_access_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feature_access_template_items` ADD CONSTRAINT `feature_access_template_items_feature_id_fkey` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_access` ADD CONSTRAINT `role_access_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `feature_access_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
