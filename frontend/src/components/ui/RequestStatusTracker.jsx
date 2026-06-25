// src/components/ui/RequestStatusTracker.jsx
// Visual stepper tracker for document request lifecycle

const steps = [
  { id: 'pending', label: 'Submitted', desc: 'Request sent' },
  { id: 'processing', label: 'Processing', desc: 'Under review' },
  { id: 'ready_for_pickup', label: 'Ready', desc: 'Ready for pickup' },
  { id: 'released', label: 'Released', desc: 'Collected' }
]

export default function RequestStatusTracker({ status }) {
  // Find current step index
  const currentIdx = steps.findIndex((step) => step.id === status)

  return (
    <div className="w-full py-4">
      {/* Stepper container */}
      <div className="flex items-center justify-between relative">

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx || (status === 'released' && idx === currentIdx)
          const isActive = idx === currentIdx && status !== 'released'
          const isPending = idx > currentIdx

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
              {/* Step indicator circle */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-accent-600 text-white' 
                    : isActive 
                      ? 'bg-accent-700 text-white dark:bg-accent-500' 
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              {/* Labels */}
              <div className="text-center mt-2">
                <p 
                  className={`text-xs font-semibold ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : isCompleted 
                        ? 'text-slate-600 dark:text-slate-350' 
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
