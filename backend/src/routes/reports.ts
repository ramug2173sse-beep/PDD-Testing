import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { query } from '../db'

const router = Router()

// Get all reports for current patient
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const result = await query('SELECT * FROM medical_reports WHERE user_id = $1 ORDER BY uploaded_at DESC', [uid])
    res.json({ reports: result.rows })
  } catch (err) {
    console.error('get reports error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Upload a report (Mock file metadata handler)
router.post('/upload', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const { filename, mime_type, file_content } = req.body

    if (!filename) {
      return res.status(400).json({ error: 'filename is required' })
    }

    // Generate simulated AI clinical summary based on filename
    let summary = 'AI Medical Analysis Summary:\n\n'
    const nameLower = filename.toLowerCase()

    if (nameLower.includes('blood') || nameLower.includes('cbc')) {
      summary += `- Red Blood Cell (RBC) count: 4.8 million/mcL (Normal)\n`
      summary += `- White Blood Cell (WBC) count: 7.2 thousand/mcL (Normal)\n`
      summary += `- Hemoglobin: 14.2 g/dL (Normal)\n`
      summary += `- Platelet count: 250,000/mcL (Normal)\n\n`
      summary += `Clinical Note: General blood indices are within standard reference ranges. No immediate inflammatory markers detected.`
    } else if (nameLower.includes('lipid') || nameLower.includes('cholesterol')) {
      summary += `- Total Cholesterol: 215 mg/dL (Borderline High)\n`
      summary += `- LDL Cholesterol: 135 mg/dL (Borderline High)\n`
      summary += `- HDL Cholesterol: 48 mg/dL (Normal)\n`
      summary += `- Triglycerides: 160 mg/dL (Mildly Elevated)\n\n`
      summary += `Clinical Note: Results show borderline high total and LDL cholesterol. Diet modifications and moderate cardiovascular exercise are recommended.`
    } else if (nameLower.includes('chest') || nameLower.includes('xray') || nameLower.includes('x-ray')) {
      summary += `- Lung Fields: Clear, no active infiltrates, consolidation or effusion.\n`
      summary += `- Cardiothoracic Ratio: Normal heart size limits.\n`
      summary += `- Bony Thorax: Intact, no fractures.\n\n`
      summary += `Clinical Note: Normal chest radiographic appearance. Lungs are clear.`
    } else if (nameLower.includes('diabet') || nameLower.includes('sugar') || nameLower.includes('hba1c') || nameLower.includes('glucose')) {
      summary += `- Fasting Blood Glucose: 108 mg/dL (Pre-diabetic range)\n`
      summary += `- HbA1c: 5.9% (Pre-diabetic range)\n\n`
      summary += `Clinical Note: Glycemic indicators suggest mild insulin resistance or pre-diabetes. A low-glycemic diet, reduction in simple sugars, and regular physical activity are advised.`
    } else {
      summary += `- Standard diagnostics scan completed successfully.\n`
      summary += `- File size: ${file_content ? Math.round(file_content.length / 1.3) : 1024} bytes.\n\n`
      summary += `Clinical Note: Document successfully processed. Clear clinical indicators were not automatically extracted. Please consult your specialist for detailed review.`
    }

    const mockPath = `/uploads/user_${uid}/${Date.now()}_${filename}`

    const result = await query(
      `INSERT INTO medical_reports (user_id, filename, file_path, mime_type, summary)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [uid, filename, mockPath, mime_type || 'application/pdf', summary]
    )

    // Log security audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [uid, 'REPORT_UPLOAD', JSON.stringify({ reportId: result.rows[0].id, filename }), req.ip]
    )

    res.json({ report: result.rows[0] })
  } catch (err) {
    console.error('upload report error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Download report details
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)
    const uid = req.user.id

    const result = await query('SELECT * FROM medical_reports WHERE id = $1 AND user_id = $2', [id, uid])
    if (result.rowCount === 0) return res.status(404).json({ error: 'report not found' })

    const report = result.rows[0]

    // Simulate sending file stream: we send base64 metadata mock
    res.json({
      filename: report.filename,
      mime_type: report.mime_type,
      summary: report.summary,
      file_path: report.file_path,
      content: 'MOCK_FILE_STREAM_DATA_BASE64_REPRESENTATION'
    })
  } catch (err) {
    console.error('download report error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Delete report
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)
    const uid = req.user.id

    const check = await query('SELECT id FROM medical_reports WHERE id = $1 AND user_id = $2', [id, uid])
    if (check.rowCount === 0) return res.status(404).json({ error: 'report not found' })

    await query('DELETE FROM medical_reports WHERE id = $1', [id])

    // Log security audit
    await query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [uid, 'REPORT_DELETE', JSON.stringify({ reportId: id }), req.ip]
    )

    res.json({ status: 'ok', deleted: id })
  } catch (err) {
    console.error('delete report error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
