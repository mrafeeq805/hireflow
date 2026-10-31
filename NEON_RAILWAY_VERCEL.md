# Deploying HireFlow with Neon, Railway, and Vercel

This guide walks you through deploying the complete production stack in under 10 minutes:
- **Database**: [Neon](https://neon.tech) (Serverless PostgreSQL)
- **Backend API & WebSockets**: [Railway](https://railway.app) (Node.js + Socket.IO)
- **Frontend SPA**: [Vercel](https://vercel.com) (React 18 + Vite + Edge CDN)

---

```
                       ┌─────────────────────────┐
                       │      Vercel (Edge)      │
                       │   https://app.vercel.app│
                       └────────────┬────────────┘
                                    │
                                    │ HTTPS + WSS
                                    ▼
                       ┌─────────────────────────┐
                       │    Railway (Backend)    │
                       │  https://api.railway.app│
                       └────────────┬────────────┘
                                    │
                                    │ SSL Pooled Connection
                                    ▼
                       ┌─────────────────────────┐
                       │     Neon PostgreSQL     │
                       │   ep-xyz.aws.neon.tech  │
                       └─────────────────────────┘
```

---

## Step 1: Create PostgreSQL Database on Neon (2 minutes)

1. Sign up or log in at **[Neon.tech](https://neon.tech)**.
2. Click **Create Project**:
   - **Name**: `hireflow-db` (or any name you choose)
   - **Region**: Choose the region closest to your users (e.g., `US East (Ohio)` or `Europe (Frankfurt)`)
3. Once created, you will see your **Connection Details** on the Neon dashboard.
4. Select **Connection string** with **Pooled connection**:
   It looks like:
   ```
   postgresql://neondb_owner:password123@ep-patient-rain-12345-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copy this connection string**. You will use it in Step 2.

---

## Step 2: Deploy Backend API on Railway (4 minutes)

Railway hosts the Node.js API and keeps the Socket.IO WebSocket connection alive.

1. Sign up or log in at **[Railway.app](https://railway.app)**.
2. Click **+ New Project** → **Deploy from GitHub repo**.
3. Select your `HireFlow` repository.
4. Click **Add Variables** and configure the following environment variables:

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | *(Paste Neon connection string from Step 1)* | Pooled PostgreSQL connection |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `5000` | Internal server port |
| `API_PREFIX` | `/api/v1` | API routing prefix |
| `CORS_ORIGIN` | `*` | Or your Vercel URL once deployed |
| `COOKIE_SECURE` | `true` | Enforces HTTPS-only cookies |
| `COOKIE_SAME_SITE` | `none` | **Critical**: Allows cross-site auth cookies from Vercel to Railway |
| `JWT_ACCESS_SECRET` | `(Click 'Generate Random' or paste random 64-char string)` | Access token secret |
| `JWT_REFRESH_SECRET` | `(Click 'Generate Random' or paste random 64-char string)` | Refresh token secret |
| `COOKIE_SECRET` | `(Click 'Generate Random' or paste random 32-char string)` | Cookie signature secret |

5. Railway automatically detects [`railway.json`](./railway.json) which instructs it to:
   - Build `@hireflow/shared`
   - Switch Prisma to PostgreSQL and generate client
   - Run `npx prisma db push` to initialize tables in your Neon database
   - Launch `dist/server.js`
6. Click **Deploy**.
7. Once deployed, go to the service **Settings** → **Networking** → Click **Generate Domain**.
   - Your backend URL will be something like:
     ```
     https://hireflow-api-production.up.railway.app
     ```
8. **Copy your Railway URL**. You will use it in Step 3.

---

## Step 3: Deploy Frontend on Vercel (3 minutes)

1. Sign up or log in at **[Vercel.com](https://vercel.com)**.
2. Click **Add New...** → **Project**.
3. Import your `HireFlow` repository.
4. In the project setup screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Leave as `./` (the root [`vercel.json`](./vercel.json) handles building)
5. Expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app/api/v1` |
| `VITE_SOCKET_URL` | `https://your-railway-url.up.railway.app` |

*(Replace with your actual Railway domain from Step 2, without trailing slashes)*

6. Click **Deploy**.
7. Within 1 minute, Vercel will complete the build and assign your live production domain (e.g. `https://hireflow.vercel.app`).

---

## Step 4: Seed Demo Data (1 minute)

To populate your new Neon database with realistic seed data (Alex Morgan, Sarah Jenkins, 5 job openings, 10 candidates, scorecards, and offers):

### Option A: From your local machine
In your local `.env`, temporarily paste your Neon `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://neondb_owner:password123@ep-patient-rain-12345-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
Then run from root:
```bash
npm run db:postgres
npm run db:seed
```

### Option B: From Railway Web Terminal
1. In your Railway project, click on your backend service.
2. Open the **Terminal** tab.
3. Run:
```bash
cd apps/api && npm run db:seed
```

---

## Verification Checklist

- [ ] **Neon Database**: Check Neon console to see 22 tables created (`User`, `Workspace`, `Job`, `Candidate`, `Application`, etc.).
- [ ] **Railway API Health**: Visit `https://your-backend.up.railway.app/health` → returns `{"status":"healthy"}`.
- [ ] **Vercel Web App**: Visit `https://your-app.vercel.app/login` → page loads with emerald theme.
- [ ] **Login & WebSockets**: Log in with `alex.morgan@hireflow.io` / `Password123!`. Green live sync indicator appears on topbar!

