-- ============================================
-- Baesys — Run All Migrations
-- Barangay Management System
-- ============================================
-- 
-- Usage (MySQL CLI):
--   mysql -u root -p < run_migrations.sql
--
-- Or import this file via phpMyAdmin.
-- ============================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `baesys`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `baesys`;

-- Run migrations in order
SOURCE migrations/001_create_users_table.sql;
SOURCE migrations/002_create_households_table.sql;
SOURCE migrations/003_create_residents_table.sql;
SOURCE migrations/004_create_officials_table.sql;
SOURCE migrations/005_create_document_types_table.sql;
SOURCE migrations/006_create_document_requests_table.sql;
SOURCE migrations/007_create_blotter_records_table.sql;
SOURCE migrations/008_create_announcements_table.sql;
SOURCE migrations/009_create_programs_table.sql;
SOURCE migrations/010_create_activity_logs_table.sql;
SOURCE migrations/011_create_settings_table.sql;
SOURCE migrations/012_seed_data.sql;

-- ============================================
-- All migrations complete!
-- Default admin: admin@baesys.local / admin123
-- ============================================
