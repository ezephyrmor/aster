/*
  Warnings:

  - Added the required column `brand_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `teams` ADD COLUMN `brand_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `brands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `logo` VARCHAR(500) NULL,
    `website` VARCHAR(255) NULL,
    `industry` VARCHAR(100) NULL,
    `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NOT NULL,

    UNIQUE INDEX `brands_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
