import axios from 'axios'

export function getToken(): string | null {
  try { return localStorage.getItem('token') } catch(e){ return null }
}

export async function fetchCurrentUser() {
  try {
    const t = getToken()
    if (!t) return null
    const r = await axios.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${t}` } })
    return r.data.user
  } catch (e) {
    return null
  }
}

export async function isCurrentUserAdmin() {
  const u = await fetchCurrentUser()
  return !!(u && u.role === 'admin')
}
