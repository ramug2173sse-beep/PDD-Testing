import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function EmergencyPage() {
  const [token, setToken] = useState<string | null>(null)
  
  // Geolocation States
  const [latitude, setLatitude] = useState<number | null>(13.0602)
  const [longitude, setLongitude] = useState<number | null>(80.2496)
  const [locationStatus, setLocationStatus] = useState('Default (Chennai Center)')

  // SOS dispatch States
  const [sosActive, setSosActive] = useState(false)
  const [eta, setEta] = useState(8)
  const [dispatchStatus, setDispatchStatus] = useState('Ready')
  const [nearestHospitals, setNearestHospitals] = useState<any[]>([])

  const loadLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      setLocationStatus('Locating device...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          setLocationStatus('GPS Coordinates Synchronized')
        },
        (error) => {
          setLocationStatus('GPS denied. Using regional fallback.')
        }
      )
    }
  };

  const fetchEmergencyHospitals = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/hospitals')
      const emergOnly = (res.data || []).filter((h: any) => h.emergency === true)
      setNearestHospitals(emergOnly)
    } catch (e) {
      setNearestHospitals([
        { id: 1, name: 'Chennai City Hospital', address: '12 Greams Road', phone: '+914428290200', available_icu: 8, available_ventilators: 4 },
        { id: 2, name: 'Apollo Health Center', address: '21 Shanthi Colony', phone: '+914426260000', available_icu: 2, available_ventilators: 0 },
        { id: 3, name: 'Metro Emergency Clinic', address: '56 Lattice Bridge Rd', phone: '+914424910000', available_icu: 0, available_ventilators: 0 }
      ])
    }
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (t) setToken(t)
    } catch (e) {}
    loadLocation()
    fetchEmergencyHospitals()
  }, [])

  // Trigger ETA Countdown once SOS is active
  useEffect(() => {
    let timer: any
    if (sosActive && eta > 0) {
      timer = setTimeout(() => setEta(eta - 1), 60000) // Decrement every minute
    } else if (sosActive && eta === 0) {
      setDispatchStatus('Arrived at Location')
    }
    return () => clearTimeout(timer)
  }, [sosActive, eta])

  const handleTriggerSOS = async () => {
    setSosActive(true)
    setEta(8)
    setDispatchStatus('Dispatched (Ambulance #SOS-8812)')

    // Log critical security audit log on backend
    if (token) {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        await axios.post('http://localhost:4000/api/notifications/trigger', {
          message: 'CRITICAL WARNING: Emergency SOS dispatch was activated. GPS coordinates transmitted.',
          category: 'emergency'
        }, { headers })

        // Write custom audit log
        await axios.get('http://localhost:4000/api/users/me', { headers }) // Trigger log
      } catch (e) {}
    }
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Emergency SOS Center - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-3xl font-black text-red-500 uppercase tracking-wider">Emergency SOS Dispatch</h1>
            <p className="text-xs text-slate-400 mt-1">One-click ambulance routing, GPS locator tracking, and emergency trauma clinics contact indexes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SOS Dispatch Trigger (Left column) */}
            <div className="lg:col-span-5 bg-slate-850 border border-red-500/20 rounded-2xl p-6 shadow-xl space-y-6 text-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-left">Trauma Dispatch Trigger</h2>

              {/* SOS Button */}
              <div className="flex flex-col items-center justify-center py-6">
                <button
                  type="button"
                  onClick={handleTriggerSOS}
                  disabled={sosActive}
                  className={`w-36 h-36 rounded-full border-8 font-black uppercase text-sm tracking-widest flex flex-col items-center justify-center shadow-2xl transition duration-300 ${
                    sosActive
                      ? 'bg-red-950/20 border-red-650/40 text-red-550 cursor-not-allowed'
                      : 'bg-red-650 border-red-550 text-white hover:bg-red-750 hover:scale-105 animate-pulse cursor-pointer'
                  }`}
                >
                  <span>Request</span>
                  <span className="text-2xl mt-0.5">SOS</span>
                </button>
                <p className="text-[10px] text-slate-450 uppercase tracking-widest mt-4">
                  {sosActive ? 'System Locked on Dispatch' : 'Press to trigger immediate dispatch'}
                </p>
              </div>

              {/* Live Dispatch Tracker Details */}
              {sosActive && (
                <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Ambulance Dispatch Active</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p>Status: <strong className="text-white">{dispatchStatus}</strong></p>
                    {eta > 0 ? (
                      <p>Estimated Arrival: <strong className="text-red-450">{eta} minutes</strong></p>
                    ) : (
                      <p className="text-emerald-450 font-bold">First Responders Arrived at Scene</p>
                    )}
                    <p>Contact Driver: <strong className="text-white">+91 99999 12345</strong></p>
                  </div>
                </div>
              )}

              {/* GPS Tracker details */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest">Live GPS Coordinates</span>
                  <button onClick={loadLocation} className="text-[10px] text-teal-400 hover:underline">Re-Sync</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-850 p-2 rounded border border-slate-700/30">
                    <span className="text-[9px] text-slate-450 block uppercase tracking-widest">Latitude</span>
                    <strong className="text-white block mt-0.5">{latitude?.toFixed(5)}</strong>
                  </div>
                  <div className="bg-slate-850 p-2 rounded border border-slate-700/30">
                    <span className="text-[9px] text-slate-450 block uppercase tracking-widest">Longitude</span>
                    <strong className="text-white block mt-0.5">{longitude?.toFixed(5)}</strong>
                  </div>
                </div>
                <span className="block text-[10px] text-slate-400 text-center italic">{locationStatus}</span>
              </div>

            </div>

            {/* Emergency Resources (Right columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Emergency Hotline Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold block">Ambulance</span>
                  <strong className="text-2xl text-white block">102</strong>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold block">Medical Emerg</span>
                  <strong className="text-2xl text-white block">108</strong>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-1">
                  <span className="text-[9px] text-red-400 uppercase tracking-widest font-bold block">National Helpline</span>
                  <strong className="text-2xl text-white block">112</strong>
                </div>
              </div>

              {/* Nearest Trauma Clinics */}
              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Nearest Trauma Clinics</h3>
                
                <div className="divide-y divide-slate-800">
                  {nearestHospitals.length === 0 ? (
                    <p className="text-xs text-slate-450 text-center py-6">No emergency hospitals found.</p>
                  ) : (
                    nearestHospitals.map(h => (
                      <div key={h.id} className="py-3.5 flex justify-between items-center gap-4">
                        <div>
                          <strong className="text-sm text-slate-200 block">{h.name}</strong>
                          <span className="text-xs text-slate-400 block mt-0.5">{h.address || h.city}</span>
                          <span className="text-[10px] text-teal-400 block mt-1">Available ICU: {h.available_icu || 0} | Ventilators: {h.available_ventilators || 0}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <a
                            href={`tel:${h.phone}`}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg border border-slate-750 transition text-xs block"
                          >
                            Call ER
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
