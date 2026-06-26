// src/router/AppRouter.jsx
// React Router v6 with route guards, lazy loading, and role-based access
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { PageSpinner } from '../components/ui/Spinner'

// Layouts
import AdminLayout from '../components/layout/AdminLayout'
import ResidentLayout from '../components/layout/ResidentLayout'
import PublicLayout from '../components/layout/PublicLayout'

// Lazy-loaded pages
const Landing = lazy(() => import('../pages/public/Landing'))
const Login = lazy(() => import('../pages/public/Login'))
const Register = lazy(() => import('../pages/public/Register'))
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'))
const NotFound = lazy(() => import('../pages/public/NotFound'))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const ResidentsList = lazy(() => import('../pages/admin/residents/List'))
const AddResident = lazy(() => import('../pages/admin/residents/Add'))
const ResidentProfile = lazy(() => import('../pages/admin/residents/View'))
const HouseholdsList = lazy(() => import('../pages/admin/households/List'))
const AddHousehold = lazy(() => import('../pages/admin/households/Add'))
const HouseholdDetails = lazy(() => import('../pages/admin/households/View'))
const DocumentRequestsList = lazy(() => import('../pages/admin/requests/List'))
const DocumentRequestDetail = lazy(() => import('../pages/admin/requests/View'))

// Phase 9 — Clinic & Digital ID
const ClinicDashboard = lazy(() => import('../pages/admin/clinic/Dashboard'))
const AppointmentsManager = lazy(() => import('../pages/admin/clinic/Appointments'))

// Resident pages
const ResidentDashboard = lazy(() => import('../pages/resident/Dashboard'))
const ResidentNewRequest = lazy(() => import('../pages/resident/requests/New'))
const ResidentRequestHistory = lazy(() => import('../pages/resident/requests/History'))
const ResidentRequestDetail = lazy(() => import('../pages/resident/requests/View'))
const ResidentSelfProfile = lazy(() => import('../pages/resident/Profile'))

// Phase 9 — Clinic & Digital ID
const ClinicBooking = lazy(() => import('../pages/resident/clinic/Booking'))
const MyAppointments = lazy(() => import('../pages/resident/clinic/History'))
const DigitalID = lazy(() => import('../pages/resident/profile/DigitalID'))

// Phase 5 — Blotter pages
const ResidentNewBlotter = lazy(() => import('../pages/resident/blotter/New'))
const ResidentBlotterHistory = lazy(() => import('../pages/resident/blotter/History'))
const AdminBlotterList = lazy(() => import('../pages/admin/blotter/List'))
const AdminBlotterAdd = lazy(() => import('../pages/admin/blotter/Add'))
const AdminBlotterView = lazy(() => import('../pages/admin/blotter/View'))

// Phase 6 — Officials pages
const OfficialsList = lazy(() => import('../pages/admin/officials/List'))
const AddOfficial = lazy(() => import('../pages/admin/officials/Add'))
const OfficialProfile = lazy(() => import('../pages/admin/officials/View'))

// Phase 6 — Announcements pages
const AdminAnnouncementsList = lazy(() => import('../pages/admin/announcements/List'))
const AddAnnouncement = lazy(() => import('../pages/admin/announcements/Add'))
const EditAnnouncement = lazy(() => import('../pages/admin/announcements/Edit'))

// Phase 6 — Programs pages
const ProgramsList = lazy(() => import('../pages/admin/programs/List'))
const AddProgram = lazy(() => import('../pages/admin/programs/Add'))
const ProgramDetail = lazy(() => import('../pages/admin/programs/View'))

// Public announcements pages
const AnnouncementsList = lazy(() => import('../pages/public/AnnouncementsList'))
const AnnouncementDetail = lazy(() => import('../pages/public/AnnouncementDetail'))

// Phase 7 — Admin pages
const AdminSettings = lazy(() => import('../pages/admin/Settings'))
const AdminActivityLog = lazy(() => import('../pages/admin/ActivityLog'))

/**
 * ProtectedRoute — Checks if user is authenticated.
 * Redirects to /login if not.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * RoleGuard — Checks if user has the required role.
 * Redirects unauthorized users to their appropriate dashboard.
 */
