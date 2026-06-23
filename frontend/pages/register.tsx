import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  
  // Registration States
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState(25)
  const [gender, setGender] = useState('male')
  const [address, setAddress] = useState('')

  // Verification States
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenOtpModal = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!fullName || !password || (!email && !phone)) {
      setError('Please provide your Full Name, Password, and either Email or Phone.')
      return
    }

    // Trigger simulated OTP dispatch
    setShowOtpModal(true)
    setOtpValue('')
    setOtpError('')
  }

  const handleVerifyAndRegister = async () => {
    setOtpError('')
    if (otpValue !== '123456') {
      setOtpError('Invalid OTP code. Please enter the simulated code: 123456.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('http://localhost:4000/api/auth/register', {
        full_name: fullName,
        email,
        phone,
        password,
        age: Number(age),
        gender,
        address,
        role: 'patient'
      })

      const { token } = res.data
      localStorage.setItem('token', token)
      
      // Auto-trigger a welcome notification in the background
      try {
        await axios.post('http://localhost:4000/api/notifications/trigger', {
          message: `Welcome to GSMS, ${fullName}! Your patient health records profile has been created successfully.`,
          category: 'health'
        }, { headers: { Authorization: `Bearer ${token}` } })
      } catch (ne) {}

      setShowOtpModal(false)
      router.push('/dashboard')
    } catch (err: any) {
      setOtpError(err?.response?.data?.error || 'Registration failed. The email/phone might already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Register Account - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-slate-850 border border-slate-700/60 rounded-2xl w-full max-w-lg p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white">Create Clinical Account</h1>
            <p className="text-xs text-slate-400">Register your secure patient profile on the smart assistance ecosystem</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg leading-relaxed text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOpenOtpModal} className="space-y-4">
            
            {/* Grid of basic inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Age</label>
                <input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  min="1"
                  max="120"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  placeholder="john@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+918888888888"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Residential Address</label>
                <input
                  type="text"
                  placeholder="45 Park Street, Chennai"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Choose Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                  required
                />
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-900 font-black rounded-xl transition duration-150 uppercase tracking-widest cursor-pointer shadow-lg shadow-teal-500/10 text-sm mt-4"
            >
              Verify Contact & Register
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link href="/login" className="text-teal-400 font-semibold hover:underline">
              Sign In here &rarr;
            </Link>
          </div>

        </div>
      </main>

      {/* OTP Verification Modal Overlay */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-xl">📱</span>
              <h3 className="text-lg font-bold text-white">Contact Verification</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A verification passcode has been dispatched to your mobile. For demonstration, type the code below:
              </p>
            </div>

            {/* Display code alert */}
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-3 py-2 rounded-lg text-center font-bold tracking-wide">
              Simulated Passcode: 123456
            </div>

            {otpError && (
              <div className="text-red-400 text-xs leading-relaxed text-center">
                {otpError}
              </div>
            )}

            {/* Input */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block text-center">Enter 6-Digit OTP</label>
              <input
                type="text"
                placeholder="000000"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                maxLength={6}
                className="bg-slate-900 border border-slate-700 text-white text-center font-black tracking-widest text-lg px-4 py-2 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                required
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="border border-slate-700 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyAndRegister}
                disabled={loading}
                className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider shadow shadow-teal-500/15"
              >
                {loading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
