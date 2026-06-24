import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotifStore } from '../../store/useNotifStore'
import { logout as logoutApi } from '../../api/auth'
import ThemeToggle from '../ui/ThemeToggle'

const navLinks = [
  { label: 'Dashboard', path: '/resident/dashboard' },
  { label: 'Request Document', path: '/resident/request/new' },
  { label: 'My Requests', path: '/resident/request/history' },
  { label: 'File Blotter', path: '/resident/blotter/new' },
  { label: 'Announcements', path: '/announcements' },
]

export default function ResidentLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const addToast = useNotifStore((s) => s.addToast)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    logout()
    addToast('success', 'Logged out')
    navigate('/login')
  }

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '?'

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-navy-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/resident/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-700 dark:bg-accent-600">
              <span className="text-xs font-bold text-white">B</span>
            </div>
            <div>
              <span className="block text-sm font-semibold leading-tight text-slate-950 dark:text-white">Baesys</span>
              <span className="block text-[11px] font-medium leading-tight text-slate-500 dark:text-slate-400">Resident Portal</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'bg-accent-700 text-white dark:bg-accent-600'
                    : 'text-slate-500 hover:bg-accent-50 hover:text-accent-800 dark:text-slate-400 dark:hover:bg-accent-950/30 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" />
            <Link to="/resident/profile" className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-700 dark:bg-accent-600">
                <span className="text-xs font-medium text-white">{initials}</span>
              </div>
              <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-300 sm:block">{user?.first_name}</span>
            </Link>
            <button onClick={handleLogout} className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-950/30" title="Logout">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="space-y-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800 lg:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-semibold ${
                  location.pathname === link.path
                    ? 'bg-accent-700 text-white dark:bg-accent-600'
                    : 'text-slate-500 hover:bg-accent-50 dark:text-slate-400 dark:hover:bg-accent-950/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
