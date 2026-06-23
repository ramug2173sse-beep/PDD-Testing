type Prediction = { disease: string; confidence: number; }

// Simple heuristic-based predictor stub. Replace with real ML integration later.
export function predictDisease(symptoms: string[]): Prediction[] {
  const lower = symptoms.map(s => s.toLowerCase())
  const scores: Record<string, number> = {}

  const diseaseKeywords: Record<string, string[]> = {
    'Common Cold': ['cough','sore throat','sneezing','runny nose','nasal'],
    'Influenza': ['fever','cough','chills','body ache','fatigue'],
    'Migraine': ['headache','nausea','sensitivity to light','aura'],
    'Gastritis': ['stomach','nausea','vomit','abdominal pain'],
    'Pneumonia': ['fever','cough','shortness of breath','chest pain'],
  }

  for (const [disease, keys] of Object.entries(diseaseKeywords)) {
    scores[disease] = 0
    for (const k of keys) {
      for (const s of lower) {
        if (s.includes(k)) scores[disease] += 1
      }
    }
  }

  // assign base confidence proportional to matched keywords
  const results: Prediction[] = Object.keys(diseaseKeywords).map(d => ({
    disease: d,
    confidence: Math.min(95, Math.round((scores[d] / (diseaseKeywords[d].length || 1)) * 100))
  }))

  // Add a fallback low-confidence generic prediction
  if (results.every(r => r.confidence === 0)) {
    results.push({ disease: 'Undetermined - seek medical advice', confidence: 20 })
  }

  // sort by confidence desc and return top 3
  return results.sort((a,b) => b.confidence - a.confidence).slice(0,3)
}

export default predictDisease
