// src/pages/admin/officials/Add.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'

const POSITIONS = [
  'Barangay Chairperson',
  'Barangay Kagawad',
  'SK Chairperson',
  'Barangay Secretary',
  'Barangay Treasurer',
  'Barangay Tanod',
  'Health Worker',
  'Others',
]

export default function AddOfficial() {
  const navigate = useNavigate()
  const { createOfficial } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [termStart, setTermStart] = useState('')
  const [termEnd, setTermEnd] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('Only JPG, PNG, or WEBP images are allowed.')
      e.target.value = ''
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !position || !termStart || !termEnd) {
      showError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('first_name', firstName.trim())
      formData.append('last_name', lastName.trim())
      formData.append('position', position)
      formData.append('term_start', termStart)
      formData.append('term_end', termEnd)
      if (contactNo.trim()) formData.append('contact_no', contactNo.trim())
      if (photoFile) formData.append('photo', photoFile)

      const res = await createOfficial(formData)
      if (res.success) {
        showSuccess('Official registered successfully!')
        navigate('/admin/officials')
      } else {
        showError(res.message || 'Failed to register official.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/officials"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
        >
          ➔ Back to Officials Roster
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Register New Official</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add a barangay official to the active roster. All starred (*) fields are required.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo Upload */}
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="label">Profile Photo (Optional)</label>
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, or WEBP. Max 5 MB recommended.</p>
              {photoFile && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="mt-1 text-xs text-red-500 hover:text-red-600 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                placeholder="e.g. Arturo"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                placeholder="e.g. Santos"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Position / Role *</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input text-xs"
              required
            >
              <option value="">-- Select Position --</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Term Start Date *</label>
              <input
                type="date"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
            <div>
              <label className="label">Term End Date *</label>
              <input
                type="date"
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Contact Number (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 09XX-XXX-XXXX"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm px-6"
            >
              {submitting ? 'Registering...' : 'Register Official'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
