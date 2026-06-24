// src/pages/admin/residents/Add.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'

export default function AddResident() {
  const { setPageTitle } = useUIStore()
  const { households, fetchHouseholds, createResident } = useAdminStore()
  const { success, error: showNotifError } = useNotifStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    sex: 'Male',
    civil_status: 'Single',
    contact_no: '',
    purok: 'Purok 1',
    address: '',
    household_id: ''
  })

  useEffect(() => {
    setPageTitle('Add Resident')
    fetchHouseholds({ limit: 100 }) // Load households list
  }, [setPageTitle, fetchHouseholds])

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

    // Form validations
    if (!formData.first_name || !formData.last_name || !formData.birthdate || !formData.address) {
      showNotifError('Please fill out all required fields.')
      setLoading(false)
      return
    }

    try {
      const res = await createResident(formData)
      if (res.success) {
        success('Resident record created successfully!')
        navigate('/admin/residents')
      } else {
        showNotifError(res.message || 'Failed to create resident.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred while creating the resident.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/admin/residents" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Residents Directory
        </Link>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Resident Registration Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="first_name">First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="last_name">Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="middle_name">Middle Name</label>
                <input
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="birthdate">Birthdate <span className="text-danger">*</span></label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="sex">Sex <span className="text-danger">*</span></label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="civil_status">Civil Status <span className="text-danger">*</span></label>
                <select
                  id="civil_status"
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Section 2: Contact & Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact & Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="contact_no">Contact Number</label>
                <input
                  type="text"
                  id="contact_no"
                  name="contact_no"
                  placeholder="e.g. 09123456789"
                  value={formData.contact_no}
                  onChange={handleChange}
                  className="input"
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
              <label className="label" htmlFor="address">Full Address <span className="text-danger">*</span></label>
              <textarea
                id="address"
                name="address"
                rows="2"
                placeholder="House no., street description"
                value={formData.address}
                onChange={handleChange}
                className="input resize-none"
                required
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Section 3: Household Linkage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Household linkage</h3>
            
            <div>
              <label className="label" htmlFor="household_id">Link to Household (Optional)</label>
              <select
                id="household_id"
                name="household_id"
                value={formData.household_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- No household linked --</option>
                {households.map((hh) => (
                  <option key={hh.id} value={hh.id}>
                    {hh.household_no} ({hh.purok} - {hh.address})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link to="/admin/residents" className="btn btn-secondary" disabled={loading}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Registering...
                </span>
              ) : (
                'Register Resident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
