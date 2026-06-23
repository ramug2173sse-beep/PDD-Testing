import Head from 'next/head'
import NavBar from '../../components/NavBar'
import Footer from '../../components/Footer'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier || !password) {
      setError('Please provide admin credentials.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        identifier,
        password
      })

      const { token, user } = res.data
      if (user.role_id !== 1) {
        setError('Access denied. Administrator privileges required.')
        return
      }

      localStorage.setItem('token', token)
      router.push('/admin')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid administrator credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Admin Login - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-slate-850 border border-slate-700/60 rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Control Panel Portal
            </span>
            <h1 className="text-2xl font-black text-white">Administrator Login</h1>
            <p className="text-xs text-slate-400 font-medium">Verify credentials to access administrative systems</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Admin Email or ID</label>
              <input
                type="text"
                placeholder="admin@gsmat.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIdentifier(''); setPassword(''); setError(''); }}
                className="border border-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow"
              >
                {loading ? 'Entering...' : 'Authenticate'}
              </button>
            </div>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  )
}
