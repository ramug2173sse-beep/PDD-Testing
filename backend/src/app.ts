import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import hospitalRoutes from './routes/hospitals'
import predictRoutes from './routes/predict'
import usersRoutes from './routes/users'
import predictionsRoutes from './routes/predictions'
import appointmentsRoutes from './routes/appointments'
import adminRoutes from './routes/admin'
import bedsRoutes from './routes/beds'
import reportsRoutes from './routes/reports'
import notificationsRoutes from './routes/notifications'
import diseasesRoutes from './routes/diseases'
import { authenticateToken } from './middleware/auth'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ status: 'ok', service: 'gsmat-backend' }))

app.use('/api/auth', authRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/predictions', predictionsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/beds', bedsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/diseases', diseasesRoutes)

// test protected
app.get('/api/me', authenticateToken, (req, res) => {
  // req.user populated by middleware
  res.json({ user: (req as any).user })
})

export default app
