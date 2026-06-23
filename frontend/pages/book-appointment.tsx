import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function BookAppointmentPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)

  // Lists
  const [hospitals, setHospitals] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  
  // Selection States
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [notes, setNotes] = useState('')

  // UI Flow States
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Time Slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]

  const loadHospitals = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/hospitals')
      setHospitals(res.data || [])
    } catch (e) {}
  }

  const loadDoctors = async (hospitalId: string) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/hospitals/${hospitalId}/doctors`)
      setDoctors(res.data || [])
      setSelectedDoctorId('')
    } catch (e) {}
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (!t) {
        router.push('/login')
      } else {
        setToken(t)
        loadHospitals()
      }
    } catch (e) {}
  }, [])

  const handleHospitalChange = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId)
    if (hospitalId) {
      loadDoctors(hospitalId)
    } else {
      setDoctors([])
    }
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!selectedHospitalId || !appointmentDate || !selectedTimeSlot) {
      setError('Please select a hospital, date, and time slot.')
      return
    }

    setLoading(true)
    try {
      // Parse date and time into iso string
      const datetimeString = `${appointmentDate}T${convertTimeTo24h(selectedTimeSlot)}:00`
      const headers = { Authorization: `Bearer ${token}` }

      await axios.post('http://localhost:4000/api/appointments/book', {
        hospital_id: Number(selectedHospitalId),
        doctor_id: selectedDoctorId ? Number(selectedDoctorId) : null,
        appointment_at: new Date(datetimeString).toISOString(),
        notes
      }, { headers })

      // Trigger appointment confirmation notification
      try {
        const hospName = hospitals.find(h => String(h.id) === selectedHospitalId)?.name || 'Clinic'
        await axios.post('http://localhost:4000/api/notifications/trigger', {
          message: `Appointment confirmed at ${hospName} for ${appointmentDate} at ${selectedTimeSlot}.`,
          category: 'appointment'
        }, { headers })
      } catch (ne) {}

      setSuccess(true)
      // Reset forms
      setSelectedHospitalId('')
      setSelectedDoctorId('')
      setAppointmentDate('')
      setSelectedTimeSlot('')
      setNotes('')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to complete booking. Please verify details.')
    } finally {
      setLoading(false)
    }
  }

  // Helper to parse '02:00 PM' to '14:00'
  function convertTimeTo24h(timeStr: string) {
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':')
    if (hours === '12') hours = '00'
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12)
    }
    return `${hours.padStart(2, '0')}:${minutes}`
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Schedule Consultation - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10 flex items-center justify-center px-4">
        <div className="bg-slate-850 border border-slate-700/60 rounded-2xl w-full max-w-xl p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Schedule Consultation</h1>
            <p className="text-xs text-slate-400">Select clinics, browse practicing specialist doctors, and reserve slots</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center leading-relaxed">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs px-4 py-3 rounded-lg text-center font-bold tracking-wide">
              🎉 Appointment booked successfully! Confirmation notification sent to dashboard.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleBookAppointment} className="space-y-4">
            
            {/* 1. Select Hospital */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">1. Select Hospital / Clinic</label>
              <select
                value={selectedHospitalId}
                onChange={e => handleHospitalChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              >
                <option value="">Choose hospital option...</option>
                {hospitals.map(h => (
                  <option key={h.id} value={String(h.id)}>{h.name} ({h.city})</option>
                ))}
              </select>
            </div>

            {/* 2. Select Doctor */}
            {selectedHospitalId && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">2. Select Doctor (Optional)</label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                >
                  <option value="">First Available Doctor (General Intake)</option>
                  {doctors.map(d => (
                    <option key={d.id} value={String(d.id)}>{d.full_name} ({d.specialization}) — Fee: INR {d.consultation_fee}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Choose Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">3. Select Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Block historical dates
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                />
              </div>

              {/* Time slots grid */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">4. Select Time Slot</label>
                <select
                  value={selectedTimeSlot}
                  onChange={e => setSelectedTimeSlot(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                >
                  <option value="">Select time slot...</option>
                  {timeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Consultation Reason / Notes</label>
              <textarea
                placeholder="Describe your health concerns (e.g. chronic headache, post-flu checkup)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-900 font-black rounded-xl transition duration-150 uppercase tracking-widest cursor-pointer shadow-lg shadow-teal-500/10 text-sm mt-4"
            >
              {loading ? 'Processing reservation...' : 'Confirm Appointment Booking'}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  )
}
