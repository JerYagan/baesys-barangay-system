-- ============================================
-- Migration 008: Create announcements table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(300) NOT NULL,
    `body` TEXT NOT NULL,
    `category` ENUM('event', 'advisory', 'notice') NOT NULL DEFAULT 'notice',
    `posted_by` INT UNSIGNED NULL,
    `is_published` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_announcements_published` (`is_published`),
    INDEX `idx_announcements_category` (`category`),
    INDEX `idx_announcements_date` (`created_at`),

    CONSTRAINT `fk_announcements_posted_by`
        FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
