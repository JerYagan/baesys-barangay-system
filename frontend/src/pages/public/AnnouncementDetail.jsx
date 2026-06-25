// src/pages/public/AnnouncementDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'

const categoryBadges = {
  advisory: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50',
  event: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50',
  notice: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50',
}

export default function AnnouncementDetail() {
  const { id } = useParams()
  const location = useLocation()
  const isResident = location.pathname.startsWith('/resident')
  const routePrefix = isResident ? '/resident/announcements' : '/announcements'

  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/announcements/get.php?id=${id}`)
        if (res.data.success) {
          setAnnouncement(res.data.announcement)
        } else {
          setError(res.data.message || 'Announcement not found.')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch announcement details.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncement()
  }, [id])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Announcement Not Found</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error || 'The requested announcement is not available.'}</p>
        <Link to={routePrefix} className="mt-6 inline-flex btn btn-secondary btn-sm">
          Back to Announcements
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Back button link */}
      <div className="mb-6">
        <Link
          to={routePrefix}
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Announcements
        </Link>
      </div>

      <article className="card p-8 sm:p-10">
        {/* Header meta */}
        <header className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border ${categoryBadges[announcement.category]}`}>
              {announcement.category}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Published on {formatDate(announcement.created_at)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {announcement.title}
          </h1>
        </header>

        {/* Content body */}
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed whitespace-pre-wrap">
          {announcement.body}
        </div>

        {/* Footer author card */}
        <footer className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>Posted by: <strong className="font-semibold text-slate-700 dark:text-slate-300">{announcement.author_name || 'System Admin'}</strong></span>
          {announcement.updated_at !== announcement.created_at && (
            <span>Updated {new Date(announcement.updated_at).toLocaleDateString()}</span>
          )}
        </footer>
      </article>
    </div>
  )
}
