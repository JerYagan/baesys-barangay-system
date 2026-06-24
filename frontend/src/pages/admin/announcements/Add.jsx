// src/pages/admin/announcements/Add.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'

export default function AddAnnouncement() {
  const navigate = useNavigate()
  const { createAnnouncement } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e, publishNow = null) => {
    e.preventDefault()
    if (!title.trim() || !body.trim() || !category) {
      showError('Title, body, and category are required.')
      return
    }

    const publish = publishNow !== null ? publishNow : isPublished

    setSubmitting(true)
    try {
      const res = await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        category,
        is_published: publish ? 1 : 0,
      })
      if (res.success) {
        showSuccess(publish ? 'Announcement published successfully!' : 'Draft saved successfully!')
        navigate('/admin/announcements')
      } else {
        showError(res.message || 'Failed to create announcement.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/announcements"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
        >
          ➔ Back to Announcements
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Post New Announcement</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create a barangay announcement. You can save as a draft or publish immediately.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Announcement Title *</label>
            <input
              type="text"
              placeholder="e.g. Barangay Clean-up Drive this Saturday"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-xs"
              required
            />
          </div>

          <div>
            <label className="label">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input text-xs"
              required
            >
              <option value="">-- Select Category --</option>
              <option value="event">Event</option>
              <option value="advisory">Advisory</option>
              <option value="notice">Notice</option>
            </select>
          </div>

          <div>
            <label className="label">Announcement Body *</label>
            <textarea
              placeholder="Write the full content of the announcement here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="input text-xs resize-none"
              required
            />
            <p className="mt-1 text-[10px] text-slate-400">{body.length} characters</p>
          </div>

          <div className="flex items-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
            <input
              id="is-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-accent-600 focus:ring-accent-500"
            />
            <label htmlFor="is-published" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Publish immediately (visible to residents on the public portal)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, false)}
              className="btn btn-secondary btn-sm px-5"
            >
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, true)}
              className="btn btn-primary btn-sm px-6"
            >
              {submitting ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
