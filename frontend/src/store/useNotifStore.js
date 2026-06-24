// src/store/useNotifStore.js
// Manages toast notification queue
import { create } from 'zustand'

let toastId = 0

export const useNotifStore = create((set, get) => ({
  toasts: [],

  /**
   * Add a toast notification
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} message
   * @param {number} duration - Auto-dismiss in milliseconds (default: 4000)
   */
  addToast: (type, message, duration = 4000) => {
    const id = ++toastId
    const toast = { id, type, message, duration }

    set((state) => ({
      toasts: [...state.toasts, toast],
    }))

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }

    return id
  },

  /**
   * Remove a specific toast by ID
   */
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  /**
   * Clear all toasts
   */
  clearToasts: () => set({ toasts: [] }),

  // Convenience methods
  success: (message, duration) => get().addToast('success', message, duration),
  error: (message, duration) => get().addToast('error', message, duration ?? 6000),
  info: (message, duration) => get().addToast('info', message, duration),
  warning: (message, duration) => get().addToast('warning', message, duration ?? 5000),
}))
