import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const services = [
  { title: 'Request documents from home', desc: 'Start common barangay requests without lining up first.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z' },
  { title: 'Know what happens next', desc: 'Track whether your request is pending, processing, or ready.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { title: 'Keep your details updated', desc: 'Help the barangay office verify your resident information faster.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { title: 'Stay informed', desc: 'Read important advisories and announcements for Baesa residents.', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
]

const documents = [
  'Barangay Clearance',
  'Certificate of Residency',
  'Certificate of Indigency',
  'Business Clearance',
  'Certificate of Good Moral Character',
  'Barangay ID Application',
  'First Time Job Seeker Certification',
  'Community Tax Certificate',
]

const contactItems = [
  { label: 'Address', value: '22 Saklolo St., Manotoc Subdivision, Brgy. Baesa, Quezon City', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Phone', value: '7-3393-122 / 0962-715-0979', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  { label: 'Email', value: 'baesajuan4all@gmail.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

const officeHours = [
  { day: 'Monday to Friday', hours: '8:00 AM - 5:00 PM' },
  { day: 'Saturday', hours: '9:00 AM - 12:00 PM' },
  { day: 'Sunday and Holidays', hours: 'Closed' },
]

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={d} />
    </svg>
  )
}

export default function Landing() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/announcements/list.php?limit=3')
        if (res.data.success) {
          setAnnouncements(res.data.announcements)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  return (
    <div className="animate-fade-in bg-white dark:bg-navy-950">
      <section className="relative min-h-[620px] overflow-hidden border-b border-accent-700/20 bg-accent-900 dark:border-slate-800">
        <img
          src="/images/baesa.jpg"
          alt="Barangay Baesa community building"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-accent-900/80" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-md bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-accent-100 ring-1 ring-white/15">For Baesa Residents</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Barangay services made easier to reach
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Baesys helps Barangay Baesa residents request documents, follow updates, and contact the barangay office through one simple online portal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-navy btn-lg">Create Resident Account</Link>
              <Link to="/login" className="btn btn-white-soft btn-lg">Sign In</Link>
            </div>
            <p className="mt-4 text-sm text-accent-100/85">Use your account to submit requests and check status anytime.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Resident Services</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">What you can do online</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Start the common tasks residents usually visit the barangay hall for, then come in only when needed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div key={service.title} className="card p-5 hover:border-accent-500/30">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300">
                  <Icon d={service.icon} />
                </div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Document Requests</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Available documents</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Choose the document you need and submit the request from your resident account. Staff will review the details before release.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {documents.map((doc) => (
              <div key={doc} className="card flex min-h-24 items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-accent-700 text-white">
                  <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">{doc}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Request through your resident account.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Announcements</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Latest news & advisories</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Stay updated with the newest updates, notices, and events from the Barangay.
              </p>
            </div>
            <Link to="/announcements" className="mt-4 sm:mt-0 text-sm font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 flex items-center">
              View All Announcements
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No recent announcements.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="card p-6 hover:border-slate-350 dark:hover:border-slate-700 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300">
                        {ann.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      <Link to={`/announcements/${ann.id}`}>
                        {ann.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">By {ann.author_name || 'Admin'}</span>
                    <Link to={`/announcements/${ann.id}`} className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline">
                      Read more
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-navy-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Need Help?</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Contact Barangay Baesa</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              For document follow-ups, account help, or concerns that need in-person assistance, you may reach the barangay office through these details.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {contactItems.map((item) => (
                <div key={item.label} className="card p-5">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300">
                    <Icon d={item.icon} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                  <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-900 [overflow-wrap:anywhere] dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Office hours</h3>
            <div className="mt-5 card overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {officeHours.map((item) => (
                  <div key={item.day} className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.day}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.hours}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
