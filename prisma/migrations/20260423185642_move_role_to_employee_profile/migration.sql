/*
  Warnings:

  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- AlterTable
ALTER TABLE `employee_profiles` ADD COLUMN `role_id` VARCHAR(191) NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role_id`;

-- CreateIndex
CREATE INDEX `employee_profiles_role_id_fkey` ON `employee_profiles`(`role_id`);

-- AddForeignKey
ALTER TABLE `employee_profiles` ADD CONSTRAINT `employee_profiles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
