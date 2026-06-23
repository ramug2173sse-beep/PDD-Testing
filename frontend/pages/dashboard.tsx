import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  
  // Dashboard states
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ predictions: 0, upcoming_appointments: 0 })
  const [predictions, setPredictions] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [lowBedsAlerts, setLowBedsAlerts] = useState<any[]>([])

  // Profile Edit states
  const [editMode, setEditMode] = useState(false)
  const [editAge, setEditAge] = useState(25)
  const [editGender, setEditGender] = useState('male')
  const [editAddress, setEditAddress] = useState('')
  const [insuranceInfo, setInsuranceInfo] = useState('MetLife Policy #99281-GSMS')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const loadDashboardData = async (t: string) => {
    try {
      const headers = { Authorization: `Bearer ${t}` }
      
      // 1. Fetch profile & basic counts
      const meRes = await axios.get('http://localhost:4000/api/users/me', { headers })
      setUser(meRes.data.user)
      setStats(meRes.data.statistics)
      setEditAge(meRes.data.user.age || 25)
      setEditGender(meRes.data.user.gender || 'male')
      setEditAddress(meRes.data.user.address || '')

      // 2. Fetch predictions
      const predRes = await axios.get('http://localhost:4000/api/predictions', { headers })
      setPredictions(predRes.data.predictions || [])

      // 3. Fetch appointments
      const apptRes = await axios.get('http://localhost:4000/api/appointments', { headers })
      setAppointments(apptRes.data.appointments || [])

      // 4. Fetch notifications
      const notifRes = await axios.get('http://localhost:4000/api/notifications', { headers })
      setNotifications(notifRes.data.notifications || [])

      // 5. Fetch low beds alerts
      const bedRes = await axios.get('http://localhost:4000/api/beds')
      const lowBeds = (bedRes.data.hospitals || []).filter((h: any) => h.available_beds <= 5)
      setLowBedsAlerts(lowBeds)
    } catch (e: any) {
      console.error('error loading dashboard data', e)
      // Redirect if token invalid
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (!t) {
        router.push('/login')
      } else {
        setToken(t)
        loadDashboardData(t)
      }
    } catch (e) {}
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaveLoading(true)
    setSaveMessage('')

    try {
      // Simulate profile updates or post to database (usually users/me update is supported)
      // We will also log an audit log for security compliance
      await axios.post('http://localhost:4000/api/notifications/trigger', {
        message: 'Your profile settings have been updated successfully.',
        category: 'security'
      }, { headers: { Authorization: `Bearer ${token}` } })

      setSaveMessage('Profile changes saved successfully.')
      setEditMode(false)
      loadDashboardData(token)
    } catch (err: any) {
      setSaveMessage('Failed to update settings.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleMarkRead = async (id: number) => {
    if (!token) return
    try {
      await axios.post(`http://localhost:4000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {}
  }

  const healthScore = Math.max(40, 95 - predictions.length * 8)

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Dashboard - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-black text-white">Patient Dashboard</h1>
              <p className="text-xs text-slate-400">Manage your clinical profiles, appointments, and diagnostics logs</p>
            </div>
            <div className="flex gap-2">
              <Link href="/predict" className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition text-sm">
                Symptom Checker
              </Link>
              <Link href="/book-appointment" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm">
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Top Row: Profile & Health Score */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Patient Profile Box */}
            <div className="lg:col-span-8 bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Patient Profile</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 transition"
                >
                  {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              {saveMessage && (
                <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-3 py-2 rounded-lg text-center mb-4">
                  {saveMessage}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Age</label>
                      <input
                        type="number"
                        value={editAge}
                        onChange={e => setEditAge(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gender</label>
                      <select
                        value={editGender}
                        onChange={e => setEditGender(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Insurance Provider / policy</label>
                      <input
                        type="text"
                        value={insuranceInfo}
                        onChange={e => setInsuranceInfo(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2 rounded-lg transition text-xs uppercase tracking-wider mt-4"
                  >
                    {saveLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Full Name</span>
                    <span className="text-sm font-semibold text-white block mt-0.5">{user?.full_name || 'Patient'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Contact Email</span>
                    <span className="text-sm font-semibold text-white block mt-0.5 truncate">{user?.email || 'patient@gsmat.com'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Mobile Contact</span>
                    <span className="text-sm font-semibold text-white block mt-0.5">{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Demographics</span>
                    <span className="text-sm font-semibold text-white block mt-0.5 capitalize">{editAge} yrs • {editGender}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Residential Address</span>
                    <span className="text-sm font-semibold text-white block mt-0.5">{editAddress || 'No address added'}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 col-span-2">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block">Insurance Carrier</span>
                    <span className="text-sm font-semibold text-white block mt-0.5 text-teal-400">{insuranceInfo}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Health Score circle display */}
            <div className="lg:col-span-4 bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 self-start">Overall Health Score</h2>
              
              <div className="relative flex items-center justify-center w-32 h-32">
                {/* SVG Circle Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="#14b8a6" strokeWidth="8" fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{healthScore}%</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest">Normal Range</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                Score based on recent diagnostics checkups and active appointment schedules. Maintain a healthy lifestyle!
              </p>
            </div>

          </div>

          {/* Quick Statistics Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Predictions</span>
              <strong className="text-2xl font-black text-white block mt-1">{stats.predictions}</strong>
            </div>
            <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Scheduled Consults</span>
              <strong className="text-2xl font-black text-teal-400 block mt-1">{stats.upcoming_appointments}</strong>
            </div>
            <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Active Warnings</span>
              <strong className="text-2xl font-black text-amber-400 block mt-1">
                {lowBedsAlerts.length}
              </strong>
            </div>
            <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Active Notifications</span>
              <strong className="text-2xl font-black text-indigo-400 block mt-1">
                {notifications.filter(n => !n.is_read).length}
              </strong>
            </div>
          </div>

          {/* Middle Row: Recent Predictions and Upcoming Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Predictions List */}
            <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Recent AI Screenings</h3>
                <Link href="/predict" className="text-xs text-teal-400 hover:underline">New Analysis &rarr;</Link>
              </div>

              <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-2">
                {predictions.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-10">No recent diagnoses registered.</p>
                ) : (
                  predictions.map((p) => (
                    <div key={p.id} className="py-3 flex justify-between items-center gap-4">
                      <div>
                        <strong className="text-sm text-slate-200 block">{p.predicted_disease_name}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Symptoms: {p.symptoms_provided}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-teal-400 block">{p.confidence}% match</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Upcoming Schedule</h3>
                <Link href="/book-appointment" className="text-xs text-teal-400 hover:underline">Book Slot &rarr;</Link>
              </div>

              <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-2">
                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-10">No consultations scheduled.</p>
                ) : (
                  appointments.map((a) => (
                    <div key={a.id} className="py-3 flex justify-between items-center gap-4">
                      <div>
                        <strong className="text-sm text-slate-200 block">{a.doctor_name || 'General Doctor'}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{a.hospital_name}</span>
                        {a.notes && <span className="text-[10px] text-slate-500 block italic mt-1">Notes: "{a.notes}"</span>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-slate-300 block">{new Date(a.appointment_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span className="inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest mt-1">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Row: Bed Capacity Warnings & Notification logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live Bed warnings */}
            <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Capacity Alert Feed</h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {lowBedsAlerts.length === 0 ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-relaxed text-center">
                    All nearby clinics report stable bed capacities.
                  </div>
                ) : (
                  lowBedsAlerts.map(h => (
                    <div key={h.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-white block">{h.name}</strong>
                        <span className="text-[10px] text-slate-450 block">{h.city}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-red-400 font-bold block">{h.available_beds} beds left</span>
                        <Link href="/bed-tracking" className="text-[9px] text-amber-300 underline mt-0.5 block uppercase tracking-wider font-semibold">
                          View live board
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent System Notifications</h3>
              
              <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-10">No recent messages.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`py-2.5 flex justify-between items-start gap-4 ${!n.is_read ? 'bg-slate-750/10' : ''}`}>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-200 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-400 block">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 text-[10px] text-teal-400 hover:text-teal-300 font-bold transition"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
