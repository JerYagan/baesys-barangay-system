// src/components/ui/Toast.jsx
// Clean toast notifications
import { useNotifStore } from '../../store/useNotifStore'

const icons = {
  success: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
    </svg>
  ),
}

const styles = {
  success: 'bg-success-light text-success border-success/20 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  error: 'bg-danger-light text-danger border-danger/20 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  warning: 'bg-warning-light text-warning border-warning/20 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  info: 'bg-info-light text-info border-info/20 dark:bg-accent-900/30 dark:text-accent-400 dark:border-accent-800',
}

export default function Toast() {
  const { toasts, removeToast } = useNotifStore()
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium animate-slide-down ${styles[t.type]}`}>
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity p-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
