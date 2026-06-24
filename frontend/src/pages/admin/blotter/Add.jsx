// src/pages/admin/blotter/Add.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'
import api from '../../../api/axios'

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

export default function AdminBlotterAdd() {
  const navigate = useNavigate()
  const { createBlotterOnBehalf } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  // Form states
  const [complainantId, setComplainantId] = useState('')
  const [respondentName, setRespondentName] = useState('')
  const [incidentType, setIncidentType] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [description, setDescription] = useState('')
  const [witnessNames, setWitnessNames] = useState('')

  // Search residents state
  const [searchQuery, setSearchQuery] = useState('')
  const [residentsList, setResidentsList] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedResident, setSelectedResident] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Handle resident search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResidentsList([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/residents/list.php?search=${searchQuery.trim()}&limit=10&status=active`)
        if (res.data.success) {
          setResidentsList(res.data.residents)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const handleSelectResident = (res) => {
    setSelectedResident(res)
    setComplainantId(res.id)
    setSearchQuery('')
    setResidentsList([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!complainantId) {
      showError('Please select a resident complainant.')
      return
    }

    if (!incidentType || !respondentName.trim() || !incidentDate || !incidentLocation.trim() || !description.trim()) {
      showError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await createBlotterOnBehalf({
        complainant_id: parseInt(complainantId),
        respondent_name: respondentName.trim(),
        incident_type: incidentType,
        incident_date: incidentDate.replace('T', ' ') + ':00',
        incident_location: incidentLocation.trim(),
        description: description.trim(),
        witness_names: witnessNames.trim() || null
      })

      if (res.success) {
        showSuccess('Walk-in blotter entry created successfully!')
        navigate('/admin/blotter')
      } else {
        showError(res.message || 'Failed to create blotter record.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <Link
          to="/admin/blotter"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
        >
          ➔ Back to Blotter Registry
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Log Walk-in Blotter Case</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Record a complaint filed in-person at the Barangay Hall.</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Complainant Selection */}
          <div className="relative">
            <label className="label">Complainant Resident *</label>
            {selectedResident ? (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-850 rounded-lg text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedResident.first_name} {selectedResident.last_name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Address: {selectedResident.purok || '—'}, Contact: {selectedResident.contact_no || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResident(null)
                    setComplainantId('')
                  }}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Change Complainant
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Type resident name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input text-xs"
                />
                
                {/* Search dropdown results */}
                {residentsList.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-20 divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {residentsList.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResident(res)}
                        className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-900/60"
                      >
                        <p className="font-bold text-slate-850 dark:text-slate-200">{res.first_name} {res.last_name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">DOB: {res.birthdate} | Purok: {res.purok || 'None Assigned'}</p>
                      </div>
                    ))}
                  </div>
                )}
                {searching && (
                  <div className="absolute right-3 top-9 text-[10px] text-slate-400">Searching...</div>
                )}
              </div>
            )}
          </div>

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
                placeholder="Name of the person being complained against"
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
                placeholder="Specific street address or area"
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
              placeholder="Describe the sequence of events and context of the walk-in complaint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input text-xs resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting || !complainantId}
              className="btn btn-primary btn-sm px-6"
            >
              {submitting ? 'Recording case...' : 'Record Case Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
