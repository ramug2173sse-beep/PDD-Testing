import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function PredictPage() {
  const [token, setToken] = useState<string | null>(null)
  
  // Available symptoms list matching seed.sql
  const availableSymptoms = [
    'Fever', 'Cough', 'Sore Throat', 'Sneezing', 'Runny Nose', 
    'Chills', 'Body Ache', 'Fatigue', 'Headache', 'Nausea', 
    'Sensitivity to light', 'Aura', 'Stomach Pain', 'Vomiting', 
    'Abdominal Bloating', 'Shortness of Breath', 'Chest Pain', 
    'Dry Cough', 'Loss of Taste'
  ]

  // States
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severity, setSeverity] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState('')

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (t) setToken(t)
    } catch (e) {}
  }, [])

  // Web Speech API Voice implementation
  const startSpeechRecognition = () => {
    setSpeechError('')
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported in this browser. Trying simulation...')
      simulateVoiceInput()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onerror = (e: any) => {
      setSpeechError('Voice recording failed. Try again.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      console.log('Voice Transcript:', transcript)

      // Match transcript against available symptoms
      const found: string[] = []
      availableSymptoms.forEach(s => {
        if (transcript.includes(s.toLowerCase())) {
          found.push(s)
        }
      })

      if (found.length > 0) {
        setSelectedSymptoms(prev => {
          const union = new Set([...prev, ...found])
          return Array.from(union)
        })
      } else {
        setSpeechError(`Recorded: "${transcript}" (No matching symptoms found)`)
      }
    }

    recognition.start()
  }

  // Fallback simulator for speech input
  const simulateVoiceInput = () => {
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      const mockMatches = ['Cough', 'Fever']
      setSelectedSymptoms(prev => {
        const union = new Set([...prev, ...mockMatches])
        return Array.from(union)
      })
      setSpeechError('Simulated voice input: Detected "cough" and "fever"')
    }, 3000)
  }

  const handleAddSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
    setSearchTerm('')
  }

  const handleRemoveSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
  }

  const handleSubmitPrediction = async () => {
    setError('')
    setResult(null)

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to run the AI analysis.')
      return
    }

    if (!token) {
      setError('You must be signed in to perform diagnostic symptom checking.')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
        'http://localhost:4000/api/predict',
        { symptoms: selectedSymptoms, severity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(res.data.analysis)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Diagnostic query failed. Please verify authentication token status.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSymptoms = availableSymptoms.filter(
    s => s.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSymptoms.includes(s)
  )

  // Severity indicator color styling
  let severityColor = 'text-green-400 bg-green-500/10 border-green-500/25'
  let severityLabel = 'Mild'
  if (severity > 7) {
    severityColor = 'text-red-400 bg-red-500/10 border-red-500/25'
    severityLabel = 'Critical'
  } else if (severity > 3) {
    severityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/25'
    severityLabel = 'Moderate'
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Symptom Checker - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-white">AI Diagnostic Screening</h1>
              <p className="text-xs text-slate-400">Map medical symptoms, rate severity levels, and generate analysis reports</p>
            </div>
            {!token && (
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-lg">
                ⚠️ Login required for full report generation
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Portal (Left side) */}
            <div className="lg:col-span-5 bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Symptom Query Form</h2>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-xl text-center leading-relaxed">
                  {error}
                </div>
              )}

              {/* Symptom Search and Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Search & Select Symptoms</label>
                <input
                  type="text"
                  placeholder="Type to search (e.g. fever, cough)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 w-full"
                />

                {/* Dropdown Options */}
                {searchTerm && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 divide-y divide-slate-750">
                    {filteredSymptoms.length === 0 ? (
                      <div className="p-2 text-xs text-slate-400 text-center">No matching symptoms.</div>
                    ) : (
                      filteredSymptoms.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddSymptom(s)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-750 transition"
                        >
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Pills */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block">Selected Symptoms</span>
                {selectedSymptoms.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No symptoms selected. Use search bar or voice command.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((s, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <span>{s}</span>
                        <button type="button" onClick={() => handleRemoveSymptom(s)} className="hover:text-white transition font-black text-xs pr-0.5">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Input Section */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block">Voice Symptom Entry</span>
                  {isListening && <span className="text-[10px] text-teal-400 animate-pulse font-semibold">Microphone active</span>}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={startSpeechRecognition}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 transition ${
                      isListening
                        ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse'
                        : 'bg-slate-850 border-slate-700 text-slate-350 hover:text-white hover:border-slate-650'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                  </button>

                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Click the microphone to describe symptoms verbally (e.g. <em>"I have a fever and dry cough"</em>).
                    </p>
                    {speechError && (
                      <span className="block text-[10px] text-amber-300 font-semibold">{speechError}</span>
                    )}
                  </div>
                </div>

                {/* Animated waves while recording */}
                {isListening && (
                  <div className="flex justify-center items-center gap-1.5 h-6 pt-2">
                    <span className="w-1 bg-red-400 rounded animate-bounce" style={{ height: '70%', animationDelay: '0.1s' }}></span>
                    <span className="w-1 bg-red-400 rounded animate-bounce" style={{ height: '40%', animationDelay: '0.3s' }}></span>
                    <span className="w-1 bg-red-400 rounded animate-bounce" style={{ height: '90%', animationDelay: '0.2s' }}></span>
                    <span className="w-1 bg-red-400 rounded animate-bounce" style={{ height: '50%', animationDelay: '0.4s' }}></span>
                  </div>
                )}
              </div>

              {/* Severity Scale Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Symptom Severity Scale</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${severityColor}`}>
                    {severityLabel} ({severity}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={e => setSeverity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedSymptoms([]); setResult(null); setError(''); }}
                  className="border border-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPrediction}
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-650 text-slate-900 font-extrabold py-3 rounded-xl transition text-xs uppercase tracking-wider shadow shadow-teal-500/15"
                >
                  {loading ? 'Analyzing...' : 'Run Diagnostics'}
                </button>
              </div>

            </div>

            {/* Diagnostics Report (Right side) */}
            <div className="lg:col-span-7">
              {result ? (
                <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
                  
                  {/* Title & Risk level badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block">Screening Results</span>
                      <h2 className="text-2xl font-black text-white block mt-0.5">{result.disease_name}</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {result.confidence}% Match
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                        result.risk_level === 'High' 
                          ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : result.risk_level === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {result.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-bold">Suggested Specialist</span>
                      <span className="text-sm font-semibold text-white block mt-1">{result.suggested_specialist}</span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-bold">Clinical Severity Score</span>
                      <span className="text-sm font-semibold text-white block mt-1">{result.severity_score} / 10</span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 md:col-span-2">
                      <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-bold">Recommended Action</span>
                      <span className="text-xs text-slate-200 block mt-1 leading-relaxed">{result.recommended_action}</span>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 md:col-span-2">
                      <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-bold">Immediate Precautions</span>
                      <span className="text-xs text-slate-200 block mt-1 leading-relaxed">{result.precautions}</span>
                    </div>
                  </div>

                  {/* Detailed Analysis Breakdown */}
                  {result.details && (
                    <div className="space-y-4 pt-4 border-t border-slate-700/40">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Disease Analysis</h3>
                      
                      <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                        <p><strong className="text-slate-100 block">Overview:</strong> {result.details.description}</p>
                        <p><strong className="text-slate-100 block">Causes:</strong> {result.details.causes}</p>
                        <p><strong className="text-slate-100 block">Typical Symptoms:</strong> {result.details.symptoms_list}</p>
                        <p><strong className="text-slate-100 block">Diagnosis Methods:</strong> {result.details.diagnosis_methods}</p>
                        <p><strong className="text-slate-100 block">Lifestyle Recommendations:</strong> {result.details.lifestyle_recommendations}</p>
                        <p><strong className="text-slate-100 block">Prevention Techniques:</strong> {result.details.prevention_techniques}</p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                          <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                            <span className="block text-[9px] text-slate-450 uppercase tracking-widest">Recovery timeline</span>
                            <span className="font-semibold text-white block mt-0.5">{result.details.treatment_duration}</span>
                          </div>
                          <div className="bg-slate-900/40 p-2 rounded border border-slate-850">
                            <span className="block text-[9px] text-slate-450 uppercase tracking-widest">Approximate Treatment cost</span>
                            <span className="font-semibold text-white block mt-0.5">{result.details.treatment_cost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Diet & Exercise recommendations */}
                  {result.details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/40">
                      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
                        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">Diet Recommendations</span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.details.diet_recommendations}</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
                        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">Exercise Protocol</span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.details.exercise_recommendations}</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-slate-850 border border-slate-800 rounded-2xl py-24 px-6 text-center shadow-xl border-dashed">
                  <span className="text-5xl block mb-4">🩺</span>
                  <h3 className="text-lg font-bold text-white mb-2">Awaiting Diagnostic Query</h3>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                    Select symptoms using the search catalog or voice assistant on the left, set the severity indicator, and click "Run Diagnostics" to generate a clinical screening report.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
