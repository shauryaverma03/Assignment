# SplitWise — Shared Expense Tracker (Spreetail Assignment)

A production-ready full-stack web application for tracking shared expenses among flatmates. Built as part of the Spreetail engineering assignment — handles real-world data problems including multi-currency expenses, time-scoped group memberships, CSV anomaly detection, and minimum-transaction debt simplification.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | _[deployed URL]_ |
| Backend API (Render) | https://splitwise-backend-n5cq.onrender.com/api/health |

> **Test credentials:** Register a new account in under 30 seconds, or use the CSV import to instantly populate a group with the Flat 4B scenario data.

---

## The Problem This Solves

Six flatmates (Aisha, Rohan, Priya, Meera, Dev, Sam) share a flat. They log expenses in a spreadsheet — but the spreadsheet is "a mess":

- Priya paid for a Netflix subscription in USD, but the sheet records it as `$12` — which others read as ₹12. **Wrong.**
- Meera moved out on March 31. Expenses after that date still list her as a participant.
- Sam moved in on April 15. Some expenses before that date accidentally include him.
- There are duplicate rows, missing payers, invalid dates, and a settlement accidentally recorded as an expense.

This app ingests that CSV, detects every one of these problems, imports what it can safely, flags what it can't, and gives each member a clear picture of who owes what.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | Node.js + Express | Fast to build, well-understood ecosystem |
| Database | PostgreSQL (Neon serverless) | Relational model fits the join/leave membership pattern |
| ORM | Prisma | Type-safe queries, readable schema, built-in migrations |
| Auth | JWT (Bearer token + HttpOnly cookie) | Stateless, works with both browser and API clients |
| File upload | Multer v2 | Multipart form handling for CSV upload |
| CSV parsing | csv-parser | Streaming parser, handles large files without memory issues |
| Frontend | React 19 + Vite 8 | Fast dev server, instant HMR, small production bundle |
| Routing | React Router v6 | Client-side routing with protected routes |
| HTTP client | Axios | Interceptors for auth headers + 401 redirect |
| Hosting | Vercel (frontend) + Render (backend) | Free tier, zero-config deployment |

---

## Features

### Core
1. **Authentication** — Register/login with JWT. Token stored in localStorage + HttpOnly cookie for dual support.
2. **Groups** — Create named expense groups. Creator is automatically a member.
3. **Time-scoped membership** — Members have `joinedAt` and `leftAt` dates. A member is "active on date X" only if `joinedAt ≤ X ≤ leftAt` (or they never left). This correctly handles Meera leaving March 31 and Sam joining April 15.
4. **Expenses** — Add expenses with equal/exact/percentage/shares split types. USD amounts auto-convert to INR.
5. **Multi-currency** — USD detected by `$` symbol; converted at configurable rate (default 1 USD = ₹83.5). Both original and INR amounts stored.
6. **Balances** — Per-member net balance calculated using all expenses, splits, and settlements.
7. **Min-cash-flow settlement** — Greedy algorithm minimises the number of transactions needed to settle all debts. 5 people with complex splits → as few as 3–4 payments.
8. **Settlements** — Record actual payments between members to update balances in real time.
9. **CSV Import** — Upload `expenses_export.csv`; app detects 10+ anomaly types, imports valid rows, logs every decision.
10. **Anomaly Report** — Every anomaly (error/warning/info) stored in `ImportLog` table and shown in the UI with row number, issue type, and action taken.

### Visualisations (Dashboard & Group Detail)
- **Spending Trend** — 6-month area chart across all groups
- **Groups by Spending** — Horizontal bar chart comparing group totals
- **Group cards** — Total spent + per-group 6-month sparkline
- **Monthly Spending** — Per-group bar chart on the Expenses tab
- **Top Payers** — Donut chart showing contribution % per member
- **Balance Overview** — Horizontal balance bars (green = gets back, red = owes) on the Balances tab
- **Member stats** — Per-member paid vs share breakdown on the Members tab

---

## Project Structure

