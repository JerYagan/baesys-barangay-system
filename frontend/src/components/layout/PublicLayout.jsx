import { Outlet, Link, useLocation } from 'react-router-dom'
import ThemeToggle from '../ui/ThemeToggle'

export default function PublicLayout() {
  const location = useLocation()

  const navLinks = []

  return (
    <div className="flex min-h-screen flex-col bg-white transition-colors dark:bg-navy-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/logo-light.png" alt="Logo" className="h-8 w-8 object-contain" />
            <div>
              <span className="block text-sm font-semibold leading-tight text-slate-950 dark:text-white">Barangay Baesa</span>
              <span className="block text-[11px] font-medium leading-tight text-slate-500 dark:text-slate-400">Baesys Portal</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent-700 dark:text-accent-300'
                    : 'text-slate-500 hover:bg-accent-50 hover:text-accent-800 dark:text-slate-400 dark:hover:bg-accent-950/30 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" />

            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-accent-50 hover:text-accent-800 dark:text-slate-400 dark:hover:bg-accent-950/30 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link to="/register" className="btn btn-navy btn-sm ml-1">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-accent-700 bg-accent-900 text-slate-300 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/images/logo-light.png" alt="Logo" className="h-8 w-8 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-white">Barangay Baesa</p>
                  <p className="text-[11px] font-medium text-slate-400">Baesys Digital Portal</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                A resident-friendly portal for Barangay Baesa services, public notices, and document requests.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Quick Links</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/announcements" className="hover:text-white">Announcements</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Contact</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
                <li>22 Saklolo St., Manotoc Subdivision, Brgy. Baesa, Quezon City</li>
                <li>7-3393-122 / 0962-715-0979</li>
                <li>baesajuan4all@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Copyright {new Date().getFullYear()} Barangay Baesa. All rights reserved.</p>
            <ul className="flex gap-4">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
