-- ============================================
-- Migration 012: Seed default data
-- Baesys - Barangay Management System
-- ============================================

-- Default admin account
-- Email: admin@baesys.local
-- Password: admin123 (hashed with PHP password_hash)
-- Hash generated via: password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO `users` (`email`, `password_hash`, `first_name`, `last_name`, `role`, `status`) VALUES
('admin@baesys.local', '$2y$10$d6Lgwzs.35j07iJ7FJg2YerbDdtJwZhre/5rwrmTgGs.bPgN7DrcW', 'System', 'Administrator', 'admin', 'active');

-- Default document types
INSERT INTO `document_types` (`name`, `description`, `fee`, `processing_days`, `is_active`) VALUES
('Barangay Clearance', 'General-purpose barangay clearance certificate for employment, travel, or other transactions.', 50.00, 1, 1),
('Certificate of Indigency', 'Certification that a resident belongs to the indigent sector, used for medical/financial assistance.', 0.00, 1, 1),
('Certificate of Residency', 'Proof that a person resides within the barangay jurisdiction.', 30.00, 1, 1),
('Certificate of Good Moral Character', 'Attestation of the resident''s good moral character, commonly required for employment or school enrollment.', 50.00, 1, 1),
('Business Clearance', 'Clearance required for business permit applications within the barangay.', 200.00, 3, 1),
('First Time Job Seeker Certification', 'Certification under RA 11261 for first-time job seekers, exempt from fees.', 0.00, 1, 1);

-- Default system settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('barangay_name', 'Barangay Sample'),
('barangay_address', '123 Main Street, Municipality, Province'),
('barangay_contact', '(012) 345-6789'),
('barangay_email', 'barangay@sample.gov.ph'),
('office_hours', 'Monday - Friday, 8:00 AM - 5:00 PM'),
('barangay_logo', NULL);
