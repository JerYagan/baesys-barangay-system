// src/pages/admin/clinic/Dashboard.jsx
import { useEffect, useState } from 'react'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'

export default function ClinicDashboard() {
  const { setPageTitle } = useUIStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const {
    clinicServices,
    clinicServicesLoading,
    fetchClinicServices,
    clinicSchedules,
    clinicSchedulesLoading,
    fetchClinicSchedules,
    createClinicSchedule
  } = useAdminStore()

  // Form states
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('12:00')
  const [maxSlots, setMaxSlots] = useState(10)
  const [submitting, setSubmitting] = useState(false)

  // Filter state
  const [filterServiceId, setFilterServiceId] = useState('')

  useEffect(() => {
    setPageTitle('Clinic Schedules')
    fetchClinicServices()
    fetchClinicSchedules()
  }, [])

  useEffect(() => {
    fetchClinicSchedules(filterServiceId)
  }, [filterServiceId])

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    if (!selectedServiceId || !scheduleDate || !startTime || !endTime) {
      showError('Please fill out all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await createClinicSchedule({
        service_id: selectedServiceId,
        schedule_date: scheduleDate,
        start_time: startTime,
        end_time: endTime,
        max_slots: maxSlots
      })
      if (res.success) {
        showSuccess(res.message || 'Schedule slot created successfully!')
        // Reset form
        setSelectedServiceId('')
        setScheduleDate('')
        setMaxSlots(10)
        fetchClinicSchedules(filterServiceId)
      }
    } catch (err) {
      showError(err.message || 'Failed to create schedule slot.')
    } finally {
      setSubmitting(false)
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header Actions */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage Barangay Health Center services, doctor schedules, and slot capacities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Create Schedule Form */}
        <div className="md:col-span-1">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Add Schedule Slot
            </h2>
            
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="label">Clinic Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="input text-xs"
                  required
                >
                  <option value="">-- Select Service --</option>
                  {clinicServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Schedule Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Max Slot Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(parseInt(e.target.value))}
                  className="input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn btn-primary py-2 font-semibold text-xs"
              >
                {submitting ? 'Creating Slot...' : 'Create Slot'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Schedules List */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scheduled Slots Overview</h3>
            
            <div className="w-full sm:w-64">
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
          </div>

          <div className="card overflow-hidden">
            {clinicSchedulesLoading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : clinicSchedules.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                No active schedule slots found matching the criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service Name</th>
                      <th>Time Slot</th>
                      <th>Max Capacity</th>
                      <th>Filled Slots</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicSchedules.map((sched) => {
                      const slotsLeft = sched.max_slots - sched.filled_slots
                      const isFull = slotsLeft <= 0
                      return (
                        <tr key={sched.id}>
                          <td className="font-semibold text-slate-900 dark:text-white">
                            {formatDate(sched.schedule_date)}
                          </td>
                          <td>{sched.service_name}</td>
                          <td className="text-accent-600 dark:text-accent-400 font-medium">
                            {formatTime(sched.start_time)} – {formatTime(sched.end_time)}
                          </td>
                          <td>{sched.max_slots}</td>
                          <td>{sched.filled_slots}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFull
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                            }`}>
                              {isFull ? 'FULL' : 'AVAILABLE'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
