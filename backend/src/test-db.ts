import pool, { query } from './db'

async function test() {
  try {
    const res = await query('SELECT now()')
    console.log('Postgres connected, now:', res.rows[0])
  } catch (err) {
    console.error('Postgres connection failed:', err)
  } finally {
    await pool.end()
  }
}

test()
