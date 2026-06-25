-- Drop existing tables if they exist to ensure clean recreation with correct types
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_schedules;
DROP TABLE IF EXISTS clinic_services;

-- A. HEALTH CLINIC TABLES

CREATE TABLE clinic_services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    estimated_duration_mins INT DEFAULT 30,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clinic_schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id INT UNSIGNED NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_slots INT DEFAULT 10,
    filled_slots INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES clinic_services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    schedule_id INT UNSIGNED NOT NULL,
    appointment_time TIME NOT NULL,
    purpose TEXT,
    status ENUM('pending', 'approved', 'cancelled', 'completed') DEFAULT 'pending',
    staff_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES clinic_services(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES clinic_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- B. RESIDENTS TABLE UPDATES (For Digital ID Verification)
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS barangay_id_no VARCHAR(50) UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS digital_id_issued_at DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS digital_id_expires_at DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS digital_id_secure_hash VARCHAR(64) DEFAULT NULL;

-- Seed some default clinic services if they don't exist
INSERT INTO clinic_services (name, description, estimated_duration_mins, is_active) VALUES
('General Medical Consultation', 'Regular checkup and consultation with the barangay physician.', 30, 1),
('Dental Checkup & Extraction', 'Dental cleaning, consult, and tooth extractions.', 30, 1),
('Free Vaccination Program', 'Immunization for children, seniors, and general flu shots.', 15, 1),
('Pre-natal & Maternal Care', 'Maternal health checkups for pregnant residents.', 30, 1)
ON DUPLICATE KEY UPDATE name=name;
