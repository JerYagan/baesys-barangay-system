-- ============================================
-- Migration 007: Create blotter_records table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `blotter_records` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `complainant_id` INT UNSIGNED NOT NULL,
    `respondent_name` VARCHAR(255) NOT NULL,
    `incident_type` VARCHAR(100) NOT NULL,
    `incident_date` DATETIME NOT NULL,
    `incident_location` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `witness_names` TEXT NULL,
    `status` ENUM('open', 'under_mediation', 'resolved', 'referred') NOT NULL DEFAULT 'open',
    `case_notes` TEXT NULL,
    `filed_by` INT UNSIGNED NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_blotter_status` (`status`),
    INDEX `idx_blotter_complainant` (`complainant_id`),
    INDEX `idx_blotter_date` (`incident_date`),
    INDEX `idx_blotter_type` (`incident_type`),

    CONSTRAINT `fk_blotter_complainant`
        FOREIGN KEY (`complainant_id`) REFERENCES `residents`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_blotter_filed_by`
        FOREIGN KEY (`filed_by`) REFERENCES `users`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
