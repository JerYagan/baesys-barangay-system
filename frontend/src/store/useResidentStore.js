// src/store/useResidentStore.js
// Manages resident-facing data: requests, blotters, profile, clinic appointments, digital ID
import { create } from 'zustand'
import api from '../api/axios'

export const useResidentStore = create((set, get) => ({
  // My document requests
  myRequests: [],
  myRequestsLoading: false,
  fetchMyRequests: async () => {
    set({ myRequestsLoading: true })
    try {
      const res = await api.get('/requests/my.php')
      if (res.data.success) {
        set({ myRequests: res.data.requests })
      }
    } catch (error) {
      console.error('Failed to fetch resident requests', error)
    } finally {
      set({ myRequestsLoading: false })
    }
  },

  // My blotter records
  myBlotters: [],
  myBlottersLoading: false,
  fetchMyBlotters: async () => {
    set({ myBlottersLoading: true })
    try {
      const res = await api.get('/blotter/my.php')
      if (res.data.success) {
        set({ myBlotters: res.data.records })
      }
    } catch (error) {
      console.error('Failed to fetch resident blotters', error)
    } finally {
      set({ myBlottersLoading: false })
    }
  },

  createBlotter: async (data) => {
    try {
      const res = await api.post('/blotter/create.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to file blotter complaint')
    }
  },

  // Profile info
  profile: null,
  profileLoading: false,
  fetchProfile: async () => {
    set({ profileLoading: true })
    try {
      const res = await api.get('/auth/me.php')
      if (res.data.success) {
        set({ profile: res.data.resident })
      }
    } catch (error) {
      console.error('Failed to fetch profile info', error)
    } finally {
      set({ profileLoading: false })
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password.php', {
        current_password: currentPassword,
        new_password: newPassword
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to change password')
    }
  },

  // Clinic Services
  clinicServices: [],
  clinicServicesLoading: false,
  fetchClinicServices: async () => {
    set({ clinicServicesLoading: true })
    try {
      const res = await api.get('/clinic/services.php')
      if (res.data.success) {
        set({ clinicServices: res.data.services })
      }
    } catch (error) {
      console.error('Failed to fetch clinic services', error)
    } finally {
      set({ clinicServicesLoading: false })
    }
  },

  // Clinic Schedules
  clinicSchedules: [],
  clinicSchedulesLoading: false,
  fetchClinicSchedules: async (serviceId, date = '') => {
    set({ clinicSchedulesLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (serviceId) queryParams.append('service_id', serviceId)
      if (date) queryParams.append('date', date)
      
      const res = await api.get(`/clinic/schedules.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({ clinicSchedules: res.data.schedules })
      }
    } catch (error) {
      console.error('Failed to fetch clinic schedules', error)
    } finally {
      set({ clinicSchedulesLoading: false })
    }
  },

  // My Appointments
  myAppointments: [],
  myAppointmentsLoading: false,
  fetchMyAppointments: async () => {
    set({ myAppointmentsLoading: true })
    try {
      const res = await api.get('/clinic/appointments.php')
      if (res.data.success) {
        set({ myAppointments: res.data.appointments })
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error)
    } finally {
      set({ myAppointmentsLoading: false })
    }
  },

  // Book Appointment
  bookAppointment: async (scheduleId, purpose = '', appointmentTime = '') => {
    try {
      const res = await api.post('/clinic/book.php', {
        schedule_id: scheduleId,
        purpose,
        appointment_time: appointmentTime
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to book appointment')
    }
  },

  // Digital ID Details
  digitalId: null,
  digitalIdStatus: 'not_requested',
  digitalIdLoading: false,
  fetchDigitalId: async () => {
    set({ digitalIdLoading: true })
    try {
      const res = await api.get('/digital-id/get-id-details.php')
      if (res.data.success) {
        set({ digitalId: res.data.id_details, digitalIdStatus: res.data.id_details.digital_id_status || 'issued' })
      } else {
        set({ digitalId: null, digitalIdStatus: res.data.digital_id_status || 'not_requested' })
      }
    } catch (error) {
      console.error('Failed to fetch Digital ID details', error)
      const status = error.response?.data?.digital_id_status || 'not_requested'
      set({ digitalId: null, digitalIdStatus: status })
    } finally {
      set({ digitalIdLoading: false })
    }
  },
  
  requestDigitalId: async () => {
    try {
      const res = await api.post('/digital-id/request.php')
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to request Digital ID')
    }
  }
}))
