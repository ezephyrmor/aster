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
