// src/components/layout/Navbar.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { useNotifStore } from '../../store/useNotifStore'
import { logout as logoutApi } from '../../api/auth'
import StatusBadge from '../ui/StatusBadge'
import ThemeToggle from '../ui/ThemeToggle'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const logout = useAuthStore((s) => s.logout)
  const pageTitle = useUIStore((s) => s.pageTitle)
  const addToast = useNotifStore((s) => s.addToast)

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleLogout = () => {
    setLogoutConfirmOpen(true)
  }

  const confirmLogout = async () => {
    setLogoutLoading(true)
    try { await logoutApi() } catch {}
    logout()
    addToast('success', 'Logged out successfully')
    setLogoutConfirmOpen(false)
    navigate('/login')
  }

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '?'

  return (
    <>
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 lg:px-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Workspace</p>
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        <StatusBadge status={role} size="xs" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-700 ring-1 ring-accent-200 dark:bg-accent-600 dark:ring-slate-800">
            <span className="text-white text-xs font-medium">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-950/30"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
    <ConfirmDialog
      isOpen={logoutConfirmOpen}
      onClose={() => setLogoutConfirmOpen(false)}
      onConfirm={confirmLogout}
      title="Confirm Logout"
      message="Are you sure you want to log out of your session?"
      confirmText="Logout"
      variant="danger"
      loading={logoutLoading}
    />
    </>
  )
}
