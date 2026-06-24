-- ============================================
-- Migration 009: Create programs table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `programs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('upcoming', 'ongoing', 'completed') NOT NULL DEFAULT 'upcoming',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `budget` DECIMAL(12, 2) NULL,
    `target_beneficiaries` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_programs_status` (`status`),
    INDEX `idx_programs_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
