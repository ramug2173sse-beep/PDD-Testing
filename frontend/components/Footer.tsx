import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Vision */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:opacity-90">
              <svg className="w-6 h-6 text-teal-450" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>General Smart Medical Assistance System</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              GSMS is a hospital-grade AI-powered healthcare assistant designed to support preliminary diagnostic screening, real-time bed capacity mapping, and unified patient appointments booking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/predict" className="hover:text-white transition">AI Symptom Checker</Link></li>
              <li><Link href="/bed-tracking" className="hover:text-white transition">Real-time Bed Board</Link></li>
              <li><Link href="/diseases" className="hover:text-white transition">Disease Encyclopedia</Link></li>
              <li><Link href="/book-appointment" className="hover:text-white transition">Schedule Consultation</Link></li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest">Emergency Help</h4>
            <div className="space-y-2 text-xs">
              <p className="text-white font-semibold">Ambulance dispatch: 102 / 108</p>
              <p>National Emergency Helpline: 112</p>
              <p>Clinical Support line: +91 44 2829 0200</p>
              <Link href="/emergency" className="inline-block text-xs bg-red-650/20 text-red-400 border border-red-500/30 px-3 py-1 rounded font-bold hover:bg-red-650/30 transition">
                Request SOS Dispatch
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer and Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px]">
          <p className="text-slate-500 max-w-2xl leading-relaxed text-center md:text-left">
            <strong>Disclaimer:</strong> General Smart Medical Assistance System (GSMS) provides informational symptom analysis and resource mapping. It does not replace professional clinical diagnosis, emergency dispatch routing, or formal medical care. If you are experiencing a life-threatening crisis, please dial 102/108 immediately.
          </p>
          <p className="text-slate-500 shrink-0">
            © {new Date().getFullYear()} GSMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
