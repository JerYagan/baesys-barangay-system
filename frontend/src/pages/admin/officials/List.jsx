// src/pages/admin/officials/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

// Static hierarchy for sorting positions
const POSITION_ORDER = [
  'Barangay Chairperson',
  'Barangay Kagawad',
  'SK Chairperson',
  'Barangay Secretary',
  'Barangay Treasurer',
]

function positionRank(position) {
  const idx = POSITION_ORDER.indexOf(position)
  return idx === -1 ? 99 : idx
}

const BACKEND_URL = '/api'

function OfficialCard({ official, backendBase }) {
  const photoSrc = official.photo_path
    ? (official.photo_path.startsWith('/uploads') ? `/backend${official.photo_path}` : official.photo_path)
    : null

  return (
    <Link
      to={`/admin/officials/${official.id}`}
      className="card p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow group"
    >
      {/* Photo avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 mb-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={`${official.first_name} ${official.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>

      <div className="flex-1 w-full">
        <p className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider mb-1">
          {official.position}
        </p>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
          HON. {official.first_name} {official.last_name}
        </h3>
        {official.contact_no && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{official.contact_no}</p>
        )}
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          Term: {official.term_start?.slice(0, 4)} – {official.term_end?.slice(0, 4)}
        </p>
        <div className="mt-3">
          <StatusBadge status={official.is_active ? 'active' : 'inactive'} size="xs" />
        </div>
      </div>
    </Link>
  )
}

export default function OfficialsList() {
  const { officials, officialsLoading, fetchOfficials } = useAdminStore()
  const [activeFilter, setActiveFilter] = useState('active') // 'active' | 'inactive' | 'all'

  useEffect(() => {
    const params = {}
    if (activeFilter !== 'all') {
      params.active = activeFilter === 'active' ? 1 : 0
    }
    fetchOfficials(params)
  }, [activeFilter])

  // Group officials by position hierarchy
  const grouped = {}
  if (officials && officials.length > 0) {
    officials.forEach((off) => {
      const pos = off.position
      if (!grouped[pos]) grouped[pos] = []
      grouped[pos].push(off)
    })
  }

  // Sort groups by hierarchy
  const sortedPositions = Object.keys(grouped).sort(
    (a, b) => positionRank(a) - positionRank(b)
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Leadership & Governance</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Barangay Officials</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Roster of elected and appointed barangay officials with term information.
          </p>
        </div>
        <Link to="/admin/officials/add" className="btn btn-primary btn-sm">
          + Register Official
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-1">
        {[
          { id: 'active', label: 'Active Officials' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'all', label: 'All' },
        ].map((tab) => {
          const isActive = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
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
      {officialsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="md" />
        </div>
      ) : officials.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No officials found</h4>
          <p className="mt-2 text-xs">No officials match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedPositions.map((position) => (
            <div key={position}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                {position}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {grouped[position].map((official) => (
                  <OfficialCard
                    key={official.id}
                    official={official}
                    backendBase={BACKEND_URL}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
