// src/components/ui/StatusBadge.jsx
// Clean status badge — no gradients, simple pill

const config = {
  pending:          { label: 'Pending',          bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  processing:       { label: 'Processing',       bg: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' },
  ready_for_pickup: { label: 'Ready for Pickup', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  released:         { label: 'Released',         bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  open:             { label: 'Open',             bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  under_mediation:  { label: 'Under Mediation',  bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  resolved:         { label: 'Resolved',         bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  referred:         { label: 'Referred',         bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  active:           { label: 'Active',           bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactive:         { label: 'Inactive',         bg: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  upcoming:         { label: 'Upcoming',         bg: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' },
  ongoing:          { label: 'Ongoing',          bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  completed:        { label: 'Completed',        bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  admin:            { label: 'Admin',            bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  staff:            { label: 'Staff',            bg: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' },
  resident:         { label: 'Resident',         bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

export default function StatusBadge({ status, label, size = 'sm' }) {
  const c = config[status] || { label: label || status, bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[0.625rem]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${c.bg} ${sizes[size]}`}>
      {label || c.label}
    </span>
  )
}
