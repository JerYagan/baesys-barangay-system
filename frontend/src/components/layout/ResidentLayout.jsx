import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useResidentStore } from '../../store/useResidentStore'
import { useNotifStore } from '../../store/useNotifStore'
import { logout as logoutApi } from '../../api/auth'
import ThemeToggle from '../ui/ThemeToggle'
import ConfirmDialog from '../ui/ConfirmDialog'
import api from '../../api/axios'

const navLinks = [
  { label: 'Dashboard', path: '/resident/dashboard' },
  { label: 'Request Document', path: '/resident/request/new' },
  { label: 'My Requests', path: '/resident/request/history' },
  { label: 'File Blotter', path: '/resident/blotter/new' },
  { label: 'Announcements', path: '/resident/announcements' },
]

export default function ResidentLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const addToast = useNotifStore((s) => s.addToast)
  
  const { profile, fetchProfile } = useResidentStore()
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Notification states
  const [notifications, setNotifications] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
    
    // Auto-fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close notification panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const [reqsRes, blottersRes, annRes] = await Promise.all([
        api.get('/requests/my.php'),
        api.get('/blotter/my.php'),
        api.get('/announcements/list.php?limit=5')
      ])

      const list = []

      if (reqsRes.data?.success && Array.isArray(reqsRes.data.requests)) {
        reqsRes.data.requests.forEach(req => {
          list.push({
            id: `req-${req.id}`,
            type: 'request',
            title: `Document Request: ${req.document_name}`,
            description: `Status: ${req.status.replace(/_/g, ' ')}`,
            date: new Date(req.updated_at || req.requested_at),
            link: '/resident/request/history'
          })
        })
      }

      if (blottersRes.data?.success && Array.isArray(blottersRes.data.records)) {
        blottersRes.data.records.forEach(b => {
          list.push({
            id: `blotter-${b.id}`,
            type: 'blotter',
            title: `Blotter Case #${b.case_no}`,
            description: `Status: ${b.status.replace(/_/g, ' ')}`,
            date: new Date(b.updated_at || b.created_at),
            link: '/resident/blotter/history'
          })
        })
      }

      if (annRes.data?.success && Array.isArray(annRes.data.announcements)) {
        annRes.data.announcements.forEach(ann => {
          list.push({
            id: `ann-${ann.id}`,
            type: 'announcement',
            title: `New Announcement: ${ann.title}`,
            description: ann.category.toUpperCase(),
            date: new Date(ann.created_at),
            link: '/resident/announcements'
          })
        })
      }

      // Sort by date newest first
      list.sort((a, b) => b.date - a.date)
      setNotifications(list.slice(0, 10)) // show top 10
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    setLogoutConfirmOpen(true)
  }

  const confirmLogout = async () => {
    setLogoutLoading(true)
    try { await logoutApi() } catch {}
    logout()
    addToast('success', 'Logged out')
    setLogoutConfirmOpen(false)
    navigate('/login')
  }

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '?'

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-navy-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/resident/dashboard" className="flex items-center gap-2.5">
            <img src="/images/logo-light.png" alt="Logo" className="h-8 w-8 object-contain" />
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
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger"></span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    <button 
                      onClick={fetchNotifications}
                      className="text-[10px] text-accent-600 dark:text-accent-400 hover:underline"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <Link 
                          key={n.id}
                          to={n.link}
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.description}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.date).toLocaleString()}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/resident/profile" className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-700 dark:bg-accent-600 overflow-hidden">
                {profile?.profile_path ? (
                  <img src={profile.profile_path.startsWith('/uploads') ? `/backend${profile.profile_path}` : profile.profile_path} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-white">{initials}</span>
                )}
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
    </div>
  )
}
