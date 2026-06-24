# Baesys — Phase Implementation Plan

> A step-by-step development roadmap for building the Baesys Barangay Management System from scratch to a fully working personal project.

---

## Overview

| Phase | Name | Focus | Est. Duration |
|---|---|---|---|
| **Phase 0** | Project Setup | Environment, tooling, database scaffold | 1–2 days |
| **Phase 1** | Foundation | Auth, routing, layouts, Zustand stores | 3–5 days |
| **Phase 2** | Core Admin — Records | Residents & Households CRUD | 5–7 days |
| **Phase 3** | Document Requests | Request submission, processing, PDF output | 5–7 days |
| **Phase 4** | Resident Portal | Resident-facing pages and request tracking | 4–5 days |
| **Phase 5** | Blotter System | Blotter filing, management, case tracking | 3–4 days |
| **Phase 6** | Officials, Announcements & Programs | Remaining admin modules | 4–5 days |
| **Phase 7** | Admin Controls | Activity log, settings, user management | 3–4 days |
| **Phase 8** | Polish & QA | UI cleanup, testing, bug fixes, deployment | 3–5 days |

**Total Estimated Duration:** 6–9 weeks (solo developer, part-time pace)

---

## Phase 0 — Project Setup

**Goal:** Get a working local development environment with a connected frontend and backend before writing any feature code.

### Checklist

#### Environment
- [ ] Install XAMPP and verify Apache + MySQL are running
- [ ] Create the project root folder (`baesys/`) inside `htdocs/`
- [ ] Scaffold `frontend/` and `backend/` directories

#### Frontend
- [ ] Initialize Vite + React project inside `frontend/`
  ```bash
  npm create vite@latest frontend -- --template react
  cd frontend && npm install
  ```
- [ ] Install core dependencies
  ```bash
  npm install zustand react-router-dom axios tailwindcss
  npx tailwindcss init
  ```
- [ ] Configure `tailwind.config.js` and import Tailwind in `index.css`
- [ ] Set up `vite.config.js` with a proxy to the PHP backend
  ```js
  server: { proxy: { '/api': 'http://localhost/baesys/backend' } }
  ```
- [ ] Create placeholder `App.jsx` that renders "Baesys is running"

#### Backend
- [ ] Create `backend/config/db.php` with MySQL connection
- [ ] Create `backend/api/ping.php` to verify the PHP-to-MySQL connection
- [ ] Enable CORS headers in PHP for local development
- [ ] Test the Vite proxy: call `/api/ping` from the frontend and confirm a response

#### Database
- [ ] Create the `baesys` MySQL database in phpMyAdmin
- [ ] Write and run `baesys.sql` with all table schemas:
  - `users`, `residents`, `households`, `officials`
  - `document_types`, `document_requests`
  - `blotter_records`, `announcements`, `programs`, `activity_logs`
- [ ] Seed a default admin account and a few document types

#### Version Control
- [ ] Initialize Git repository
- [ ] Create `.gitignore` (exclude `node_modules/`, `.env`, `vendor/`)
- [ ] Make initial commit: `"chore: project scaffold"`

### Deliverable
A running Vite dev server that can ping a PHP endpoint backed by a MySQL database. No UI features yet.

---

## Phase 1 — Foundation

**Goal:** Build the structural skeleton of the app — authentication, routing, layouts, and Zustand stores. Every later feature plugs into this.

### Checklist

#### Zustand Stores
- [ ] `useAuthStore.js` — user, token, role, `setAuth()`, `logout()`, persisted via `zustand/middleware/persist`
- [ ] `useUIStore.js` — sidebar toggle, active modal, page title
- [ ] `useNotifStore.js` — toast queue with `addToast()`, `removeToast()`
- [ ] `useResidentStore.js` — stub only (populated in Phase 4)
- [ ] `useAdminStore.js` — stub only (populated in Phase 2)

#### Backend — Auth API
- [ ] `POST /api/auth/register.php` — create user with `pending` status, hash password
- [ ] `POST /api/auth/login.php` — verify credentials, return JWT token + user info
- [ ] `POST /api/auth/logout.php` — invalidate session / confirm logout
- [ ] `auth.php` middleware — decode and verify JWT on protected routes
- [ ] `GET /api/auth/me.php` — return current user from token