function RoleGuard({ allowedRoles, children }) {
  const { role, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Admin always has access
  if (role === 'admin') {
    return children
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'resident') {
      return <Navigate to="/resident/dashboard" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * GuestRoute — Only accessible when NOT authenticated.
 * Redirects authenticated users to their dashboard.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, role } = useAuthStore()

  if (isAuthenticated) {
    if (role === 'admin' || role === 'staff') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/resident/dashboard" replace />
  }

  return children
}

/**
 * Suspense wrapper for lazy-loaded pages
 */
function LazyPage({ children }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

// Placeholder component for future pages
function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
          <svg className="h-7 w-7 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This page is under construction.</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  // ==========================================
  // Public Routes
  // ==========================================
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <LazyPage><Landing /></LazyPage>,
      },
      {
        path: '/login',
        element: <GuestRoute><LazyPage><Login /></LazyPage></GuestRoute>,
      },
      {
        path: '/register',
        element: <GuestRoute><LazyPage><Register /></LazyPage></GuestRoute>,
      },
      {
        path: '/forgot-password',
        element: <LazyPage><ForgotPassword /></LazyPage>,
      },
      {
        path: '/announcements',
        element: <LazyPage><AnnouncementsList /></LazyPage>,
      },
      {
        path: '/announcements/:id',
        element: <LazyPage><AnnouncementDetail /></LazyPage>,
      },
      {
        path: '/404',
        element: <LazyPage><NotFound /></LazyPage>,
      },
    ],
  },

  // ==========================================
  // Admin / Staff Routes
  // ==========================================
  {
    element: (
      <RoleGuard allowedRoles={['admin', 'staff']}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: '/admin/dashboard',
        element: <LazyPage><AdminDashboard /></LazyPage>,
      },
      // Phase 2 — Residents
      { path: '/admin/residents', element: <LazyPage><ResidentsList /></LazyPage> },
      { path: '/admin/residents/add', element: <LazyPage><AddResident /></LazyPage> },
      { path: '/admin/residents/:id', element: <LazyPage><ResidentProfile /></LazyPage> },
      // Phase 2 — Households
      { path: '/admin/households', element: <LazyPage><HouseholdsList /></LazyPage> },
      { path: '/admin/households/add', element: <LazyPage><AddHousehold /></LazyPage> },
      { path: '/admin/households/:id', element: <LazyPage><HouseholdDetails /></LazyPage> },
      // Phase 3 — Requests
      { path: '/admin/requests', element: <LazyPage><DocumentRequestsList /></LazyPage> },
      { path: '/admin/requests/:id', element: <LazyPage><DocumentRequestDetail /></LazyPage> },
      // Phase 5 — Blotter
      { path: '/admin/blotter', element: <LazyPage><AdminBlotterList /></LazyPage> },
      { path: '/admin/blotter/add', element: <LazyPage><AdminBlotterAdd /></LazyPage> },
      { path: '/admin/blotter/:id', element: <LazyPage><AdminBlotterView /></LazyPage> },
      // Phase 6 — Officials
      { path: '/admin/officials', element: <LazyPage><OfficialsList /></LazyPage> },
      { path: '/admin/officials/add', element: <LazyPage><AddOfficial /></LazyPage> },
      { path: '/admin/officials/:id', element: <LazyPage><OfficialProfile /></LazyPage> },
      // Phase 6 — Announcements
      { path: '/admin/announcements', element: <LazyPage><AdminAnnouncementsList /></LazyPage> },
      { path: '/admin/announcements/add', element: <LazyPage><AddAnnouncement /></LazyPage> },
      { path: '/admin/announcements/:id/edit', element: <LazyPage><EditAnnouncement /></LazyPage> },
      // Phase 6 — Programs
      { path: '/admin/programs', element: <LazyPage><ProgramsList /></LazyPage> },
      { path: '/admin/programs/add', element: <LazyPage><AddProgram /></LazyPage> },
      { path: '/admin/programs/:id', element: <LazyPage><ProgramDetail /></LazyPage> },
      // Phase 7 — Admin Only
      { path: '/admin/activity-log', element: <LazyPage><AdminActivityLog /></LazyPage> },
      { path: '/admin/settings', element: <LazyPage><AdminSettings /></LazyPage> },
      // Phase 9 — Clinic & Digital ID
      { path: '/admin/clinic/schedules', element: <LazyPage><ClinicDashboard /></LazyPage> },
      { path: '/admin/clinic/bookings', element: <LazyPage><AppointmentsManager /></LazyPage> },
    ],
  },

  // ==========================================
  // Resident Routes
  // ==========================================
  {
    element: (
      <RoleGuard allowedRoles={['resident']}>
        <ResidentLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: '/resident/dashboard',
        element: <LazyPage><ResidentDashboard /></LazyPage>,
      },
      // Phase 4 — Requests
      { path: '/resident/request/new', element: <LazyPage><ResidentNewRequest /></LazyPage> },
      { path: '/resident/request/history', element: <LazyPage><ResidentRequestHistory /></LazyPage> },
      { path: '/resident/request/:id', element: <LazyPage><ResidentRequestDetail /></LazyPage> },
      // Phase 5 — Blotter
      { path: '/resident/blotter/new', element: <LazyPage><ResidentNewBlotter /></LazyPage> },
      { path: '/resident/blotter/history', element: <LazyPage><ResidentBlotterHistory /></LazyPage> },
      // Profile
      { path: '/resident/profile', element: <LazyPage><ResidentSelfProfile /></LazyPage> },
      // Phase 8.1 — Announcements
      { path: '/resident/announcements', element: <LazyPage><AnnouncementsList /></LazyPage> },
      { path: '/resident/announcements/:id', element: <LazyPage><AnnouncementDetail /></LazyPage> },
      // Phase 9 — Clinic & Digital ID
      { path: '/resident/clinic/booking', element: <LazyPage><ClinicBooking /></LazyPage> },
      { path: '/resident/clinic/history', element: <LazyPage><MyAppointments /></LazyPage> },
      { path: '/resident/profile/digital-id', element: <LazyPage><DigitalID /></LazyPage> },
    ],
  },

  // ==========================================
  // Catch-all — 404
  // ==========================================
  {
    path: '*',
    element: (
      <PublicLayout />,
      <LazyPage><NotFound /></LazyPage>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
