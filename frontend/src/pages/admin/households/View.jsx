// src/pages/admin/households/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Spinner from '../../../components/ui/Spinner'

export default function HouseholdDetails() {
  const { id } = useParams()
  const { setPageTitle } = useUIStore()
  const { success, error: showNotifError } = useNotifStore()

  const {
    currentHousehold,
    currentHouseholdMembers,
    householdLoading,
    fetchHouseholdById,
    updateHousehold,
    addHouseholdMember,
    removeHouseholdMember,
    residents,
    fetchResidents
  } = useAdminStore()

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    id: '',
    household_no: '',
    address: '',
    purok: 'Purok 1',
    head_resident_id: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  // Add Member state
  const [selectedResidentId, setSelectedResidentId] = useState('')
  const [addMemberLoading, setAddMemberLoading] = useState(false)

  // Remove Member Confirm dialog state
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  useEffect(() => {
    setPageTitle('Household Record')
    fetchHouseholdById(id)
    fetchResidents({ limit: 100, status: 'active' })
  }, [id, setPageTitle, fetchHouseholdById, fetchResidents])

  // Populate edit form once household data is loaded
  useEffect(() => {
    if (currentHousehold) {
      setEditForm({
        id: currentHousehold.id,
        household_no: currentHousehold.household_no,
        address: currentHousehold.address,
        purok: currentHousehold.purok,
        head_resident_id: currentHousehold.head_resident_id || ''
      })
    }
  }, [currentHousehold])

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)

    try {
      const res = await updateHousehold(editForm)
      if (res.success) {
        success('Household details updated successfully!')
        setIsEditing(false)
        fetchHouseholdById(id)
        // Refresh residents dropdown too in case head was reassigned
        fetchResidents({ limit: 100, status: 'active' })
      } else {
        showNotifError(res.message || 'Failed to update household.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred while updating the household details.')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedResidentId) return

    setAddMemberLoading(true)
    try {
      const res = await addHouseholdMember(id, selectedResidentId)
      if (res.success) {
        success('Household member added successfully!')
        setSelectedResidentId('')
        fetchHouseholdById(id)
        fetchResidents({ limit: 100, status: 'active' })
      } else {
        showNotifError(res.message || 'Failed to add member.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred.')
    } finally {
      setAddMemberLoading(false)
    }
  }

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return

    setRemoveLoading(true)
    try {
      const res = await removeHouseholdMember(memberToRemove.id)
      if (res.success) {
        success('Member removed from household successfully.')
        setMemberToRemove(null)
        fetchHouseholdById(id)
        fetchResidents({ limit: 100, status: 'active' })
      } else {
        showNotifError(res.message || 'Failed to remove member.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred.')
    } finally {
      setRemoveLoading(false)
    }
  }

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

  // Filter residents dropdown to show only those who aren't already members of this household
  const availableResidents = residents.filter(
    (res) => !currentHouseholdMembers.some((m) => m.id === res.id)
  )

  if (householdLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentHousehold) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Household record not found</h3>
        <p className="text-sm text-slate-500 mt-2">The record may have been deleted or does not exist.</p>
        <Link to="/admin/households" className="btn btn-primary mt-4">
          Back to Households
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Household Info & Edit */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Household Details</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">Household Number</label>
                  <input
                    type="text"
                    name="household_no"
                    value={editForm.household_no}
                    onChange={handleEditChange}
                    className="input"
                    required
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

                <div>
                  <label className="label">Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="input resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="label">Head of Household</label>
                  <select
                    name="head_resident_id"
                    value={editForm.head_resident_id}
                    onChange={handleEditChange}
                    className="input"
                  >
                    <option value="">-- No Head Assigned --</option>
                    {/* Allow assigning any member currently in the household as the head */}
                    {currentHouseholdMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.last_name}, {m.first_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary btn-sm"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-0.5">Household No.</p>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {currentHousehold.household_no}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-0.5">Purok</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentHousehold.purok}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-0.5">Address</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentHousehold.address}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-0.5">Head of Household</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentHousehold.head_resident_id ? (
                      <Link 
                        to={`/admin/residents/${currentHousehold.head_resident_id}`}
                        className="text-accent-600 dark:text-accent-400 font-semibold hover:underline"
                      >
                        {currentHousehold.head_first_name} {currentHousehold.head_last_name}
                      </Link>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">None Assigned</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Member Section */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
              Add Member to Household
            </h3>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="input text-sm"
                  required
                >
                  <option value="">-- Choose Resident --</option>
                  {availableResidents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.last_name}, {r.first_name} ({r.purok})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary btn-sm"
                disabled={!selectedResidentId || addMemberLoading}
              >
                {addMemberLoading ? 'Adding...' : 'Add to Household'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Members List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Household Members ({currentHouseholdMembers.length})
              </h2>
            </div>

            {currentHouseholdMembers.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-slate-500">No members registered in this household yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Sex</th>
                      <th>Relation</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHouseholdMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <Link
                            to={`/admin/residents/${member.id}`}
                            className="font-semibold text-slate-900 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                          >
                            {member.last_name}, {member.first_name} {member.middle_name ? `${member.middle_name[0]}.` : ''}
                          </Link>
                        </td>
                        <td>{calculateAge(member.birthdate)}</td>
                        <td>{member.sex}</td>
                        <td>
                          {currentHousehold.head_resident_id === member.id ? (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-300 rounded-full">
                              Household Head
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">Member</span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-950/30"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Member Dialog */}
      <ConfirmDialog
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Member from Household"
        message={
          memberToRemove
            ? `Are you sure you want to remove ${memberToRemove.first_name} ${memberToRemove.last_name} from this household? They will become unlinked.`
            : ''
        }
        confirmText="Remove"
        variant="danger"
        loading={removeLoading}
      />
    </div>
  )
}