#### Frontend — Auth Pages
- [ ] `/login` — Login page with email/password form, calls login API, saves to `useAuthStore`, redirects by role
- [ ] `/register` — Registration form, submits to register API, shows pending approval notice
- [ ] `/forgot-password` — Static form UI (email input); backend email sending is optional for personal use

#### Frontend — Routing
- [ ] Set up `AppRouter.jsx` with React Router v6
- [ ] Define all routes as placeholders (lazy-loaded pages with `<Suspense>`)
- [ ] Create `ProtectedRoute` component — checks `useAuthStore` role before rendering
- [ ] Create `RoleGuard` wrapper — redirects unauthorized roles to `/login`
- [ ] Add `/404` not found catch-all route

#### Frontend — Layouts
- [ ] `AdminLayout.jsx` — sidebar + topbar shell for all `/admin/*` pages
- [ ] `ResidentLayout.jsx` — top navbar + content shell for all `/resident/*` pages
- [ ] `PublicLayout.jsx` — minimal header/footer for public pages
- [ ] `Sidebar.jsx` — collapsible nav links grouped by section, driven by `useUIStore`
- [ ] `Navbar.jsx` — user avatar, role badge, logout button

#### Shared UI Components
- [ ] `Toast.jsx` — reads from `useNotifStore`, auto-dismisses
- [ ] `Modal.jsx` — generic overlay, controlled by `useUIStore`
- [ ] `ConfirmDialog.jsx` — "Are you sure?" modal with confirm/cancel
- [ ] `StatusBadge.jsx` — colored chip for request/blotter/account statuses
- [ ] `Spinner.jsx` — loading indicator for async operations

### Deliverable
Working login/register flow. Authenticated users land on a stubbed dashboard. Role-based route protection works. Toast notifications fire. Sidebar toggles.

---

## Phase 2 — Core Admin Records

**Goal:** Build the most foundational data modules — Residents and Households — since almost every other feature references them.

### Checklist

#### Backend — Residents API
- [ ] `GET /api/residents/list.php` — paginated, searchable, filterable by purok/status
- [ ] `GET /api/residents/get.php?id=` — single resident with household info
- [ ] `POST /api/residents/add.php` — create new resident record
- [ ] `PUT /api/residents/update.php` — edit resident info
- [ ] `PATCH /api/residents/archive.php` — soft-delete (toggle `is_archived`)
- [ ] All endpoints protected by `auth.php` middleware (staff/admin only)

#### Backend — Households API
- [ ] `GET /api/households/list.php` — list all households with member count
- [ ] `GET /api/households/get.php?id=` — single household with members list
- [ ] `POST /api/households/add.php` — create household, set head
- [ ] `PUT /api/households/update.php` — edit household or reassign head
- [ ] `POST /api/households/add-member.php` — link a resident to a household
- [ ] `DELETE /api/households/remove-member.php` — unlink resident from household

#### Frontend — Residents
- [ ] `/admin/residents` — searchable data table with pagination; columns: Name, Purok, Contact, Status; archive badge
- [ ] `/admin/residents/add` — form: first/last/middle name, birthdate, sex, civil status, address, purok, contact, household link (optional)
- [ ] `/admin/residents/:id` — profile view with tabs: Info, Document History, Blotter Records; edit button opens inline form; archive toggle with `ConfirmDialog`

#### Frontend — Households
- [ ] `/admin/households` — list grouped by purok, each row shows head name and member count
- [ ] `/admin/households/add` — form: address, purok, head of household (search resident dropdown)
- [ ] `/admin/households/:id` — shows head + member list; button to add existing resident as member; remove member button

#### Zustand — `useAdminStore`
- [ ] Add `residents` list state + `fetchResidents()` action (cached, cleared on archive/update)
- [ ] Add `households` list state + `fetchHouseholds()` action

### Deliverable
Staff can fully manage resident and household records through the admin portal. Data persists in MySQL. Resident profiles are searchable.

---

## Phase 3 — Document Requests

**Goal:** The core feature of Baesys — allow residents to request documents online and staff to process them with PDF output.

### Checklist

#### Backend — Document Types
- [ ] `GET /api/document-types/list.php` — return all active document types with fees
- [ ] Admin-only CRUD for document types (used in Phase 7 Settings)

