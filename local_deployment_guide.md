# Local Deployment & Custom Domain Setup Guide

This guide describes how to deploy the Baesys Barangay Management System on a local computer or laptop under a custom local domain name (e.g., `baesys.local` or `barangay.gov.ph`) instead of typing `localhost` or an IP address.

---

## 📋 Prerequisites
- **XAMPP** (Apache + MySQL) installed on the target machine.
- Administrator access (required to modify system files).
- Git, Node.js, and npm installed (if building the frontend from source).

---

## 🚀 Step 1: Deploy Backend & Frontend Build

1. **Build the Frontend Assets**:
   On your development machine, run the build command inside the `frontend` folder:
   ```bash
   npm run build
   ```
2. **Move files to XAMPP**:
   - Create a folder named `baesys` inside XAMPP's `htdocs` directory (usually located at `C:\xampp\htdocs\baesys\`).
   - Copy the backend API code from your repository directly into `C:\xampp\htdocs\baesys\backend\`.
   - Copy all contents of the compiled frontend `dist/` directory directly into `C:\xampp\htdocs\baesys\`.
   
   Your folder structure should look like this:
   ```
   C:\xampp\htdocs\baesys\
     ├── backend\
     │     ├── api\
     │     ├── config\
     │     └── middleware\
     ├── assets\
     ├── index.html
     └── vite.svg
   ```

---

## 🛠️ Step 2: Configure Database

1. Open the XAMPP Control Panel and start **MySQL** and **Apache**.
2. Navigate to [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/).
3. Create a database named `baesys`.
4. Import the SQL migration files (located under `database/migrations/` inside your source files) into your `baesys` database in chronological order (from `001_...` to `012_...`).
5. Open `C:\xampp\htdocs\baesys\backend\config\db.php` and verify connection parameters:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_NAME', 'baesys');
   ```

---

## 🌐 Step 3: Set Up a Custom Domain Name

To map a custom domain (e.g. `baesys.local`) to the application, we configure the local operating system domain resolution and XAMPP Virtual Hosts.

### A. Update the Windows `hosts` File
This step maps your domain to the local loopback IP address (`127.0.0.1`).

1. Open the Start menu, search for **Notepad**, right-click it, and select **Run as Administrator**.
2. Open the file `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following line at the bottom:
   ```text
   127.0.0.1    baesys.local
   ```
4. Save and close the file.

### B. Configure Apache Virtual Hosts in XAMPP
This directs Apache to serve your specific directory when `baesys.local` is requested.

1. Open the file `C:\xampp\apache\conf\extra\httpd-vhosts.conf` in a text editor.
2. Add the following VirtualHost configuration blocks at the bottom:
   ```apache
   # Ensure Apache still serves default localhost pages
   <VirtualHost *:80>
       DocumentRoot "C:/xampp/htdocs"
       ServerName localhost
   </VirtualHost>

   # Custom Virtual Host for Baesys
   <VirtualHost *:80>
       ServerName baesys.local
       DocumentRoot "C:/xampp/htdocs/baesys"
       
       <Directory "C:/xampp/htdocs/baesys">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       # Redirect all frontend routing calls to index.html for Single Page Application React Routing
       RewriteEngine On
       RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
       RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
       RewriteRule ^ - [L]
       RewriteRule ^ /index.html [L]
   </VirtualHost>
   ```
3. Save and close the file.

### C. Enable Apache Rewrite Module
Since React Router handles routing on the client side, we must enable the `mod_rewrite` Apache module so that reloading pages other than `/` works.

1. Open `C:\xampp\apache\conf\httpd.conf`.
2. Find the line:
   ```apache
   #LoadModule rewrite_module modules/mod_rewrite.so
   ```
3. Remove the `#` at the beginning of the line to uncomment it:
   ```apache
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
4. Save and close the file.
5. Restart the Apache server from the XAMPP Control Panel.

---

## 🎯 Step 4: Verification

Open a browser and navigate to:
[http://baesys.local/](http://baesys.local/)

Your Baesys site should now load cleanly using your custom domain!

---

## 💻 Setting Up on Another Laptop

To copy this configuration to another laptop:
1. **Copy the directory**: Zip and copy `C:\xampp\htdocs\baesys\` to the same location on the new laptop.
2. **Export/Import DB**: Export database schema and contents from phpMyAdmin on the first machine and import it on the new machine.
3. **Replicate Hosts & VHost Settings**: Repeat **Step 3 (A, B, and C)** on the target machine.
