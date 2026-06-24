import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useNotifStore } from '../../store/useNotifStore'
import { login as loginApi } from '../../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const addToast = useNotifStore((s) => s.addToast)

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = await loginApi(form.email, form.password)
      if (data.success) {
        setAuth(data.user, data.token)
        addToast('success', 'Welcome back, ' + data.user.first_name + '!')
        if (data.user.role === 'admin' || data.user.role === 'staff') {
          navigate('/admin/dashboard')
        } else {
          navigate('/resident/dashboard')
        }
      }
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-navy-950">
      <div className="w-full max-w-md">
        <div className="mb-7">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-accent-700 dark:bg-accent-600">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Sign in to Baesys</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Access resident services and barangay operations.</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <input
                id="login-email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="login-password" className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-accent-700 hover:underline dark:text-accent-400">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-accent-700 hover:underline dark:text-accent-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
