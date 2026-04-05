-- CreateTable
CREATE TABLE `teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teams_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_leader` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `left_at` DATETIME(3) NULL,

    INDEX `team_members_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NOT NULL,
    `team_member_id` INTEGER NULL,
    `action` ENUM('joined', 'left', 'promoted', 'demoted', 'removed', 'created', 'updated') NOT NULL,
    `performed_by` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_history` ADD CONSTRAINT `team_history_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_history` ADD CONSTRAINT `team_history_team_member_id_fkey` FOREIGN KEY (`team_member_id`) REFERENCES `team_members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
