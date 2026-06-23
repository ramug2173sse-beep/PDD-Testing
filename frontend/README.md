# GSMAT Frontend

Next.js + React + Tailwind frontend for the General Smart Medical Assistance System.

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Pages added:
- `/predict` — Symptom checker (submit symptoms + view predictions)
- `/dashboard` — Patient dashboard (requires Bearer token)
- `/bed-tracking` — Real-time bed availability streaming

Admin pages:
- `/admin` — Admin dashboard (requires admin Bearer token)
- `/admin/users` — Manage users (activate/deactivate)
- `/admin/hospitals` — Manage hospitals and bed counts
- `/admin/analytics` — Admin analytics dashboard

