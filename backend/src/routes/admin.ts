import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/roles'
import { query } from '../db'
import { broadcastBeds } from '../bedBroadcaster'

const router = Router()

// All admin routes require auth + admin role
router.use(authenticateToken, requireRole('admin'))

router.get('/users', async (req, res) => {
  try {
    const r = await query('SELECT id, full_name, email, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 500')
    res.json({ users: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.put('/users/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { is_active } = req.body
    if (typeof is_active !== 'boolean') return res.status(400).json({ error: 'is_active boolean required' })
    const r = await query('UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id, full_name, email, is_active', [is_active, id])
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' })
    res.json({ user: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.get('/hospitals', async (req, res) => {
  try {
    const r = await query('SELECT id, name, address, city, phone, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name LIMIT 500')
    res.json({ hospitals: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.post('/hospitals', async (req, res) => {
  try {
    const { name, address, city, phone } = req.body
    if (!name) return res.status(400).json({ error: 'name required' })
    const r = await query(
      'INSERT INTO hospitals (name, address, city, phone) VALUES ($1,$2,$3,$4) RETURNING id, name, address, city, phone',
      [name, address || null, city || null, phone || null]
    )
    res.json({ hospital: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.put('/hospitals/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { name, address, city, phone } = req.body
    const r = await query(
      'UPDATE hospitals SET name=$1, address=$2, city=$3, phone=$4 WHERE id=$5 RETURNING id, name, address, city, phone',
      [name, address || null, city || null, phone || null, id]
    )
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' })
    res.json({ hospital: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.delete('/hospitals/:id', async (req, res) => {
  try {
    const id = req.params.id
    const r = await query('DELETE FROM hospitals WHERE id=$1 RETURNING id', [id])
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' })
    res.json({ deleted: r.rows[0].id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.put('/hospitals/:id/beds', async (req, res) => {
  try {
    const id = req.params.id
    const { total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators } = req.body
    const r = await query(
      `UPDATE hospitals SET total_beds=$1, available_beds=$2, icu_beds=$3, available_icu=$4, ventilators=$5, available_ventilators=$6 WHERE id=$7 RETURNING id, name, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators`,
      [total_beds || 0, available_beds || 0, icu_beds || 0, available_icu || 0, ventilators || 0, available_ventilators || 0, id]
    )
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' })
    await query(
      `INSERT INTO bed_availability (hospital_id, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, total_beds || 0, available_beds || 0, icu_beds || 0, available_icu || 0, ventilators || 0, available_ventilators || 0]
    )
    await broadcastBeds()
    res.json({ hospital: r.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.get('/predictions', async (req, res) => {
  try {
    const r = await query('SELECT p.*, u.email as user_email FROM predictions p LEFT JOIN users u ON p.user_id=u.id ORDER BY p.created_at DESC LIMIT 500')
    res.json({ predictions: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const users = await query('SELECT COUNT(*)::int AS cnt FROM users')
    const hospitals = await query('SELECT COUNT(*)::int AS cnt FROM hospitals')
    const predictions = await query('SELECT COUNT(*)::int AS cnt FROM predictions')
    const appointments = await query('SELECT COUNT(*)::int AS cnt FROM appointments')
    res.json({ counts: { users: users.rows[0].cnt, hospitals: hospitals.rows[0].cnt, predictions: predictions.rows[0].cnt, appointments: appointments.rows[0].cnt } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.get('/analytics', async (req, res) => {
  try {
    const users = await query('SELECT COUNT(*)::int AS cnt FROM users')
    const hospitals = await query('SELECT COUNT(*)::int AS cnt FROM hospitals')
    const predictions = await query('SELECT COUNT(*)::int AS cnt FROM predictions')
    const appointments = await query('SELECT COUNT(*)::int AS cnt FROM appointments')
    const utilization = await query(
      `SELECT AVG(CASE WHEN total_beds > 0 THEN (total_beds - available_beds)::float / total_beds ELSE 0 END)::numeric(5,2) AS avg_utilization
       FROM hospitals`
    )
    const lowBeds = await query(
      `SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators,
              CASE WHEN total_beds > 0 THEN available_beds::float / total_beds ELSE 0 END AS available_ratio
       FROM hospitals
       ORDER BY available_ratio ASC NULLS LAST
       LIMIT 5`
    )
    const predictionTrend = await query(
      `SELECT to_char(created_at::date, 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM predictions
       WHERE created_at >= now() - interval '7 days'
       GROUP BY date ORDER BY date`
    )
    const appointmentTrend = await query(
      `SELECT to_char(created_at::date, 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
       FROM appointments
       WHERE created_at >= now() - interval '7 days'
       GROUP BY date ORDER BY date`
    )
    res.json({
      counts: {
        users: users.rows[0].cnt,
        hospitals: hospitals.rows[0].cnt,
        predictions: predictions.rows[0].cnt,
        appointments: appointments.rows[0].cnt,
      },
      utilization: Number(utilization.rows[0].avg_utilization) || 0,
      lowBeds: lowBeds.rows,
      predictionTrend: predictionTrend.rows,
      appointmentTrend: appointmentTrend.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
