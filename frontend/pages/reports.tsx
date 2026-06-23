import Head from 'next/head'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function ReportsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  
  // Lists
  const [reports, setReports] = useState<any[]>([])
  
  // Upload States
  const [filename, setFilename] = useState('')
  const [fileType, setFileType] = useState('application/pdf')
  
  // Active detail panel
  const [selectedReport, setSelectedReport] = useState<any>(null)
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState('')

  const loadReports = async (t: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:4000/api/reports', {
        headers: { Authorization: `Bearer ${t}` }
      })
      const list = res.data.reports || []
      setReports(list)
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]) // Select first by default
      }
    } catch (e) {
      setError('Could not connect to database. Displaying offline reports cache.')
      setReports([
        {
          id: 1,
          filename: 'Lipid Panel Report.pdf',
          mime_type: 'application/pdf',
          uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          summary: `AI Medical Analysis Summary:\n\n- Total Cholesterol: 215 mg/dL (Borderline High)\n- LDL Cholesterol: 135 mg/dL (Borderline High)\n- HDL Cholesterol: 48 mg/dL (Normal)\n- Triglycerides: 160 mg/dL (Mildly Elevated)\n\nClinical Note: Results show borderline high total and LDL cholesterol. Diet modifications and moderate cardiovascular exercise are recommended.`
        },
        {
          id: 2,
          filename: 'HbA1c Blood Sugar Log.pdf',
          mime_type: 'application/pdf',
          uploaded_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          summary: `AI Medical Analysis Summary:\n\n- Fasting Blood Glucose: 108 mg/dL (Pre-diabetic range)\n- HbA1c: 5.9% (Pre-diabetic range)\n\nClinical Note: Glycemic indicators suggest mild insulin resistance or pre-diabetes. A low-glycemic diet, reduction in simple sugars, and regular physical activity are advised.`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      if (!t) {
        router.push('/login')
      } else {
        setToken(t)
        loadReports(t)
      }
    } catch (e) {}
  }, [])

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filename || !token) return
    setUploadLoading(true)
    setError('')

    try {
      const res = await axios.post('http://localhost:4000/api/reports/upload', {
        filename,
        mime_type: fileType,
        file_content: 'MOCK_FILE_CONTENT_BLOB_BASE64'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const newRep = res.data.report
      setReports(prev => [newRep, ...prev])
      setSelectedReport(newRep)
      setFilename('')
    } catch (err: any) {
      setError('Report upload simulation failed.')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteReport = async (id: number) => {
    if (!token) return
    try {
      await axios.delete(`http://localhost:4000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReports(prev => prev.filter(r => r.id !== id))
      if (selectedReport?.id === id) {
        setSelectedReport(null)
      }
    } catch (e) {}
  }

  const triggerMockDownload = (report: any) => {
    // Generate a temporary clinical txt download
    const element = document.createElement("a");
    const file = new Blob([report.summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `AI_Summary_${report.filename.replace('.pdf', '.txt')}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="bg-slate-955 min-h-screen text-slate-100 flex flex-col font-sans">
      <Head>
        <title>Medical Reports - GSMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Outfit', sans-serif; background-color: #0b1329; }`}</style>
      </Head>

      <NavBar />

      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-3xl font-black text-white">Medical Diagnostic Reports</h1>
            <p className="text-xs text-slate-400">Upload lab results, map health scores, and review simulated AI medical summaries</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg text-center font-semibold">
              {error}
            </div>
          )}

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Upload Form & Report Directory */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Upload Form */}
              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Upload Medical Files</h2>
                
                <form onSubmit={handleUploadReport} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Document Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Blood Test, Lipid Panel"
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Mime Type</label>
                    <select
                      value={fileType}
                      onChange={e => setFileType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 w-full"
                    >
                      <option value="application/pdf">PDF Document</option>
                      <option value="image/png">PNG Image</option>
                      <option value="image/jpeg">JPEG Image</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="sm:col-span-3 bg-teal-500 hover:bg-teal-600 text-slate-900 font-extrabold py-2.5 rounded-lg transition text-xs uppercase tracking-wider shadow shadow-teal-500/15"
                  >
                    {uploadLoading ? 'Uploading and Analyzing...' : 'Upload & Parse Diagnostics File'}
                  </button>
                </form>
              </div>

              {/* Reports Table/List */}
              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reports Directory</h2>
                
                <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-2">
                  {loading ? (
                    <p className="text-xs text-slate-450 text-center py-6">Syncing document history...</p>
                  ) : reports.length === 0 ? (
                    <p className="text-xs text-slate-450 text-center py-10">No diagnostic reports uploaded yet.</p>
                  ) : (
                    reports.map(r => (
                      <div
                        key={r.id}
                        className={`py-3.5 flex justify-between items-center gap-4 cursor-pointer transition ${
                          selectedReport?.id === r.id ? 'bg-slate-800/25 px-2 rounded-lg' : ''
                        }`}
                        onClick={() => setSelectedReport(r)}
                      >
                        <div className="space-y-1">
                          <strong className="text-sm text-slate-200 block">{r.filename}</strong>
                          <span className="text-[10px] text-slate-450 block uppercase tracking-widest">
                            {r.mime_type.split('/')[1]} • {new Date(r.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteReport(r.id); }}
                            className="text-xs text-red-400 hover:underline px-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right side: AI Summary Panel & Recovery Trend Graph */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI summary */}
              {selectedReport ? (
                <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-700/40 pb-4">
                    <div>
                      <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest block">AI Diagnostics Analyzer</span>
                      <h3 className="text-base font-bold text-white block mt-0.5">{selectedReport.filename}</h3>
                    </div>
                    <button
                      onClick={() => triggerMockDownload(selectedReport)}
                      className="text-xs bg-slate-850 hover:bg-slate-750 text-teal-400 px-3 py-1.5 rounded border border-teal-500/20"
                    >
                      Download Text Summary
                    </button>
                  </div>

                  {/* Summary Text block */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                      {selectedReport.summary}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-850 border border-slate-800 rounded-2xl py-12 px-6 text-center shadow-xl border-dashed">
                  <h3 className="text-xs font-bold text-white mb-2">No Report Selected</h3>
                  <p className="text-[11px] text-slate-450">Select a report from the table to view the AI-generated health metrics analysis.</p>
                </div>
              )}

              {/* Recovery Trend visualization (SVG chart) */}
              <div className="bg-slate-850 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">HbA1c Glycemic Trend Index</h3>
                
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  
                  {/* SVG line chart */}
                  <div className="relative h-24 w-full">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="15" x2="100" y2="15" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* Line graph */}
                      <path d="M 10 25 L 50 18 L 90 8" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
                      
                      {/* Circle points */}
                      <circle cx="10" cy="25" r="1.5" fill="#f43f5e" />
                      <circle cx="50" cy="18" r="1.5" fill="#f59e0b" />
                      <circle cx="90" cy="8" r="1.5" fill="#10b981" />
                    </svg>
                  </div>

                  {/* Labels row */}
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <div className="text-left">
                      <span className="block font-bold text-red-400">6.5%</span>
                      <span>2 months ago</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-amber-400">6.2%</span>
                      <span>1 month ago</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-emerald-400">5.9%</span>
                      <span>Current (Normal)</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed text-center italic">
                    Visual tracking maps index values showing clinical indicator recovery curves.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
