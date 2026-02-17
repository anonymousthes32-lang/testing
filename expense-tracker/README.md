## Running Locally
1. Install dependencies.
   - Backend: `cd backend && npm install express better-sqlite3 cors uuid`
   - Frontend: `cd frontend && npm install recharts`
   - Dev tools (backend): `cd backend && npm install -D vitest supertest`
2. Copy env examples.
   - Backend: `cp backend/.env.example backend/.env`
   - Frontend: `cp frontend/.env.example frontend/.env`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`


### Deploying (Detailed: Render backend + Netlify frontend)
1. **Backend on Render**
   - Create a new **Web Service** from your GitHub repo.
   - Set **Root Directory** to `expense-tracker/backend`.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add env vars:
     - `DB_PATH=./data/expenses.db`
     - `CORS_ORIGIN=https://<your-netlify-site>.netlify.app`
     - (Optional) `PORT=3000` (Render injects `PORT`, but local default exists).

2. **Frontend on Netlify**
   - Create a new site from the same repo.
   - Set **Base directory** to `expense-tracker/frontend`.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add env var:
     - `VITE_API_URL=https://<your-render-service>.onrender.com`

3. **Redeploy order**
   - Deploy backend first, copy Render URL.
   - Set frontend `VITE_API_URL` to that URL and redeploy frontend.
   - Then update backend `CORS_ORIGIN` to your final frontend URL and redeploy backend.

4. **Common Render error you saw (`ERR_SOCKET_BAD_PORT`)**
   - This happens when `PORT` is not a valid integer.
   - This project now guards invalid `PORT` and falls back to `3000` so deploys don't crash on bad values.

5. **Important SQLite note**
   - SQLite is file-based and great for demos.
   - Some free hosting environments may reset data after restarts or instance recreation.
   - If you need durable production data, switch to Postgres later.

Deployment note:
- Use Render.com (free tier) for the Express backend (persistent server process; SQLite works for demo use).
- Use Vercel or Netlify for the React frontend.
- For truly serverless backend functions, swap SQLite for Neon Postgres.

## API Reference
| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/expenses` | Headers: `X-Idempotency-Key` (optional), body: `{ amount, category, description?, date }` | `201` on create or `200` on idempotent replay: `{ data: { id, amount, category, description, date, created_at, idempotency_key } }` |
| GET | `/expenses` | Query: `category` (optional), `sort` (`date_desc` default or `date_asc`) | `{ data: Expense[], total: "150.75", count: 12 }` |
| GET | `/expenses/summary` | none | `{ data: [{ category, total: "100.00", count: 4 }] }` |
| GET | `/expenses/category/:category` | path param category | `{ data: Expense[], total: "100.00", count: 4 }` |
| GET | `/expenses/dashboard/months` | none | `{ data: [{ month: "2025-01", total: "4200.00", count: 12 }] }` |
| GET | `/expenses/dashboard/months/:month/categories` | month param (`YYYY-MM`) | `{ data: [{ category, total: "2100.00", count: 7, percent: 50.0 }] }` |
| GET | `/expenses/dashboard/months/:month/categories/:category` | month + category params | `{ expenses: Expense[], total: "2100.00", count: 7 }` |

## Tech Choices & Rationale
- Backend runtime: **Node.js + Express** for fast setup and straightforward REST route composition.
- Database: **SQLite via better-sqlite3** for a zero-config local database and easy migration path later.
- Money model: **DECIMAL semantics using integer cents**. SQLite `DECIMAL` affinity can behave like text; storing cents as integers guarantees exact math and avoids floating-point drift.
- Frontend: **React + Vite** for fast local development.
- Charts: **Recharts** for pie/bar dashboard visualizations.
- Styling: **single CSS file** for low complexity.
- Testing: **Vitest + Supertest** on backend routes.

## Key Design Decisions
- **How money is stored (cents):** all writes convert decimal strings to integer cents (`150.75 -> 15075`) and all reads convert cents to fixed 2-decimal strings.
- **How idempotency works:** client sends `X-Idempotency-Key`; server inserts with unique key; duplicate key returns original record (200) instead of creating another row.
- **Why SQLite was chosen:** simple local bootstrap, no external infra, and good fit for a personal-tracker demo.
- **Dashboard architecture (3-level month drill-down):** Level 1 = all months, Level 2 = month category breakdown, Level 3 = month+category expense list with strict back-navigation (3→2 keeps month).

## Trade-offs & What Was Left Out
- No authentication/multi-user tenancy.
- No pagination yet.
- Category options are mostly fixed from UI defaults.
- Error telemetry/log aggregation omitted.

## If I Had More Time
- Add integration tests for the React UI.
- Add optimistic updates and stale-while-revalidate cache behavior.
- Add CSV export/import.
- Add monthly budget goals and alerts.
- Add Postgres adapter and migrations for production scale.
