import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DiseasesIndexPage() {
  const [diseases, setDiseases] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Track which disease card is currently expanded
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchDiseases = async () => {
    setLoading(true)
    setError('')
    try {
      let url = 'http://localhost:4000/api/diseases'
      const queryParams: string[] = []
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`)
      if (selectedCategory) queryParams.push(`category=${encodeURIComponent(selectedCategory)}`)
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`
      }

      const res = await axios.get(url)
      setDiseases(res.data || [])
    } catch (e: any) {
      setError('Could not connect to database. Displaying local offline records.')
      // Offline fallback
      setDiseases([
        {
          id: 1, name: 'Common Cold', category: 'Infectious', severity: 'mild', specialist_required: 'General Practitioner',
          description: 'A viral infectious disease of the upper respiratory tract that primarily affects the nose, throat, sinuses, and larynx.',
          causes: 'Contagious rhinovirus infections spreading through airborne droplets.',
          symptoms_list: 'Sore throat, runny nose, nasal congestion, sneezing, mild cough, low-grade fever.',
          diagnosis_methods: 'Clinical evaluation, physical examination of the throat.',
          treatment_procedures: 'Rest, hydration, over-the-counter cold remedies.',
          required_medications: 'Acetaminophen, Decongestants, Saline sprays.',
          lifestyle_recommendations: 'Warm salt-water gargles, humidified room air, high vitamin C intake.',
          prevention_techniques: 'Frequent handwashing, avoidance of close contact with sick persons.',
          treatment_cost: 'INR 500 - 1500', treatment_duration: '7-10 Days', success_rate: '99%',
          faqs: [
            { question: 'Should I take antibiotics for a cold?', answer: 'No, antibiotics do not kill viruses. Resting and staying hydrated is the primary recovery process.' }
          ]
        },
        {
          id: 2, name: 'Influenza', category: 'Infectious', severity: 'moderate', specialist_required: 'Pulmonologist',
          description: 'A highly contagious viral infection that attacks the respiratory system, including the nose, throat, and lungs.',
          causes: 'Influenza viruses (Type A and B) spreading through aerosolized droplets.',
          symptoms_list: 'High fever, chills, dry cough, severe muscle aches, fatigue, headache.',
          diagnosis_methods: 'Rapid Influenza Diagnostic Test (RIDT), PCR nasal swab.',
          treatment_procedures: 'Antiviral drugs, fever reducers, supportive home rest.',
          required_medications: 'Oseltamivir (Tamiflu), Paracetamol, Ibuprofen.',
          lifestyle_recommendations: 'Complete bed rest, high fluid intake (soups/broths).',
          prevention_techniques: 'Annual flu vaccination, hygiene, social distance.',
          treatment_cost: 'INR 1500 - 4000', treatment_duration: '1-2 Weeks', success_rate: '98%',
          faqs: [
            { question: 'When should I see a doctor for the flu?', answer: 'Seek medical attention if you experience shortness of breath, chest pain, persistent high fever, or confusion.' }
          ]
        },
        {
          id: 3, name: 'Migraine', category: 'Neurological', severity: 'moderate', specialist_required: 'Neurologist',
          description: 'A neurological condition characterized by intense, debilitating headaches, often accompanied by sensory disturbances.',
          causes: 'Trigeminal nerve activation, brain chemical pathways fluctuations, genetics.',
          symptoms_list: 'Throbbing headache (usually one-sided), nausea, vomiting, photophobia, aura.',
          diagnosis_methods: 'Neurological exam, medical history catalog, MRI to rule out other organic causes.',
          treatment_procedures: 'Abortive drug therapy, prophylactic medication, trigger management.',
          required_medications: 'Triptans (Sumatriptan), NSAIDs, Beta-blockers.',
          lifestyle_recommendations: 'Regular sleep schedule, trigger identification diary, dark quiet room during attacks.',
          prevention_techniques: 'Consistent meals and hydration, stress management.',
          treatment_cost: 'INR 1000 - 3000 / month', treatment_duration: 'Varies (4-72 Hours per attack)', success_rate: '85% (management success)',
          faqs: [
            { question: 'Does caffeine help migraines?', answer: 'Yes, in early stages caffeine can assist abortive relief, but excessive use causes rebound headaches.' }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiseases()
  }, [searchTerm, selectedCategory])

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Disease Dictionary - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-3xl font-black text-white">Disease Encyclopedia</h1>
            <p className="text-xs text-slate-400">Search comprehensive medical documentation, clinical diagnosis procedures, and medication guidelines</p>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Search keywords</label>
              <input
                type="text"
                placeholder="Search disease by name (e.g. Migraine)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Filter Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 w-full"
              >
                <option value="">All Categories</option>
                <option value="Infectious">Infectious</option>
                <option value="Neurological">Neurological</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Pulmonary">Pulmonary</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-amber-400 bg-amber-500/10 border border-amber-500/20 text-xs px-4 py-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          {/* Diseases List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => (
                <div key={n} className="bg-slate-850 border border-slate-800 p-6 rounded-xl animate-pulse h-24"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {diseases.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl">
                  No diseases found in the index matching the criteria.
                </div>
              ) : (
                diseases.map((d) => {
                  const isExpanded = expandedId === d.id
                  return (
                    <div
                      key={d.id}
                      className="bg-slate-850 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition hover:border-slate-700"
                    >
                      {/* Collapsed Header */}
                      <button
                        onClick={() => toggleExpand(d.id)}
                        className="w-full text-left p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 focus:outline-none"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white tracking-tight">{d.name}</h3>
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                              {d.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 max-w-2xl truncate sm:w-auto">{d.description}</p>
                        </div>

                        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            d.severity === 'severe'
                              ? 'text-red-400 bg-red-500/10 border-red-500/25'
                              : d.severity === 'moderate'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                              : 'text-green-400 bg-green-500/10 border-green-500/25'
                          }`}>
                            {d.severity}
                          </span>
                          <span className="text-teal-400 font-bold text-xs select-none">
                            {isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
                          </span>
                        </div>
                      </button>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="p-6 border-t border-slate-800 bg-slate-900/40 space-y-6 text-xs leading-relaxed text-slate-300">
                          
                          {/* Top metadata grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg">
                              <span className="block text-[10px] text-slate-450 uppercase tracking-widest font-bold">Treatment Duration</span>
                              <strong className="block text-sm text-white mt-1">{d.treatment_duration || '7-10 Days'}</strong>
                            </div>
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg">
                              <span className="block text-[10px] text-slate-450 uppercase tracking-widest font-bold">Required Specialist</span>
                              <strong className="block text-sm text-teal-400 mt-1">{d.specialist_required || 'General Practitioner'}</strong>
                            </div>
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg">
                              <span className="block text-[10px] text-slate-450 uppercase tracking-widest font-bold">Recovery Success Rate</span>
                              <strong className="block text-sm text-white mt-1">{d.success_rate || '99%'}</strong>
                            </div>
                          </div>

                          {/* Full detail lists */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Cause & Symptoms */}
                            <div className="space-y-4">
                              <div>
                                <strong className="text-slate-100 block mb-1">Causes & Triggers</strong>
                                <p>{d.causes || 'Refer to specialist'}</p>
                              </div>
                              <div>
                                <strong className="text-slate-100 block mb-1">Diagnostic Methods</strong>
                                <p>{d.diagnosis_methods || 'Clinical consultation'}</p>
                              </div>
                              <div>
                                <strong className="text-slate-100 block mb-1">Associated Symptoms</strong>
                                <p>{d.symptoms_list || 'General symptoms'}</p>
                              </div>
                            </div>

                            {/* Protocols & Medicines */}
                            <div className="space-y-4">
                              <div>
                                <strong className="text-slate-100 block mb-1">Treatment Procedures</strong>
                                <p>{d.treatment_procedures || 'Rest and monitoring'}</p>
                              </div>
                              <div>
                                <strong className="text-slate-100 block mb-1">Required Medications</strong>
                                <p className="text-teal-400">{d.required_medications || 'Over-the-counter remedies'}</p>
                              </div>
                              <div>
                                <strong className="text-slate-100 block mb-1">Lifestyle & Prevention</strong>
                                <p>{d.lifestyle_recommendations || 'Rest, diet adjustments.'}</p>
                              </div>
                            </div>

                          </div>

                          {/* Frequently Asked Questions */}
                          {d.faqs && d.faqs.length > 0 && (
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h4>
                              <div className="space-y-3">
                                {d.faqs.map((f: any, idx: number) => (
                                  <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                                    <strong className="text-slate-200 block mb-1">Q: {f.question}</strong>
                                    <p className="text-slate-400">A: {f.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
