// src/pages/admin/clinic/Appointments.jsx
import { useEffect, useState } from 'react'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'
import StatusBadge from '../../../components/ui/StatusBadge'

export default function AppointmentsManager() {
  const { setPageTitle } = useUIStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const {
    clinicAppointments,
    clinicAppointmentsLoading,
    fetchClinicAppointments,
    updateAppointmentStatus,
    clinicServices,
    fetchClinicServices
  } = useAdminStore()

  // Filter states
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]) // default to today
  const [filterServiceId, setFilterServiceId] = useState('')

  // Modal / notes state
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [staffNotes, setStaffNotes] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    setPageTitle('Patient Bookings Queue')
    fetchClinicServices()
  }, [])

  useEffect(() => {
    fetchClinicAppointments({
      status: filterStatus,
      date: filterDate,
      service_id: filterServiceId
    })
  }, [filterStatus, filterDate, filterServiceId])

  const handleUpdateStatus = async (appt, newStatus) => {
    setUpdatingId(appt.id)
    try {
      const notesToSubmit = appt.id === selectedAppt?.id ? staffNotes : appt.staff_notes
      const res = await updateAppointmentStatus(appt.id, newStatus, notesToSubmit)
      if (res.success) {
        showSuccess(res.message || 'Appointment status updated successfully!')
        setSelectedAppt(null)
        setStaffNotes('')
        fetchClinicAppointments({
          status: filterStatus,
          date: filterDate,
          service_id: filterServiceId
        })
      }
    } catch (err) {
      showError(err.message || 'Failed to update appointment.')
    } finally {
      setUpdatingId(null)
    }
  }

  const openNotesModal = (appt) => {
    setSelectedAppt(appt)
    setStaffNotes(appt.staff_notes || '')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return '—'
    const [h, m] = timeStr.split(':')
    const hr = parseInt(h)
    const ampm = hr >= 12 ? 'PM' : 'AM'
    const displayHr = hr % 12 || 12
    return `${displayHr}:${m} ${ampm}`
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor daily patient registrations, check-in arrivals, and log medical notes.
        </p>
      </div>

      {/* Filters Board */}
      <div className="card p-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label text-[10px] font-bold uppercase tracking-wider">Date Filter</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input text-xs"
          />
        </div>

        <div>
          <label className="label text-[10px] font-bold uppercase tracking-wider">Service Type</label>
          <select
            value={filterServiceId}
            onChange={(e) => setFilterServiceId(e.target.value)}
            className="input text-xs"
          >
            <option value="">All Services</option>
            {clinicServices.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-[10px] font-bold uppercase tracking-wider">Appointment Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input text-xs"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Check-in</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Queue Log Table */}
      <div className="card overflow-hidden">
        {clinicAppointmentsLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : clinicAppointments.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">No appointments scheduled</h3>
            <p className="text-xs text-slate-500 mt-1">There are no appointments registered for this selected date/filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Purok</th>
                  <th>Service Type</th>
                  <th>Sched Date & Time</th>
                  <th>Symptom/Purpose</th>
                  <th>Status</th>
                  <th>Staff Notes / Action Details</th>
                  <th className="text-right">Manage Status</th>
                </tr>
              </thead>
              <tbody>
                {clinicAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="font-bold text-slate-900 dark:text-white">
                      {appt.last_name}, {appt.first_name} {appt.middle_name}
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {appt.contact_no || 'No contact'}
                      </div>
                    </td>
                    <td>{appt.purok}</td>
                    <td>{appt.service_name}</td>
                    <td>
                      <div>{formatDate(appt.schedule_date)}</div>
                      <div className="text-xs text-accent-600 dark:text-accent-400 font-semibold mt-0.5">
                        {formatTime(appt.appointment_time)}
                      </div>
                    </td>
                    <td className="max-w-xs truncate text-xs">{appt.purpose || '—'}</td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="max-w-xs text-xs">
                      {selectedAppt?.id === appt.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={staffNotes}
                            onChange={(e) => setStaffNotes(e.target.value)}
                            className="input text-[11px] p-1.5 resize-none w-full"
                            placeholder="Add vitals/prescriptions..."
                            rows="2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(appt, appt.status)}
                              className="btn btn-primary btn-xs text-[10px]"
                            >
                              Save Notes
                            </button>
                            <button
                              onClick={() => setSelectedAppt(null)}
                              className="btn btn-secondary btn-xs text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2 group">
                          <span className="italic text-slate-500">{appt.staff_notes || '—'}</span>
                          <button
                            onClick={() => openNotesModal(appt)}
                            className="text-accent-600 dark:text-accent-400 font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                          >
                            Edit Notes
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {appt.status === 'pending' && (
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt, 'approved')}
                            className="btn btn-primary btn-xs text-[10px]"
                          >
                            Approve
                          </button>
                        )}
                        {['pending', 'approved'].includes(appt.status) && (
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt, 'completed')}
                            className="btn bg-green-600 hover:bg-green-700 text-white btn-xs text-[10px]"
                          >
                            Complete
                          </button>
                        )}
                        {['pending', 'approved'].includes(appt.status) && (
                          <button
                            disabled={updatingId === appt.id}
                            onClick={() => handleUpdateStatus(appt, 'cancelled')}
                            className="btn btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 btn-xs text-[10px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
