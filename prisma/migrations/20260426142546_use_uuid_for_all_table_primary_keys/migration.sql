/*
  Warnings:

  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `brand_manager_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `brands` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `calendar_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `companies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `company_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `employee_profiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `employee_status_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `employee_statuses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `industries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `infraction_offenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `infraction_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `infractions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leave_credits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leave_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leave_statuses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leave_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `leave_usage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `positions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `work_schedules` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `brand_manager_history` DROP FOREIGN KEY `brand_manager_history_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `brand_manager_history` DROP FOREIGN KEY `brand_manager_history_performed_by_fkey`;

-- DropForeignKey
ALTER TABLE `brand_manager_history` DROP FOREIGN KEY `brand_manager_history_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `brands` DROP FOREIGN KEY `brands_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `brands` DROP FOREIGN KEY `brands_industry_id_fkey`;

-- DropForeignKey
ALTER TABLE `brands` DROP FOREIGN KEY `brands_manager_id_fkey`;

-- DropForeignKey
ALTER TABLE `calendar_events` DROP FOREIGN KEY `calendar_events_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `calendar_events` DROP FOREIGN KEY `calendar_events_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `company_profiles` DROP FOREIGN KEY `company_profiles_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `departments` DROP FOREIGN KEY `departments_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_profiles` DROP FOREIGN KEY `employee_profiles_department_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_profiles` DROP FOREIGN KEY `employee_profiles_position_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_profiles` DROP FOREIGN KEY `employee_profiles_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_profiles` DROP FOREIGN KEY `employee_profiles_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_profiles` DROP FOREIGN KEY `employee_profiles_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_status_history` DROP FOREIGN KEY `employee_status_history_performed_by_fkey`;

-- DropForeignKey
ALTER TABLE `employee_status_history` DROP FOREIGN KEY `employee_status_history_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `employee_status_history` DROP FOREIGN KEY `employee_status_history_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `infraction_offenses` DROP FOREIGN KEY `infraction_offenses_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `infraction_offenses` DROP FOREIGN KEY `infraction_offenses_type_id_fkey`;

-- DropForeignKey
ALTER TABLE `infraction_types` DROP FOREIGN KEY `infraction_types_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_acknowledged_by_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_offense_id_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_type_id_fkey`;

-- DropForeignKey
ALTER TABLE `infractions` DROP FOREIGN KEY `infractions_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_credits` DROP FOREIGN KEY `leave_credits_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_leave_type_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_reviewed_by_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_status_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_requests` DROP FOREIGN KEY `leave_requests_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_statuses` DROP FOREIGN KEY `leave_statuses_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_types` DROP FOREIGN KEY `leave_types_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_usage` DROP FOREIGN KEY `leave_usage_leave_credit_id_fkey`;

-- DropForeignKey
ALTER TABLE `leave_usage` DROP FOREIGN KEY `leave_usage_leave_request_id_fkey`;

-- DropForeignKey
ALTER TABLE `positions` DROP FOREIGN KEY `positions_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `roles` DROP FOREIGN KEY `roles_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_history` DROP FOREIGN KEY `team_history_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_history` DROP FOREIGN KEY `team_history_team_member_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_members` DROP FOREIGN KEY `team_members_team_id_fkey`;

-- DropForeignKey
ALTER TABLE `team_members` DROP FOREIGN KEY `team_members_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `teams` DROP FOREIGN KEY `teams_brand_id_fkey`;

-- DropForeignKey
ALTER TABLE `teams` DROP FOREIGN KEY `teams_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `work_schedules` DROP FOREIGN KEY `work_schedules_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `work_schedules` DROP FOREIGN KEY `work_schedules_user_id_fkey`;

-- AlterTable
ALTER TABLE `attendance` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `schedule_id` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `brand_manager_history` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `brandId` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NULL,
    MODIFY `performed_by` VARCHAR(191) NOT NULL,
    MODIFY `previous_manager_id` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `brands` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `created_by` VARCHAR(191) NOT NULL,
    MODIFY `industry_id` VARCHAR(191) NULL,
    MODIFY `manager_id` VARCHAR(191) NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `calendar_events` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `created_by` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `companies` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `company_profiles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `departments` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `employee_profiles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `department_id` VARCHAR(191) NULL,
    MODIFY `position_id` VARCHAR(191) NULL,
    MODIFY `status_id` VARCHAR(191) NOT NULL DEFAULT '1',
    MODIFY `role_id` VARCHAR(191) NOT NULL DEFAULT '3',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `employee_status_history` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `status_id` VARCHAR(191) NOT NULL,
    MODIFY `performed_by` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `employee_statuses` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `industries` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `infraction_offenses` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `type_id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `infraction_types` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `infractions` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `offense_id` VARCHAR(191) NOT NULL,
    MODIFY `type_id` VARCHAR(191) NOT NULL,
    MODIFY `acknowledged_by` VARCHAR(191) NULL,
    MODIFY `created_by` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `leave_credits` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `leave_requests` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `leave_type_id` VARCHAR(191) NOT NULL,
    MODIFY `status_id` VARCHAR(191) NOT NULL DEFAULT '1',
    MODIFY `reviewed_by` VARCHAR(191) NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `leave_statuses` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `leave_types` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `leave_usage` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `leave_request_id` VARCHAR(191) NOT NULL,
    MODIFY `leave_credit_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `positions` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `roles` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `team_history` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `team_id` VARCHAR(191) NOT NULL,
    MODIFY `team_member_id` VARCHAR(191) NULL,
    MODIFY `performed_by` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `team_members` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `team_id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `teams` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `brand_id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `work_schedules` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `company_id` VARCHAR(191) NOT NULL DEFAULT '1',
    ADD PRIMARY KEY (`id`);

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
