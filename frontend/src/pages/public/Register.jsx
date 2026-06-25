// src/pages/public/Register.jsx
// Clean minimal registration page
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotifStore } from '../../store/useNotifStore'
import { register as registerApi } from '../../api/auth'
import api from '../../api/axios'

const Field = ({ id, label, type = 'text', value, onChange, error, placeholder, required, children }) => (
  <div>
    <label htmlFor={id} className="label">{label} {required && <span className="text-danger">*</span>}</label>
    {children || (
      <input
        id={id}
        type={type}
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
    )}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
)

export default function Register() {
  const navigate = useNavigate()
  const addToast = useNotifStore((s) => s.addToast)

  const [form, setForm] = useState({
    first_name: '', last_name: '', middle_name: '', email: '',
    password: '', confirmPassword: '', birthdate: '', sex: '',
    civil_status: 'Single', contact_no: '', purok: '', address: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'Required'
    if (!form.last_name.trim()) errs.last_name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords don\'t match'
    if (!form.birthdate) errs.birthdate = 'Required'
    if (!form.sex) errs.sex = 'Required'
    if (!form.purok.trim()) errs.purok = 'Required'
    if (!form.address.trim()) errs.address = 'Required'
    if (!avatarFile) errs.avatar = 'Profile picture is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
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

      // 2. Submit Register Form
      const { confirmPassword, ...submitData } = form
      submitData.profile_path = profilePath

      const data = await registerApi(submitData)
      if (data.success) {
        addToast('success', data.message)
        navigate('/login')
      }
    } catch (err) {
      addToast('error', err.message || err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: undefined }))
    }
  }

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-md bg-accent-700 dark:bg-accent-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Register to access barangay services online.</p>
        </div>

        <div className="card p-6">
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
                {errors.avatar && <p className="text-xs text-danger mt-1">{errors.avatar}</p>}
                <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-navy-400 uppercase tracking-wider mb-3">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  id="r-fn"
                  label="First Name"
                  value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                  error={errors.first_name}
                  placeholder="Juan"
                  required
                />
                <Field
                  id="r-mn"
                  label="Middle Name"
                  value={form.middle_name}
                  onChange={(e) => set('middle_name', e.target.value)}
                  error={errors.middle_name}
                  placeholder="Santos"
                />
                <Field
                  id="r-ln"
                  label="Last Name"
                  value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                  error={errors.last_name}
                  placeholder="Dela Cruz"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <Field
                  id="r-bd"
                  label="Birthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => set('birthdate', e.target.value)}
                  error={errors.birthdate}
                  required
                />
                <Field
                  id="r-sex"
                  label="Sex"
                  error={errors.sex}
                  required
                >
                  <select
                    id="r-sex"
                    className={`input ${errors.sex ? 'input-error' : ''}`}
                    value={form.sex}
                    onChange={(e) => set('sex', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </Field>
                <Field
                  id="r-cs"
                  label="Civil Status"
                  error={errors.civil_status}
                >
                  <select
                    id="r-cs"
                    className="input"
                    value={form.civil_status}
                    onChange={(e) => set('civil_status', e.target.value)}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Contact & Address */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-navy-400 uppercase tracking-wider mb-3">Contact & Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  id="r-cn"
                  label="Contact Number"
                  value={form.contact_no}
                  onChange={(e) => set('contact_no', e.target.value)}
                  error={errors.contact_no}
                  placeholder="09XX-XXX-XXXX"
                />
                <Field
                  id="r-pk"
                  label="Purok / Zone"
                  value={form.purok}
                  onChange={(e) => set('purok', e.target.value)}
                  error={errors.purok}
                  placeholder="Purok 1"
                  required
                />
              </div>
              <div className="mt-3">
                <Field
                  id="r-addr"
                  label="Complete Address"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  error={errors.address}
                  placeholder="Street, Barangay, Municipality"
                  required
                />
              </div>
            </div>

            {/* Credentials */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-navy-400 uppercase tracking-wider mb-3">Account Credentials</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field
                  id="r-email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={errors.email}
                  placeholder="you@example.com"
                  required
                />
                <Field
                  id="r-pw"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  error={errors.password}
                  placeholder="Min 6 chars"
                  required
                />
                <Field
                  id="r-cpw"
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Re-enter"
                  required
                />
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-50 dark:bg-navy-800 border border-accent-200 dark:border-navy-700">
              <svg className="w-4 h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-accent-700 dark:text-accent-300">
                Your account will be <strong>pending</strong> until approved by barangay staff.
              </p>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-navy-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-600 dark:text-accent-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
