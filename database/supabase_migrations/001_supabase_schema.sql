-- 001_supabase_schema.sql
-- Unified schema migration for Supabase (PostgreSQL)

-- 1. UTILITIES & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'resident' CHECK (role IN ('admin', 'staff', 'resident')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. HOUSEHOLDS TABLE
CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    household_no VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    purok VARCHAR(50) NOT NULL,
    head_resident_id INT, -- Will be foreign-keyed after residents table is created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. RESIDENTS TABLE
CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50) DEFAULT NULL,
    birthdate DATE NOT NULL,
    sex VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female')),
    civil_status VARCHAR(20) NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Divorced', 'Separated')),
    contact_no VARCHAR(20) DEFAULT NULL,
    purok VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    household_id INT REFERENCES households(id) ON DELETE SET NULL,
    profile_path VARCHAR(255) DEFAULT NULL,
    barangay_id_no VARCHAR(50) UNIQUE DEFAULT NULL,
    digital_id_issued_at DATE DEFAULT NULL,
    digital_id_expires_at DATE DEFAULT NULL,
    digital_id_secure_hash VARCHAR(64) DEFAULT NULL,
    digital_id_status VARCHAR(20) DEFAULT 'not_requested' CHECK (digital_id_status IN ('not_requested', 'requested', 'issued')),
    is_archived INT DEFAULT 0 CHECK (is_archived IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add foreign key constraint to households referencing residents
ALTER TABLE households ADD CONSTRAINT fk_head_resident FOREIGN KEY (head_resident_id) REFERENCES residents(id) ON DELETE SET NULL;

-- 5. OFFICIALS TABLE
CREATE TABLE IF NOT EXISTS officials (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    position VARCHAR(50) NOT NULL,
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    is_active INT DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_officials_updated_at BEFORE UPDATE ON officials 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. DOCUMENT TYPES TABLE
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    processing_days INT NOT NULL DEFAULT 1 CHECK (processing_days > 0),
    is_active INT DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON document_types 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. DOCUMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS document_requests (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    document_type_id INT NOT NULL REFERENCES document_types(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready_for_pickup', 'completed', 'rejected')),
    remarks TEXT DEFAULT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_by INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON document_requests 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. BLOTTER RECORDS TABLE
CREATE TABLE IF NOT EXISTS blotter_records (
    id SERIAL PRIMARY KEY,
    case_no VARCHAR(50) UNIQUE NOT NULL,
    complainant_name VARCHAR(100) NOT NULL,
    complainant_contact VARCHAR(20) DEFAULT NULL,
    respondent_name VARCHAR(100) NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    incident_date DATE NOT NULL,
    incident_location TEXT NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'under_mediation', 'resolved', 'referred_to_court', 'dismissed')),
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_by INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_blotter_records_updated_at BEFORE UPDATE ON blotter_records 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_published INT DEFAULT 0 CHECK (is_published IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_id INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    schedule_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 13. CLINIC SERVICES TABLE
CREATE TABLE IF NOT EXISTS clinic_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    estimated_duration_mins INT NOT NULL DEFAULT 30 CHECK (estimated_duration_mins > 0),
    is_active INT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_clinic_services_updated_at BEFORE UPDATE ON clinic_services 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 14. CLINIC SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS clinic_schedules (
    id SERIAL PRIMARY KEY,
    service_id INT NOT NULL REFERENCES clinic_services(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_slots INT NOT NULL DEFAULT 10 CHECK (max_slots > 0),
    filled_slots INT NOT NULL DEFAULT 0 CHECK (filled_slots >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_clinic_schedules_updated_at BEFORE UPDATE ON clinic_schedules 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 15. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES clinic_services(id) ON DELETE CASCADE,
    schedule_id INT NOT NULL REFERENCES clinic_schedules(id) ON DELETE CASCADE,
    appointment_time TIME NOT NULL,
    purpose TEXT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled', 'completed')),
    staff_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
