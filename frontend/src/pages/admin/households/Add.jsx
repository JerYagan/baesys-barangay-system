// src/pages/admin/households/Add.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'

export default function AddHousehold() {
  const { setPageTitle } = useUIStore()
  const { residents, fetchResidents, createHousehold } = useAdminStore()
  const { success, error: showNotifError } = useNotifStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    household_no: '',
    address: '',
    purok: 'Purok 1',
    head_resident_id: ''
  })

  useEffect(() => {
    setPageTitle('Add Household')
    // Fetch residents to choose a head from
    fetchResidents({ limit: 100, status: 'active' })
  }, [setPageTitle, fetchResidents])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.household_no || !formData.address || !formData.purok) {
      showNotifError('Please fill out all required fields.')
      setLoading(false)
      return
    }

    try {
      const res = await createHousehold(formData)
      if (res.success) {
        success('Household record created successfully!')
        navigate('/admin/households')
      } else {
        showNotifError(res.message || 'Failed to create household.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred while creating the household.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/admin/households" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Households Directory
        </Link>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Household Record</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="household_no">Household Number <span className="text-danger">*</span></label>
              <input
                type="text"
                id="household_no"
                name="household_no"
                placeholder="e.g. HH-2026-0001"
                value={formData.household_no}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="purok">Purok <span className="text-danger">*</span></label>
              <select
                id="purok"
                name="purok"
                value={formData.purok}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="Purok 1">Purok 1</option>
                <option value="Purok 2">Purok 2</option>
                <option value="Purok 3">Purok 3</option>
                <option value="Purok 4">Purok 4</option>
                <option value="Purok 5">Purok 5</option>
                <option value="Purok 6">Purok 6</option>
                <option value="Purok 7">Purok 7</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="address">Address <span className="text-danger">*</span></label>
            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="e.g. House No. 24, Lopez Street"
              value={formData.address}
              onChange={handleChange}
              className="input resize-none"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="head_resident_id">Head of Household (Optional)</label>
            <select
              id="head_resident_id"
              name="head_resident_id"
              value={formData.head_resident_id}
              onChange={handleChange}
              className="input"
            >
              <option value="">-- Assign Later --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.last_name}, {r.first_name} {r.middle_name ? `${r.middle_name[0]}.` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Select an active resident to set as head.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link to="/admin/households" className="btn btn-secondary" disabled={loading}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Saving...
                </span>
              ) : (
                'Create Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
