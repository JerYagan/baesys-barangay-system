-- ============================================
-- Migration 006: Create document_requests table
-- Baesys - Barangay Management System
-- ============================================

CREATE TABLE IF NOT EXISTS `document_requests` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `resident_id` INT UNSIGNED NOT NULL,
    `document_type_id` INT UNSIGNED NOT NULL,
    `purpose` TEXT NOT NULL,
    `status` ENUM('pending', 'processing', 'ready_for_pickup', 'released') NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `processed_by` INT UNSIGNED NULL,
    `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_requests_status` (`status`),
    INDEX `idx_requests_resident` (`resident_id`),
    INDEX `idx_requests_type` (`document_type_id`),
    INDEX `idx_requests_date` (`requested_at`),

    CONSTRAINT `fk_requests_resident`
        FOREIGN KEY (`resident_id`) REFERENCES `residents`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT `fk_requests_document_type`
        FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT `fk_requests_processed_by`
        FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
