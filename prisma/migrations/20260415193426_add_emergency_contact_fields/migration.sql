-- AlterTable
ALTER TABLE `employee_profiles` ADD COLUMN `emergency_contact_name` VARCHAR(200) NULL,
    ADD COLUMN `emergency_contact_number` VARCHAR(50) NULL,
    ADD COLUMN `emergency_contact_relation` VARCHAR(100) NULL;
