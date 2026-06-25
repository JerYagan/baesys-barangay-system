// src/pages/admin/residents/View.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Spinner from '../../../components/ui/Spinner'
import StatusBadge from '../../../components/ui/StatusBadge'
import api from '../../../api/axios'

export default function ResidentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setPageTitle } = useUIStore()
  const { success, error: showNotifError } = useNotifStore()
  
  const {
    currentResident,
    currentResidentHousehold,
    residentLoading,
    fetchResidentById,
    updateResident,
    archiveResident,
    households,
    fetchHouseholds
  } = useAdminStore()

  // Tabs state
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'docs' | 'blotters'

  // History states
  const [docHistory, setDocHistory] = useState([])
  const [blotterHistory, setBlotterHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
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
    password: '',
    profile_path: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

  // Confirm dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)

  useEffect(() => {
    setPageTitle('Resident Profile')
    fetchResidentById(id)
    fetchHouseholds({ limit: 100 })
  }, [id, setPageTitle, fetchResidentById, fetchHouseholds])

  // Fetch document / blotter history when tab changes
  useEffect(() => {
    if (!currentResident) return
    
    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        if (activeTab === 'docs') {
          const res = await api.get(`/requests/list.php?resident_id=${currentResident.id}&limit=100`)
          if (res.data.success) {
            setDocHistory(res.data.requests || [])
          }
        } else if (activeTab === 'blotters') {
          const res = await api.get(`/blotter/list.php?resident_id=${currentResident.id}&limit=100`)
          if (res.data.success) {
            setBlotterHistory(res.data.blotters || [])
          }
        }
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    loadHistory()
  }, [activeTab, currentResident])

  // Set edit form values when resident data loads
  useEffect(() => {
    if (currentResident) {
      setEditForm({
        id: currentResident.id,
        first_name: currentResident.first_name,
        last_name: currentResident.last_name,
        middle_name: currentResident.middle_name || '',
        birthdate: currentResident.birthdate,
        sex: currentResident.sex,
        civil_status: currentResident.civil_status,
        contact_no: currentResident.contact_no || '',
        purok: currentResident.purok,
        address: currentResident.address,
        household_id: currentResident.household_id || '',
        email: currentResident.account_email || '',
        password: '',
        profile_path: currentResident.profile_path || ''
      })
      setAvatarPreview(currentResident.profile_path || '')
      setAvatarFile(null)
    }
  }, [currentResident])

  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return '-'
    const today = new Date()
    const birthDate = new Date(birthdateStr)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
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

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)

    try {
      let profilePath = editForm.profile_path
      
      // If a new avatar file was chosen, upload it first
      if (avatarFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('avatar', avatarFile)
        const uploadRes = await api.post('/residents/upload-avatar.php', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (!uploadRes.data.success) {
          throw new Error(uploadRes.data.message || 'Avatar upload failed')
        }
        profilePath = uploadRes.data.profile_path
      }

      const submitData = { ...editForm, profile_path: profilePath }
      const res = await updateResident(submitData)
      if (res.success) {
        success('Resident profile updated successfully!')
        setIsEditing(false)
        fetchResidentById(id)
      } else {
        showNotifError(res.message || 'Failed to update resident.')
      }
    } catch (err) {
      showNotifError(err.message || err.response?.data?.message || 'An error occurred while updating the profile.')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleArchiveConfirm = async () => {
    setArchiveLoading(true)
    const newArchiveStatus = currentResident.is_archived ? 0 : 1
    
    try {
      const res = await archiveResident(currentResident.id, newArchiveStatus)
      if (res.success) {
        success(`Resident successfully ${newArchiveStatus ? 'archived' : 'restored'}!`)
        setIsConfirmOpen(false)
        fetchResidentById(id)
      } else {
        showNotifError(res.message || 'Failed to archive resident.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred.')
    } finally {
      setArchiveLoading(false)
    }
  }

  if (residentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentResident) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Resident record not found</h3>
        <p className="text-sm text-slate-500 mt-2">The record may have been deleted or does not exist.</p>
        <Link to="/admin/residents" className="btn btn-primary mt-4">
          Back to Residents
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/residents" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>

        <button
          onClick={() => setIsConfirmOpen(true)}
          className={`btn btn-sm ${currentResident.is_archived ? 'btn-primary' : 'btn-danger'}`}
        >
          {currentResident.is_archived ? 'Restore Resident' : 'Archive Resident'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500 overflow-hidden">
            {currentResident.profile_path ? (
              <img src={currentResident.profile_path.startsWith('/uploads') ? `/backend${currentResident.profile_path}` : currentResident.profile_path} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <>
                {currentResident.first_name[0]}
                {currentResident.last_name[0]}
              </>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentResident.first_name} {currentResident.middle_name} {currentResident.last_name}
              </h1>
              <StatusBadge status={currentResident.is_archived ? 'inactive' : 'active'} />
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {currentResident.sex} / {calculateAge(currentResident.birthdate)} years old / {currentResident.civil_status}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Resident ID: #{currentResident.id}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'info', label: 'Personal Details', icon: 'ID' },
            { id: 'docs', label: 'Document History', icon: 'DOC' },
            { id: 'blotters', label: 'Blotter Records', icon: 'LOG' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setIsEditing(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-700 text-white dark:bg-accent-600'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="w-8 text-[10px] font-bold tracking-wide opacity-75">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Tab 1: Personal Details */}
          {activeTab === 'info' && (
            <div className="card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center sm:flex-row gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {avatarPreview ? (
                        <img src={avatarPreview.startsWith('blob:') ? avatarPreview : (avatarPreview.startsWith('/uploads') ? `/backend${avatarPreview}` : avatarPreview)} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="label font-semibold">Update Profile Picture</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100 dark:file:bg-slate-800 dark:file:text-accent-400" 
                      />
                      <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={editForm.first_name}
                        onChange={handleEditChange}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={editForm.last_name}
                        onChange={handleEditChange}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={editForm.middle_name}
                        onChange={handleEditChange}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Birthdate</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={editForm.birthdate}
                        onChange={handleEditChange}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Sex</label>
                      <select
                        name="sex"
                        value={editForm.sex}
                        onChange={handleEditChange}
                        className="input"
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Civil Status</label>
                      <select
                        name="civil_status"
                        value={editForm.civil_status}
                        onChange={handleEditChange}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Contact Number</label>
                      <input
                        type="text"
                        name="contact_no"
                        value={editForm.contact_no}
                        onChange={handleEditChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Purok</label>
                      <select
                        name="purok"
                        value={editForm.purok}
                        onChange={handleEditChange}
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
                    <label className="label">Full Address</label>
                    <textarea
                      name="address"
                      rows="2"
                      value={editForm.address}
                      onChange={handleEditChange}
                      className="input resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Link to Household</label>
                    <select
                      name="household_id"
                      value={editForm.household_id}
                      onChange={handleEditChange}
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

                  <hr className="border-slate-100 dark:border-slate-700" />
                  
                  {/* Account Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Credentials (Optional)</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Provide or update the email and password to allow this resident to log in to the portal.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label" htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="e.g. resident@example.com"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="label" htmlFor="password">Login Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          placeholder="Leave blank to keep current password"
                          value={editForm.password}
                          onChange={handleEditChange}
                          className="input"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="btn btn-secondary"
                      disabled={updateLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 mb-0.5">Birthdate</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{currentResident.birthdate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 mb-0.5">Contact Number</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{currentResident.contact_no || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 mb-0.5">Purok</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{currentResident.purok}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 mb-0.5">Full Address</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{currentResident.address}</p>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-700" />

                  {/* Household Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Household Information</h3>
                    {currentResidentHousehold ? (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-md border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            Household #{currentResidentHousehold.household_no}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Head: {currentResidentHousehold.head_first_name} {currentResidentHousehold.head_last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {currentResidentHousehold.purok} / {currentResidentHousehold.address}
                          </p>
                        </div>
                        <Link 
                          to={`/admin/households/${currentResidentHousehold.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View Household
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        This resident is currently not linked to any household.
                      </p>
                    )}
                  </div>

                  <hr className="border-slate-100 dark:border-slate-700" />

                  {/* Portal Account Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">System Account</h3>
                    {currentResident.user_id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Email Address</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{currentResident.account_email}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500 mb-0.5">Account Status</p>
                          <StatusBadge status={currentResident.account_status} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No online login account associated. (Registered offline by staff)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Document History */}
          {activeTab === 'docs' && (
            <div className="card p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                Document Requests History
              </h2>
              {historyLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : docHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Requested Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docHistory.map((req) => (
                        <tr key={req.id}>
                          <td>#{req.id}</td>
                          <td className="font-semibold text-slate-900 dark:text-white">{req.document_name}</td>
                          <td>
                            <StatusBadge status={req.status} />
                          </td>
                          <td>{new Date(req.requested_at).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/admin/requests/${req.id}`} className="text-accent-600 dark:text-accent-400 font-semibold text-xs hover:underline">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">No records found</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Blotter Records */}
          {activeTab === 'blotters' && (
            <div className="card p-6 md:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                Blotter Incidents Registry
              </h2>
              {historyLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : blotterHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Case No.</th>
                        <th>Incident Type</th>
                        <th>Respondent</th>
                        <th>Status</th>
                        <th>Date Filed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blotterHistory.map((caseItem) => (
                        <tr key={caseItem.id}>
                          <td>#{caseItem.case_no}</td>
                          <td className="font-semibold text-slate-900 dark:text-white">{caseItem.incident_type}</td>
                          <td>{caseItem.respondent_name}</td>
                          <td>
                            <StatusBadge status={caseItem.status} />
                          </td>
                          <td>{new Date(caseItem.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">No records found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleArchiveConfirm}
        title={currentResident.is_archived ? 'Restore Resident Profile' : 'Archive Resident Profile'}
        message={
          currentResident.is_archived
            ? 'Are you sure you want to restore this resident profile? They will be shown in the active residents directory again.'
            : 'Are you sure you want to archive this resident profile? They will be removed from active directories, and household head positions will be cleared.'
        }
        confirmText={currentResident.is_archived ? 'Restore' : 'Archive'}
        variant={currentResident.is_archived ? 'primary' : 'danger'}
        loading={archiveLoading}
      />
    </div>
  )
}
