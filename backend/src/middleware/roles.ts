import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { query } from '../db'

export function requireRole(roleName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'unauthorized' })
      const r = await query('SELECT name FROM roles WHERE id = $1', [req.user.role_id])
      const name = r.rows[0]?.name
      if (name === roleName) return next()
      return res.status(403).json({ error: 'forbidden' })
    } catch (err) {
      console.error('role check error', err)
      return res.status(500).json({ error: 'internal' })
    }
  }
}
