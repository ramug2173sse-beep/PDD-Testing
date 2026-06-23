import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { query } from '../db'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

export interface AuthRequest extends Request {
  user?: any
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({ error: 'missing authorization' })
  const parts = String(auth).split(' ')
  const token = parts.length === 2 ? parts[1] : parts[0]
  try {
    const payload: any = jwt.verify(token, JWT_SECRET)
    // fetch user basic info
    const r = await query('SELECT id, full_name, email, phone, role_id, is_active FROM users WHERE id = $1', [payload.userId])
    if (r.rowCount === 0) return res.status(401).json({ error: 'invalid token' })
    const user = r.rows[0]
    if (!user.is_active) return res.status(403).json({ error: 'account inactive' })
    req.user = { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role_id: user.role_id }
    next()
  } catch (err) {
    console.error('auth error', err)
    return res.status(401).json({ error: 'invalid token' })
  }
}
