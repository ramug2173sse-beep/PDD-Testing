import NavBar from '../../../components/NavBar'
import Footer from '../../../components/Footer'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentUser, getToken } from '../../../utils/auth'
import { useRouter } from 'next/router'

type TrendPoint = { date: string; count: number }

export default function AdminAnalytics() {
  const [token, setToken] = useState('')
  const [analytics, setAnalytics] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const user = await fetchCurrentUser()
      if (!user || user.role !== 'admin') return router.push('/admin/login')
      setToken(getToken() || '')
      await loadAnalytics(getToken() || '')
    })()
  }, [])

  async function loadAnalytics(currentToken: string) {
    try {
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {}
      const r = await axios.get('http://localhost:4000/api/admin/analytics', { headers })
      setAnalytics(r.data)
    } catch (e: any) {
      console.error(e)
    }
  }

  return (
    <div>
      <NavBar />
      <main className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Analytics</h1>
              <p className="text-gray-600">Key platform health metrics and trends for hospital bed availability, predictions, and appointments.</p>
            </div>
            <button onClick={() => loadAnalytics(token)} className="bg-blue-600 text-white px-4 py-2 rounded">Refresh</button>
          </div>

          {!analytics ? (
            <div className="bg-white p-4 rounded shadow">Loading analytics...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded shadow p-4">Users<br/><strong>{analytics.counts.users}</strong></div>
                <div className="bg-white rounded shadow p-4">Hospitals<br/><strong>{analytics.counts.hospitals}</strong></div>
                <div className="bg-white rounded shadow p-4">Predictions<br/><strong>{analytics.counts.predictions}</strong></div>
                <div className="bg-white rounded shadow p-4">Appointments<br/><strong>{analytics.counts.appointments}</strong></div>
              </div>

              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-2">Hospital Bed Utilization</h2>
                <p className="text-sm text-gray-600 mb-4">Average bed utilization across all hospitals: <strong>{Math.round(analytics.utilization * 100)}%</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-4">
                    <h3 className="font-semibold mb-2">Low available bed hospitals</h3>
                    <ul className="space-y-2">
                      {analytics.lowBeds.map((h:any) => (
                        <li key={h.id} className="border rounded p-3">
                          <div className="font-semibold">{h.name}</div>
                          <div className="text-sm text-gray-600">{h.city}</div>
                          <div className="text-sm">Beds: {h.available_beds}/{h.total_beds} | ICU: {h.available_icu}/{h.icu_beds}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded p-4">
                    <h3 className="font-semibold mb-2">Recent prediction trend</h3>
                    <div className="space-y-1">
                      {analytics.predictionTrend.map((point: TrendPoint) => (
                        <div key={point.date} className="flex justify-between text-sm">
                          <span>{point.date}</span>
                          <span>{point.count}</span>
                        </div>
                      ))}
                    </div>
                    <h3 className="font-semibold mt-4 mb-2">Recent appointments trend</h3>
                    <div className="space-y-1">
                      {analytics.appointmentTrend.map((point: TrendPoint) => (
                        <div key={point.date} className="flex justify-between text-sm">
                          <span>{point.date}</span>
                          <span>{point.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
