import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { predictDisease } from '../ml/predictor'
import { query } from '../db'

const router = Router()

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const symptoms: string[] = req.body.symptoms || []
    const severityInput: number = Number(req.body.severity || 5) // Slider 1-10

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of symptoms' })
    }

    const predictions = predictDisease(symptoms)
    const top = predictions[0] || { disease: 'Undetermined - seek medical advice', confidence: 20 }

    // Fetch full clinical details from database
    const diseaseResult = await query('SELECT * FROM diseases WHERE name = $1', [top.disease])
    const diseaseDetails = diseaseResult.rows[0] || null

    // Determine risk level and severity based on confidence and severity input
    let riskLevel = 'Low'
    if (top.confidence > 75 || severityInput > 7) {
      riskLevel = 'High'
    } else if (top.confidence > 45 || severityInput > 4) {
      riskLevel = 'Medium'
    }

    const severityScore = Number(((top.confidence / 10) * 0.4 + severityInput * 0.6).toFixed(1))
    const recommendedAction = severityScore > 7 
      ? 'Seek emergency room care immediately or contact nearest ambulance.'
      : severityScore > 4
      ? 'Schedule a consultation with a specialist within 24-48 hours.'
      : 'Rest at home, monitor symptoms, and consult a general practitioner if symptoms persist.'

    const suggestedSpecialist = diseaseDetails?.specialist_required || 'General Practitioner'
    const precautions = diseaseDetails?.home_care || 'Rest, stay hydrated, and monitor temperature.'

    // Save prediction record to DB for audit history
    const result = await query(
      `INSERT INTO predictions (user_id, predicted_disease_id, predicted_disease_name, confidence, risk_level, severity_score, recommended_action, suggested_specialist, symptoms_provided)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, created_at`,
      [
        req.user?.id || null,
        diseaseDetails?.id || null,
        top.disease,
        top.confidence,
        riskLevel,
        severityScore,
        recommendedAction,
        suggestedSpecialist,
        symptoms.join(', ')
      ]
    )

    // Log security audit log entry
    await query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [req.user?.id || null, 'DISEASE_PREDICTION', JSON.stringify({ predictionId: result.rows[0].id, disease: top.disease }), req.ip]
    )

    res.json({
      prediction_id: result.rows[0].id,
      predictions,
      analysis: {
        disease_name: top.disease,
        confidence: top.confidence,
        risk_level: riskLevel,
        severity_score: severityScore,
        recommended_action: recommendedAction,
        suggested_specialist: suggestedSpecialist,
        precautions: precautions,
        details: diseaseDetails
      }
    })
  } catch (err) {
    console.error('prediction error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
