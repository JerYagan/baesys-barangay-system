// src/pages/admin/digital-id/Scanner.jsx
import { useEffect, useState } from 'react'
import { useAdminStore } from '../../../store/useAdminStore'
import { useUIStore } from '../../../store/useUIStore'
import { useNotifStore } from '../../../store/useNotifStore'
import Spinner from '../../../components/ui/Spinner'

export default function IDScanner() {
  const { setPageTitle } = useUIStore()
  const { scanVerifyDigitalId } = useAdminStore()
  const { error: showNotifError } = useNotifStore()

  const [inputHash, setInputHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { verified: boolean, message: string, resident: object }

  useEffect(() => {
    setPageTitle('ID Checkpoint')
  }, [])

  const handleVerify = async (hashToVerify) => {
    if (!hashToVerify.trim()) return

    setLoading(true)
    setResult(null)
    try {
      // If it is a full verification URL, extract only the hash parameter
      let secureHash = hashToVerify.trim()
      if (secureHash.includes('hash=')) {
        secureHash = secureHash.split('hash=')[1].split('&')[0]
      }

      const res = await scanVerifyDigitalId(secureHash)
      if (res.success) {
        setResult(res)
      } else {
        showNotifError(res.message || 'Verification request failed.')
      }
    } catch (err) {
      showNotifError(err.message || 'An error occurred during verification.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    handleVerify(inputHash)
  }

  const handleClear = () => {
    setInputHash('')
    setResult(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Security Checkpoint</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Verify Resident Digital ID</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Verify mobile passes, scan security hash keys, and check citizen credentials.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Scanner Code Input Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Scan/Verify Panel
            </h3>

            {/* Mock Camera Scan Interface */}
            <div className="w-full aspect-square max-w-[280px] mx-auto rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center items-center relative overflow-hidden group">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-accent-600"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-accent-600"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-accent-600"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-accent-600"></div>

              <svg className="w-16 h-16 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 20h2M4 14H2m4 0H4v-4m14 4h2M6 20h2M4 18h2m-2-4h2M8 4h2" />
              </svg>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">Camera Ready</span>
              
              {/* Overlay scanning line micro-animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-accent-500 top-1/2 animate-bounce"></div>
            </div>

            {/* Manual Code Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="label text-[10px] font-bold uppercase tracking-wider" htmlFor="hash">
                  Security Hash Key / QR URL
                </label>
                <input
                  type="text"
                  id="hash"
                  required
                  placeholder="Paste secure SHA-256 hash or scan URL"
                  value={inputHash}
                  onChange={(e) => setInputHash(e.target.value)}
                  className="input text-xs font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn btn-primary py-2 font-semibold text-xs"
                >
                  {loading ? 'Verifying...' : 'Verify ID'}
                </button>
                {inputHash && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-secondary py-2 px-4 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Verification Results Panel */}
        <div className="md:col-span-1">
          <div className="card p-6 min-h-[380px] flex flex-col justify-center items-center text-center">
            {loading ? (
              <Spinner size="lg" />
            ) : !result ? (
              <div className="text-slate-400 dark:text-slate-600 space-y-3">
                <svg className="w-16 h-16 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400">Awaiting Checkpoint Verification</h3>
                <p className="text-xs leading-relaxed max-w-[240px] mx-auto">
                  Scan a QR code pass or enter a security hash code lookup on the left panel to execute verification.
                </p>
              </div>
            ) : result.verified ? (
              // VERIFIED SUCCESS
              <div className="w-full space-y-6 animate-fade-in">
                {/* Check badge */}
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 px-4 py-1.5 rounded-full border border-green-200/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                  <span className="text-xs font-black uppercase tracking-wider">VERIFIED PASSPORT</span>
                </div>

                {/* Profile card layout */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                    {result.resident.profile_path ? (
                      <img 
                        src={result.resident.profile_path.startsWith('/uploads') ? `/backend${result.resident.profile_path}` : result.resident.profile_path} 
                        alt="Resident photo" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase leading-none">
                      {result.resident.last_name}, {result.resident.first_name} {result.resident.middle_name}
                    </h2>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">ID NO: {result.resident.barangay_id_no}</span>
                  </div>
                </div>

                {/* Metadata Table */}
                <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 grid grid-cols-2 gap-y-3 gap-x-2 text-left text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Purok</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{result.resident.purok}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Expiration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(result.resident.digital_id_expires_at)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 block uppercase">Full Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight block">{result.resident.address}</span>
                  </div>
                </div>
              </div>
            ) : (
              // VERIFIED FAILED (INVALID / EXPIRED)
              <div className="space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-200/50">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-sm text-red-600 dark:text-red-400 uppercase tracking-wider">VERIFICATION FAILED</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[250px] mx-auto">
                  {result.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
