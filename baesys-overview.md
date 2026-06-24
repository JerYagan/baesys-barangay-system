# Baesys — Barangay Management & Document Request System

> A simple, personal web-based system for managing barangay records, officials, blotter reports, and processing resident document requests online.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Goals & Purpose](#goals--purpose)
3. [Key Features](#key-features)
4. [User Roles](#user-roles)
5. [Tech Stack](#tech-stack)
6. [Sitemap](#sitemap)
7. [Page Descriptions](#page-descriptions)
8. [Zustand Store Design](#zustand-store-design)
9. [Database Overview](#database-overview)
10. [Project Structure](#project-structure)

---

## Project Overview

**Baesys** (Barangay Baesa System) is a lightweight, locally-hosted web application designed to help a barangay office manage resident records, officials, blotter incidents, and document requests digitally. Instead of residents lining up at the barangay hall, they can submit requests online and simply pick up the printed document when it's ready.

- **Type:** Personal / Local Government Unit (LGU) Project
- **Deployment:** Local network (XAMPP) or shared hosting
- **Target Users:** Barangay Staff, Admin & Residents

---

## Goals & Purpose

- Replace manual, paper-based document request processes with a simple online form
- Give barangay staff a centralized dashboard to manage residents, officials, and incidents
- Provide residents a way to track the status of their requests without visiting the hall
- Maintain a digital blotter log for barangay incidents and complaints
- Keep all barangay records organized and easily searchable

---

## Key Features

### For Residents
- Register and log in to a personal account
- Submit document requests online (Barangay Clearance, Indigency, Residency, etc.)
- Track request status in real time (Pending → Processing → Ready for Pickup → Released)
- View complete request history
- File a blotter complaint online
- View barangay announcements and news

### For Barangay Staff
- Manage resident profiles (add, edit, view, archive)
- Review and process incoming document requests
- Update request statuses and add notes
- Manage blotter records and case statuses
- Record and view barangay programs and projects

### For Admin
- Full access to all staff features
- Manage barangay officials and their positions
- Manage household records
- Configure document types and fees
- Manage user accounts and roles
- View audit logs and activity history

---

## User Roles

| Role | Description |
|---|---|
| **Resident** | Can register, log in, submit document requests, file blotter complaints, and view announcements |
| **Staff** | Can manage requests, residents, blotter reports, and update statuses |
| **Admin** | Full access — manages officials, households, users, settings, and audit logs |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vite + React |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Backend** | PHP (via XAMPP) |
| **Database** | MySQL (managed via phpMyAdmin) |
| **Server** | Apache (bundled with XAMPP) |
| **Auth** | PHP Sessions + JWT stored in Zustand |
| **PDF Generation** | mPDF or TCPDF (server-side document printing) |
| **Version Control** | Git + GitHub |

> **Why Zustand?** Zustand provides a minimal, boilerplate-free global state solution for React. It manages the authenticated user session, sidebar/UI state, and cached data (e.g., resident lists) across pages without the overhead of Redux or Context prop-drilling.

> **Why XAMPP?** Since this is a personal project for local barangay use, XAMPP provides a zero-cost, easy-to-set-up environment without needing a cloud server.

---

## Sitemap

```
baesys/
│
├── / ........................................... Home / Landing Page
│
├── /login ...................................... Login Page
├── /register ................................... Resident Registration Page
├── /forgot-password ............................ Forgot Password Page
│
├── /announcements .............................. Public Announcements Page
│   └── /announcements/:id ...................... Announcement Detail Page
│
├── /resident/ .................................. Resident Portal
│   ├── /resident/dashboard ..................... Resident Dashboard
│   ├── /resident/request/new ................... New Document Request Form
│   ├── /resident/request/history ............... My Request History
│   ├── /resident/request/:id ................... Request Detail & Status Tracker
│   ├── /resident/blotter/new ................... File a Blotter Complaint
│   ├── /resident/blotter/history ............... My Blotter Records
│   └── /resident/profile ....................... My Profile & Settings
│
├── /admin/ ..................................... Admin / Staff Portal
│   │
│   ├── /admin/dashboard ........................ Admin Dashboard (Overview & Stats)
│   │
│   ├── /admin/residents ........................ Resident Directory
│   ├── /admin/residents/add .................... Add New Resident
│   ├── /admin/residents/:id .................... View / Edit Resident Profile
│   │
│   ├── /admin/households ....................... Household Directory
│   ├── /admin/households/add ................... Add New Household
│   ├── /admin/households/:id ................... View / Edit Household Record
│   │
│   ├── /admin/officials ........................ Barangay Officials List
│   ├── /admin/officials/add .................... Add Official
│   ├── /admin/officials/:id .................... View / Edit Official Profile
│   │
│   ├── /admin/requests ......................... All Document Requests
│   ├── /admin/requests/:id ..................... View / Process Individual Request
│   │
│   ├── /admin/blotter .......................... Blotter Records List
│   ├── /admin/blotter/add ...................... Log New Blotter Entry
│   ├── /admin/blotter/:id ...................... View / Update Blotter Case
│   │
│   ├── /admin/announcements .................... Manage Announcements
│   ├── /admin/announcements/add ................ Post New Announcement
│   ├── /admin/announcements/:id/edit ........... Edit Announcement
│   │
│   ├── /admin/programs ......................... Barangay Programs & Projects
│   ├── /admin/programs/add ..................... Add Program / Project
│   ├── /admin/programs/:id ..................... View / Edit Program
│   │
│   ├── /admin/activity-log ..................... Audit / Activity Log (Admin only)
│   │
│   └── /admin/settings ......................... System Settings (Admin only)
│       ├── General (Barangay info)
│       ├── Document Types & Fees
│       └── User Account Management
│
└── /404 ........................................ Not Found Page
```

---

## Page Descriptions

### Public Pages

#### `/` — Landing Page
Introduces Baesys to visitors. Shows the barangay name and logo, a short description of what the system does, quick-access buttons to **Login** and **Register**, and a preview of the latest announcements. Also shows barangay contact info and office hours.

#### `/login` — Login Page
Email and password login form. Redirects to the appropriate portal based on the authenticated user's role. Shows a link to **Forgot Password** and **Register**.

#### `/register` — Registration Page
A sign-up form for new residents. Collects: Full Name, Address (Purok/Street), Contact Number, Date of Birth, and credentials (Email & Password). Newly registered accounts are set to **pending** until approved by an admin or staff.

#### `/forgot-password` — Forgot Password
Allows a user to request a password reset link via their registered email.

#### `/announcements` — Public Announcements
A public-facing list of announcements posted by the barangay (events, notices, advisories). Accessible without logging in.

#### `/announcements/:id` — Announcement Detail
Full content of a single announcement with the date posted and the name of the posting staff.

---

### Resident Portal (`/resident/*`)

#### `/resident/dashboard` — Resident Dashboard
A summary page for the logged-in resident showing: active requests and their current statuses, unread announcements, and quick-action buttons to submit a new request or file a blotter. Powered by Zustand's `useResidentStore` for cached request data.

#### `/resident/request/new` — New Document Request Form
Residents select the type of document needed:
- Barangay Clearance
- Certificate of Indigency
- Certificate of Residency
- Certificate of Good Moral Character
- Business Clearance
- First Time Job Seeker Certification

Residents fill in the **purpose** of the request. The form shows the estimated processing time and applicable fee.

#### `/resident/request/history` — Request History
A paginated table of all past and current requests with statuses and dates. Each row links to the full request detail page.

#### `/resident/request/:id` — Request Detail & Status Tracker
Shows a visual step-by-step status tracker (Pending → Processing → Ready for Pickup → Released), the document type, purpose, date filed, and any notes added by staff.

#### `/resident/blotter/new` — File a Blotter Complaint
A form for residents to submit a complaint or incident report. Fields include: type of incident, date/time it occurred, location, description, and names of persons involved. The submission is reviewed and logged by staff.

#### `/resident/blotter/history` — My Blotter Records
Shows all blotter complaints filed by the resident, with case status and the date filed.

#### `/resident/profile` — Profile & Settings
The resident can view and update personal information (address, contact number) and change their password.

---

### Admin / Staff Portal (`/admin/*`)

#### `/admin/dashboard` — Admin Dashboard
Overview cards showing key statistics: Total Residents, Total Households, Pending Requests, Open Blotter Cases, and Requests Completed This Month. Includes a Recent Activity feed and quick links to the most common tasks. Data is fetched once and cached in Zustand's `useAdminStore`.

---

#### Residents

#### `/admin/residents` — Resident Directory
Searchable, filterable table of all residents. Can filter by purok/zone, status (active/archived), or search by name. Shows a count badge per purok.

#### `/admin/residents/add` — Add New Resident
A form for staff to manually register a walk-in resident. Optionally links the resident to an existing household.

#### `/admin/residents/:id` — Resident Profile
Full profile view with all personal information, household linkage, a history of all document requests, and all related blotter records. Staff can edit info or archive the profile here.

---

#### Households

#### `/admin/households` — Household Directory
A list of all registered households grouped by purok. Shows the head of household, number of members, and address.

#### `/admin/households/add` — Add New Household
A form to register a new household, assign a household head, and link existing residents as members.

#### `/admin/households/:id` — Household Record
Displays all household members, address, and household head. Staff can add or remove members.

---

#### Officials

#### `/admin/officials` — Barangay Officials List
Displays the current set of barangay officials: Barangay Captain, Kagawads, SK officials, Secretary, and Treasurer. Shows their term of office.

#### `/admin/officials/add` — Add Official
Form to add a new official with position, term dates, and photo.

#### `/admin/officials/:id` — Official Profile
Full profile with position, term dates, contact info, and photo. Admin can edit or mark as inactive.

---

#### Document Requests

#### `/admin/requests` — All Document Requests
A sortable, filterable table of all incoming and past document requests. Filters: status, document type, date range. Counts of each status shown at the top as quick filter badges.

#### `/admin/requests/:id` — Request Detail / Processing
Full view of a single request. Staff can:
- View the requesting resident's info
- Update the status (Pending → Processing → Ready for Pickup → Released)
- Add internal notes
- Generate and print the official document as a PDF

---

#### Blotter

#### `/admin/blotter` — Blotter Records
A log of all blotter entries. Filterable by status (Open, Under Mediation, Resolved, Referred to Police) and date. Each entry links to its detail page.

#### `/admin/blotter/add` — Log New Blotter Entry
A form to manually log a blotter complaint by staff, typically for walk-in complainants.

#### `/admin/blotter/:id` — Blotter Case Detail
Full view of a blotter record including all parties involved, incident description, timeline of actions taken, and case status. Staff can update the status and add case notes.

---

#### Announcements

#### `/admin/announcements` — Manage Announcements
A list of all posted announcements with options to edit or delete. Visible to staff and admin.

#### `/admin/announcements/add` — Post New Announcement
A form with a title, body content (rich text), and category (Event, Advisory, Notice).

#### `/admin/announcements/:id/edit` — Edit Announcement
Edit an existing announcement's content, category, or visibility.

---

#### Programs & Projects

#### `/admin/programs` — Barangay Programs & Projects
A list of barangay programs, livelihood projects, and community events. Each entry shows its name, status (Ongoing, Completed, Upcoming), and target beneficiaries.

#### `/admin/programs/add` — Add Program / Project
A form to log a new barangay program with name, description, budget (optional), start and end dates, and status.

#### `/admin/programs/:id` — Program Detail
Full view of a program record. Admin can edit details or mark it as completed.

---

#### Admin-Only Pages

#### `/admin/activity-log` — Audit / Activity Log
A chronological log of all system actions: logins, status changes, record edits, and deletions. Shows who did what and when. Read-only; accessible by Admin only.

#### `/admin/settings` — System Settings
Organized into three tabs:
- **General** — Barangay name, address, contact info, logo upload
- **Document Types & Fees** — Add, edit, or disable document types and set their fees and processing times
- **User Accounts** — View all registered user accounts, approve pending registrations, change roles, or deactivate accounts

---

## Zustand Store Design

Zustand stores are defined in `src/store/` and shared across pages to avoid redundant API calls and prop-drilling.

```
src/store/
├── useAuthStore.js        — Logged-in user, role, JWT token, login/logout actions
├── useResidentStore.js    — Resident's own requests, blotter records, profile data
├── useAdminStore.js       — Dashboard stats, residents list, requests list (paginated cache)
├── useUIStore.js          — Sidebar open/close state, active nav item, modal states
└── useNotifStore.js       — Toast/notification queue (success, error, info messages)
```

### Example: `useAuthStore`

```js
// src/store/useAuthStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setAuth: (user, token) => set({ user, token, role: user.role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    { name: 'baesys-auth' } // persisted to localStorage
  )
)
```

### Example: `useUIStore`

```js
// src/store/useUIStore.js
import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeModal: null,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}))
```

---

## Database Overview

### Tables

```
users
  id, email, password_hash, role (resident|staff|admin), status (pending|active|inactive), created_at

residents
  id, user_id (FK), first_name, last_name, middle_name, birthdate, sex,
  civil_status, contact_no, purok, address, household_id (FK), is_archived, created_at

households
  id, household_no, head_resident_id (FK), address, purok, created_at

officials
  id, first_name, last_name, position, term_start, term_end, contact_no,
  photo_path, is_active, created_at

document_types
  id, name, description, fee, processing_days, is_active

document_requests
  id, resident_id (FK), document_type_id (FK), purpose, status
  (pending|processing|ready_for_pickup|released), notes, processed_by (FK users),
  requested_at, updated_at

blotter_records
  id, complainant_id (FK residents), respondent_name, incident_type,
  incident_date, incident_location, description, status
  (open|under_mediation|resolved|referred), case_notes, filed_by (FK users),
  created_at, updated_at

announcements
  id, title, body, category (event|advisory|notice), posted_by (FK users),
  is_published, created_at, updated_at

programs
  id, name, description, status (upcoming|ongoing|completed),
  start_date, end_date, budget, created_at

activity_logs
  id, user_id (FK), action, target_table, target_id, details, created_at
```

### Status Flows

```
Document Requests:  pending → processing → ready_for_pickup → released
Blotter Cases:      open → under_mediation → resolved  (or)  open → referred
User Accounts:      pending → active  (or)  active → inactive
```

---

## Project Structure

```
baesys/
│
├── frontend/                        # Vite + React project
│   ├── public/
│   │   └── baesys-logo.png
│   ├── src/
│   │   ├── api/                     # Axios API helpers
│   │   │   ├── auth.js
│   │   │   ├── residents.js
│   │   │   ├── requests.js
│   │   │   ├── blotter.js
│   │   │   ├── officials.js
│   │   │   ├── households.js
│   │   │   ├── announcements.js
│   │   │   └── programs.js
│   │   ├── components/              # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── ResidentLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── ui/
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   └── shared/
│   │   │       ├── ResidentCard.jsx
│   │   │       └── RequestStatusTracker.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Announcements.jsx
│   │   │   │   └── AnnouncementDetail.jsx
│   │   │   ├── resident/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── NewRequest.jsx
│   │   │   │   ├── RequestHistory.jsx
│   │   │   │   ├── RequestDetail.jsx
│   │   │   │   ├── NewBlotter.jsx
│   │   │   │   ├── BlotterHistory.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── residents/
│   │   │       ├── households/
│   │   │       ├── officials/
│   │   │       ├── requests/
│   │   │       ├── blotter/
│   │   │       ├── announcements/
│   │   │       ├── programs/
│   │   │       ├── ActivityLog.jsx
│   │   │       └── Settings.jsx
│   │   ├── store/                   # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useResidentStore.js
│   │   │   ├── useAdminStore.js
│   │   │   ├── useUIStore.js
│   │   │   └── useNotifStore.js
│   │   ├── router/
│   │   │   └── AppRouter.jsx        # React Router v6 routes + role guards
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── backend/                         # PHP REST API (htdocs/baesys-api/)
│   ├── config/
│   │   └── db.php
│   ├── middleware/
│   │   └── auth.php                 # JWT verification middleware
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   └── logout.php
│   │   ├── residents/
│   │   ├── households/
│   │   ├── officials/
│   │   ├── requests/
│   │   ├── blotter/
│   │   ├── announcements/
│   │   ├── programs/
│   │   ├── activity-log/
│   │   └── settings/
│   └── templates/                   # mPDF document templates
│       ├── clearance.php
│       ├── indigency.php
│       ├── residency.php
│       └── business_clearance.php
│
└── database/
    └── baesys.sql                   # Full schema + seed data
```

---

*Baesys — Built for the barangay, by the community.*
