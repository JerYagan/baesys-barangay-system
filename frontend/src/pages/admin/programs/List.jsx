// src/pages/admin/programs/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

function formatCurrency(value) {
  if (value == null || value === '') return '—'
  return '₱' + parseFloat(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUS_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
]

export default function ProgramsList() {
  const { programs, programsLoading, fetchPrograms } = useAdminStore()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const params = {}
    if (activeTab !== 'all') params.status = activeTab
    fetchPrograms(params)
  }, [activeTab])

  const counts = {
    all: programs.length,
    upcoming: programs.filter(p => p.status === 'upcoming').length,
    ongoing: programs.filter(p => p.status === 'ongoing').length,
    completed: programs.filter(p => p.status === 'completed').length,
  }

  // Filter locally (data is fetched filtered, but if activeTab=all we get everything)
  const displayed = activeTab === 'all'
    ? programs
    : programs.filter(p => p.status === activeTab)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Community Development</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Programs & Projects</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track barangay projects, programs, budgets, and status updates.
          </p>
        </div>
        <Link to="/admin/programs/add" className="btn btn-primary btn-sm">
          + Add Program
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-accent-600 text-accent-600 dark:text-accent-400 dark:border-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {programsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="md" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No programs found</h4>
          <p className="mt-2 text-xs">No projects matched the selected status filter.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Budget</th>
                  <th>Beneficiaries</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((prog) => (
                  <tr key={prog.id}>
                    <td className="max-w-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{prog.name}</p>
                      {prog.description && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-48">{prog.description}</p>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={prog.status} />
                    </td>
                    <td className="text-xs">{formatDate(prog.start_date)}</td>
                    <td className="text-xs">{formatDate(prog.end_date)}</td>
                    <td className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(prog.budget)}</td>
                    <td className="text-xs text-slate-500">{prog.target_beneficiaries || '—'}</td>
                    <td className="text-right">
                      <Link
                        to={`/admin/programs/${prog.id}`}
                        className="btn btn-secondary btn-xs font-semibold"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
