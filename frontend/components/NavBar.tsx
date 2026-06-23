import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function NavBar() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const loadNotifications = async (t: string) => {
    try {
      const r = await axios.get('http://localhost:4000/api/notifications', {
        headers: { Authorization: `Bearer ${t}` }
      })
      setNotifications(r.data.notifications || [])
    } catch (e) {}
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (t) {
        setToken(t)
        axios.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${t}` } })
          .then(r => {
            setUser(r.data.user)
            if (r.data?.user?.role === 'admin') setIsAdmin(true)
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('token')
            setToken(null)
          })
        loadNotifications(t)
        // Refresh notifications every 15s
        const interval = setInterval(() => loadNotifications(t), 15000)
        return () => clearInterval(interval)
      }
    } catch (e) {}
  }, [router.pathname])

  const handleMarkAsRead = async (id: number) => {
    if (!token) return
    try {
      await axios.post(`http://localhost:4000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {}
  }

  function logout() {
    try {
      localStorage.removeItem('token')
    } catch (e) {}
    setToken(null)
    setUser(null)
    setIsAdmin(false)
    router.push('/')
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-90">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>GSMS</span>
              <span className="text-xs bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded border border-teal-500/30 uppercase tracking-widest hidden sm:inline-block">Clinical</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className={`transition duration-150 ${router.pathname === '/' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Home</Link>
            <Link href="/predict" className={`transition duration-150 ${router.pathname === '/predict' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Symptom Checker</Link>
            <Link href="/bed-tracking" className={`transition duration-150 ${router.pathname === '/bed-tracking' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Live Beds</Link>
            <Link href="/diseases" className={`transition duration-150 ${router.pathname === '/diseases' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Disease Index</Link>
            <Link href="/book-appointment" className={`transition duration-150 ${router.pathname === '/book-appointment' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Book Appointment</Link>
            {token && (
              <>
                <Link href="/dashboard" className={`transition duration-150 ${router.pathname === '/dashboard' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Dashboard</Link>
                <Link href="/reports" className={`transition duration-150 ${router.pathname === '/reports' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>Medical Reports</Link>
              </>
            )}
            <Link href="/emergency" className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-full transition duration-150 border border-red-500/50 uppercase tracking-wider text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>Emergency SOS</span>
            </Link>
          </div>

          {/* Actions & Session */}
          <div className="hidden lg:flex items-center space-x-4">
            {token ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Dropdown Trigger */}
                <div className="relative">
                  <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 text-slate-200">
                      <div className="px-4 py-2 bg-slate-750 border-b border-slate-750 font-semibold flex justify-between items-center text-sm">
                        <span>Notifications</span>
                        {unreadCount > 0 && <span className="text-xs text-teal-400 font-medium">{unreadCount} unread</span>}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-700">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-400">No notifications.</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-3 text-xs transition duration-150 hover:bg-slate-750 flex flex-col gap-1 ${!n.is_read ? 'bg-slate-750/30' : ''}`}>
                              <p className="leading-relaxed">{n.message}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                {!n.is_read && (
                                  <button onClick={() => handleMarkAsRead(n.id)} className="text-teal-400 hover:text-teal-300 font-semibold text-[10px]">
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Session Profile Link */}
                <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-white">{user?.full_name || 'Patient'}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'patient'}</span>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded px-2 py-0.5 hover:bg-amber-500/30 transition">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-white transition">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-sm">
                <Link href="/login" className="text-slate-300 hover:text-white transition font-medium">Login</Link>
                <Link href="/register" className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-4 py-2 rounded-lg transition duration-150">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-md text-slate-400 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden bg-slate-800 border-t border-slate-700 px-2 pt-2 pb-4 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Home</Link>
          <Link href="/predict" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Symptom Checker</Link>
          <Link href="/bed-tracking" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Live Beds</Link>
          <Link href="/diseases" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Disease Index</Link>
          <Link href="/book-appointment" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Book Appointment</Link>
          {token && (
            <>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Dashboard</Link>
              <Link href="/reports" className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white">Medical Reports</Link>
            </>
          )}
          <Link href="/emergency" className="block px-3 py-2 rounded-md text-base font-bold text-red-400 bg-red-950/30 border border-red-500/20 text-center uppercase tracking-widest text-xs">Emergency SOS</Link>
          {token ? (
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="px-3 py-1.5 text-sm font-semibold text-slate-400">{user?.full_name || 'Patient'}</div>
              {isAdmin && <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-amber-300 hover:bg-slate-700">Admin Panel</Link>}
              <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:bg-slate-700 hover:text-white">Logout</button>
            </div>
          ) : (
            <div className="border-t border-slate-700 pt-2 mt-2 flex flex-col gap-2 px-3">
              <Link href="/login" className="block text-center text-slate-200 border border-slate-600 rounded-lg py-2">Login</Link>
              <Link href="/register" className="block text-center bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold rounded-lg py-2">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
