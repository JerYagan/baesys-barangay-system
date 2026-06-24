// src/pages/admin/blotter/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import CaseNoteTimeline from '../../../components/ui/CaseNoteTimeline'

export default function AdminBlotterView() {
  const { id } = useParams()
  const { 
    currentBlotter, 
    blotterDetailLoading, 
    fetchBlotterById, 
    updateBlotterStatus 
  } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  // Update status form state
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBlotterById(id)
  }, [id])

  useEffect(() => {
    if (currentBlotter) {
      setStatus(currentBlotter.status)
    }
  }, [currentBlotter])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!status) return

    setUpdating(true)
    try {
      const res = await updateBlotterStatus(id, status, note.trim())
      if (res.success) {
        showSuccess('Blotter case updated successfully!')
        setNote('')
        fetchBlotterById(id) // Reload details
      } else {
        showError(res.message || 'Failed to update case.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred.')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const decodeTimeline = (notesJson) => {
    if (!notesJson) return []
    try {
      const parsed = JSON.parse(notesJson)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  if (blotterDetailLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentBlotter) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-red-600">Error Loading Blotter Details</h2>
        <p className="text-sm text-slate-500">The requested blotter record could not be loaded.</p>
        <Link to="/admin/blotter" className="btn btn-secondary btn-sm">
          Back to Registry
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/blotter"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          ➔ Back to Registry
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Blotter Case #{currentBlotter.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentBlotter.incident_type}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Complainant: {currentBlotter.complainant_first_name} {currentBlotter.complainant_last_name} vs. {currentBlotter.respondent_name}
          </p>
        </div>

        <div className="print:hidden">
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Case Summary
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column details & timeline */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Incident Details Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Incident File Summary
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Complainant Resident</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentBlotter.complainant_first_name} {currentBlotter.complainant_last_name}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Contact: {currentBlotter.complainant_contact_no || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Respondent / Complainee</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentBlotter.respondent_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Date & Time Occurred</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatDate(currentBlotter.incident_date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Incident Location</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentBlotter.incident_location}</span>
              </div>
              {currentBlotter.witness_names && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Witnesses</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{currentBlotter.witness_names}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Description details</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap card p-3 bg-slate-50 dark:bg-navy-900/20">
                {currentBlotter.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] text-slate-400">
              <span>Recorded by User ID: {currentBlotter.filed_by || 'System'}</span>
              <span>Case Logged: {new Date(currentBlotter.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Mediation Timeline */}
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Mediation & Hearing Progress
            </h3>
            <CaseNoteTimeline notes={decodeTimeline(currentBlotter.case_notes)} />
          </div>

        </div>

        {/* Right column update form */}
        <div className="md:col-span-1 print:hidden">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Mediation Action Panel
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">Case Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input text-xs"
                  required
                >
                  <option value="open">Open</option>
                  <option value="under_mediation">Under Mediation</option>
                  <option value="resolved">Resolved</option>
                  <option value="referred">Referred (Lupon / Court)</option>
                </select>
              </div>

              <div>
                <label className="label">Mediation / Hearing Note</label>
                <textarea
                  placeholder="Record minutes of hearing, mediation schedule, or terms of dispute resolution..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  className="input text-xs resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updating || !note.trim()}
                className="w-full btn btn-primary btn-sm"
              >
                {updating ? 'Updating Case...' : 'Log Note & Update Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
