# HireFlow Deployment Guide

This guide details four production deployment strategies for **HireFlow**.

---

## Architecture Summary

HireFlow consists of:
- **Frontend (`apps/web`)**: React 18, Vite, Tailwind CSS, Recharts.
- **Backend (`apps/api`)**: Node.js, Express, Socket.IO, Prisma ORM, PostgreSQL.
- **Shared (`packages/shared`)**: Shared Zod schemas, constants, and TypeScript types.

---

## Option 1: 1-Click Unified Deployment on Render (Recommended)

Render provides free/starter PostgreSQL and continuous deployment directly from your GitHub repository using our pre-configured `render.yaml` Blueprint.

### Steps:
1. Push your repository to **GitHub**.
2. Log in to [Render.com](https://render.com).
3. Click **New +** → **Blueprint**.
4. Connect your `HireFlow` repository.
5. Render will automatically detect `render.yaml` and provision:
   - A managed **PostgreSQL Database** (`hireflow-db`)
   - A **Docker Web Service** (`hireflow-app`) that runs both the API, WebSockets, and serves the frontend.
6. Click **Apply**.
7. Once the build completes, visit your custom Render URL (e.g. `https://hireflow-app.onrender.com`).

#### Optional: Seed Demo Data on Render
Open the **Shell** tab in your Render Web Service dashboard and run:
```bash
cd apps/api && npm run db:seed
```

---

## Option 2: Railway Deployment

Railway supports monorepos, WebSockets, and PostgreSQL out of the box.

### Steps:
1. Go to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Provision PostgreSQL** to add a database.
3. Click **New Service** → **GitHub Repo** → select `HireFlow`.
4. In the service settings:
   - **Root Directory**: Leave blank or set to `/`
   - **Build Command**: `npm ci && npm run build:shared && npm run build:web && cd apps/api && node scripts/use-db.js postgres && npx prisma generate && npm run build`
   - **Start Command**: `cd apps/api && npx prisma db push && node dist/server.js`
5. In the **Variables** tab, set:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `API_PREFIX`: `/api/v1`
   - `JWT_ACCESS_SECRET`: `(generate random 64 characters)`
   - `JWT_REFRESH_SECRET`: `(generate random 64 characters)`
   - `COOKIE_SECRET`: `(generate random 32 characters)`
   - `COOKIE_SECURE`: `true`
   - `COOKIE_SAME_SITE`: `lax`
6. Under **Settings** → **Networking**, click **Generate Domain**.

---

## Option 3: Split Deployment (Vercel Frontend + Render/Railway Backend)

If you prefer hosting the React frontend on Vercel's global CDN edge network:

### 1. Backend (on Railway or Render):
Deploy `apps/api` using Option 1 or 2, and copy the assigned backend URL (e.g. `https://api.hireflow.yourdomain.com`).

### 2. Frontend (on Vercel):
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import the `HireFlow` GitHub repo.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build --workspace=@hireflow/web`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://api.hireflow.yourdomain.com/api/v1`
   - `VITE_SOCKET_URL`: `https://api.hireflow.yourdomain.com`
5. Click **Deploy**. Vercel will build the frontend using `apps/web/vercel.json` for SPA routing.

---

## Option 4: Self-Hosted Cloud VPS with Docker Compose (DigitalOcean, AWS, GCP, Hetzner)

For full control over server resources and zero vendor lock-in.

### 1. Provision a Server
- Any Linux server (Ubuntu 22.04 LTS recommended) with at least 1 GB RAM.
- Install Docker and Docker Compose:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
```

### 2. Clone and Launch
```bash
git clone https://github.com/your-username/HireFlow.git
cd HireFlow

# Launch database and application in background
docker compose up -d --build
```

### 3. Verify
```bash
# Check running containers
docker compose ps

# View live application logs
docker compose logs -f app
```
The application will be accessible at `http://your-server-ip:5000`.

### 4. Optional: Add Nginx & Free SSL with Certbot
Point your custom domain (e.g. `ats.company.com`) to your server IP and run:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d ats.company.com
```

---

## Environment Variables Reference

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | **Yes** | Runtime environment | `production` |
| `PORT` | No | Server port | `5000` |
| `API_PREFIX` | No | REST API routing prefix | `/api/v1` |
| `JWT_ACCESS_SECRET` | **Yes** | 64-char secret for short-lived JWT | High-entropy random string |
| `JWT_REFRESH_SECRET`| **Yes** | 64-char secret for rotation tokens| High-entropy random string |
| `COOKIE_SECRET` | **Yes** | Secret for signing refresh cookie | High-entropy random string |
| `COOKIE_SECURE` | No | HTTPS-only cookies | `true` in production |
| `COOKIE_SAME_SITE` | No | SameSite cookie policy | `lax` |
| `STORAGE_DRIVER` | No | Upload storage engine | `local` |
| `STORAGE_MAX_FILE_SIZE` | No | Maximum file size in bytes | `10485760` (10MB) |
| `VITE_API_URL` | Frontend | Full API endpoint | `https://your-domain.com/api/v1` |
| `VITE_SOCKET_URL` | Frontend | Socket.IO endpoint | `https://your-domain.com` |