#### Backend — Document Requests API
- [ ] `POST /api/requests/create.php` — resident submits a new request
- [ ] `GET /api/requests/list.php` — admin/staff: all requests, filterable by status, type, date
- [ ] `GET /api/requests/my.php` — resident: their own requests only
- [ ] `GET /api/requests/get.php?id=` — single request detail
- [ ] `PATCH /api/requests/update-status.php` — staff updates status + optional note; logs to `activity_logs`
- [ ] All status changes are appended as timestamped history entries

#### Backend — PDF Generation
- [ ] Install mPDF via Composer: `composer require mpdf/mpdf`
- [ ] `GET /api/requests/generate-pdf.php?id=` — renders the correct template and streams a PDF
- [ ] Create PHP templates for each document type:
  - `templates/clearance.php`
  - `templates/indigency.php`
  - `templates/residency.php`
  - `templates/good_moral.php`
  - `templates/business_clearance.php`
  - `templates/first_time_jobseeker.php`
- [ ] Templates auto-populate resident name, address, purpose, and barangay official signature block

#### Frontend — Admin Requests
- [ ] `/admin/requests` — table with filter tabs by status (All / Pending / Processing / Ready / Released); badge count per tab
- [ ] `/admin/requests/:id` — two-column layout: left shows request info and resident summary; right shows status updater dropdown + notes textarea + update button; "Generate PDF" button opens/downloads the PDF

#### Frontend — Shared Component
- [ ] `RequestStatusTracker.jsx` — horizontal stepper component showing the 4 status stages, highlights current step; used in both admin and resident views

#### Zustand — `useAdminStore`
- [ ] Add `requests` list + `fetchRequests()` + `updateRequestStatus()` action

### Deliverable
Staff can view, filter, process, and generate PDF documents for all requests. The full status workflow is functional end-to-end.

---

## Phase 4 — Resident Portal

**Goal:** Build all resident-facing pages so residents can use the system independently without visiting the barangay hall.

### Checklist

#### Frontend — Resident Dashboard
- [ ] `/resident/dashboard` — summary cards: Active Requests, Latest Status, Unread Announcements; quick-action buttons; recent request rows

#### Frontend — Document Requests (Resident Side)
- [ ] `/resident/request/new` — multi-step form:
  - Step 1: Select document type (cards with name, fee, processing time)
  - Step 2: Fill in purpose / additional details
  - Step 3: Review and confirm
- [ ] `/resident/request/history` — paginated table of all requests, status badge, date; links to detail
- [ ] `/resident/request/:id` — `RequestStatusTracker` at the top, request metadata below, staff notes (if any) shown as a note block

#### Frontend — Profile
- [ ] `/resident/profile` — two sections:
  - Personal Info (read-only view, with "Request Edit" note or editable fields)
  - Change Password form (current password + new password + confirm)

#### Frontend — Public Announcements
- [ ] `/announcements` — card grid of published announcements, sorted by newest; category filter chips (Event / Advisory / Notice)
- [ ] `/announcements/:id` — full announcement body, posted date, posted by name; "Back to Announcements" link

#### Landing Page
- [ ] `/` — hero section with barangay name/logo, system tagline, Login/Register buttons; latest 3 announcements preview; barangay contact info and office hours section; footer

#### Zustand — `useResidentStore`
- [ ] `myRequests` list + `fetchMyRequests()` action
- [ ] `myBlotters` list (populated in Phase 5)
- [ ] `profile` object + `fetchProfile()` action

### Deliverable
A resident can register, log in, submit a document request, and track it through its lifecycle via the resident portal. The public landing page and announcements are live.

---

## Phase 5 — Blotter System

**Goal:** Add the barangay blotter module — both the resident-facing complaint form and the admin case management interface.

### Checklist

#### Backend — Blotter API
- [ ] `POST /api/blotter/create.php` — resident or staff files a new blotter entry
- [ ] `GET /api/blotter/list.php` — admin/staff: all records, filterable by status and date
- [ ] `GET /api/blotter/my.php` — resident: their own filed complaints
- [ ] `GET /api/blotter/get.php?id=` — single blotter record full detail
- [ ] `PATCH /api/blotter/update.php` — staff updates status and appends case notes; logs to `activity_logs`

#### Frontend — Resident Blotter
- [ ] `/resident/blotter/new` — form fields: incident type (dropdown), date/time occurred, location, detailed description, respondent name(s), witness names (optional); submission confirmation dialog
- [ ] `/resident/blotter/history` — table of filed complaints with case status badge and date; links to detail view (read-only for residents)

