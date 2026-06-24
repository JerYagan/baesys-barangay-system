// src/pages/public/AnnouncementsList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/ui/Spinner'

const categoryBadges = {
  advisory: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50',
  event: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50',
  notice: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50',
}

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const url = selectedCategory === 'all'
          ? '/announcements/list.php'
          : `/announcements/list.php?category=${selectedCategory}`
        const res = await api.get(url)
        if (res.data.success) {
          setAnnouncements(res.data.announcements)
        }
      } catch (err) {
        console.error('Failed to fetch announcements', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [selectedCategory])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Client-side search filter
  const filteredAnnouncements = announcements.filter((ann) => {
    const query = searchQuery.toLowerCase()
    return (
      ann.title.toLowerCase().includes(query) ||
      ann.body.toLowerCase().includes(query)
    )
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Title */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Barangay Announcements
        </h1>
        <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
          Stay updated with the latest news, advisories, and events in Barangay Baesa.
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'advisory', 'event', 'notice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all uppercase tracking-wider ${
                selectedCategory === cat
                  ? 'bg-accent-600 border-accent-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-navy-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9 pr-4 py-2 text-sm"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No announcements found</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Check back later for new updates or try refining your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((ann) => (
            <article
              key={ann.id}
              className="card flex flex-col justify-between overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="p-6">
                {/* Meta details */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${categoryBadges[ann.category]}`}>
                    {ann.category}
                  </span>
                  <time className="text-xs text-slate-400 dark:text-slate-500" dateTime={ann.created_at}>
                    {formatDate(ann.created_at)}
                  </time>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  <Link to={`/announcements/${ann.id}`}>
                    {ann.title}
                  </Link>
                </h3>

                {/* Short preview body */}
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {ann.body}
                </p>
              </div>

              {/* Card Footer action */}
              <div className="bg-slate-50 dark:bg-navy-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  By {ann.author_name || 'System Admin'}
                </span>
                <Link
                  to={`/announcements/${ann.id}`}
                  className="inline-flex items-center text-xs font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
                >
                  Read Full
                  <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
