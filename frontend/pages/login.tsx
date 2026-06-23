import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [selectedCaptchaIdx, setSelectedCaptchaIdx] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Captcha configuration: Grid of icons, user must select the medical cross (Index 1)
  const captchaOptions = [
    { icon: '💊', label: 'Pill' },
    { icon: '➕', label: 'Medical Cross' },
    { icon: '🚗', label: 'Car' },
    { icon: '☕', label: 'Coffee' }
  ]

  const handleCaptchaSelect = (idx: number) => {
    setSelectedCaptchaIdx(idx)
    if (idx === 1) {
      setCaptchaVerified(true)
      setError('')
    } else {
      setCaptchaVerified(false)
      setError('Incorrect CAPTCHA verification. Please select the Medical Cross icon.')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier || !password) {
      setError('Please fill in all credential fields.')
      return
    }

    if (!captchaVerified) {
      setError('Security verification required. Please complete the CAPTCHA.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', {
        identifier,
        password
      })

      const { token, user } = res.data
      localStorage.setItem('token', token)
      
      // Navigate to dashboard or admin based on role
      if (user.role_id === 1) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials or connection lost.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Login - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-slate-850 border border-slate-700/60 rounded-2xl w-full max-w-md p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Clinical Authentication</h1>
            <p className="text-xs text-slate-400">Access your unified smart health profile portal</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Email or Mobile Number</label>
              <input
                type="text"
                placeholder="doctor@gsmat.com / john@gmail.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Password</label>
                <button type="button" onClick={() => alert('Demo notice: To reset password, contact administrative desk.')} className="text-xs text-teal-400 hover:underline">
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer">
                Remember my credentials on this device
              </label>
            </div>

            {/* Interactive Captcha */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block">Security Verification</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Click on the <strong className="text-teal-400">Medical Cross (➕)</strong> icon below to verify you are a clinical agent:
              </p>
              
              <div className="grid grid-cols-4 gap-2 pt-1.5">
                {captchaOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCaptchaSelect(idx)}
                    className={`p-3 rounded-lg border text-xl flex items-center justify-center transition duration-150 ${
                      selectedCaptchaIdx === idx
                        ? idx === 1
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-red-500 bg-red-500/10'
                        : 'border-slate-700/60 bg-slate-850 hover:border-slate-650'
                    }`}
                    title={opt.label}
                  >
                    {opt.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition duration-150 uppercase tracking-widest ${
                captchaVerified && !loading
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-900 shadow-lg shadow-teal-500/10 cursor-pointer'
                  : 'bg-slate-750 text-slate-500 cursor-not-allowed border border-slate-700/30'
              }`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center pt-2 text-xs text-slate-400">
            <span>New patient? </span>
            <Link href="/register" className="text-teal-400 font-semibold hover:underline">
              Create an account now &rarr;
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
