// src/pages/admin/Settings.jsx
import { useEffect, useState } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { useNotifStore } from '../../store/useNotifStore'
import StatusBadge from '../../components/ui/StatusBadge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'

export default function Settings() {
  const { success: showSuccess, error: showError } = useNotifStore()
  
  // Store actions/states
  const {
    settings,
    settingsLoading,
    fetchSettings,
    updateSettings,
    
    docTypes,
    docTypesLoading,
    fetchAdminDocTypes,
    addDocType,
    updateDocType,
    toggleDocType,
    
    users,
    usersTotal,
    usersPages,
    usersCurrentPage,
    usersLoading,
    fetchUsers,
    approveUser,
    changeUserRole,
    toggleUserActive,
  } = useAdminStore()

  // Tab State
  const [activeTab, setActiveTab] = useState('general')

  // Tab 1: General Settings state
  const [barangayName, setBarangayName] = useState('')
  const [barangayAddress, setBarangayAddress] = useState('')
  const [barangayContact, setBarangayContact] = useState('')
  const [barangayEmail, setBarangayEmail] = useState('')
  const [officeHours, setOfficeHours] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  // Tab 2: Document Types state
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null) // null for Add, object for Edit
  const [docName, setDocName] = useState('')
  const [docDesc, setDocDesc] = useState('')
  const [docFee, setDocFee] = useState('')
  const [docDays, setDocDays] = useState('')
  const [savingDoc, setSavingDoc] = useState(false)

  // Tab 3: User Accounts state
  const [searchUser, setSearchUser] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [usersPage, setUsersPage] = useState(1)
  
  // Confirm Dialog State (for toggle user status)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [togglingUserStatus, setTogglingUserStatus] = useState(false)

  // Initial Fetches
  useEffect(() => {
    if (activeTab === 'general') {
      fetchSettings()
    } else if (activeTab === 'doctypes') {
      fetchAdminDocTypes()
    } else if (activeTab === 'users') {
      fetchUsers({ page: usersPage, search: searchUser, role: filterRole, status: filterStatus })
    }
  }, [activeTab, usersPage, filterRole, filterStatus])

  // Handle Search input with debounce or direct trigger
  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        fetchUsers({ page: 1, search: searchUser, role: filterRole, status: filterStatus })
        setUsersPage(1)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchUser])

  // Sync settings state
  useEffect(() => {
    if (settings) {
      setBarangayName(settings.barangay_name || '')
      setBarangayAddress(settings.barangay_address || '')
      setBarangayContact(settings.barangay_contact || '')
      setBarangayEmail(settings.barangay_email || '')
      setOfficeHours(settings.office_hours || '')
    }
  }, [settings])

  // Save general settings
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      await updateSettings({
        barangay_name: barangayName,
        barangay_address: barangayAddress,
        barangay_contact: barangayContact,
        barangay_email: barangayEmail,
        office_hours: officeHours,
      })
      showSuccess('General settings updated successfully.')
    } catch (err) {
      showError(err.message || 'Failed to update settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Open Document Modal (Add)
  const handleOpenAddDoc = () => {
    setEditingDoc(null)
    setDocName('')
    setDocDesc('')
    setDocFee('')
    setDocDays('')
    setDocModalOpen(true)
  }

  // Open Document Modal (Edit)
  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc)
    setDocName(doc.name)
    setDocDesc(doc.description || '')
    setDocFee(doc.fee)
    setDocDays(doc.processing_days)
    setDocModalOpen(true)
  }

  // Save Document Type
  const handleSaveDocType = async (e) => {
    e.preventDefault()
    if (!docName.trim() || docFee === '' || docDays === '') {
      showError('Name, fee, and processing days are required.')
      return
    }
    setSavingDoc(true)
    try {
      if (editingDoc) {
        // Edit Mode
        await updateDocType({
          id: editingDoc.id,
          name: docName.trim(),
          description: docDesc.trim(),
          fee: parseFloat(docFee),
          processing_days: parseInt(docDays, 10),
        })
        showSuccess('Document type updated successfully.')
      } else {
        // Add Mode
        await addDocType({
          name: docName.trim(),
          description: docDesc.trim(),
          fee: parseFloat(docFee),
          processing_days: parseInt(docDays, 10),
        })
        showSuccess('Document type created successfully.')
      }
      fetchAdminDocTypes()
      setDocModalOpen(false)
    } catch (err) {
      showError(err.message || 'Failed to save document type.')
    } finally {
      setSavingDoc(false)
    }
  }

  // Toggle active status for document type
  const handleToggleDocActive = async (id) => {
    try {
      await toggleDocType(id)
      showSuccess('Document type status toggled.')
      fetchAdminDocTypes()
    } catch (err) {
      showError(err.message || 'Failed to toggle status.')
    }
  }

  // Approve User Account
  const handleApproveUser = async (id) => {
    try {
      await approveUser(id)
      showSuccess('User account approved successfully.')
      fetchUsers({ page: usersPage, search: searchUser, role: filterRole, status: filterStatus })
    } catch (err) {
      showError(err.message || 'Failed to approve user.')
    }
  }

  // Change User Role
  const handleChangeRole = async (id, newRole) => {
    try {
      await changeUserRole(id, newRole)
      showSuccess('User role changed successfully.')
      fetchUsers({ page: usersPage, search: searchUser, role: filterRole, status: filterStatus })
    } catch (err) {
      showError(err.message || 'Failed to change role.')
    }
  }

  // Prompt active toggle for user
  const handlePromptToggleUserActive = (user) => {
    setSelectedUser(user)
    setConfirmOpen(true)
  }

  // Confirm active toggle for user
  const handleConfirmToggleActive = async () => {
    if (!selectedUser) return
    setTogglingUserStatus(true)
    try {
      await toggleUserActive(selectedUser.id, selectedUser.status)
      showSuccess(`User account status updated to ${selectedUser.status === 'active' ? 'inactive' : 'active'}.`)
      setConfirmOpen(false)
      fetchUsers({ page: usersPage, search: searchUser, role: filterRole, status: filterStatus })
    } catch (err) {
      showError(err.message || 'Failed to toggle status.')
    } finally {
      setTogglingUserStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure barangay details, document types, and manage accounts.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'general'
              ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('doctypes')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'doctypes'
              ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Document Types & Fees
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          User Accounts
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <div className="card max-w-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Barangay Profile & Configuration</h3>
            {settingsLoading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="label text-xs font-semibold">Barangay Name</label>
                  <input
                    type="text"
                    required
                    value={barangayName}
                    onChange={(e) => setBarangayName(e.target.value)}
                    className="input w-full text-xs"
                    placeholder="e.g. Barangay 781"
                  />
                </div>
                <div>
                  <label className="label text-xs font-semibold">Address</label>
                  <textarea
                    required
                    rows={2}
                    value={barangayAddress}
                    onChange={(e) => setBarangayAddress(e.target.value)}
                    className="input w-full text-xs py-2"
                    placeholder="Barangay Hall Address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs font-semibold">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={barangayContact}
                      onChange={(e) => setBarangayContact(e.target.value)}
                      className="input w-full text-xs"
                      placeholder="e.g. 0917-123-4567"
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={barangayEmail}
                      onChange={(e) => setBarangayEmail(e.target.value)}
                      className="input w-full text-xs"
                      placeholder="e.g. contact@barangay781.gov.ph"
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-xs font-semibold">Office Hours</label>
                  <input
                    type="text"
                    required
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    className="input w-full text-xs"
                    placeholder="e.g. Mon - Fri, 8:00 AM - 5:00 PM"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="btn btn-primary text-xs px-4 py-2"
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Document Types & Fees */}
        {activeTab === 'doctypes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Catalog</h3>
              <button
                onClick={handleOpenAddDoc}
                className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Document Type
              </button>
            </div>

            {docTypesLoading ? (
              <div className="card py-12 flex justify-center"><Spinner /></div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fee (PHP)</th>
                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Proc. Days</th>
                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {docTypes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-xs text-slate-500">No document types registered yet.</td>
                        </tr>
                      ) : (
                        docTypes.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-3.5 px-4 text-xs font-bold text-slate-900 dark:text-white">{doc.name}</td>
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">{doc.description || '—'}</td>
                            <td className="py-3.5 px-4 text-xs text-right font-medium text-slate-900 dark:text-white">
                              {parseFloat(doc.fee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-center text-slate-900 dark:text-white">{doc.processing_days} {doc.processing_days === 1 ? 'day' : 'days'}</td>
                            <td className="py-3.5 px-4 text-center">
                              <StatusBadge status={doc.is_active ? 'active' : 'inactive'} size="xs" />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditDoc(doc)}
                                  className="btn btn-secondary text-[10px] px-2 py-1"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleDocActive(doc.id)}
                                  className={`btn text-[10px] px-2 py-1 ${
                                    doc.is_active
                                      ? 'btn-danger bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
                                      : 'btn-success bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                  }`}
                                >
                                  {doc.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Add/Edit Modal */}
            <Modal
              isOpen={docModalOpen}
              onClose={() => setDocModalOpen(false)}
              title={editingDoc ? 'Edit Document Type' : 'Add Document Type'}
              size="sm"
            >
              <form onSubmit={handleSaveDocType} className="space-y-4">
                <div>
                  <label className="label text-xs font-semibold">Document Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="input w-full text-xs"
                    placeholder="e.g. Barangay Clearance"
                  />
                </div>
                <div>
                  <label className="label text-xs font-semibold">Description</label>
                  <textarea
                    rows={2}
                    value={docDesc}
                    onChange={(e) => setDocDesc(e.target.value)}
                    className="input w-full text-xs py-2"
                    placeholder="Describe usage or requirements..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs font-semibold">Fee (PHP) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={docFee}
                      onChange={(e) => setDocFee(e.target.value)}
                      className="input w-full text-xs"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label text-xs font-semibold">Processing Days *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={docDays}
                      onChange={(e) => setDocDays(e.target.value)}
                      className="input w-full text-xs"
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setDocModalOpen(false)}
                    className="btn btn-secondary text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDoc}
                    className="btn btn-primary text-xs px-3 py-1.5"
                  >
                    {savingDoc ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* Tab 3: User Accounts */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search/Filters Layout */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search user accounts by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="input w-full text-xs py-2 px-3"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value)
                    setUsersPage(1)
                  }}
                  className="input text-xs py-2"
                >
                  <option value="">All Roles</option>
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setUsersPage(1)
                  }}
                  className="input text-xs py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <div className="card py-12 flex justify-center"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="data-table w-full">
                      <thead>
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                          <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                          <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered On</th>
                          <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-xs text-slate-500">No user accounts found matching your filters.</td>
                          </tr>
                        ) : (
                          users.map((userObj) => (
                            <tr key={userObj.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="py-3 px-4 text-xs font-bold text-slate-900 dark:text-white">
                                {userObj.first_name} {userObj.last_name}
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{userObj.email}</td>
                              <td className="py-3 px-4 text-xs">
                                <select
                                  value={userObj.role}
                                  onChange={(e) => handleChangeRole(userObj.id, e.target.value)}
                                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-2 py-1 rounded focus:outline-none"
                                >
                                  <option value="resident">Resident</option>
                                  <option value="staff">Staff</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <StatusBadge status={userObj.status} size="xs" />
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                                {new Date(userObj.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {userObj.status === 'pending' && (
                                    <button
                                      onClick={() => handleApproveUser(userObj.id)}
                                      className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 text-[10px] px-2 py-1"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handlePromptToggleUserActive(userObj)}
                                    className={`btn text-[10px] px-2 py-1 ${
                                      userObj.status === 'active'
                                        ? 'btn-danger bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900'
                                        : 'btn-success bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                    }`}
                                  >
                                    {userObj.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={usersCurrentPage}
                  totalPages={usersPages}
                  onPageChange={(page) => setUsersPage(page)}
                  totalItems={usersTotal}
                  itemsPerPage={10}
                />
              </div>
            )}

            {/* Deactivation Confirmation Dialog */}
            <ConfirmDialog
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleConfirmToggleActive}
              title={selectedUser?.status === 'active' ? 'Deactivate User Account' : 'Activate User Account'}
              message={`Are you sure you want to ${
                selectedUser?.status === 'active' ? 'deactivate' : 'activate'
              } the account for ${selectedUser?.first_name} ${selectedUser?.last_name}?`}
              confirmText={selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
              variant={selectedUser?.status === 'active' ? 'danger' : 'primary'}
              loading={togglingUserStatus}
            />
          </div>
        )}
      </div>
    </div>
  )
}
