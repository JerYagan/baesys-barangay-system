// src/pages/resident/requests/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../api/axios'
import RequestStatusTracker from '../../../components/ui/RequestStatusTracker'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

export default function ResidentRequestDetail() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequestDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/requests/get.php?id=${id}`)
      if (res.data.success) {
        setRequest(res.data.request)
      } else {
        setError(res.data.message || 'Request not found.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequestDetails()
  }, [id])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-red-600">Error Loading Details</h2>
        <p className="text-sm text-slate-500">{error || 'Request detail could not be loaded.'}</p>
        <Link to="/resident/request/history" className="btn btn-secondary btn-sm">
          Back to History
        </Link>
      </div>
    )
  }

  const showPDF = request.status === 'ready_for_pickup' || request.status === 'released'
  const tokenVal = JSON.parse(localStorage.getItem('baesys-auth'))?.state?.token
  const pdfLink = `/api/requests/generate-pdf.php?id=${request.id}&token=${tokenVal}`

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Back button */}
      <div>
        <Link
          to="/resident/request/history"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          ➔ Back to History
        </Link>
      </div>

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Request #{request.id}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {request.document_name}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Track and monitor the status of this document request below.</p>
      </div>

      {/* Status Tracker */}
      <div className="card p-6 bg-slate-50 dark:bg-navy-900/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">Live Status Tracker</h3>
        <RequestStatusTracker status={request.status} />
      </div>

      {/* Grid panels */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main metadata */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Request Information
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Date Requested</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatDate(request.requested_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Status Badge</span>
                <StatusBadge status={request.status} />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Estimated Processing</span>
                <span className="font-semibold text-slate-900 dark:text-white">{request.processing_days} business day(s)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">OR / Reference Code</span>
                <span className="font-semibold text-slate-900 dark:text-white">OR-2026{String(request.id).padStart(4, '0')}</span>
              </div>
            </div>

            <div className="pt-3 text-xs border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Purpose details</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {request.purpose}
              </p>
            </div>
          </div>

          {/* Notes Timeline callout */}
          {request.notes && (
            <div className="p-5 bg-blue-50/20 border border-blue-200/50 rounded-lg space-y-2">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                Staff Review Feedback
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {request.notes}
              </p>
              <span className="text-[10px] text-slate-400 block">
                Last updated: {formatDate(request.updated_at)}
              </span>
            </div>
          )}
        </div>

        {/* Right card Panel (Payment and download) */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Payment & Collection
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Applicable Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {parseFloat(request.document_fee) > 0 ? `₱${parseFloat(request.document_fee).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              
              <div className="p-3.5 bg-slate-50 dark:bg-navy-900/50 border border-slate-100 dark:border-slate-800 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Fees are settled in cash during physical document collection at the Barangay Hall. Please bring change.
              </div>
            </div>

            {showPDF ? (
              <div className="pt-2">
                <a
                  href={pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn btn-primary btn-sm flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate & View PDF
                </a>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  disabled
                  className="w-full btn btn-secondary btn-sm opacity-60 cursor-not-allowed"
                >
                  Waiting for release
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
