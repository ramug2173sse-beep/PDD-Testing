import { Router } from 'express'
import { query } from '../db'

const router = Router()

// Fetch all hospitals (with optional search, city, and specialty filter)
router.get('/', async (req, res) => {
  try {
    const { city, specialty, search } = req.query

    let sql = 'SELECT * FROM hospitals WHERE 1=1'
    const params: any[] = []
    let pIdx = 1

    if (city) {
      sql += ` AND city ILIKE $${pIdx}`
      params.push(`%${city}%`)
      pIdx++
    }

    if (specialty) {
      sql += ` AND specialties ILIKE $${pIdx}`
      params.push(`%${specialty}%`)
      pIdx++
    }

    if (search) {
      sql += ` AND (name ILIKE $${pIdx} OR address ILIKE $${pIdx})`
      params.push(`%${search}%`)
      pIdx++
    }

    sql += ' ORDER BY rating DESC, name ASC'

    const result = await query(sql, params)
    
    // Add mock distance since we don't have geospatial calculations in sqlite/pg mockup
    const hospitals = result.rows.map((h: any, idx: number) => ({
      ...h,
      distance: `${(1.2 + idx * 0.7).toFixed(1)} km` // Mocked distance
    }))

    res.json(hospitals)
  } catch (err) {
    console.error('hospitals get error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Fetch single hospital details
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await query('SELECT * FROM hospitals WHERE id = $1', [id])
    if (result.rowCount === 0) return res.status(404).json({ error: 'hospital not found' })
    
    const hospital = result.rows[0]
    hospital.distance = '1.5 km' // Mocked distance

    res.json(hospital)
  } catch (err) {
    console.error('hospital detail error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Fetch doctors practicing at the hospital
router.get('/:id/doctors', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await query('SELECT * FROM doctors WHERE hospital_id = $1 ORDER BY rating DESC', [id])
    res.json(result.rows)
  } catch (err) {
    console.error('hospital doctors error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
