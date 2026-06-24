// src/pages/admin/announcements/List.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

const CATEGORY_LABELS = {
  event: 'Event',
  advisory: 'Advisory',
  notice: 'Notice',
}

const CATEGORY_COLORS = {
  event: 'bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300',
  advisory: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  notice: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function AdminAnnouncementsList() {
  const { allAnnouncements, announcementsLoading, fetchAdminAnnouncements, deleteAnnouncement } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [activeTab, setActiveTab] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAdminAnnouncements()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const filtered = allAnnouncements.filter((a) => {
    if (activeTab === 'published') return a.is_published == 1
    if (activeTab === 'drafts') return a.is_published == 0
    return true
  })

  const totalPublished = allAnnouncements.filter((a) => a.is_published == 1).length
  const totalDrafts = allAnnouncements.filter((a) => a.is_published == 0).length

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await deleteAnnouncement(deleteTarget.id)
      if (res.success) {
        showSuccess('Announcement deleted successfully.')
        fetchAdminAnnouncements()
      } else {
        showError(res.message || 'Failed to delete announcement.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Communications</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create, publish, and manage barangay news, events, and advisories.
          </p>
        </div>
        <Link to="/admin/announcements/add" className="btn btn-primary btn-sm">
          + Post Announcement
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
        {[
          { id: 'all', label: 'All', count: allAnnouncements.length },
          { id: 'published', label: 'Published', count: totalPublished },
          { id: 'drafts', label: 'Drafts', count: totalDrafts },
        ].map((tab) => {
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

      {/* Table */}
      <div className="card overflow-hidden">
        {announcementsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No announcements found</h4>
            <p className="mt-2 text-xs">No records matched the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Date Posted</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ann) => (
                  <tr key={ann.id}>
                    <td className="max-w-xs">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{ann.title}</p>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[ann.category] || CATEGORY_COLORS.notice}`}>
                        {CATEGORY_LABELS[ann.category] || ann.category}
                      </span>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 text-xs">{ann.author_name || '—'}</td>
                    <td>
                      <StatusBadge
                        status={ann.is_published == 1 ? 'active' : 'inactive'}
                        label={ann.is_published == 1 ? 'Published' : 'Draft'}
                      />
                    </td>
                    <td className="text-xs">{formatDate(ann.created_at)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/announcements/${ann.id}/edit`}
                          className="btn btn-secondary btn-xs font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(ann)}
                          className="btn btn-xs text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Announcement"
        message={deleteTarget ? `Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
