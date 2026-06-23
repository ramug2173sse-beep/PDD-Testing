import Head from 'next/head'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentUser, getToken } from '../../utils/auth'
import { useRouter } from 'next/router'

export default function AdminHospitalsPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [checking, setChecking] = useState(true)

  // Hospital lists
  const [hospitals, setHospitals] = useState<any[]>([])

  // Hospital creation form state
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')

  // Hospital update beds form state
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null)
  const [totalBeds, setTotalBeds] = useState(0)
  const [availableBeds, setAvailableBeds] = useState(0)
  const [icuBeds, setIcuBeds] = useState(0)
  const [availableIcu, setAvailableIcu] = useState(0)
  const [ventilators, setVentilators] = useState(0)
  const [availableVentilators, setAvailableVentilators] = useState(0)

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      loadHospitals(t)
    } catch (e) {
      router.push('/admin/login')
    }
  }

  const loadHospitals = async (t: string) => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${t}` }
      const r = await axios.get('http://localhost:4000/api/admin/hospitals', { headers })
      setHospitals(r.data.hospitals || [])
    } catch (e) {
      setError('Failed to load hospitals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !token) return
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.post(
        'http://localhost:4000/api/admin/hospitals',
        { name, address, city, phone },
        { headers }
      )
      setName('')
      setAddress('')
      setCity('')
      setPhone('')
      loadHospitals(token)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create hospital.')
    }
  }

  const handleDeleteHospital = async (id: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this hospital node?')) return
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.delete(`http://localhost:4000/api/admin/hospitals/${id}`, { headers })
      loadHospitals(token)
    } catch (e: any) {
      setError('Failed to delete hospital.')
    }
  }

  const handleStartEditBeds = (hospital: any) => {
    setSelectedHospitalId(hospital.id)
    setTotalBeds(hospital.total_beds || 0)
    setAvailableBeds(hospital.available_beds || 0)
    setIcuBeds(hospital.icu_beds || 0)
    setAvailableIcu(hospital.available_icu || 0)
    setVentilators(hospital.ventilators || 0)
    setAvailableVentilators(hospital.available_ventilators || 0)
  }

  const handleUpdateBedCounts = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHospitalId || !token) return
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.put(
        `http://localhost:4000/api/admin/hospitals/${selectedHospitalId}/beds`,
        {
          total_beds: totalBeds,
          available_beds: availableBeds,
          icu_beds: icuBeds,
          available_icu: availableIcu,
          ventilators,
          available_ventilators: availableVentilators,
        },
        { headers }
      )
      setSelectedHospitalId(null)
      loadHospitals(token)
    } catch (e: any) {
      setError('Failed to update bed counts.')
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Manage Hospitals - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex items-center justify-between gap-4">
            <div>
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                System Administrator
              </span>
              <h1 className="text-3xl font-black text-white mt-1">Manage Hospital Nodes</h1>
              <p className="text-xs text-slate-400 mt-0.5">Register trauma clinics and update live general ward, ICU, and ventilator metrics</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl border border-slate-750 transition text-xs uppercase tracking-wider shrink-0"
            >
              Control Panel &larr;
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center font-semibold animate-pulse">
              {error}
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create Hospital */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register New Clinic Node</h3>
              
              <form onSubmit={handleCreateHospital} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Hospital Name</label>
                  <input
                    type="text"
                    placeholder="Apollo Trauma Center"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">City</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Address</label>
                  <input
                    type="text"
                    placeholder="Greams Road, Chennai"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+91 44 2829 0200"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-900 font-black py-2.5 rounded-lg transition text-xs uppercase tracking-wider w-full mt-2"
                >
                  Create Clinic Node
                </button>
              </form>
            </div>

            {/* Edit beds */}
            <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Bed capacity Board</h3>
              
              {selectedHospitalId ? (
                <form onSubmit={handleUpdateBedCounts} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Gen beds */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Total Gen Beds</label>
                      <input
                        type="number"
                        value={totalBeds}
                        onChange={e => setTotalBeds(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Available Gen Beds</label>
                      <input
                        type="number"
                        value={availableBeds}
                        onChange={e => setAvailableBeds(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>

                    {/* ICU */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Total ICU Beds</label>
                      <input
                        type="number"
                        value={icuBeds}
                        onChange={e => setIcuBeds(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Available ICU Beds</label>
                      <input
                        type="number"
                        value={availableIcu}
                        onChange={e => setAvailableIcu(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>

                    {/* Ventilators */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Total Ventilators</label>
                      <input
                        type="number"
                        value={ventilators}
                        onChange={e => setVentilators(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block">Available Ventilators</label>
                      <input
                        type="number"
                        value={availableVentilators}
                        onChange={e => setAvailableVentilators(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-750 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                        required
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedHospitalId(null)}
                      className="border border-slate-750 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-900 font-black py-2.5 rounded-lg transition text-xs uppercase tracking-wider"
                    >
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl py-14 text-center border-dashed text-slate-400 text-xs">
                  Select a clinic from the registry directory below to modify live bed capacities.
                </div>
              )}
            </div>

          </div>

          {/* Directory list */}
          <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hospital Registry Directory</h3>
            
            <div className="divide-y divide-slate-800">
              {loading ? (
                <p className="text-xs text-slate-450 text-center py-6 animate-pulse">Loading directory entries...</p>
              ) : hospitals.length === 0 ? (
                <p className="text-xs text-slate-450 text-center py-6">No hospitals currently registered.</p>
              ) : (
                hospitals.map(h => (
                  <div key={h.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <strong className="text-sm text-slate-200 block">{h.name}</strong>
                      <span className="text-[10px] text-slate-450 block mt-0.5">{h.city} • {h.address}</span>
                      <span className="text-[10px] text-teal-400 block mt-1">General: {h.available_beds}/{h.total_beds} | ICU: {h.available_icu}/{h.icu_beds} | Ventilators: {h.available_ventilators}/{h.ventilators}</span>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleStartEditBeds(h)}
                        className="text-xs border border-slate-700 hover:bg-slate-800 text-teal-400 px-3 py-1 rounded-lg"
                      >
                        Modify Capacity
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(h.id)}
                        className="text-xs border border-slate-700 hover:bg-slate-800 text-red-400 px-3 py-1 rounded-lg"
                      >
                        Delete Node
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
