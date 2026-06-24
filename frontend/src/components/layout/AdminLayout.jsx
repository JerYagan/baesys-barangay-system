// src/components/layout/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useUIStore } from '../../store/useUIStore'

export default function AdminLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 transition-colors">
      <Sidebar />
      <div className={`transition-all duration-200 ${sidebarOpen ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56') : 'ml-0'}`}>
        <Navbar />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
