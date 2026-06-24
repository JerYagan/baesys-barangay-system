-- ============================================
-- Migration 002: Create households table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `households` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `household_no` VARCHAR(50) NOT NULL UNIQUE,
    `address` VARCHAR(500) NOT NULL,
    `purok` VARCHAR(100) NOT NULL,
    `head_resident_id` INT UNSIGNED NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_households_purok` (`purok`),
    INDEX `idx_households_head` (`head_resident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: FK to residents.id will be added after residents table is created (see migration 003)
