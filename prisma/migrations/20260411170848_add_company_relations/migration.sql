-- AlterTable
ALTER TABLE `brands` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `teams` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `company_id` VARCHAR(191) NOT NULL DEFAULT 1;

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

-- CreateIndex
CREATE INDEX `brands_company_id_fkey` ON `brands`(`company_id`);

-- CreateIndex
CREATE INDEX `teams_company_id_fkey` ON `teams`(`company_id`);

-- CreateIndex
CREATE INDEX `users_company_id_fkey` ON `users`(`company_id`);

-- AddForeignKey
ALTER TABLE `company_profiles` ADD CONSTRAINT `company_profiles_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
