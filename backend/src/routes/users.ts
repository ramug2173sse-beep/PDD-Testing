import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { query } from '../db'

const router = Router()

// Get detailed profile for current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const r = await query('SELECT u.id, u.full_name, u.email, u.phone, u.age, u.gender, u.address, u.is_active, u.created_at, ro.name as role FROM users u LEFT JOIN roles ro ON u.role_id = ro.id WHERE u.id = $1', [uid])
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' })
    const user = r.rows[0]

    // counts
    const preds = await query('SELECT COUNT(*)::int AS cnt FROM predictions WHERE user_id = $1', [uid])
    const appts = await query("SELECT COUNT(*)::int AS cnt FROM appointments WHERE user_id = $1 AND appointment_at >= now()", [uid])

    res.json({ user, statistics: { predictions: preds.rows[0].cnt, upcoming_appointments: appts.rows[0].cnt } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
