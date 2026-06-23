import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { query } from '../db'

const router = Router()

// Fetch all notifications for patient
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100', [uid])
    res.json({ notifications: result.rows })
  } catch (err) {
    console.error('get notifications error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Mark notification as read
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const nid = Number(req.params.id)
    const uid = req.user.id

    const check = await query('SELECT id FROM notifications WHERE id = $1 AND user_id = $2', [nid, uid])
    if (check.rowCount === 0) return res.status(404).json({ error: 'notification not found' })

    const result = await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [nid])
    res.json({ notification: result.rows[0] })
  } catch (err) {
    console.error('read notification error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Trigger a mock notification (useful for testing alert systems)
router.post('/trigger', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const { message, category } = req.body

    if (!message) {
      return res.status(400).json({ error: 'message is required' })
    }

    const result = await query(
      'INSERT INTO notifications (user_id, message, category) VALUES ($1, $2, $3) RETURNING *',
      [uid, message, category || 'health']
    )

    res.json({ notification: result.rows[0] })
  } catch (err) {
    console.error('trigger notification error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
