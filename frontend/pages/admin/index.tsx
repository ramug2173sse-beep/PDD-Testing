import Head from 'next/head'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentUser, getToken } from '../../utils/auth'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminIndexPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [checking, setChecking] = useState(true)
  const [counts, setCounts] = useState<any>(null)
  const [error, setError] = useState('')

  const checkAdminAndLoad = async () => {
    try {
      const user = await fetchCurrentUser()
      if (!user || user.role !== 'admin') {
        router.push('/admin/login')
        return
      }
      
      const t = getToken() || ''
      setToken(t)
      setChecking(false)
      
      // Load operational stats
      const headers = { Authorization: `Bearer ${t}` }
      const r = await axios.get('http://localhost:4000/api/admin/stats', { headers })
      setCounts(r.data.counts)
    } catch (e: any) {
      console.error(e)
      setError('Failed to load administrative stats. Access token may have expired.')
      router.push('/admin/login')
    }
  }

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  function handleLogout() {
    try {
      localStorage.removeItem('token')
    } catch (e) {}
    router.push('/admin/login')
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Admin Dashboard - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                System Administrator
              </span>
              <h1 className="text-3xl font-black text-white mt-1">Control Panel</h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage regional hospitals directories, patient accounts status, and view metrics</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl border border-slate-750 transition text-xs uppercase tracking-wider shrink-0"
            >
              Sign Out
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          {/* Quick Portal Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/hospitals"
              className="bg-slate-850 border border-slate-800 p-5 rounded-xl text-center font-bold text-sm text-slate-200 hover:border-teal-500 hover:bg-slate-800/40 transition duration-200"
            >
              🏢 Manage Hospitals & Beds
            </Link>
            <Link
              href="/admin/users"
              className="bg-slate-850 border border-slate-800 p-5 rounded-xl text-center font-bold text-sm text-slate-200 hover:border-teal-500 hover:bg-slate-800/40 transition duration-200"
            >
              👥 Manage Patients Directory
            </Link>
            <Link
              href="/admin/analytics"
              className="bg-slate-850 border border-slate-800 p-5 rounded-xl text-center font-bold text-sm text-slate-200 hover:border-teal-500 hover:bg-slate-800/40 transition duration-200"
            >
              📊 Operational Analytics
            </Link>
          </div>

          {/* Statistics Grid */}
          {checking ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-slate-850 border border-slate-800 p-6 rounded-xl h-24"></div>
              ))}
            </div>
          ) : counts && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl shadow-lg">
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-bold">Patient Registrations</span>
                <strong className="text-3xl font-black text-white block mt-1.5">{counts.users}</strong>
                <span className="text-[9px] text-slate-500 block mt-1">Active profile nodes</span>
              </div>

              <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl shadow-lg">
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-bold">Hospital Nodes</span>
                <strong className="text-3xl font-black text-teal-400 block mt-1.5">{counts.hospitals}</strong>
                <span className="text-[9px] text-slate-500 block mt-1">Connected clinics</span>
              </div>

              <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl shadow-lg">
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-bold">AI Diagnostics Runs</span>
                <strong className="text-3xl font-black text-indigo-400 block mt-1.5">{counts.predictions}</strong>
                <span className="text-[9px] text-slate-500 block mt-1">Screening query counts</span>
              </div>

              <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl shadow-lg">
                <span className="text-[10px] text-slate-450 uppercase tracking-wider block font-bold">Active Bookings</span>
                <strong className="text-3xl font-black text-emerald-450 block mt-1.5">{counts.appointments}</strong>
                <span className="text-[9px] text-slate-500 block mt-1">Scheduled consultations</span>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
