// src/pages/admin/residents/Add.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'
import api from '../../../api/axios'

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
    household_id: '',
    email: '',
    password: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
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

    if (!avatarFile) {
      showNotifError('Profile picture is required.')
      setLoading(false)
      return
    }

    try {
      // 1. Upload Avatar
      const formDataUpload = new FormData()
      formDataUpload.append('avatar', avatarFile)
      
      const uploadRes = await api.post('/residents/upload-avatar.php', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (!uploadRes.data.success) {
        throw new Error(uploadRes.data.message || 'Avatar upload failed')
      }
      
      const profilePath = uploadRes.data.profile_path

      // 2. Submit resident details
      const submitData = { ...formData, profile_path: profilePath }
      const res = await createResident(submitData)
      if (res.success) {
        success('Resident record created successfully!')
        navigate('/admin/residents')
      } else {
        showNotifError(res.message || 'Failed to create resident.')
      }
    } catch (err) {
      showNotifError(err.message || err.response?.data?.message || 'An error occurred while creating the resident.')
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
          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:flex-row gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="space-y-1">
              <label className="label font-semibold">Profile Picture <span className="text-danger">*</span></label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100 dark:file:bg-slate-800 dark:file:text-accent-400" 
              />
              <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
            </div>
          </div>

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

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Section 4: Account Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Credentials (Optional)</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Provide an email and password to allow this resident to log in to the portal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. resident@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Login Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  autoComplete="new-password"
                />
              </div>
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
