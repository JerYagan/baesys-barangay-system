// src/pages/resident/profile/DigitalID.jsx
import { useEffect, useState } from 'react'
import { useResidentStore } from '../../../store/useResidentStore'
import Spinner from '../../../components/ui/Spinner'
import { useNotifStore } from '../../../store/useNotifStore'
import { useAuthStore } from '../../../store/useAuthStore'

export default function DigitalID() {
  const { digitalId, digitalIdStatus, digitalIdLoading, fetchDigitalId, requestDigitalId } = useResidentStore()
  const { success: showSuccess, error: showError } = useNotifStore()
  const [requestLoading, setRequestLoading] = useState(false)

  useEffect(() => {
    fetchDigitalId()
  }, [])

  const handleRequest = async () => {
    setRequestLoading(true)
    try {
      const res = await requestDigitalId()
      showSuccess(res.message || 'Request submitted successfully')
      fetchDigitalId()
    } catch (err) {
      showError(err.message || 'Failed to submit request')
    } finally {
      setRequestLoading(false)
    }
  }

  if (digitalIdLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mx-auto space-y-6 py-6 flex flex-col items-center">
      {/* Title */}
      <div className="w-full text-left">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verification</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Digital Barangay ID</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Access your official digital verification pass and QR code for relief distribution and checkpoints.</p>
      </div>

      {!digitalId ? (
        <div className="card p-8 text-center max-w-lg space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          {digitalIdStatus === 'requested' ? (
            <>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Digital ID Request Pending</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your request for a Digital Barangay ID Card has been submitted and is currently pending approval. The Barangay Secretariat staff will review your application and generate your virtual ID shortly.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Review
                </span>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Digital ID Not Issued</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your Digital Barangay ID Card has not been generated yet. You can submit a request below to generate your virtual ID, which will be available as soon as it is approved by the admin.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleRequest}
                  disabled={requestLoading}
                  className="btn btn-primary px-6 py-2.5 text-xs font-bold w-full"
                >
                  {requestLoading ? 'Submitting Request...' : '📩 Request Barangay ID Card'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 w-full max-w-5xl">
          {/* Back to Back Cards Layout */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center w-full">
            
            {/* FRONT SIDE */}
            <div className="relative w-80 h-[480px] rounded-2xl bg-white border-2 border-accent-600 shadow-xl p-5 flex flex-col justify-between dark:bg-slate-900 dark:border-accent-500">
              {/* Header logo / title */}
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <img src="/images/logo-light.png" alt="Logo" className="w-9 h-9 object-contain" />
                <div>
                  <span className="block text-xs font-black tracking-wider text-accent-700 dark:text-accent-400 uppercase leading-none">Republic of the Philippines</span>
                  <span className="block text-[11px] font-bold text-slate-900 dark:text-white uppercase mt-0.5">Barangay Baesa, Quezon City</span>
                  <span className="block text-[8px] font-medium text-slate-400 leading-none">National Capital Region</span>
                </div>
              </div>

              {/* Card Body (Photo + Primary details) */}
              <div className="flex flex-col items-center my-4 space-y-3">
                <div className="w-28 h-28 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {digitalId.profile_path ? (
                    <img
                      src={digitalId.profile_path.startsWith('/uploads') ? `/backend${digitalId.profile_path}` : digitalId.profile_path}
                      alt="Resident profile photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Resident Name</span>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white uppercase mt-0.5">
                    {digitalId.last_name}, {digitalId.first_name} {digitalId.middle_name}
                  </h2>
                </div>
              </div>

              {/* Additional metadata */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Purok / Area</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{digitalId.purok}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Expiration</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{formatDate(digitalId.digital_id_expires_at)}</span>
                </div>
              </div>

              {/* Bottom ID tag */}
              <div className="w-full bg-accent-700 text-white dark:bg-accent-600 rounded-lg py-2 text-center font-black text-xs uppercase tracking-widest mt-3">
                ID NO: {digitalId.barangay_id_no}
              </div>
            </div>

            {/* BACK SIDE (Generic Barangay ID Design) */}
            <div className="relative w-80 h-[480px] rounded-2xl bg-white border-2 border-accent-600 shadow-xl p-5 flex flex-col justify-between dark:bg-slate-900 dark:border-accent-500">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2 text-center">
                <span className="text-xs font-black text-accent-700 dark:text-accent-400 uppercase tracking-wider block">Terms & Verification</span>
              </div>

              {/* Certification Statement */}
              <div className="text-center my-2">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  This certifies that the bearer whose name, photo, and signature appear on this card is a registered resident of Barangay Baesa, Quezon City.
                </p>
              </div>

              {/* QR and Verification info */}
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-inner">
                  {digitalId.qr_code_url ? (
                    <img src={digitalId.qr_code_url} alt="Verification QR Code" className="w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                  )}
                </div>
                <p className="text-[8px] text-slate-400 text-center leading-normal max-w-[200px]">
                  Scan this QR code to verify ID authenticity.
                </p>
              </div>

              {/* Signatures Panel */}
              <div className="grid grid-cols-2 gap-4 text-center my-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-col justify-end min-h-[48px]">
                  <div className="border-b border-slate-400 dark:border-slate-600 mx-2"></div>
                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Resident Signature</span>
                </div>
                <div className="flex flex-col justify-end min-h-[48px]">
                  <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 leading-none">HON. JOSE A. PEREZ</span>
                  <span className="text-[7px] text-slate-400 uppercase tracking-wider leading-none mt-0.5">Barangay Captain</span>
                  <div className="border-b border-slate-400 dark:border-slate-600 mx-2 mt-1"></div>
                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Authorized Officer</span>
                </div>
              </div>

              {/* Security details list */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-xs space-y-1">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400 block uppercase">Issued Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(digitalId.digital_id_issued_at)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400 block uppercase">Emergency Contact</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">7-3393-122</span>
                </div>
                <div className="flex flex-col text-[7px] text-slate-400 leading-none pt-1">
                  <span className="uppercase">Secure Signature Hash</span>
                  <span className="font-mono mt-0.5 break-all select-all">{digitalId.digital_id_secure_hash}</span>
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-[8px] text-slate-400 text-center italic border-t border-slate-100 dark:border-slate-800 pt-1.5 leading-tight">
                If found, please return to: Barangay Hall, 22 Saklolo St., Manotoc Subd., Brgy. Baesa, QC.
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="w-full max-w-sm flex gap-3">
            <a
              href={`/backend/api/digital-id/download-card.php?token=${useAuthStore.getState().token}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 btn btn-primary py-2.5 font-semibold text-xs text-center"
            >
              📥 Download Printable PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
