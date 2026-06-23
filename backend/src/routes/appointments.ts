import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { query } from '../db'

const router = Router()

// list upcoming appointments for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const r = await query('SELECT a.*, h.name as hospital_name, d.full_name as doctor_name FROM appointments a LEFT JOIN hospitals h ON a.hospital_id=h.id LEFT JOIN doctors d ON a.doctor_id=d.id WHERE a.user_id=$1 ORDER BY appointment_at ASC LIMIT 50', [uid])
    res.json({ appointments: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

// book appointment
router.post('/book', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const { hospital_id, doctor_id, appointment_at, notes } = req.body
    if (!hospital_id || !appointment_at) return res.status(400).json({ error: 'hospital_id and appointment_at required' })
    const r = await query('INSERT INTO appointments (user_id, hospital_id, doctor_id, appointment_at, notes) VALUES ($1,$2,$3,$4,$5) RETURNING id, appointment_at, status', [uid, hospital_id, doctor_id || null, appointment_at, notes || null])
    res.json({ appointment: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
