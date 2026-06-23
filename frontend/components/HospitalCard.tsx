import Link from 'next/link'

type Props = {
  id?: number
  name: string
  location: string
  distance: string
  beds: number
  totalBeds?: number
  icuBeds?: number
  availableIcu?: number
  ventilators?: number
  availableVentilators?: number
  phone: string
  emergency?: boolean
  rating?: number
}

export default function HospitalCard({
  id,
  name,
  location,
  distance,
  beds,
  totalBeds = 100,
  icuBeds = 10,
  availableIcu = 2,
  ventilators = 5,
  availableVentilators = 1,
  phone,
  emergency = false,
  rating = 4.0
}: Props) {
  // Determine capacity level colors
  const pct = totalBeds > 0 ? (beds / totalBeds) * 100 : 0
  let bedStatusColor = 'text-red-500 bg-red-500/10 border-red-500/20'
  let bedStatusLabel = 'Full'

  if (pct > 15) {
    bedStatusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    bedStatusLabel = 'Available'
  } else if (pct > 0) {
    bedStatusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    bedStatusLabel = 'Limited'
  }

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 shadow-lg transition duration-200 hover:border-slate-600 hover:shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Title & Badge */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-bold text-white tracking-tight leading-snug">{name}</h3>
          {emergency && (
            <span className="shrink-0 bg-red-500/15 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Emergency
            </span>
          )}
        </div>

        {/* Location & Rating */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>{location} • {distance}</span>
          <div className="flex items-center gap-0.5 ml-auto text-amber-400 font-medium text-xs">
            <span>★</span>
            <span className="text-slate-300">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bed Indicators */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/40 text-center">
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-700/20">
            <span className="block text-[10px] text-slate-400">General Beds</span>
            <strong className="block text-sm text-white mt-0.5">{beds}/{totalBeds}</strong>
          </div>
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-700/20">
            <span className="block text-[10px] text-slate-400">ICU Capacity</span>
            <strong className="block text-sm text-white mt-0.5">{availableIcu}/{icuBeds}</strong>
          </div>
          <div className="bg-slate-850 p-2 rounded-lg border border-slate-700/20">
            <span className="block text-[10px] text-slate-400">Ventilators</span>
            <strong className="block text-sm text-white mt-0.5">{availableVentilators}/{ventilators}</strong>
          </div>
        </div>
      </div>

      {/* Capacity color banner & Action */}
      <div className="mt-5 pt-3 border-t border-slate-700/30 flex items-center justify-between gap-4">
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bedStatusColor} uppercase tracking-wider`}>
          {bedStatusLabel}
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`} className="p-1.5 rounded bg-slate-700 text-slate-300 hover:text-white transition" title="Call Hospital">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </a>
          <Link href="/book-appointment" className="text-xs bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold px-3 py-1.5 rounded transition">
            Book
          </Link>
        </div>
      </div>
    </div>
  )
}
