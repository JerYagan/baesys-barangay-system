// src/pages/admin/blotter/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'

export default function AdminBlotterList() {
  const { 
    blotters, 
    blottersTotal, 
    blottersPages, 
    blottersCurrentPage, 
    blottersLoading, 
    blottersStats, 
    fetchBlotters 
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const loadBlotters = () => {
    fetchBlotters({
      page,
      limit: 10,
      status: activeTab === 'all' ? '' : activeTab,
      search: search.trim()
    })
  }

  useEffect(() => {
    loadBlotters()
  }, [page, activeTab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    loadBlotters()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mediation & Security</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Blotter Registry</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Record and manage resident disputes, schedule mediation hearings, and resolve cases.</p>
        </div>
        
        <div>
          <Link to="/admin/blotter/add" className="btn btn-primary btn-sm">
            + Log Walk-in Complaint
          </Link>
        </div>
      </div>

      {/* Tabs list with counters */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'All Cases', count: blottersStats.total },
          { id: 'open', label: 'Open', count: blottersStats.open },
          { id: 'under_mediation', label: 'Under Mediation', count: blottersStats.under_mediation },
          { id: 'resolved', label: 'Resolved', count: blottersStats.resolved },
          { id: 'referred', label: 'Referred', count: blottersStats.referred },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-accent-600 text-accent-600 dark:text-accent-400 dark:border-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                isActive 
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300' 
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="Search by complainant or respondent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-xs"
        />
        <button type="submit" className="btn btn-secondary btn-sm px-4">
          Search
        </button>
      </form>

      {/* Data Table */}
      <div className="card overflow-hidden">
        {blottersLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="md" />
          </div>
        ) : blotters.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No cases registered</h4>
            <p className="mt-2 text-xs">No blotter records matched your filter settings.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Complainant</th>
                    <th>Respondent / Complainee</th>
                    <th>Incident Type</th>
                    <th>Incident Date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blotters.map((caseItem) => (
                    <tr key={caseItem.id}>
                      <td className="font-bold text-slate-900 dark:text-white">#{caseItem.id}</td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200">
                        {caseItem.complainant_first_name} {caseItem.complainant_last_name}
                      </td>
                      <td className="text-slate-600 dark:text-slate-400">{caseItem.respondent_name}</td>
                      <td className="font-semibold">{caseItem.incident_type}</td>
                      <td>{formatDate(caseItem.incident_date)}</td>
                      <td>
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/admin/blotter/${caseItem.id}`}
                          className="btn btn-secondary btn-xs font-semibold"
                        >
                          Process Case
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {blottersPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <Pagination
                  currentPage={blottersCurrentPage}
                  totalPages={blottersPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
