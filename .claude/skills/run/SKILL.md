---
name: run
description: Start the RMS application (database, backend, frontend)
---

# Run Application

Start the full RMS stack.

## Steps

1. Check if database is running, start if not:
   ```bash
   docker ps | grep rms-postgres || bun run db:start
   ```

2. Start backend API server:
   ```bash
   bun run dev &
   ```

3. Start frontend dev server:
   ```bash
   cd frontend && bun run dev &
   ```

## Output

After running, the services will be available at:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
