// src/components/ui/ConfirmDialog.jsx
// "Are you sure?" confirmation modal
import Modal from './Modal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) {
  const variantClasses = {
    danger: 'btn btn-danger',
    warning: 'btn bg-warning text-white border-warning hover:bg-amber-700',
    primary: 'btn btn-primary',
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-md bg-danger-light dark:bg-red-950/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn ${variantClasses[variant]}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
