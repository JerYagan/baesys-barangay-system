// src/pages/admin/programs/View.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAdminStore } from '../../../store/useAdminStore'
import { useNotifStore } from '../../../store/useNotifStore'
import StatusBadge from '../../../components/ui/StatusBadge'
import Spinner from '../../../components/ui/Spinner'

function formatCurrency(value) {
  if (value == null || value === '') return '—'
  return '₱' + parseFloat(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ProgramDetail() {
  const { id } = useParams()
  const { currentProgram, programsLoading, fetchProgramById, updateProgram } = useAdminStore()
  const { success: showSuccess, error: showError } = useNotifStore()

  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('upcoming')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [beneficiaries, setBeneficiaries] = useState('')

  useEffect(() => {
    fetchProgramById(id)
  }, [id])

  useEffect(() => {
    if (currentProgram) {
      setName(currentProgram.name || '')
      setDescription(currentProgram.description || '')
      setStatus(currentProgram.status || 'upcoming')
      setStartDate(currentProgram.start_date?.slice(0, 10) || '')
      setEndDate(currentProgram.end_date?.slice(0, 10) || '')
      setBudget(currentProgram.budget != null ? String(currentProgram.budget) : '')
      setBeneficiaries(currentProgram.target_beneficiaries || '')
    }
  }, [currentProgram])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim() || !status) {
      showError('Program name and status are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await updateProgram({
        id: parseInt(id),
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget !== '' ? parseFloat(budget) : null,
        target_beneficiaries: beneficiaries.trim() || null,
      })
      if (res.success) {
        showSuccess('Program updated successfully!')
        setEditing(false)
        fetchProgramById(id)
      } else {
        showError(res.message || 'Failed to update program.')
      }
    } catch (err) {
      showError(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  if (programsLoading && !currentProgram) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!currentProgram) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-red-600">Program Not Found</h2>
        <p className="text-sm text-slate-500">The program record could not be loaded.</p>
        <Link to="/admin/programs" className="btn btn-secondary btn-sm">Back to Programs</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div>
        <Link
          to="/admin/programs"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          ➔ Back to Programs
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Program #{currentProgram.id}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentProgram.name}
          </h1>
          {currentProgram.description && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">{currentProgram.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={currentProgram.status} size="md" />
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary btn-sm"
            >
              Edit Program
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left — Summary Card */}
        <div className="md:col-span-1">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Project Summary
            </h3>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-slate-400 mb-0.5">Status</dt>
                <dd><StatusBadge status={currentProgram.status} /></dd>
              </div>
              <div>
                <dt className="text-slate-400 mb-0.5">Allocated Budget</dt>
                <dd className="font-bold text-base text-slate-900 dark:text-white">{formatCurrency(currentProgram.budget)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 mb-0.5">Start Date</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(currentProgram.start_date)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 mb-0.5">End Date</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(currentProgram.end_date)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 mb-0.5">Target Beneficiaries</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-300">{currentProgram.target_beneficiaries || '—'}</dd>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-400 mb-0.5">Date Recorded</dt>
                <dd className="text-slate-500">{new Date(currentProgram.created_at).toLocaleString()}</dd>
              </div>
              {currentProgram.updated_at && (
                <div>
                  <dt className="text-slate-400 mb-0.5">Last Updated</dt>
                  <dd className="text-slate-500">{new Date(currentProgram.updated_at).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right — Detail / Edit */}
        <div className="md:col-span-2">
          {editing ? (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                Edit Program Details
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="label">Program Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input text-xs" required />
                </div>
                <div>
                  <label className="label">Status *</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-xs" required>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input text-xs" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input text-xs" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Budget (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Target Beneficiaries</label>
                    <input type="text" value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} className="input text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="input text-xs resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-sm px-6">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Program Description & Details
              </h3>
              {currentProgram.description ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentProgram.description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No description recorded for this program.</p>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Quick Status Update</h4>
                <div className="flex items-center gap-3">
                  {['upcoming', 'ongoing', 'completed'].map((s) => (
                    <button
                      key={s}
                      disabled={currentProgram.status === s || submitting}
                      onClick={async () => {
                        setSubmitting(true)
                        try {
                          const res = await updateProgram({
                            id: parseInt(id),
                            name: currentProgram.name,
                            description: currentProgram.description,
                            status: s,
                            start_date: currentProgram.start_date,
                            end_date: currentProgram.end_date,
                            budget: currentProgram.budget,
                            target_beneficiaries: currentProgram.target_beneficiaries,
                          })
                          if (res.success) {
                            showSuccess(`Program status updated to ${s}.`)
                            fetchProgramById(id)
                          } else {
                            showError(res.message)
                          }
                        } catch (err) {
                          showError(err.message)
                        } finally {
                          setSubmitting(false)
                        }
                      }}
                      className={`btn btn-sm capitalize ${currentProgram.status === s ? 'btn-primary opacity-60 cursor-not-allowed' : 'btn-secondary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-400">Click a status button to quickly update the project stage.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
