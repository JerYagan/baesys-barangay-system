// src/store/useAuthStore.js
// Manages authenticated user session, JWT token, and role
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,

      /**
       * Set auth state after successful login
       */
      setAuth: (user, token) =>
        set({
          user,
          token,
          role: user.role,
          isAuthenticated: true,
        }),

      /**
       * Clear auth state on logout
       */
      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
        }),

      /**
       * Update user profile data (e.g., after editing profile)
       */
      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      /**
       * Check if the current user has a specific role
       */
      hasRole: (role) => {
        const state = get()
        if (state.role === 'admin') return true // admin has all access
        return state.role === role
      },
    }),
    {
      name: 'baesys-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