```
spreetail-assignment/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── api/axios.js         # Axios instance with auth interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # JWT auth state + login/logout
│   │   │   └── ThemeContext.jsx # Light/dark theme toggle
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Groups overview + spending charts
│   │   │   ├── GroupDetail.jsx  # 5-tab group view with visualisations
│   │   │   ├── Landing.jsx      # Marketing landing page
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Logo.jsx
│   │       └── ThemeSwitcher.jsx
│   ├── .env.example
│   └── vercel.json              # SPA rewrite rule for Vercel
│
├── server/                      # Node.js + Express backend
│   ├── prisma/
│   │   └── schema.prisma        # Single source of truth for DB schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── group.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── settlement.controller.js
│   │   │   ├── balance.controller.js    # Min-cash-flow algorithm
│   │   │   └── import.controller.js     # CSV parsing + anomaly detection
│   │   ├── routes/              # Express routers (one per resource)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js       # JWT verification
│   │   └── utils/
│   │       ├── prisma.js        # Prisma client singleton
│   │       └── balance.js       # simplifyDebts() algorithm
│   └── .env.example
│
├── expenses_export.csv          # Company test CSV (26 rows, 10 anomaly types)
├── SCOPE.md                     # Anomaly log + database schema
├── DECISIONS.md                 # Engineering decision log
└── AI_USAGE.md                  # AI tool usage + cases where AI was wrong
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A free [Neon](https://neon.tech) PostgreSQL database

### 1. Clone the repo
```bash
git clone https://github.com/shauryaverma03/Assignment.git
cd Assignment
```

### 2. Set up the backend
```bash
cd server
npm install

# Create your .env file
cp .env.example .env
# Edit .env and set:
#   DATABASE_URL  = your Neon connection string
#   JWT_SECRET    = any long random string
#   PORT          = 8000
#   USD_TO_INR    = 83.5

# Push schema to database
npm run db:generate    # generates Prisma client
npm run db:push        # creates tables in your Neon DB

# Start server (http://localhost:8000)
npm run dev
```

### 3. Set up the frontend
```bash
cd ../client
npm install

# Create your .env file
cp .env.example .env
# Edit .env and set:
#   VITE_API_URL = http://localhost:8000/api

# Start frontend (http://localhost:5173)
npm run dev
```

### 4. Test the CSV import
- Register an account and create a group named "Flat 4B"
- Go to the group → Import tab
- Upload `expenses_export.csv` from the repo root
- You should see 22 rows imported and 10 anomalies logged

---

## API Reference

All endpoints require `Authorization: Bearer <token>` header (except auth routes).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/groups` | List user's groups (with spending totals) |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group with expenses + memberships |
| POST | `/api/expenses` | Add expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/balances/:groupId` | Get member balances + suggested settlements |
| GET | `/api/balances/:groupId/:memberId` | Per-member expense breakdown |
| GET | `/api/settlements?groupId=X` | List settlements |
| POST | `/api/settlements` | Record a payment |
| POST | `/api/import/csv` | Upload CSV file (multipart) |
| GET | `/api/import/logs/:groupId` | Get all anomaly logs for a group |
| PATCH | `/api/import/logs/:id` | Resolve/update an anomaly log |

---

## Environment Variables

### Server (`server/.env`)
```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-minimum-32-chars
PORT=8000
USD_TO_INR=83.5
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:8000/api
```
For production: `VITE_API_URL=https://splitwise-backend-n5cq.onrender.com/api`

---

## Deployment

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `server`
3. Build command: `npm install && npm run db:generate && npm run db:push`
4. Start command: `node src/index.js`
5. Add environment variables (DATABASE_URL, JWT_SECRET, PORT, USD_TO_INR)

### Frontend → Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy — Vercel auto-detects Vite and handles the build

---

## AI Tools Used

- **Claude (Anthropic)** — Architecture design, code scaffolding, algorithm implementation, debugging
- **GitHub Copilot** — Inline completions while writing boilerplate

All prompts, AI outputs, and — crucially — **the cases where AI got it wrong and had to be corrected** are documented in [`AI_USAGE.md`](AI_USAGE.md).
