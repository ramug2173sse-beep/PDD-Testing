import { Router } from 'express'
import { query } from '../db'

const router = Router()

// Get all diseases (with optional search filter)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query

    let sql = 'SELECT id, name, description, category, severity, specialist_required, is_contagious FROM diseases WHERE 1=1'
    const params: any[] = []
    let pIdx = 1

    if (search) {
      sql += ` AND name ILIKE $${pIdx}`
      params.push(`%${search}%`)
      pIdx++
    }

    if (category) {
      sql += ` AND category ILIKE $${pIdx}`
      params.push(`%${category}%`)
      pIdx++
    }

    sql += ' ORDER BY name ASC'

    const result = await query(sql, params)
    res.json(result.rows)
  } catch (err) {
    console.error('get diseases error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Get single disease details by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await query('SELECT * FROM diseases WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'disease not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('get disease detail error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
