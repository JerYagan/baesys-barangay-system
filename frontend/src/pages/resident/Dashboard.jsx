// src/pages/resident/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifStore } from '../../store/useNotifStore'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import api from '../../api/axios'

export default function ResidentDashboard() {
  const { error: showNotifError } = useNotifStore()
  
  const [requests, setRequests] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Fetch my requests
      const requestsRes = await api.get('/requests/my.php')
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.requests)
      }

      // 2. Fetch latest announcements
      const annRes = await api.get('/announcements/list.php?limit=3')
      if (annRes.data.success) {
        setAnnouncements(annRes.data.announcements)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
      showNotifError('Failed to synchronize dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate active requests count
  const activeCount = requests.filter(r => r.status !== 'released').length
  // Find latest request status
  const latestStatus = requests.length > 0 ? requests[0].status : '—'

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resident Portal</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Resident Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your document requests and track their status online.</p>
        </div>
        
        {/* Quick-action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link to="/resident/request/new" className="btn btn-primary btn-sm shadow-sm">
            Request a Document
          </Link>
          <Link to="/resident/profile" className="btn btn-secondary btn-sm">
            View My Profile
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Requests</p>
            <div className="h-8 w-8 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center dark:bg-accent-950/30 dark:text-accent-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {loading ? '...' : activeCount}
          </p>
        </div>
        
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest Request Status</p>
            <div className="h-8 w-8 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center dark:bg-accent-950/30 dark:text-accent-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            {loading ? '...' : latestStatus === '—' ? '—' : <StatusBadge status={latestStatus} />}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Published Notices</p>
            <div className="h-8 w-8 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center dark:bg-accent-950/30 dark:text-accent-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {loading ? '...' : announcements.length}
          </p>
        </div>
      </div>

      {/* Main dashboard content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Requests Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Recent Requests</h3>
              <Link to="/resident/request/history" className="text-xs font-semibold text-accent-600 hover:underline">
                View All History
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <p className="text-sm font-medium">No requests yet</p>
                <p className="mt-1 text-xs">Your requested documents will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Requested Date</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.id}>
                        <td className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.document_name}
                        </td>
                        <td>{formatDate(req.requested_at)}</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/resident/request/${req.id}`}
                            className="btn btn-secondary btn-xs font-semibold"
                          >
                            Track
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unread/Latest Announcements */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Recent Notices</h3>
              <Link to="/resident/announcements" className="text-xs font-semibold text-accent-600 hover:underline">
                All
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No recent announcements.
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/40">
                {announcements.map((ann, i) => (
                  <div key={ann.id} className={`${i > 0 ? 'pt-4' : ''} space-y-2`}>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800">
                        {ann.category}
                      </span>
                      <span>{formatDate(ann.created_at)}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-950 dark:text-white hover:text-accent-600 transition-colors">
                      <Link to={`/resident/announcements/${ann.id}`}>{ann.title}</Link>
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
