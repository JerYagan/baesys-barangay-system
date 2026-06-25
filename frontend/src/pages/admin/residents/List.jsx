// src/pages/admin/residents/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import Pagination from '../../../components/ui/Pagination'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

export default function ResidentsList() {
  const { setPageTitle } = useUIStore()
  const {
    residents,
    residentsTotal,
    residentsPages,
    residentsCurrentPage,
    residentsLoading,
    fetchResidents
  } = useAdminStore()

  // Filters state
  const [search, setSearch] = useState('')
  const [purok, setPurok] = useState('')
  const [status, setStatus] = useState('active') // 'active' | 'archived' | 'all'
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPageTitle('Residents Directory')
  }, [setPageTitle])

  // Fetch residents when filters or page changes
  useEffect(() => {
    fetchResidents({ page, search, purok, status })
  }, [fetchResidents, page, status, purok, search])

  // Trigger search on debounce or manual input
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1) // Reset to first page
  }

  const handlePurokChange = (e) => {
    setPurok(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  // Calculate age from birthdate
  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return '—'
    const today = new Date()
    const birthDate = new Date(birthdateStr)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and view all registered resident profiles.
          </p>
        </div>
        <Link to="/admin/residents/add" className="btn btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Resident
        </Link>
      </div>

      {/* Filter and Tab Section */}
      <div className="card p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'all', label: 'All Residents' },
            { id: 'active', label: 'Active' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                status === tab.id
                  ? 'border-accent-600 text-accent-600 dark:text-accent-400 dark:border-accent-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Purok filter */}
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

          <div className="w-full md:w-48">
            <select
              value={purok}
              onChange={handlePurokChange}
              className="input"
            >
              <option value="">All Puroks</option>
              <option value="Purok 1">Purok 1</option>
              <option value="Purok 2">Purok 2</option>
              <option value="Purok 3">Purok 3</option>
              <option value="Purok 4">Purok 4</option>
              <option value="Purok 5">Purok 5</option>
              <option value="Purok 6">Purok 6</option>
              <option value="Purok 7">Purok 7</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="card overflow-hidden">
        {residentsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : residents.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No residents found</h3>
            <p className="text-sm text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Civil Status</th>
                  <th>Purok</th>
                  <th>Contact No.</th>
                  <th>Household No.</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    <td className="font-medium text-slate-900 dark:text-white">
                      {resident.last_name}, {resident.first_name} {resident.middle_name}
                    </td>
                    <td>{calculateAge(resident.birthdate)}</td>
                    <td>{resident.sex}</td>
                    <td>{resident.civil_status}</td>
                    <td>{resident.purok}</td>
                    <td>{resident.contact_no || '—'}</td>
                    <td>
                      {resident.household_no ? (
                        <Link 
                          to={`/admin/households/${resident.household_id}`}
                          className="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
                        >
                          {resident.household_no}
                        </Link>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Unlinked</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={resident.is_archived ? 'inactive' : 'active'} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/residents/${resident.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Profile
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
            currentPage={residentsCurrentPage}
            totalPages={residentsPages}
            totalItems={residentsTotal}
            itemsPerPage={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  )
}
