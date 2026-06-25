-- Add profile_path to residents table
ALTER TABLE `residents` ADD COLUMN `profile_path` VARCHAR(255) DEFAULT NULL;
