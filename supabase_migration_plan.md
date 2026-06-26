# Supabase Migration Plan (MySQL to Supabase/PostgreSQL)

This plan outlines the steps required to migrate the **Baesys Barangay Management System** database from local MySQL (XAMPP) to a remote **Supabase (PostgreSQL)** instance.

---

## 📋 Pre-migration Checklist
- [ ] Create a **Supabase** account at [supabase.com](https://supabase.com/).
- [ ] Create a new project in Supabase (e.g., `baesys-barangay`).
- [ ] Retrieve the database connection parameters (Host, Database Name, Port, User, and Password) from the **Database Settings** tab in Supabase.
- [ ] Ensure the **PDO pgsql** extension is enabled in your PHP environment (`php.ini`).

---

## 🛠️ Phase 1: Schema Conversion & Migration Files
- [ ] Create `database/supabase_migrations/` folder.
- [ ] Convert all existing MySQL migrations (`001_...` to `015_...`) into PostgreSQL compatible scripts:
  - [ ] Convert data types:
    - `INT AUTO_INCREMENT` ➡️ `SERIAL` or `BIGSERIAL`
    - `DATETIME` / `TIMESTAMP` ➡️ `TIMESTAMP WITH TIME ZONE`
    - `TEXT` ➡️ `TEXT`
    - `VARCHAR(N)` ➡️ `VARCHAR(N)`
  - [ ] Adapt constraints (e.g., `UNSIGNED` is not supported in PostgreSQL; replace with `CHECK (col >= 0)` or use standard integer types).
  - [ ] Convert functions/triggers (e.g., MySQL `ON UPDATE CURRENT_TIMESTAMP` needs a custom PL/pgSQL trigger function in PostgreSQL).
- [ ] Create a unified SQL schema file `001_supabase_schema.sql` containing all tables, constraints, and triggers.
- [ ] Create a seed file `002_supabase_seed.sql` containing administrative defaults, settings, and official roles.

---

## ⚙️ Phase 2: Database Connection Refactoring
- [ ] Update `backend/config/db.php` to use the **PDO pgsql** driver:
  ```php
  <?php
  function getDBConnection() {
      $host = 'aws-0-ap-southeast-1.pooler.supabase.com'; // Your Supabase host
      $port = '6543'; // Transaction pooler port (or 5432 for direct connection)
      $db   = 'postgres';
      $user = 'postgres.yourprojectid';
      $pass = 'your-strong-password';
      $charset = 'utf8';

      $dsn = "pgsql:host=$host;port=$port;dbname=$db;user=$user;password=$pass";
      
      try {
          $pdo = new PDO($dsn);
          $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
          $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
          return $pdo;
      } catch (PDOException $e) {
          throw new Exception("Connection failed: " . $e->getMessage());
      }
  }
  ?>
  ```
- [ ] Test connectivity from the PHP backend to Supabase.

---

## 📝 Phase 3: PHP Query Adaptations (Dialect Compatibility)
PostgreSQL is stricter about syntax, casing, and types.
- [ ] Review and fix SQL quotes: PostgreSQL uses double quotes `"` for system identifiers (tables/columns) and single quotes `'` for strings. Ensure standard SQL is used.
- [ ] Adapt boolean fields: In MySQL, `TINYINT(1)` represents booleans. In Supabase, use actual `BOOLEAN` types (`TRUE`/`FALSE`). Ensure PHP queries check booleans correctly.
- [ ] Modify `LIMIT` and offset queries to match standard SQL syntax.
- [ ] Update datetime inputs: PostgreSQL expects strict ISO-8601 formatting for timestamps (e.g., `YYYY-MM-DD HH:MM:SS` or timezone-aware values).

---

## 🧪 Phase 4: Verification & Testing
- [ ] Deploy schema to Supabase using the Supabase SQL Editor.
- [ ] Verify default seeding is correct.
- [ ] Run backend tests to ensure CRUD operations for:
  - [ ] User authentication and JWT generation.
  - [ ] Resident profiles (including Digital ID requests and generation).
  - [ ] Household registers.
  - [ ] Document requests and PDF clearance generators.
  - [ ] Blotter incident trackers.
  - [ ] Clinic scheduling schedules.
- [ ] Deploy the production backend configuration pointing to Supabase.
