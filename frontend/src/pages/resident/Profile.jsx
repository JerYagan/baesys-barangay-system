// src/pages/resident/Profile.jsx
import { useEffect, useState } from 'react'
import { useResidentStore } from '../../store/useResidentStore'
import { useNotifStore } from '../../store/useNotifStore'
import Spinner from '../../components/ui/Spinner'

export default function ResidentProfile() {
  const { profile, profileLoading, fetchProfile, changePassword } = useResidentStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match.')
      return
    }

    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long.')
      return
    }

    setSubmitting(true)
    try {
      const res = await changePassword(currentPassword, newPassword)
      if (res.success) {
        showSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showError(res.message || 'Failed to update password.')
      }
    } catch (err) {
      showError(err.message || 'Failed to update password.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Settings</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Resident Profile</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your credentials and view your official Barangay registration information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Official personal info details (Read-only) */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Official Personal Details (Read-Only)
            </h3>
            
            {profile ? (
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">First Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.first_name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Last Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.last_name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Middle Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.middle_name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Birthdate</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDate(profile.birthdate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Gender / Sex</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{profile.sex || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Civil Status</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{profile.civil_status || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Contact Number</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.contact_no || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Purok</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.purok || '—'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Address / Street</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{profile.address || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Failed to load profile details.
              </div>
            )}

            <div className="p-4 bg-amber-50/20 border border-amber-200/50 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Request Official Edits:</strong> Official demographic records (Full name, Birthdate, Address, Purok, and Civil Status) are verified legal parameters and cannot be edited online. To request changes, please present valid government-issued ID at the Barangay Hall.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Password Reset change form */}
        <div className="md:col-span-1">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Change Account Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn btn-primary btn-sm mt-2"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
