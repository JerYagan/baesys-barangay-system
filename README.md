# Baesys — Barangay Management System

Baesys is a modern, minimalist web application built to streamline operations and public service delivery for local barangays. It supports resident registration, household catalogs, official rosters, announcement boards, community programs, document requests with PDF generation, a blotter mediation system, and system auditing.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, TailwindCSS (Vanilla CSS theme classes), Zustand (State Store), Axios (API client).
- **Backend**: PHP (Vanilla Object-Oriented APIs with PDO).
- **Database**: MySQL.
- **Environment**: Optimized for XAMPP stack.

---

## 🚀 Setup & Installation

### 1. Database Setup
1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Go to [phpMyAdmin](http://localhost/phpmyadmin/).
3. Create a new database named `baesys`.
4. Import all migration SQL files in order from the `database/migrations/` folder, or import the full snapshot if available.
   - Specifically, run `001_create_users_table.sql` through `011_create_settings_table.sql`.
   - Run `012_seed_data.sql` to populate default settings, default document types, and the admin user.

### 2. Backend Config (PHP)
1. Copy the `backend/` folder into your XAMPP `htdocs/baesys/backend/` directory, or symlink the repository to your local server.
2. Verify connection settings in `backend/config/db.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_NAME', 'baesys');
   ```

### 3. Frontend Config (React + Vite)
1. Navigate to the `frontend/` folder in your terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the development server:
   ```bash
   npm run dev
   ```
4. Access the portal at [http://localhost:5173/](http://localhost:5173/).

---

## 🔑 Default Credentials

- **Role**: System Administrator
- **Email**: `admin@baesys.local`
- **Password**: `admin123`

---

## 🌐 Local Network / LAN Access

To make Baesys accessible to other devices (e.g. mobile phones, staff tablets) on the same local network:

1. **Get your host IP**:
   Open a terminal and run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your local IPv4 address (e.g., `192.168.1.100`).
2. **Expose Vite server**:
   Start Vite with the `--host` flag:
   ```bash
   npm run dev -- --host
   ```
3. **Configure API base URL**:
   Ensure `frontend/src/api/axios.js` is targeting relative paths `/api` or the absolute IP Address of the host machine.
4. **Access the portal**:
   From any device connected to the same Wi-Fi network, navigate to:
   `http://<your-host-ip>:5173/`

---

## 📦 Production Deployment
1. Build the production build:
   ```bash
   npm run build
   ```
2. Copy the contents of the `dist/` directory directly into XAMPP `htdocs/baesys/` so Apache serves the compiled HTML, CSS, and JS static assets directly.

## Changes, Fixes, and Improvements
- Fix the Document History and Blotter Records UI in Admin view when viewing a resident profile
- Profile pictures are not displaying properly
- Fix the generated document (pdf) being cut off at the bottom
- In another markdown, write what other barangay features we can add, specially in resident side.