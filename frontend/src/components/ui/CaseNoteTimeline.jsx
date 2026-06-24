// src/components/ui/CaseNoteTimeline.jsx
import React from 'react'

const statusStyles = {
  open: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/50',
    dot: 'bg-blue-600',
    label: 'Case Opened'
  },
  under_mediation: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50',
    dot: 'bg-amber-600',
    label: 'Under Mediation'
  },
  resolved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50',
    dot: 'bg-emerald-600',
    label: 'Resolved'
  },
  referred: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/50',
    dot: 'bg-rose-600',
    label: 'Referred to Lupon / Court'
  }
}

export default function CaseNoteTimeline({ notes = [] }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        No mediation or hearing notes logged yet.
      </div>
    )
  }

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
      {notes.map((item, idx) => {
        const style = statusStyles[item.status] || statusStyles.open

        return (
          <div key={idx} className="relative group">
            {/* Timeline Circle Node */}
            <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${style.dot}`} />

            {/* Note bubble */}
            <div className="card p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg}`}>
                    {style.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    By {item.by}
                  </span>
                </div>
                <time className="text-[10px] text-slate-400 dark:text-slate-500">
                  {formatDate(item.date)}
                </time>
              </div>

              {item.note ? (
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {item.note}
                </p>
              ) : (
                <p className="text-xs italic text-slate-400 dark:text-slate-500">
                  Status updated without additional notes.
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
