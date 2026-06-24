import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'
import { useAdminStore } from '../../store/useAdminStore'

const icons = {
  residents: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  households: 'M3 12l9-8 9 8M5 10.5V20a1 1 0 001 1h12a1 1 0 001-1v-9.5M9 21v-6h6v6',
  requests: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z',
  blotters: 'M12 9v3.75m0 3.75h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

function MetricIcon({ type }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={icons[type]} />
    </svg>
  )
}

export default function AdminDashboard() {
  const { setPageTitle } = useUIStore()
  const { dashboardStats, fetchDashboardStats, statsLoading } = useAdminStore()

  useEffect(() => {
    setPageTitle('Dashboard')
    fetchDashboardStats()
  }, [setPageTitle, fetchDashboardStats])

  const statCards = [
    { label: 'Total Residents', value: dashboardStats.totalResidents, icon: 'residents', tone: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800' },
    { label: 'Households', value: dashboardStats.totalHouseholds, icon: 'households', tone: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40' },
    { label: 'Pending Requests', value: dashboardStats.pendingRequests, icon: 'requests', tone: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40' },
    { label: 'Open Blotters', value: dashboardStats.openBlotters, icon: 'blotters', tone: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/40' },
  ]

  const quickActions = [
    { label: 'Add New Resident', path: '/admin/residents/add', desc: 'Register a walk-in resident' },
    { label: 'Process Requests', path: '/admin/requests', desc: 'Review pending document requests' },
    { label: 'Post Announcement', path: '/admin/announcements/add', desc: 'Share news with the community' },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Barangay operations</h1>
        </div>
        <Link to="/admin/residents/add" className="btn btn-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Resident
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {statsLoading ? '-' : card.value}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${card.tone}`}>
                <MetricIcon type={card.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Recent Activity</h3>
          </div>
          <div className="flex min-h-72 items-center justify-center px-5 py-12 text-slate-400 dark:text-slate-500">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                <MetricIcon type="clock" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No activity to show yet</p>
              <p className="mt-1 text-xs text-slate-500">System activity will appear here when available.</p>
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Quick Actions</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{action.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
                </div>
                <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
