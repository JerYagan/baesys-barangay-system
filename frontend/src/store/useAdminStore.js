// src/store/useAdminStore.js
// Manages admin-facing data: residents, households, requests, dashboard stats
import { create } from 'zustand'
import api from '../api/axios'

export const useAdminStore = create((set, get) => ({
  // Dashboard stats
  dashboardStats: {
    totalResidents: 0,
    totalHouseholds: 0,
    pendingRequests: 0,
    openBlotters: 0,
    completedThisMonth: 0,
  },
  statsLoading: false,
  fetchDashboardStats: async () => {
    set({ statsLoading: true })
    try {
      const res = await api.get('/dashboard/stats.php')
      if (res.data.success) {
        set({
          dashboardStats: {
            totalResidents: res.data.totalResidents,
            totalHouseholds: res.data.totalHouseholds,
            pendingRequests: res.data.pendingRequests,
            openBlotters: res.data.openBlotters,
            completedThisMonth: res.data.completedThisMonth,
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error)
    } finally {
      set({ statsLoading: false })
    }
  },

  // Residents list state
  residents: [],
  residentsTotal: 0,
  residentsPages: 1,
  residentsCurrentPage: 1,
  residentsLoading: false,
  fetchResidents: async (params = {}) => {
    set({ residentsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.purok) queryParams.append('purok', params.purok)
      if (params.status) queryParams.append('status', params.status)

      const res = await api.get(`/residents/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({
          residents: res.data.residents,
          residentsTotal: res.data.totalItems,
          residentsPages: res.data.totalPages,
          residentsCurrentPage: res.data.currentPage,
        })
      }
    } catch (error) {
      console.error('Failed to fetch residents', error)
    } finally {
      set({ residentsLoading: false })
    }
  },

  // Single resident profile state
  currentResident: null,
  currentResidentHousehold: null,
  residentLoading: false,
  fetchResidentById: async (id) => {
    set({ residentLoading: true, currentResident: null, currentResidentHousehold: null })
    try {
      const res = await api.get(`/residents/get.php?id=${id}`)
      if (res.data.success) {
        set({
          currentResident: res.data.resident,
          currentResidentHousehold: res.data.household
        })
      }
    } catch (error) {
      console.error('Failed to fetch resident profile', error)
    } finally {
      set({ residentLoading: false })
    }
  },

  // Create Resident
  createResident: async (data) => {
    try {
      const res = await api.post('/residents/add.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create resident')
    }
  },

  // Update Resident
  updateResident: async (data) => {
    try {
      const res = await api.put('/residents/update.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update resident')
    }
  },

  // Archive / Restore Resident
  archiveResident: async (id, isArchived) => {
    try {
      const res = await api.patch('/residents/archive.php', { id, is_archived: isArchived ? 1 : 0 })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to change archive status')
    }
  },

  // Households list state
  households: [],
  householdsTotal: 0,
  householdsPages: 1,
  householdsCurrentPage: 1,
  householdsLoading: false,
  fetchHouseholds: async (params = {}) => {
    set({ householdsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.search) queryParams.append('search', params.search)
      if (params.purok) queryParams.append('purok', params.purok)

      const res = await api.get(`/households/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({
          households: res.data.households,
          householdsTotal: res.data.totalItems,
          householdsPages: res.data.totalPages,
          householdsCurrentPage: res.data.currentPage,
        })
      }
    } catch (error) {
      console.error('Failed to fetch households', error)
    } finally {
      set({ householdsLoading: false })
    }
  },

  // Single household details state
  currentHousehold: null,
  currentHouseholdMembers: [],
  householdLoading: false,
  fetchHouseholdById: async (id) => {
    set({ householdLoading: true, currentHousehold: null, currentHouseholdMembers: [] })
    try {
      const res = await api.get(`/households/get.php?id=${id}`)
      if (res.data.success) {
        set({
          currentHousehold: res.data.household,
          currentHouseholdMembers: res.data.members
        })
      }
    } catch (error) {
      console.error('Failed to fetch household details', error)
    } finally {
      set({ householdLoading: false })
    }
  },

  // Create Household
  createHousehold: async (data) => {
    try {
      const res = await api.post('/households/add.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create household')
    }
  },

  // Update Household
  updateHousehold: async (data) => {
    try {
      const res = await api.put('/households/update.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update household')
    }
  },

  // Add Household Member
  addHouseholdMember: async (householdId, residentId) => {
    try {
      const res = await api.post('/households/add-member.php', {
        household_id: householdId,
        resident_id: residentId
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to add household member')
    }
  },

  // Remove Household Member
  removeHouseholdMember: async (residentId) => {
    try {
      const res = await api.post('/households/remove-member.php', { resident_id: residentId })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to remove household member')
    }
  },

  // Document requests list
  requests: [],
  requestsTotal: 0,
  requestsPages: 1,
  requestsCurrentPage: 1,
  requestsStats: {
    total: 0,
    pending: 0,
    processing: 0,
    ready: 0,
    released: 0
  },
  requestsLoading: false,
  fetchRequests: async (params = {}) => {
    set({ requestsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)
      if (params.type) queryParams.append('type', params.type)

      const res = await api.get(`/requests/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({
          requests: res.data.requests,
          requestsTotal: res.data.totalItems,
          requestsPages: res.data.totalPages,
          requestsCurrentPage: res.data.currentPage,
          requestsStats: res.data.stats
        })
      }
    } catch (error) {
      console.error('Failed to fetch document requests', error)
    } finally {
      set({ requestsLoading: false })
    }
  },

  // Single request details
  currentRequest: null,
  requestDetailLoading: false,
  fetchRequestById: async (id) => {
    set({ requestDetailLoading: true, currentRequest: null })
    try {
      const res = await api.get(`/requests/get.php?id=${id}`)
      if (res.data.success) {
        set({ currentRequest: res.data.request })
      }
    } catch (error) {
      console.error('Failed to fetch request detail', error)
    } finally {
      set({ requestDetailLoading: false })
    }
  },

  // Update request status
  updateRequestStatus: async (requestId, status, notes) => {
    try {
      const res = await api.patch('/requests/update-status.php', {
        id: requestId,
        status,
        notes
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update request status')
    }
  },

  // Admin Blotter records
  blotters: [],
  blottersTotal: 0,
  blottersPages: 1,
  blottersCurrentPage: 1,
  blottersLoading: false,
  currentBlotter: null,
  blotterDetailLoading: false,
  blottersStats: {
    total: 0,
    open: 0,
    under_mediation: 0,
    resolved: 0,
    referred: 0
  },
  fetchBlotters: async (params = {}) => {
    set({ blottersLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      if (params.search) queryParams.append('search', params.search)

      const res = await api.get(`/blotter/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({
          blotters: res.data.blotters,
          blottersTotal: res.data.totalItems,
          blottersPages: res.data.totalPages,
          blottersCurrentPage: res.data.currentPage,
          blottersStats: res.data.stats
        })
      }
    } catch (error) {
      console.error('Failed to fetch blotters', error)
    } finally {
      set({ blottersLoading: false })
    }
  },

  fetchBlotterById: async (id) => {
    set({ blotterDetailLoading: true, currentBlotter: null })
    try {
      const res = await api.get(`/blotter/get.php?id=${id}`)
      if (res.data.success) {
        set({ currentBlotter: res.data.blotter })
      }
    } catch (error) {
      console.error('Failed to fetch blotter detail', error)
    } finally {
      set({ blotterDetailLoading: false })
    }
  },

  createBlotterOnBehalf: async (data) => {
    try {
      const res = await api.post('/blotter/create.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create walk-in blotter')
    }
  },

  updateBlotterStatus: async (id, status, note) => {
    try {
      const res = await api.patch('/blotter/update.php', { id, status, note })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update blotter case')
    }
  },

  // Officials State
  officials: [],
  currentOfficial: null,
  officialsLoading: false,
  fetchOfficials: async (params = {}) => {
    set({ officialsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.active !== undefined) queryParams.append('active', params.active)
      const res = await api.get(`/officials/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({ officials: res.data.officials })
      }
    } catch (error) {
      console.error('Failed to fetch officials', error)
    } finally {
      set({ officialsLoading: false })
    }
  },
  fetchOfficialById: async (id) => {
    set({ officialsLoading: true, currentOfficial: null })
    try {
      const res = await api.get(`/officials/get.php?id=${id}`)
      if (res.data.success) {
        set({ currentOfficial: res.data.official })
      }
    } catch (error) {
      console.error('Failed to fetch official details', error)
    } finally {
      set({ officialsLoading: false })
    }
  },
  createOfficial: async (formData) => {
    try {
      // Must be POST since upload uses multipart/form-data
      const res = await api.post('/officials/add.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create official')
    }
  },
  updateOfficial: async (formData) => {
    try {
      // Must be POST since upload uses multipart/form-data
      const res = await api.post('/officials/update.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update official')
    }
  },
  toggleOfficialActive: async (id, isActive) => {
    try {
      const res = await api.patch('/officials/toggle-active.php', { id, is_active: isActive ? 1 : 0 })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to toggle official active status')
    }
  },

  // Announcements State
  allAnnouncements: [],
  announcementsLoading: false,
  fetchAdminAnnouncements: async (params = {}) => {
    set({ announcementsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('all', '1') // request drafts too
      if (params.category) queryParams.append('category', params.category)
      if (params.limit) queryParams.append('limit', params.limit)
      const res = await api.get(`/announcements/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({ allAnnouncements: res.data.announcements })
      }
    } catch (error) {
      console.error('Failed to fetch admin announcements', error)
    } finally {
      set({ announcementsLoading: false })
    }
  },
  fetchAnnouncementById: async (id) => {
    set({ announcementsLoading: true })
    try {
      const res = await api.get(`/announcements/get.php?id=${id}&all=1`)
      if (res.data.success) {
        return res.data.announcement
      }
      return null
    } catch (error) {
      console.error('Failed to fetch announcement detail', error)
      return null
    } finally {
      set({ announcementsLoading: false })
    }
  },
  createAnnouncement: async (data) => {
    try {
      const res = await api.post('/announcements/add.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create announcement')
    }
  },
  updateAnnouncement: async (data) => {
    try {
      const res = await api.put('/announcements/update.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update announcement')
    }
  },
  deleteAnnouncement: async (id) => {
    try {
      const res = await api.delete(`/announcements/delete.php`, { data: { id } })
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to delete announcement')
    }
  },

  // Programs State
  programs: [],
  currentProgram: null,
  programsLoading: false,
  fetchPrograms: async (params = {}) => {
    set({ programsLoading: true })
    try {
      const queryParams = new URLSearchParams()
      if (params.status) queryParams.append('status', params.status)
      const res = await api.get(`/programs/list.php?${queryParams.toString()}`)
      if (res.data.success) {
        set({ programs: res.data.programs })
      }
    } catch (error) {
      console.error('Failed to fetch programs', error)
    } finally {
      set({ programsLoading: false })
    }
  },
  fetchProgramById: async (id) => {
    set({ programsLoading: true, currentProgram: null })
    try {
      const res = await api.get(`/programs/get.php?id=${id}`)
      if (res.data.success) {
        set({ currentProgram: res.data.program })
      }
    } catch (error) {
      console.error('Failed to fetch program details', error)
    } finally {
      set({ programsLoading: false })
    }
  },
  createProgram: async (data) => {
    try {
      const res = await api.post('/programs/add.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to create program')
    }
  },
  updateProgram: async (data) => {
    try {
      const res = await api.put('/programs/update.php', data)
      return res.data
    } catch (error) {
      throw error.response?.data || new Error('Failed to update program')
    }
  },
}))
