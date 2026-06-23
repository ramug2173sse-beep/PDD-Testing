import { Router } from 'express'
import bcrypt from 'bcrypt'
import { query } from '../db'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'

async function getRoleId(roleName: string) {
  const r = await query('SELECT id FROM roles WHERE name = $1', [roleName])
  return r.rows[0]?.id
}

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, age, gender, address, role } = req.body
    if (!full_name || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'full_name, password and email/phone required' })
    }

    // check existing
    const existing = await query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone])
    if ((existing.rowCount ?? 0) > 0) return res.status(409).json({ error: 'User already exists' })

    const password_hash = await bcrypt.hash(password, 10)
    const roleName = role || 'patient'
    const roleId = await getRoleId(roleName)

    const insert = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, age, gender, address, role_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, full_name, email, phone, age, gender, address, role_id, created_at`,
      [full_name, email, phone, password_hash, age || null, gender || null, address || null, roleId || null]
    )

    const user = insert.rows[0]
    const token = jwt.sign({ userId: user.id, roleId: user.role_id }, JWT_SECRET, { expiresIn: '12h' })
    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ error: 'missing' })

    const r = await query('SELECT * FROM users WHERE email = $1 OR phone = $1', [identifier])
    if (r.rowCount === 0) return res.status(401).json({ error: 'invalid credentials' })

    const user = r.rows[0]
    if (!user.is_active) return res.status(403).json({ error: 'account inactive' })

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'invalid credentials' })

    const token = jwt.sign({ userId: user.id, roleId: user.role_id }, JWT_SECRET, { expiresIn: '12h' })
    // do not return password
    delete user.password_hash
    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