#### Frontend — Admin Blotter
- [ ] `/admin/blotter` — data table with status filter tabs (Open / Under Mediation / Resolved / Referred); search by complainant name or incident type
- [ ] `/admin/blotter/add` — walk-in blotter form for staff; same fields as resident form but with additional "filed by staff on behalf" note
- [ ] `/admin/blotter/:id` — full case view: all parties, incident details, timestamped case notes history; status updater with note input; print/export option

#### Shared Component
- [ ] `CaseNoteTimeline.jsx` — vertical timeline of notes and status changes for a blotter record

#### Zustand — `useResidentStore`
- [ ] Populate `myBlotters` + `fetchMyBlotters()` action

### Deliverable
Residents can file blotter complaints online. Staff can manage cases, update statuses, and append notes. Full case history is maintained per record.

---

## Phase 6 — Officials, Announcements & Programs

**Goal:** Build the remaining admin content modules that round out the system.

### Checklist

#### Backend — Officials API
- [ ] `GET /api/officials/list.php` — all officials, filterable by `is_active`
- [ ] `GET /api/officials/get.php?id=`
- [ ] `POST /api/officials/add.php` — with photo upload handling
- [ ] `PUT /api/officials/update.php`
- [ ] `PATCH /api/officials/toggle-active.php`

#### Backend — Announcements API
- [ ] `GET /api/announcements/list.php` — public: published only; admin: all including drafts
- [ ] `GET /api/announcements/get.php?id=`
- [ ] `POST /api/announcements/add.php` — staff/admin only
- [ ] `PUT /api/announcements/update.php`
- [ ] `DELETE /api/announcements/delete.php`

#### Backend — Programs API
- [ ] `GET /api/programs/list.php`
- [ ] `GET /api/programs/get.php?id=`
- [ ] `POST /api/programs/add.php`
- [ ] `PUT /api/programs/update.php`

#### Frontend — Officials
- [ ] `/admin/officials` — card grid layout showing photo, name, and position; active/inactive filter; sorted by position hierarchy
- [ ] `/admin/officials/add` — form with photo upload, name, position (dropdown), term start/end, contact number
- [ ] `/admin/officials/:id` — profile card with all info; edit form; toggle active status button

#### Frontend — Announcements
- [ ] `/admin/announcements` — table with title, category, published status, date; toggle publish/unpublish inline
- [ ] `/admin/announcements/add` — form: title, category, body (textarea), publish toggle
- [ ] `/admin/announcements/:id/edit` — pre-filled edit form

#### Frontend — Programs & Projects
- [ ] `/admin/programs` — table with program name, status badge, date range; filter by status
- [ ] `/admin/programs/add` — form: name, description, status, start date, end date, budget (optional), target beneficiaries
- [ ] `/admin/programs/:id` — full detail view with edit form and status update

### Deliverable
Barangay officials are listed and manageable. Announcements can be drafted and published. Programs and projects are trackable. The public announcements pages are fully functional.

---

## Phase 7 — Admin Controls

**Goal:** Add system-level control pages — settings, user account management, and the audit log.

### Checklist

#### Backend — Settings API
- [ ] `GET /api/settings/get.php` — return all settings as key-value pairs
- [ ] `PUT /api/settings/update.php` — update one or many settings

#### Backend — Document Types CRUD (Settings)
- [ ] `POST /api/document-types/add.php`
- [ ] `PUT /api/document-types/update.php`
- [ ] `PATCH /api/document-types/toggle.php` — enable/disable a type

#### Backend — User Management
- [ ] `GET /api/users/list.php` — admin only; all user accounts with role and status
- [ ] `PATCH /api/users/approve.php` — approve a pending registration
- [ ] `PATCH /api/users/change-role.php` — assign staff/admin role
- [ ] `PATCH /api/users/toggle-active.php` — activate or deactivate account

#### Backend — Activity Log
- [ ] `GET /api/activity-log/list.php` — paginated log, filterable by user and action type
- [ ] Ensure all status-changing endpoints in Phases 2–6 write to `activity_logs`

#### Frontend — Settings Page
- [ ] `/admin/settings` — tabbed layout with three tabs:

  **Tab 1 — General**
  - Barangay name, address, contact number, email, office hours
  - Logo upload
  - Save button writes to `settings` table

  **Tab 2 — Document Types & Fees**
  - Table of document types with inline fee and processing day editors
  - Toggle active/inactive per type
  - "Add Document Type" button opens a modal form

  **Tab 3 — User Accounts**
  - Table of all registered users with role badge and status
  - "Approve" button for pending accounts
  - Role change dropdown
  - Deactivate toggle with `ConfirmDialog`

