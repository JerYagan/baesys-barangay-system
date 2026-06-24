// src/store/useResidentStore.js
// Manages resident-facing data: requests, blotters, profile
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
  }
}))
