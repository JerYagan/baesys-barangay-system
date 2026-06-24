// src/pages/admin/requests/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import { useAuthStore } from '../../../store/useAuthStore'
import RequestStatusTracker from '../../../components/ui/RequestStatusTracker'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

export default function DocumentRequestDetail() {
  const { id } = useParams()
  const { setPageTitle } = useUIStore()
  const { success, error: showNotifError } = useNotifStore()
  const { token } = useAuthStore()

  const {
    currentRequest,
    requestDetailLoading,
    fetchRequestById,
    updateRequestStatus
  } = useAdminStore()

  // Form state
  const [status, setStatus] = useState('pending')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setPageTitle('Request Details')
    fetchRequestById(id)
  }, [id, setPageTitle, fetchRequestById])

  // Populate form state when request details load
  useEffect(() => {
    if (currentRequest) {
      setStatus(currentRequest.status)
      setNotes(currentRequest.notes || '')
    }
  }, [currentRequest])

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const res = await updateRequestStatus(id, status, notes)
      if (res.success) {
        success('Request status updated successfully!')
        fetchRequestById(id)
      } else {
        showNotifError(res.message || 'Failed to update status.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred while updating the status.')
    } finally {
      setUpdating(false)
    }
  }

  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return '—'
    const today = new Date()
    const birthDate = new Date(birthdateStr)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (requestDetailLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentRequest) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Document request not found</h3>
        <p className="text-sm text-slate-500 mt-2">The record does not exist or has been removed.</p>
        <Link to="/admin/requests" className="btn btn-primary mt-4">
          Back to Requests
        </Link>
      </div>
    )
  }

  // Absolute path to dynamic mpdf generator (using the Vite proxy /api)
  const pdfUrl = `/api/requests/generate-pdf.php?id=${currentRequest.id}&token=${token}`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/admin/requests" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Document Requests
        </Link>
      </div>

      {/* Stepper tracker */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Request Status Tracker</h3>
        <RequestStatusTracker status={currentRequest.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Request details & Resident details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Metadata Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Document Type</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200 text-base">{currentRequest.document_name}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Current Status</p>
                <StatusBadge status={currentRequest.status} />
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Date Requested</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200">{formatDate(currentRequest.requested_at)}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Document Fee</p>
                <p className="font-bold text-slate-850 dark:text-slate-200">
                  {parseFloat(currentRequest.document_fee) > 0 ? `₱${parseFloat(currentRequest.document_fee).toFixed(2)}` : 'FREE'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Purpose</p>
                <p className="font-medium text-slate-800 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-850 text-justify">
                  {currentRequest.purpose}
                </p>
              </div>
            </div>
          </div>

          {/* Resident Details Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Applicant Information
              </h2>
              <Link 
                to={`/admin/residents/${currentRequest.resident_id}`}
                className="btn btn-secondary btn-sm"
              >
                View Profile
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Full Name</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200 text-base">
                  {currentRequest.resident_last_name}, {currentRequest.resident_first_name} {currentRequest.resident_middle_name ? `${currentRequest.resident_middle_name[0]}.` : ''}
                </p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Contact Number</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200">{currentRequest.resident_contact_no || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Age / Sex</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200">
                  {calculateAge(currentRequest.resident_birthdate)} years old • {currentRequest.resident_sex}
                </p>
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Purok</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200">{currentRequest.resident_purok}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-400 dark:text-slate-500 mb-0.5">Registered Address</p>
                <p className="font-semibold text-slate-850 dark:text-slate-200">{currentRequest.resident_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update actions & PDF printing */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Update Form */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              Request Actions
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="label">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="released">Released</option>
                </select>
              </div>

              <div>
                <label className="label">Process Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Please bring dry seal fee or physical ID..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="input text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary btn-sm"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* PDF Generator Card */}
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Print / Export
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Compile the document template using resident records and stream the official PDF to print.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn btn-secondary text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-950/40 hover:bg-accent-50 dark:hover:bg-accent-950/15 flex items-center justify-center font-bold"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Generate & View PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