#### Frontend — Activity Log
- [ ] `/admin/activity-log` — chronological table: timestamp, user, action description, affected record; search by user or date range; read-only

### Deliverable
Admin can fully control system settings, document type configuration, and user accounts. A complete, searchable audit trail is available.

---

## Phase 8 — Polish & QA

**Goal:** Tighten up the entire application — fix bugs, improve UX, write basic tests, and prepare for local deployment.

### Checklist

#### UI & UX Polish
- [ ] Ensure consistent spacing, font sizes, and color usage across all pages
- [ ] Add empty state illustrations/messages to all tables when data is absent
- [ ] Add loading skeletons to tables and dashboards while data fetches
- [ ] Confirm all `StatusBadge` colors match across admin and resident views
- [ ] Verify sidebar active state highlights correctly on all routes
- [ ] Make all forms show validation errors inline (required fields, format checks)
- [ ] Add character/word limits where appropriate (e.g., blotter description)
- [ ] Verify mobile responsiveness on the resident portal and public pages

#### Error Handling
- [ ] All Axios calls wrapped in try/catch with toast error messages via `useNotifStore`
- [ ] PHP API returns consistent JSON error responses: `{ success: false, message: "..." }`
- [ ] 401 Unauthorized responses from PHP auto-trigger logout in `useAuthStore`
- [ ] `/404` page displays correctly for all unmatched routes

#### Security Checks
- [ ] All PHP endpoints validate JWT before processing
- [ ] Role checks enforced server-side (not just frontend route guards)
- [ ] Passwords hashed with `password_hash()` / verified with `password_verify()`
- [ ] SQL queries use prepared statements throughout (no raw string concatenation)
- [ ] File uploads (official photos) validated for type and size server-side

#### Testing
- [ ] Manually test all happy-path flows per user role:
  - Resident: register → request document → track status → file blotter
  - Staff: approve user → process request → update blotter
  - Admin: manage officials → post announcement → change settings
- [ ] Test edge cases: duplicate email on register, request for archived resident, invalid JWT
- [ ] Test PDF generation for all document types

#### Deployment (Local / LAN)
- [ ] Confirm XAMPP Apache and MySQL auto-start on boot
- [ ] Build the Vite frontend: `npm run build`
- [ ] Copy `dist/` output to `htdocs/baesys/` (or configure Apache to serve it)
- [ ] Update `vite.config.js` base path if serving from a subfolder
- [ ] Test the full system on a second device on the same LAN
- [ ] Export and backup `baesys.sql` with seed data

#### Documentation
- [ ] Update `README.md` with: setup steps, XAMPP configuration, how to run the frontend, default admin credentials
- [ ] Add inline comments to complex PHP endpoints and Zustand stores
- [ ] Tag the final commit: `git tag v1.0.0`

### Deliverable
A complete, working, locally deployable Barangay Management System. All modules functional, UI consistent, and code reasonably secure for a personal/LAN project.

---

## Summary Timeline

```
Week 1    [Phase 0 + Phase 1]   Setup, Auth, Routing, Zustand, Layouts
Week 2    [Phase 2]             Residents & Households CRUD
Week 3    [Phase 3]             Document Requests & PDF Generation
Week 4    [Phase 4]             Resident Portal & Landing Page
Week 5    [Phase 5]             Blotter System
Week 6    [Phase 6]             Officials, Announcements & Programs
Week 7    [Phase 7]             Settings, User Management & Activity Log
Week 8–9  [Phase 8]             Polish, QA, Testing & Local Deployment
```

---

## Development Tips

- **Build backend first, frontend second** for each feature. Confirm the API works in the browser or a REST client (like Hoppscotch) before wiring up the React side.
- **Commit after each page or feature**, not at the end of a phase. Smaller commits make bugs easier to trace.
- **Don't skip the Zustand stubs** in Phase 1. Defining the store shape early prevents refactoring later when pages start sharing state.
- **PDF templates are tedious** — save them for last within Phase 3. Get the status flow working first, then style the PDFs.
- **Phase 8 always takes longer than expected.** Budget an extra day or two for polish.

---

*Baesys — Built for the barangay, by the community.*
