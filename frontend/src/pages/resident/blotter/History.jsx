// src/pages/resident/blotter/History.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useResidentStore } from '../../../store/useResidentStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import CaseNoteTimeline from '../../../components/ui/CaseNoteTimeline'

export default function BlotterHistory() {
  const { myBlotters, myBlottersLoading, fetchMyBlotters } = useResidentStore()
  
  // Selected blotter for modal viewing
  const [selectedCase, setSelectedCase] = useState(null)

  useEffect(() => {
    fetchMyBlotters()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const decodeNotes = (notesJson) => {
    if (!notesJson) return []
    try {
      const parsed = JSON.parse(notesJson)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  return (
    <div className="space-y-6 py-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Blotter & Complaints</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Filed Complaints</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View status updates and hearing schedule logs for reports you have filed.</p>
      </div>

      {/* Grid Table Card */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filed Reports ({myBlotters.length})</h3>
          <Link to="/resident/blotter/new" className="btn btn-primary btn-xs">
            + File Complaint
          </Link>
        </div>

        {myBlottersLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" />
          </div>
        ) : myBlotters.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No blotter cases found</h4>
            <p className="mt-2 text-xs">You have not filed any incident complaints yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Incident Type</th>
                  <th>Respondent / Complainee</th>
                  <th>Incident Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBlotters.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="font-semibold text-slate-900 dark:text-white">
                      #{caseItem.id}
                    </td>
                    <td className="font-semibold text-slate-800 dark:text-slate-200">
                      {caseItem.incident_type}
                    </td>
                    <td className="text-slate-600 dark:text-slate-400">
                      {caseItem.respondent_name}
                    </td>
                    <td>{formatDate(caseItem.incident_date)}</td>
                    <td>
                      <StatusBadge status={caseItem.status} />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedCase(caseItem)}
                        className="btn btn-secondary btn-xs font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-navy-950 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-navy-900/40">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Blotter Registry Case File</p>
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-1">
                  Case #{selectedCase.id}: {selectedCase.incident_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-slate-400 block mb-1">Complainant (You)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedCase.complainant_first_name} {selectedCase.complainant_last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Respondent</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedCase.respondent_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Incident Date & Time</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedCase.incident_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedCase.incident_location}</span>
                </div>
                {selectedCase.witness_names && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-1">Witnesses</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedCase.witness_names}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <span className="text-slate-400 block mb-1">Description of Incident</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap card p-3 bg-slate-50 dark:bg-navy-900/30">
                  {selectedCase.description}
                </p>
              </div>

              {/* Mediation Timeline */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mediation & Hearings Logs</h4>
                <CaseNoteTimeline notes={decodeNotes(selectedCase.case_notes)} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="btn btn-secondary btn-sm px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
