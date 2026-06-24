-- ============================================
-- Migration 003: Create residents table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `residents` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `birthdate` DATE NOT NULL,
    `sex` ENUM('Male', 'Female') NOT NULL,
    `civil_status` ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced') NOT NULL DEFAULT 'Single',
    `contact_no` VARCHAR(20) NULL,
    `purok` VARCHAR(100) NOT NULL,
    `address` VARCHAR(500) NOT NULL,
    `household_id` INT UNSIGNED NULL,
    `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_residents_name` (`last_name`, `first_name`),
    INDEX `idx_residents_purok` (`purok`),
    INDEX `idx_residents_archived` (`is_archived`),
    INDEX `idx_residents_user` (`user_id`),
    INDEX `idx_residents_household` (`household_id`),

    CONSTRAINT `fk_residents_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT `fk_residents_household`
        FOREIGN KEY (`household_id`) REFERENCES `households`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now add the FK from households.head_resident_id → residents.id
ALTER TABLE `households`
    ADD CONSTRAINT `fk_households_head_resident`
    FOREIGN KEY (`head_resident_id`) REFERENCES `residents`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
