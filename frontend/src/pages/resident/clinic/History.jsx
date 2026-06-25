// src/pages/resident/clinic/History.jsx
import { useEffect, useState } from 'react'
import { useResidentStore } from '../../../store/useResidentStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'
import StatusBadge from '../../../components/ui/StatusBadge'
import api from '../../../api/axios'

export default function MyAppointments() {
  const { myAppointments, myAppointmentsLoading, fetchMyAppointments } = useResidentStore()
  const { success: showSuccess, error: showError } = useNotifStore()
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchMyAppointments()
  }, [])

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this clinic appointment?')) return

    setCancellingId(id)
    try {
      // Put to cancel API
      // Since PUT updates the appointment status, we can call clinic/appointments.php if staff/admin OR we can expose a dedicated cancellation or reuse the endpoint.
      // Wait, is clinic/appointments.php PUT checking for staff?
      // Ah! In clinic/appointments.php line 125, we check if they are staff/admin!
      // Wait! Let's check: can a resident cancel their own?
      // If we don't allow residents to PUT on clinic/appointments.php, they can't cancel!
      // Let's modify `clinic/appointments.php` to allow residents to cancel their own appointments!
      // Let's verify: does `clinic/appointments.php` allow resident cancellation?
      // Let's check the code:
      // "if (!in_array($payload['role'], ['staff', 'admin']))" -> it will throw 403!
      // Let's modify the backend `appointments.php` so that if the user is a resident, they can update the status to "cancelled" IF the appointment belongs to them!
      // Yes! This is a very important security and functional check! Let's implement this validation in backend appointments.php in the next step, but write the frontend cancel caller now.
      
      const res = await api.put('/clinic/appointments.php', { id, status: 'cancelled', staff_notes: 'Cancelled by resident' })
      if (res.data.success) {
        showSuccess('Appointment cancelled successfully.')
        fetchMyAppointments()
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel appointment.')
    } finally {
      setCancellingId(null)
    }
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
    const [h, m] = timeStr.split(':')
    const hr = parseInt(h)
    const ampm = hr >= 12 ? 'PM' : 'AM'
    const displayHr = hr % 12 || 12
    return `${displayHr}:${m} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">History</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Clinic Appointments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage your scheduled consultations at the Barangay Health Center.</p>
      </div>

      <div className="card overflow-hidden">
        {myAppointmentsLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : myAppointments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No appointments booked</h3>
            <p className="text-sm text-slate-500 mt-1">You haven't scheduled any clinic consultations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Service Type</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Staff Remarks</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>#{appt.id}</td>
                    <td className="font-semibold text-slate-900 dark:text-white">{appt.service_name}</td>
                    <td>
                      <div>{formatDate(appt.schedule_date)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {formatTime(appt.appointment_time)}
                      </div>
                    </td>
                    <td className="max-w-xs truncate text-xs">{appt.purpose || '—'}</td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="max-w-xs truncate text-xs italic text-slate-500">{appt.staff_notes || '—'}</td>
                    <td className="text-right">
                      {['pending', 'approved'].includes(appt.status) && (
                        <button
                          disabled={cancellingId === appt.id}
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="btn btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 btn-xs"
                        >
                          {cancellingId === appt.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
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
