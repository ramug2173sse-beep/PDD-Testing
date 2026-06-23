import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { query } from '../db'

const router = Router()

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const uid = req.user.id
    const r = await query('SELECT * FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [uid])
    res.json({ predictions: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
