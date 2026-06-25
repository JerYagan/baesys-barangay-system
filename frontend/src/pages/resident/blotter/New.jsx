// src/pages/resident/blotter/New.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useResidentStore } from '../../../store/useResidentStore'
import { useNotifStore } from '../../../store/useNotifStore'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

const incidentTypes = [
  'Physical Assault / Quarrel',
  'Theft / Robbery',
  'Verbal Abuse / Slander',
  'Neighborhood Noise Dispute',
  'Property Damage',
  'Trespassing',
  'Boundary Dispute',
  'Others'
]

export default function NewBlotter() {
  const navigate = useNavigate()
  const { createBlotter } = useResidentStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  // Form state
  const [incidentType, setIncidentType] = useState('')
  const [respondentName, setRespondentName] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [description, setDescription] = useState('')
  const [witnessNames, setWitnessNames] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmitClick = (e) => {
    e.preventDefault()
    if (!incidentType || !respondentName.trim() || !incidentDate || !incidentLocation.trim() || !description.trim()) {
      showError('Please fill in all required fields.')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirm(false)
    setSubmitting(true)
    try {
      const res = await createBlotter({
        respondent_name: respondentName.trim(),
        incident_type: incidentType,
        incident_date: incidentDate.replace('T', ' ') + ':00', // Format for MySQL DATETIME
        incident_location: incidentLocation.trim(),
        description: description.trim(),
        witness_names: witnessNames.trim() || null
      })

      if (res.success) {
        showSuccess('Blotter complaint filed successfully!')
        navigate('/resident/blotter/history')
      } else {
        showError(res.message || 'Failed to file blotter complaint.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto space-y-6 py-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Blotter & Complaints</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">File a Blotter Complaint</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          File an official complaint or incident report. Please describe the incident as accurately as possible.
        </p>
      </div>

      {/* Warning block */}
      <div className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Notice:</strong> Submitting false reports or perjury is a criminal offense under Article 180 of the Revised Penal Code. All reports are verified by Barangay authorities and mediation hearings will be scheduled.
        </p>
      </div>

      {/* Form card */}
      <div className="card p-6">
        <form onSubmit={handleSubmitClick} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Incident Type *</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="input text-xs"
                required
              >
                <option value="">-- Select Type --</option>
                {incidentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Date & Time Occurred *</label>
              <input
                type="datetime-local"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Respondent / Complainee Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe (Person complained against)"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label">Incident Location *</label>
              <input
                type="text"
                placeholder="e.g. 123 Orchid Street, Purok 1"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Witness Names (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Maria Clara, Juan dela Cruz (separated by commas)"
              value={witnessNames}
              onChange={(e) => setWitnessNames(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Detailed Description of Incident *</label>
            <textarea
              placeholder="Provide a comprehensive timeline of events, actions taken, and context of the dispute..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="input text-xs resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm px-6"
            >
              {submitting ? 'Filing Report...' : 'File Complaint'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Blotter Submission"
        message="Are you sure you want to submit this blotter report? The Barangay office will evaluate the details and schedule mediation hearings if necessary."
      />
    </div>
  )
}
