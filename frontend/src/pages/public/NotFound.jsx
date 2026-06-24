// src/pages/public/NotFound.jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-navy-950">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-slate-200 dark:text-navy-800 select-none">404</p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Page not found</h1>
        <p className="text-sm text-slate-500 dark:text-navy-400 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary">Go back</button>
        </div>
      </div>
    </div>
  )
}
