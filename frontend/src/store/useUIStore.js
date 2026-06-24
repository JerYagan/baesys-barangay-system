// src/store/useUIStore.js
// Manages UI state: sidebar, modals, page title, theme
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light', // 'light' | 'dark'
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Modal
      activeModal: null,
      modalData: null,
      openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Page title (shown in topbar)
      pageTitle: 'Dashboard',
      setPageTitle: (title) => set({ pageTitle: title }),

      // Mobile
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      setIsMobile: (isMobile) => set({ isMobile }),
    }),
    {
      name: 'baesys-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Apply theme on initial load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('baesys-ui')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      applyTheme(parsed?.state?.theme || 'light')
    } catch {
      applyTheme('light')
    }
  }
}
