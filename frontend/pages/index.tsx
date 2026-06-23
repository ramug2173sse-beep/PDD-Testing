import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import HospitalCard from '../components/HospitalCard'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function Home() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [searchCity, setSearchCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchHospitals = async (city = '') => {
    setLoading(true)
    setError('')
    try {
      const url = city 
        ? `http://localhost:4000/api/hospitals?city=${encodeURIComponent(city)}`
        : 'http://localhost:4000/api/hospitals'
      const res = await axios.get(url)
      setHospitals(res.data || [])
    } catch (e: any) {
      setError('Could not fetch nearby hospitals. Please ensure the backend is running.')
      // Fallback
      setHospitals([
        { id: 1, name: 'Chennai City Hospital', city: 'Chennai', total_beds: 200, available_beds: 45, icu_beds: 30, available_icu: 8, ventilators: 15, available_ventilators: 4, phone: '+914428290200', emergency: true, rating: 4.6, distance: '1.2 km' },
        { id: 2, name: 'Apollo Health Center', city: 'Chennai', total_beds: 150, available_beds: 12, icu_beds: 20, available_icu: 2, ventilators: 10, available_ventilators: 0, phone: '+914426260000', emergency: true, rating: 4.4, distance: '2.5 km' },
        { id: 3, name: 'Metro Emergency Clinic', city: 'Chennai', total_beds: 50, available_beds: 0, icu_beds: 5, available_icu: 0, ventilators: 3, available_ventilators: 0, phone: '+914424910000', emergency: true, rating: 3.9, distance: '3.8 km' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHospitals(searchCity)
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>GSMS - Smart Medical Assistance System</title>
        <meta name="description" content="AI symptom prediction, real-time hospital bed capacity tracking, and doctor appointment scheduling system." />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;850&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Outfit', sans-serif;
            background-color: #0b1329;
          }
        `}</style>
      </Head>

      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Advanced Healthcare Platform
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  Hospital-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Smart Medical</span> Assistance
                </h1>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Analyze symptoms instantly with AI diagnostic modeling, monitor real-time ICU and ventilator bed availability, and book direct specialist appointments.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link href="/predict" className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-900 font-extrabold rounded-xl transition duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20">
                    Check Symptoms Now
                  </Link>
                  <Link href="/bed-tracking" className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition duration-200">
                    Live Bed Tracking
                  </Link>
                </div>
              </div>

              {/* Hero Vector Dashboard representation */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-emerald-500/10 rounded-2xl filter blur-3xl opacity-50"></div>
                <div className="relative bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-6">
                  
                  {/* Status header */}
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">GSMS Center Status</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Online
                    </span>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-2xl font-black text-teal-400">99.2%</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Prediction Match</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                      <span className="text-2xl font-black text-emerald-400">45</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Available Beds</p>
                    </div>
                  </div>

                  {/* Quick SOS alert */}
                  <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2.5 bg-red-650 rounded-lg text-white">
                      <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Critical Emergency Access</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">Need immediate clinical dispatch? Access ambulance triggers and map coordinates.</p>
                      <Link href="/emergency" className="text-[10px] text-red-400 font-bold hover:underline uppercase tracking-wider block mt-1">
                        Trigger SOS Dispatch &rarr;
                      </Link>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Comprehensive Clinical Portals</h2>
            <p className="text-slate-400 text-sm">
              Integrated medical solutions connecting symptom prediction, physical bed availability, and consult bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Predict Portal */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">AI Symptom Prediction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search and register multiple health concerns. Analyze severity, map potential ailments, and access tailored medications and prevention plans.
                </p>
              </div>
              <Link href="/predict" className="text-teal-450 hover:text-teal-400 text-xs font-bold uppercase tracking-wider mt-6 inline-flex items-center gap-1">
                Analyze Symptoms &rarr;
              </Link>
            </div>

            {/* Live Beds Portal */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Real-Time Bed Board</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Live dashboard tracks general ward, ICU, and ventilator capacity across regional clinics, synced instantly via Server-Sent Events (SSE).
                </p>
              </div>
              <Link href="/bed-tracking" className="text-emerald-450 hover:text-emerald-450 text-xs font-bold uppercase tracking-wider mt-6 inline-flex items-center gap-1">
                Browse Capacities &rarr;
              </Link>
            </div>

            {/* Doctor Bookings Portal */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Consultation Scheduling</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avoid physical queues. Select regional hospitals, browse practicing specialists, filter consultation fees, and reserve slots.
                </p>
              </div>
              <Link href="/book-appointment" className="text-indigo-400 hover:text-indigo-350 text-xs font-bold uppercase tracking-wider mt-6 inline-flex items-center gap-1">
                Book Appointment &rarr;
              </Link>
            </div>

          </div>
        </section>

        {/* Nearby Hospitals Section */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Nearby Hospital Resources</h2>
                <p className="text-slate-400 text-sm max-w-xl">
                  Real-time general bed and ICU counts. Search by city to find emergency clinics closest to your current location.
                </p>
              </div>

              {/* City Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto max-w-sm">
                <input
                  type="text"
                  placeholder="Enter city (e.g. Chennai)"
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                />
                <button type="submit" className="bg-teal-550 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition duration-150 shrink-0 text-sm">
                  Search
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-slate-850 border border-slate-800 p-6 rounded-xl animate-pulse h-48"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hospitals.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl">
                    No hospitals found in this region.
                  </div>
                ) : (
                  hospitals.map(h => (
                    <HospitalCard
                      key={h.id}
                      id={h.id}
                      name={h.name}
                      location={`${h.address || ''}, ${h.city || ''}`}
                      distance={h.distance || '1.0 km'}
                      beds={h.available_beds}
                      totalBeds={h.total_beds}
                      icuBeds={h.icu_beds}
                      availableIcu={h.available_icu}
                      ventilators={h.ventilators}
                      availableVentilators={h.available_ventilators}
                      phone={h.phone || 'Contact line'}
                      emergency={h.emergency}
                      rating={Number(h.rating) || 4.0}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
