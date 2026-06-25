// src/pages/admin/households/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import Pagination from '../../../components/ui/Pagination'
import Spinner from '../../../components/ui/Spinner'

export default function HouseholdsList() {
  const { setPageTitle } = useUIStore()
  
  const {
    households,
    householdsTotal,
    householdsPages,
    householdsCurrentPage,
    householdsLoading,
    fetchHouseholds
  } = useAdminStore()

  // Filters state
  const [search, setSearch] = useState('')
  const [purok, setPurok] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPageTitle('Households Directory')
  }, [setPageTitle])

  // Fetch households when page or filters change
  useEffect(() => {
    fetchHouseholds({ page, search, purok })
  }, [fetchHouseholds, page, search, purok])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handlePurokChange = (e) => {
    setPurok(e.target.value)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage the registry of families and household units in the barangay.
          </p>
        </div>
        <Link to="/admin/households/add" className="btn btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Household
        </Link>
      </div>

      {/* Filters Section */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by household no. or address..."
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

      {/* Households Table */}
      <div className="card overflow-hidden">
        {householdsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : households.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No households found</h3>
            <p className="text-sm text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Household No.</th>
                  <th>Purok</th>
                  <th>Address</th>
                  <th>Head of Household</th>
                  <th>Member Count</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {households.map((hh) => (
                  <tr key={hh.id}>
                    <td className="font-semibold text-slate-900 dark:text-white">
                      {hh.household_no}
                    </td>
                    <td>{hh.purok}</td>
                    <td className="max-w-xs truncate">{hh.address}</td>
                    <td>
                      {hh.head_resident_id ? (
                        <Link 
                          to={`/admin/residents/${hh.head_resident_id}`}
                          className="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
                        >
                          {hh.head_last_name}, {hh.head_first_name}
                        </Link>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">None Assigned</span>
                      )}
                    </td>
                    <td className="font-medium">{hh.member_count} members</td>
                    <td className="text-right">
                      <Link
                        to={`/admin/households/${hh.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Record
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
            currentPage={householdsCurrentPage}
            totalPages={householdsPages}
            totalItems={householdsTotal}
            itemsPerPage={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  )
}
