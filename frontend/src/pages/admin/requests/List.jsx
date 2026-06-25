// src/pages/admin/requests/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import Pagination from '../../../components/ui/Pagination'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import api from '../../../api/axios'

export default function DocumentRequestsList() {
  const { setPageTitle } = useUIStore()
  
  const {
    requests,
    requestsTotal,
    requestsPages,
    requestsCurrentPage,
    requestsStats,
    requestsLoading,
    fetchRequests
  } = useAdminStore()

  // Filters state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all') // 'all' | 'pending' | 'processing' | 'ready_for_pickup' | 'released'
  const [type, setType] = useState('0')
  const [page, setPage] = useState(1)

  // Document types dropdown state
  const [docTypes, setDocTypes] = useState([])
  const [typesLoading, setTypesLoading] = useState(false)

  useEffect(() => {
    setPageTitle('Document Requests')
    
    // Load document types
    setTypesLoading(true)
    api.get('/document-types/list.php')
      .then((res) => {
        if (res.data.success) {
          setDocTypes(res.data.document_types)
        }
      })
      .catch((err) => console.error('Failed to load document types', err))
      .finally(() => setTypesLoading(false))
  }, [setPageTitle])

  // Fetch requests when filters or page changes
  useEffect(() => {
    fetchRequests({ page, status, search, type: type === '0' ? '' : type })
  }, [fetchRequests, page, status, search, type])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleTypeChange = (e) => {
    setType(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Description Header */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review, update status, and generate official PDF documents for resident requests.
        </p>
      </div>

      {/* Filter Tabs Card */}
      <div className="card p-4 space-y-4">
        {/* Status Tabs with Counters */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'all', label: 'All', count: requestsStats.total },
            { id: 'pending', label: 'Pending', count: requestsStats.pending },
            { id: 'processing', label: 'Processing', count: requestsStats.processing },
            { id: 'ready_for_pickup', label: 'Ready', count: requestsStats.ready },
            { id: 'released', label: 'Released', count: requestsStats.released }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${
                status === tab.id
                  ? 'border-accent-600 text-accent-600 dark:text-accent-400 dark:border-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              <span 
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  status === tab.id 
                    ? 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {tab.count ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Document Type filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by resident name..."
              value={search}
              onChange={handleSearchChange}
              className="input pl-10!"
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={type}
              onChange={handleTypeChange}
              className="input text-sm"
              disabled={typesLoading}
            >
              <option value="0">All Document Types</option>
              {docTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Directory Table */}
      <div className="card overflow-hidden">
        {requestsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No document requests found</h3>
            <p className="text-sm text-slate-500 mt-1">There are no requests matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Date Requested</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <Link 
                        to={`/admin/residents/${req.resident_id}`}
                        className="font-semibold text-slate-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                      >
                        {req.resident_last_name}, {req.resident_first_name}
                      </Link>
                    </td>
                    <td className="font-medium text-slate-700 dark:text-slate-350">{req.document_name}</td>
                    <td className="max-w-xs truncate text-slate-500">{req.purpose}</td>
                    <td>{formatDate(req.requested_at)}</td>
                    <td className="font-semibold">
                      {parseFloat(req.document_fee) > 0 ? `₱${parseFloat(req.document_fee).toFixed(2)}` : 'FREE'}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/requests/${req.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Process Request
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-slate-100 dark:border-slate-700 px-4">
          <Pagination
            currentPage={requestsCurrentPage}
            totalPages={requestsPages}
            totalItems={requestsTotal}
            itemsPerPage={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  )
}
