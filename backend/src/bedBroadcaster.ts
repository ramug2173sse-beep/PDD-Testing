import { Response } from 'express'
import { query } from './db'

const clients: { id: number; res: Response }[] = []
let nextId = 1

export function addBedClient(res: Response) {
  const id = nextId++
  clients.push({ id, res })
  return id
}

export function removeBedClient(id: number) {
  const index = clients.findIndex(client => client.id === id)
  if (index !== -1) clients.splice(index, 1)
}

export async function broadcastBeds() {
  try {
    const r = await query('SELECT id, name, city, total_beds, available_beds, icu_beds, available_icu, ventilators, available_ventilators FROM hospitals ORDER BY name')
    const payload = JSON.stringify({ hospitals: r.rows, updated_at: new Date().toISOString() })
    clients.forEach(client => {
      client.res.write(`event: beds\ndata: ${payload}\n\n`)
    })
  } catch (err) {
    console.error('broadcastBeds error', err)
  }
}
