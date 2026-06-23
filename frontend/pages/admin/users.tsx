import Head from 'next/head'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { fetchCurrentUser, getToken } from '../../utils/auth'
import { useRouter } from 'next/router'

export default function AdminUsersPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [checking, setChecking] = useState(true)

  // User lists
  const [users, setUsers] = useState<any[]>([])

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
      loadUsers(t)
    } catch (e) {
      router.push('/admin/login')
    }
  }

  const loadUsers = async (t: string) => {
    setLoading(true)
    setError('')
    try {
      const headers = { Authorization: `Bearer ${t}` }
      const r = await axios.get('http://localhost:4000/api/admin/users', { headers })
      setUsers(r.data.users || [])
    } catch (e) {
      setError('Failed to load system users database.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    if (!token) return
    setError('')

    try {
      const headers = { Authorization: `Bearer ${token}` }
      await axios.put(
        `http://localhost:4000/api/admin/users/${id}`,
        { is_active: !currentStatus },
        { headers }
      )
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u))
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to toggle account status.')
    }
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Manage Patients - GSMS</title>
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
              <h1 className="text-3xl font-black text-white mt-1">Manage Patients</h1>
              <p className="text-xs text-slate-400 mt-0.5">Suspend or activate patient credentials and monitor system account logs</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl border border-slate-750 transition text-xs uppercase tracking-wider shrink-0"
            >
              Control Panel &larr;
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          {/* User Directory Table */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patients Directory Index</h3>
            </div>

            {loading ? (
              <p className="text-xs text-slate-450 text-center py-12 animate-pulse">Syncing patient records...</p>
            ) : users.length === 0 ? (
              <p className="text-xs text-slate-450 text-center py-12">No patient records registered in system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[9px] tracking-wider text-slate-400 font-bold">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Registered Date</th>
                      <th className="px-6 py-4">Account Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/20">
                        <td className="px-6 py-4 font-mono">#{u.id}</td>
                        <td className="px-6 py-4 text-white font-semibold">{u.full_name}</td>
                        <td className="px-6 py-4">{u.email || '—'}</td>
                        <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block font-bold text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider ${
                            u.is_active
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`font-semibold transition hover:underline ${
                              u.is_active ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {u.is_active ? 'Suspend Logins' : 'Activate Logins'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
