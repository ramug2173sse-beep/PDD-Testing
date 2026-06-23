# GSMAT Backend

Express + TypeScript backend for the General Smart Medical Assistance System.

Run locally:

```bash
cd backend
npm install
npm run dev
```

Test DB connectivity (after you set `backend/.env` values or export env vars):

```bash
# using ts-node-dev (installed in devDependencies)
npx ts-node-dev src/test-db.ts

# or compile then run
npm run build
node dist/test-db.js
```
