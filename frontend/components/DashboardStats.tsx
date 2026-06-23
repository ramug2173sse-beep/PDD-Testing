type Props = {
  stats: { predictions: number; upcoming_appointments: number }
}

export default function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">Predictions<br /><strong>{stats.predictions}</strong></div>
      <div className="bg-white p-4 rounded shadow">Upcoming Appointments<br /><strong>{stats.upcoming_appointments}</strong></div>
      <div className="bg-white p-4 rounded shadow">Health Score<br /><strong>—</strong></div>
      <div className="bg-white p-4 rounded shadow">Bed Alerts<br /><strong>—</strong></div>
    </div>
  )
}
