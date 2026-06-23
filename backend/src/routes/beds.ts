import { Router } from 'express'
import { query } from '../db'
import { addBedClient, removeBedClient, broadcastBeds } from '../bedBroadcaster'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const r = await query('SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name')
    res.json({ hospitals: r.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.get('/stream', async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.flushHeaders()

  const id = addBedClient(res)

  const sendInitial = async () => {
    try {
      const r = await query('SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name')
      res.write(`event: beds\ndata: ${JSON.stringify({ hospitals: r.rows, updated_at: new Date().toISOString() })}\n\n`)
    } catch (err) {
      console.error('SSE initial error', err)
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'failed to load initial data' })}\n\n`)
    }
  }

  sendInitial()

  req.on('close', () => {
    removeBedClient(id)
  })
})

router.post('/refresh', async (req, res) => {
  try {
    await broadcastBeds()
    res.json({ status: 'ok' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
