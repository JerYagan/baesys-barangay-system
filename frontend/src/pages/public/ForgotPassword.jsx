// src/pages/public/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-navy-950">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-md bg-accent-700 dark:bg-accent-600 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Reset your password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your email to receive instructions.</p>
        </div>

        <div className="card p-6">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-success-light dark:bg-navy-800 flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Instructions sent to <strong>{email}</strong></p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Note: Email is not configured for local installations. Contact the barangay office.
              </p>
              <Link to="/login" className="btn btn-secondary w-full mt-4">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="label">Email</label>
                <input id="forgot-email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-full">Send reset link</button>
              <p className="text-center text-sm text-slate-500 dark:text-navy-400">
                <Link to="/login" className="text-accent-600 dark:text-accent-400 font-medium hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
