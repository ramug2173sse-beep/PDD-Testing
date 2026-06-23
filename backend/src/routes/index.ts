import { Router } from 'express'
const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'GSMAT API' })
})

export default router
