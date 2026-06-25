// src/pages/resident/clinic/Booking.jsx
import { useEffect, useState } from 'react'
import { useResidentStore } from '../../../store/useResidentStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'

export default function ClinicBooking() {
  const {
    clinicServices,
    clinicServicesLoading,
    fetchClinicServices,
    clinicSchedules,
    clinicSchedulesLoading,
    fetchClinicSchedules,
    bookAppointment
  } = useResidentStore()

  const { success: showSuccess, error: showError } = useNotifStore()

  // Booking states
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchClinicServices()
  }, [])

  // Fetch schedules when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchClinicSchedules(selectedService.id)
      setSelectedSchedule(null)
    }
  }, [selectedService])

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setStep(2)
  }

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule)
    setStep(3)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSchedule) return

    setSubmitting(true)
    try {
      const res = await bookAppointment(selectedSchedule.id, purpose)
      if (res.success) {
        showSuccess(res.message || 'Appointment booked successfully!')
        // Reset state
        setStep(1)
        setSelectedService(null)
        setSelectedSchedule(null)
        setPurpose('')
      }
    } catch (err) {
      showError(err.message || 'Failed to book appointment. Please try again.')
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

  if (clinicServicesLoading && step === 1) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Title */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Services</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Book Clinic Appointment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Schedule free consultations, dental treatments, or vaccinations at the Barangay Health Center.</p>
      </div>

      {/* Progress Steps Indicators */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/80">
        {[
          { number: 1, label: 'Select Service' },
          { number: 2, label: 'Choose Schedule' },
          { number: 3, label: 'Fill Details' }
        ].map((s) => (
          <div key={s.number} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.number
                ? 'bg-accent-700 text-white dark:bg-accent-600'
                : 'bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-500'
              }`}>
              {s.number}
            </span>
            <span className={`text-xs font-semibold ${step === s.number ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {clinicServices.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="card p-6 text-left hover:border-accent-600 dark:hover:border-accent-400 transition-all group flex flex-col justify-between h-48"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {service.description || 'No description available.'}
                </p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">
                Est. Duration: {service.estimated_duration_mins} mins
              </div>
            </button>
          ))}
          {clinicServices.length === 0 && (
            <div className="card p-12 text-center col-span-2 text-slate-500 text-sm">
              No clinic services are currently offered. Please check back later.
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Choose Schedule Slot */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary btn-sm"
            >
              ➔ Back to Services
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Service: {selectedService?.name}
            </span>
          </div>

          {clinicSchedulesLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : clinicSchedules.length === 0 ? (
            <div className="card p-12 text-center text-slate-500 text-sm border border-slate-200 dark:border-slate-800">
              <svg className="w-10 h-10 mx-auto text-slate-400 opacity-40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No slots scheduled</h3>
              <p className="text-xs text-slate-500 mt-1">There are no available appointment times scheduled for this service at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {clinicSchedules.map((sched) => {
                const availableSlots = sched.max_slots - sched.filled_slots
                const isFull = availableSlots <= 0
                return (
                  <button
                    key={sched.id}
                    disabled={isFull}
                    onClick={() => handleScheduleSelect(sched)}
                    className={`card p-4 text-left border transition-all ${isFull
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/10'
                        : 'hover:border-accent-600 dark:hover:border-accent-400'
                      }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatDate(sched.schedule_date)}
                    </div>
                    <div className="text-xs font-semibold text-accent-600 dark:text-accent-400 mt-1">
                      {formatTime(sched.start_time)} – {formatTime(sched.end_time)}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider">Available Capacity</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${isFull
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                          : availableSlots <= 3
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                        }`}>
                        {isFull ? 'FULL' : `${availableSlots} / ${sched.max_slots} slots`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Fill Purpose and Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="btn btn-secondary btn-sm"
            >
              ➔ Back to Schedules
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirm Appointment
            </span>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Appointment Summary
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Service Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedService?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Target Schedule</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {formatDate(selectedSchedule?.schedule_date)}
                </span>
                <span className="block text-accent-600 dark:text-accent-400 font-semibold mt-0.5">
                  {formatTime(selectedSchedule?.start_time)} – {formatTime(selectedSchedule?.end_time)}
                </span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="label font-bold text-xs" htmlFor="purpose">
                  Purpose of Appointment <span className="text-danger">*</span>
                </label>
                <textarea
                  id="purpose"
                  rows="3"
                  required
                  placeholder="Describe your medical symptoms, vaccination type, or checkup reason..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="input resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn btn-primary py-2.5 font-semibold text-xs"
              >
                {submitting ? 'Submitting Reservation...' : 'Confirm & Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
