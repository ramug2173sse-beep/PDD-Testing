import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'

type HospitalBedStatus = {
  id: number
  name: string
  city: string
  total_beds: number
  available_beds: number
  icu_beds: number
  available_icu: number
  ventilators: number
  available_ventilators: number
  emergency?: boolean
}

export default function BedTrackingPage() {
  const [beds, setBeds] = useState<HospitalBedStatus[]>([])
  const [updatedAt, setUpdatedAt] = useState<string>('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    // Connect to Server-Sent Events stream
    const source = new EventSource('http://localhost:4000/api/beds/stream')

    source.addEventListener('beds', (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        setBeds(payload.hospitals || [])
        setUpdatedAt(payload.updated_at || new Date().toISOString())
        setError('')
      } catch (err) {
        console.error('SSE JSON error', err)
      }
    })

    source.onerror = () => {
      setError('Connection lost. Re-establishing live sync...')
    }

    return () => {
      source.close()
    }
  }, [])

  const triggerManualRefresh = async () => {
    try {
      await axios.post('http://localhost:4000/api/beds/refresh')
      setError('')
    } catch (e: any) {
      setError('Live board refresh requested, but connection is currently offline.')
    }
  }

  // Filter lists based on user search
  const filteredBeds = beds.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = cityFilter === '' || h.city.toLowerCase().includes(cityFilter.toLowerCase())
    return matchesSearch && matchesCity
  })

  // Extract unique cities for filtering options
  const uniqueCities = Array.from(new Set(beds.map(h => h.city))).filter(Boolean)

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Live Beds capacity Board - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-white">Live Bed tracking</h1>
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live SSE Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time occupancy updates streamed directly from hospital emergency rooms</p>
            </div>
            <button
              onClick={triggerManualRefresh}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl border border-slate-750 transition text-xs uppercase tracking-wider shrink-0"
            >
              Force Refresh
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-4 py-3 rounded-lg text-center font-semibold animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Sync Timestamp indicator */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Showing {filteredBeds.length} centers</span>
            <span>Last database sync: <strong className="text-slate-200">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'waiting...'}</strong></span>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Search centers</label>
              <input
                type="text"
                placeholder="Search hospital by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select Region</label>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
              >
                <option value="">All Regions</option>
                {uniqueCities.map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid list of hospitals bed boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBeds.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl">
                No hospital data streams found.
              </div>
            ) : (
              filteredBeds.map((h) => {
                const occupancyPct = h.total_beds > 0 
                  ? Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100) 
                  : 0

                // Bed indicator logic
                const bedPct = h.total_beds > 0 ? (h.available_beds / h.total_beds) * 100 : 0
                let bedStatusBg = 'bg-red-500/10 border-red-500/20 text-red-400'
                let bedStatusLabel = 'Full'
                if (bedPct > 15) {
                  bedStatusBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  bedStatusLabel = 'Available'
                } else if (bedPct > 0) {
                  bedStatusBg = 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  bedStatusLabel = 'Limited'
                }

                // ICU indicator logic
                const icuPct = h.icu_beds > 0 ? (h.available_icu / h.icu_beds) * 100 : 0
                let icuStatusBg = 'text-red-400'
                if (icuPct > 15) icuStatusBg = 'text-emerald-400'
                else if (icuPct > 0) icuStatusBg = 'text-amber-400'

                return (
                  <div
                    key={h.id}
                    className="bg-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 hover:border-slate-700 transition duration-150"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug">{h.name}</h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{h.city} City</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${bedStatusBg}`}>
                        {bedStatusLabel}
                      </span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                        <span className="text-slate-400">Occupancy Level</span>
                        <span className="text-white">{occupancyPct}% Occupied</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPct > 85
                              ? 'bg-red-500'
                              : occupancyPct > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Numeric breakdown table */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-450 uppercase tracking-widest font-bold block">General Beds</span>
                        <strong className="text-base font-black text-white mt-0.5 block">{h.available_beds}</strong>
                        <span className="text-[9px] text-slate-400 block">Available of {h.total_beds}</span>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-450 uppercase tracking-widest font-bold block">ICU Beds</span>
                        <strong className={`text-base font-black mt-0.5 block ${icuStatusBg}`}>{h.available_icu}</strong>
                        <span className="text-[9px] text-slate-400 block">Available of {h.icu_beds}</span>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[9px] text-slate-450 uppercase tracking-widest font-bold block">Ventilators</span>
                        <strong className="text-base font-black text-slate-350 mt-0.5 block">{h.available_ventilators}</strong>
                        <span className="text-[9px] text-slate-400 block">Available of {h.ventilators}</span>
                      </div>
                    </div>

                  </div>
                )
              })
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
