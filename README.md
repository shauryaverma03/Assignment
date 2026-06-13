# SplitWise — Shared Expenses App (Spreetail Assignment)

A full-stack shared expenses app built with Node.js, Express, React, and PostgreSQL (Neon).

## Stack
- **Backend:** Node.js + Express + JWT Auth
- **Database:** PostgreSQL via Neon + Prisma ORM
- **Frontend:** React + Vite + Tailwind CSS

## Local Setup

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (neon.tech)

### Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your DATABASE_URL from Neon
npm run db:generate
npm run db:push
npm run dev
```

### Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Features
1. **Auth** — Register/login with JWT
2. **Groups** — Create groups, manage time-based membership (join/leave dates)
3. **Expenses** — Create expenses with equal/exact/percentage/shares split types
4. **Multi-currency** — USD expenses auto-converted to INR at configurable rate
5. **Balances** — Per-member net balance + min-cash-flow debt simplification
6. **Settlements** — Record payments between members
7. **CSV Import** — Import `expenses_export.csv` with full anomaly detection and user-visible report

## AI Tools Used
See `AI_USAGE.md`

## Data Anomaly Handling
See `SCOPE.md`

## Decision Log
See `DECISIONS.md`
