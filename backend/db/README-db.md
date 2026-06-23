PostgreSQL schema and seed for GSMAT backend

Run the schema and seed using a Postgres superuser or a user with CREATE privileges.

Examples:

```bash
# create database (if not exists)
createdb -U postgres gsmat_db

# run schema
psql -U postgres -d gsmat_db -f backend/db/schema.sql

# run seed
psql -U postgres -d gsmat_db -f backend/db/seed.sql
```

Alternatively use `psql` with connection params or a Docker container running Postgres.

After running, update `backend/.env` (or your environment) with the DB connection values.
