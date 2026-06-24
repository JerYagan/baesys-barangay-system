export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
    xl: 'w-16 h-16 border-2',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-slate-200 border-t-accent-600 dark:border-slate-800 dark:border-t-accent-400`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="animate-pulse text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
