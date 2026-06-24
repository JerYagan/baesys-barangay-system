-- ============================================
-- Migration 004: Create officials table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `officials` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `position` VARCHAR(100) NOT NULL,
    `term_start` DATE NOT NULL,
    `term_end` DATE NOT NULL,
    `contact_no` VARCHAR(20) NULL,
    `photo_path` VARCHAR(500) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_officials_active` (`is_active`),
    INDEX `idx_officials_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
