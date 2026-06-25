// src/pages/admin/officials/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

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

const BACKEND_URL = '/api'

export default function OfficialProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOfficial, officialsLoading, fetchOfficialById, updateOfficial, toggleOfficialActive } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [showConfirmToggle, setShowConfirmToggle] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [termStart, setTermStart] = useState('')
  const [termEnd, setTermEnd] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    fetchOfficialById(id)
  }, [id])

  useEffect(() => {
    if (currentOfficial) {
      setFirstName(currentOfficial.first_name || '')
      setLastName(currentOfficial.last_name || '')
      setPosition(currentOfficial.position || '')
      setTermStart(currentOfficial.term_start?.slice(0, 10) || '')
      setTermEnd(currentOfficial.term_end?.slice(0, 10) || '')
      setContactNo(currentOfficial.contact_no || '')
      setPhotoFile(null)
      setPhotoPreview(null)
    }
  }, [currentOfficial])

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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !position || !termStart || !termEnd) {
      showError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('first_name', firstName.trim())
      formData.append('last_name', lastName.trim())
      formData.append('position', position)
      formData.append('term_start', termStart)
      formData.append('term_end', termEnd)
      if (contactNo.trim()) formData.append('contact_no', contactNo.trim())
      if (photoFile) formData.append('photo', photoFile)

      const res = await updateOfficial(formData)
      if (res.success) {
        showSuccess('Official details updated successfully!')
        setEditing(false)
        fetchOfficialById(id)
      } else {
        showError(res.message || 'Failed to update official details.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async () => {
    setTogglingActive(true)
    try {
      const newStatus = !currentOfficial.is_active
      const res = await toggleOfficialActive(parseInt(id), newStatus)
      if (res.success) {
        showSuccess(`Official marked as ${newStatus ? 'Active' : 'Inactive'}.`)
        fetchOfficialById(id)
      } else {
        showError(res.message || 'Failed to toggle status.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred.')
    } finally {
      setTogglingActive(false)
      setShowConfirmToggle(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (officialsLoading && !currentOfficial) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentOfficial) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-red-600">Official Not Found</h2>
        <p className="text-sm text-slate-500">This official record could not be loaded.</p>
        <Link to="/admin/officials" className="btn btn-secondary btn-sm">Back to Roster</Link>
      </div>
    )
  }

  const photoSrc = photoPreview
    ? photoPreview
    : currentOfficial.photo_path
    ? (currentOfficial.photo_path.startsWith('/uploads') ? `/backend${currentOfficial.photo_path}` : currentOfficial.photo_path)
    : null

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div>
        <Link
          to="/admin/officials"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          ➔ Back to Officials Roster
        </Link>
      </div>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Official #{currentOfficial.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            HON. {currentOfficial.first_name} {currentOfficial.last_name}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{currentOfficial.position}</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <StatusBadge status={currentOfficial.is_active ? 'active' : 'inactive'} />
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary btn-sm"
            >
              Edit Details
            </button>
          )}
          <button
            onClick={() => setShowConfirmToggle(true)}
            disabled={togglingActive}
            className={`btn btn-sm ${currentOfficial.is_active ? 'btn-secondary text-red-600' : 'btn-primary'}`}
          >
            {togglingActive ? 'Updating...' : currentOfficial.is_active ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left — Photo Card */}
        <div className="md:col-span-1">
          <div className="card p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {photoSrc ? (
                <img src={photoSrc} alt="Official photo" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
                {currentOfficial.position}
              </p>
              <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                HON. {currentOfficial.first_name} {currentOfficial.last_name}
              </h2>
            </div>
            {editing && (
              <div className="w-full text-left">
                <label className="label text-xs">Replace Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300"
                />
              </div>
            )}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Term Start</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(currentOfficial.term_start)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Term End</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(currentOfficial.term_end)}</span>
              </div>
              {currentOfficial.contact_no && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{currentOfficial.contact_no}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Registered</span>
                <span className="text-slate-500">{new Date(currentOfficial.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Edit Form or Read-only Detail */}
        <div className="md:col-span-2">
          {editing ? (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                Edit Official Information
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">First Name *</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input text-xs" required />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input text-xs" required />
                  </div>
                </div>
                <div>
                  <label className="label">Position *</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="input text-xs" required>
                    <option value="">-- Select --</option>
                    {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Term Start *</label>
                    <input type="date" value={termStart} onChange={(e) => setTermStart(e.target.value)} className="input text-xs" required />
                  </div>
                  <div>
                    <label className="label">Term End *</label>
                    <input type="date" value={termEnd} onChange={(e) => setTermEnd(e.target.value)} className="input text-xs" required />
                  </div>
                </div>
                <div>
                  <label className="label">Contact Number</label>
                  <input type="text" value={contactNo} onChange={(e) => setContactNo(e.target.value)} className="input text-xs" placeholder="09XX-XXX-XXXX" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(null) }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-sm px-6">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Official Record Details
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-slate-400 mb-0.5">Full Name</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">HON. {currentOfficial.first_name} {currentOfficial.last_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Position</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{currentOfficial.position}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Term Start</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{formatDate(currentOfficial.term_start)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Term End</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{formatDate(currentOfficial.term_end)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Contact Number</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{currentOfficial.contact_no || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Status</dt>
                  <dd><StatusBadge status={currentOfficial.is_active ? 'active' : 'inactive'} /></dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Last Updated</dt>
                  <dd className="text-slate-500">{currentOfficial.updated_at ? new Date(currentOfficial.updated_at).toLocaleString() : '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 mb-0.5">Date Registered</dt>
                  <dd className="text-slate-500">{new Date(currentOfficial.created_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Toggle Dialog */}
      {showConfirmToggle && (
        <ConfirmDialog
          isOpen={showConfirmToggle}
          onClose={() => setShowConfirmToggle(false)}
          title={currentOfficial.is_active ? 'Deactivate Official' : 'Reactivate Official'}
          message={
            currentOfficial.is_active
              ? `This will mark HON. ${currentOfficial.first_name} ${currentOfficial.last_name} as inactive. They will be hidden from the active roster.`
              : `This will restore HON. ${currentOfficial.first_name} ${currentOfficial.last_name} to the active roster.`
          }
          confirmText={currentOfficial.is_active ? 'Deactivate' : 'Reactivate'}
          variant={currentOfficial.is_active ? 'danger' : 'primary'}
          loading={togglingActive}
          onConfirm={handleToggleActive}
        />
      )}
    </div>
  )
}
