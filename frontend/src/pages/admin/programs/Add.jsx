// src/pages/admin/programs/Add.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'

export default function AddProgram() {
  const navigate = useNavigate()
  const { createProgram } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('upcoming')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [beneficiaries, setBeneficiaries] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !status) {
      showError('Program name and status are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await createProgram({
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget !== '' ? parseFloat(budget) : null,
        target_beneficiaries: beneficiaries.trim() || null,
      })
      if (res.success) {
        showSuccess('Program recorded successfully!')
        navigate('/admin/programs')
      } else {
        showError(res.message || 'Failed to create program.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/programs"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2"
        >
          ➔ Back to Programs
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Add New Program</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Register a barangay program or project. Track budgets, timelines, and targeted beneficiaries.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="label">Program / Project Name *</label>
            <input
              type="text"
              placeholder="e.g. Oplan Linis Barangay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input text-xs"
              required
            />
          </div>

          <div>
            <label className="label">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input text-xs"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Allocated Budget (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 15000.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="label">Target Beneficiaries</label>
              <input
                type="text"
                placeholder="e.g. Senior Citizens, Youth"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Program Description</label>
            <textarea
              placeholder="Describe the program objectives, scope, and expected outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input text-xs resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm px-6"
            >
              {submitting ? 'Saving Program...' : 'Save Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
