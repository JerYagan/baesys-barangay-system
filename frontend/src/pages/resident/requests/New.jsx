// src/pages/resident/requests/New.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifStore } from '../../../store/useNotifStore'
import api from '../../../api/axios'
import Spinner from '../../../components/ui/Spinner'

export default function NewRequest() {
  const navigate = useNavigate()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [docTypes, setDocTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Wizard state
  const [step, setStep] = useState(1) // 1: Select Doc, 2: Purpose, 3: Review
  const [selectedType, setSelectedType] = useState(null)
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    const fetchDocTypes = async () => {
      setLoading(true)
      try {
        const res = await api.get('/document-types/list.php')
        if (res.data.success) {
          setDocTypes(res.data.document_types)
        }
      } catch (err) {
        console.error('Failed to load document types', err)
        showError('Failed to load document types. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDocTypes()
  }, [])

  const handleSubmit = async () => {
    if (!selectedType || !purpose.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post('/requests/create.php', {
        document_type_id: selectedType.id,
        purpose: purpose.trim()
      })
      if (res.data.success) {
        showSuccess('Document request submitted successfully!')
        navigate('/resident/request/history')
      } else {
        showError(res.data.message || 'Failed to submit request.')
      }
    } catch (err) {
      showError(err.response?.data?.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6 py-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Document Services</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Request a Document</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Complete the steps below to request a new certificate or permit online.</p>
      </div>

      {/* Stepper Headers */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-slate-800 rounded-lg px-6 py-4">
        {[
          { label: 'Select Document', stepNum: 1 },
          { label: 'Specify Purpose', stepNum: 2 },
          { label: 'Confirm & Submit', stepNum: 3 }
        ].map((item) => {
          const isActive = step === item.stepNum
          const isCompleted = step > item.stepNum
          return (
            <div key={item.stepNum} className="flex items-center space-x-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isActive
                  ? 'bg-accent-600 text-white'
                  : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                {isCompleted ? '✓' : item.stepNum}
              </span>
              <span className={`text-xs font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                {item.label}
              </span>
              {item.stepNum < 3 && <span className="text-slate-300 dark:text-slate-800 font-normal">➔</span>}
            </div>
          )
        })}
      </div>

      {/* Wizard Content */}
      <div className="card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Step 1: Choose Document Type</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {docTypes.map((type) => {
                const isSelected = selectedType?.id === type.id
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`card p-5 cursor-pointer transition-all border flex flex-col justify-between relative ${isSelected
                        ? 'border-accent-600 ring-2 ring-accent-600/30 bg-accent-50/30 dark:bg-accent-950/30 dark:border-accent-500'
                        : 'hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-accent-600 dark:text-accent-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h4 className={`font-bold text-sm pr-6 transition-colors ${isSelected ? 'text-accent-700 dark:text-accent-400' : 'text-slate-900 dark:text-white'}`}>{type.name}</h4>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {type.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Processing: {type.processing_days} day(s)</span>
                      <span className="text-accent-600 dark:text-accent-400">
                        {parseFloat(type.fee) > 0 ? `₱${parseFloat(type.fee).toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedType}
                className="btn btn-primary btn-sm px-6"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Step 2: Specify Purpose</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please provide a clear and specific purpose for requesting your <strong>{selectedType?.name}</strong>. This details the legal basis or transaction use for the certificate.</p>

            <div className="pt-2">
              <label className="label">Purpose / Intended Use</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. For local job employment application, scholarship requirements, passport application, etc."
                rows={5}
                className="input text-sm resize-none"
                required
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary btn-sm px-6"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!purpose.trim()}
                className="btn btn-primary btn-sm px-6"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Step 3: Review and Confirm</h3>

            <div className="bg-slate-50 dark:bg-navy-900/50 border border-slate-100 dark:border-slate-800 rounded-lg p-5 divide-y divide-slate-100 dark:divide-slate-800/80">
              <div className="pb-3 flex justify-between">
                <span className="text-xs font-medium text-slate-400">Document Type</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedType?.name}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-xs font-medium text-slate-400">Fee to Pay</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {parseFloat(selectedType?.fee) > 0 ? `₱${parseFloat(selectedType?.fee).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-xs font-medium text-slate-400">Est. Processing Time</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedType?.processing_days} day(s)</span>
              </div>
              <div className="pt-3">
                <span className="text-xs font-medium text-slate-400 block mb-1">Purpose details</span>
                <p className="text-xs text-slate-850 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                  {purpose}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Important:</strong> By submitting this request, you attest that the information provided is true and accurate. Submitting false info may lead to automatic disapproval and administrative sanctions. Fees must be settled directly at the Barangay Hall during document pickup.
              </p>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(2)}
                disabled={submitting}
                className="btn btn-secondary btn-sm px-6"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary btn-sm px-6"
              >
                {submitting ? 'Submitting Request...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
