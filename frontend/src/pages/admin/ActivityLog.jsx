// src/pages/admin/ActivityLog.jsx
import { useEffect, useState } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'

export default function ActivityLog() {
  const {
    activityLogs,
    activityLogsTotal,
    activityLogsPages,
    activityLogsCurrentPage,
    activityLogsLoading,
    fetchActivityLogs,
  } = useAdminStore()

  const [searchText, setSearchText] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [page, setPage] = useState(1)

  // Fetch Activity Logs
  useEffect(() => {
    fetchActivityLogs({ page, search: searchText, action: filterAction })
  }, [page, filterAction])

  // Search filter trigger (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivityLogs({ page: 1, search: searchText, action: filterAction })
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  const formatActionName = (action) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Activity Log</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chronological audit trail of all staff and admin actions performed in the system.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search logs by operator or details..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input w-full text-xs py-2 px-3"
          />
        </div>
        <div>
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value)
              setPage(1)
            }}
            className="input text-xs py-2 w-full sm:w-auto"
          >
            <option value="">All Actions</option>
            <option value="update_settings">Update Settings</option>
            <option value="approve_user">Approve User</option>
            <option value="change_role">Change User Role</option>
            <option value="toggle_user_status">Toggle User Status</option>
            <option value="add_document_type">Add Document Type</option>
            <option value="update_document_type">Update Document Type</option>
            <option value="toggle_document_type">Toggle Document Type Status</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {activityLogsLoading ? (
        <div className="card py-12 flex justify-center"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timestamp</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Operator</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</th>
                    <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-xs text-slate-500">No activity logs recorded yet.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {log.first_name ? (
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {log.first_name} {log.last_name}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{log.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">System</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 max-w-md break-words">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-xs text-center text-slate-500 dark:text-slate-500 font-mono">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={activityLogsCurrentPage}
            totalPages={activityLogsPages}
            onPageChange={(page) => setPage(page)}
            totalItems={activityLogsTotal}
            itemsPerPage={15}
          />
        </div>
      )}
    </div>
  )
}
