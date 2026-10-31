# 🚀 Deploy HireFlow 100% Free (Step-by-Step Guide)

This guide walks you through deploying **HireFlow** completely for **FREE** with zero credit card required, using the exact same proven stack as **WorkSphere**.

Because HireFlow features **real-time recruitment updates via WebSockets (Socket.IO)**, a **background follow-up reminder worker**, and **PostgreSQL relational data**, the optimal free-tier architecture separates concerns across industry-standard free platforms:

| Layer | Provider | Free Tier Benefits | Cost |
| :--- | :--- | :--- | :--- |
| **Database** | [**Neon.tech**](https://neon.tech) | Serverless PostgreSQL, 0.5 GB storage, built-in connection pooler, no credit card required, never expires | **$0 / month** |
| **Backend API & Sockets** | [**Render.com**](https://render.com) or [**Railway**](https://railway.app) | Continuous Node.js web service, native WebSockets & Socket.IO support, automatic HTTPS | **$0 / month** |
| **Frontend Web Client** | [**Vercel**](https://vercel.com) | Worldwide edge CDN, automatic Vite detection, unlimited bandwidth, instant custom domains | **$0 / month** |

---

## 📋 Prerequisites

1. A **GitHub account** (with your HireFlow repository pushed to your account).
2. A free account on [**Neon.tech**](https://neon.tech) (Sign in with GitHub).
3. A free account on [**Render.com**](https://render.com) or [**Railway.app**](https://railway.app) (Sign in with GitHub).
4. A free account on [**Vercel**](https://vercel.com) (Sign in with GitHub).

---

## Step 1: Create a Free PostgreSQL Database on Neon

1. Go to [https://neon.tech](https://neon.tech) and click **Sign Up** (use your GitHub account).
2. Click **Create Project**.
   - **Project Name:** `hireflow-db`
   - **Postgres version:** `16` (or latest default)
   - **Region:** Choose the region closest to you (e.g. `US East (Ohio)` or `Frankfurt`).
3. Click **Create Project**.
4. In the Dashboard under **Connection Details**, ensure **Connection pooling** is checked, and copy the connection string.
   It looks like:
   ```text
   postgresql://hireflow_owner:password@ep-shiny-feather-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   > 💡 **Keep this connection string handy!** You will use it as `DATABASE_URL` in the next step.

---

## Step 2: Deploy the Backend API & Socket.IO on Render (or Railway)

### Option A: Using the 1-Click Render Blueprint (Easiest)

1. Log into [Render.com](https://render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your HireFlow GitHub repository.
4. Render will detect the included `render.yaml` file automatically!
5. In the prompts:
   - Set `DATABASE_URL` to your Neon PostgreSQL connection string.
   - For `CORS_ORIGIN`, you can temporarily put `http://localhost:5173` (we will update it after deploying the frontend in Step 3).
6. Click **Apply**. Render will provision your services.

---

### Option B: Manual Setup on Render

1. Log into [Render.com](https://render.com) and click **New +** -> **Web Service**.
2. Select your `hireflow` repository.
3. Configure the following settings:
   - **Name:** `hireflow-api`
   - **Region:** Select the same region as your Neon database (e.g., `Oregon` or `Frankfurt`).
   - **Runtime:** `Node`
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install --include=dev && npm run build:shared && npm run db:postgres && npm run build:api
     ```
   - **Start Command:**
     ```bash
     npm run db:push && node apps/api/dist/server.js
     ```
     *(If you also want to pre-seed the demo users and recruitment data on initial boot, use: `npm run db:push && npm run db:seed && node apps/api/dist/server.js`)*
   - **Instance Type:** `Free` (0.1 CPU, 512 MB RAM, 750 free hours/month).

4. Scroll down and click **Advanced** -> **Add Environment Variable**:

| Variable Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render default web port |
| `DATABASE_URL` | `<Your Neon PostgreSQL URL>` | Connection string from Step 1 |
| `JWT_ACCESS_SECRET` | *(Click "Generate" or type a random 32+ character string)* | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | *(Click "Generate" or type a random 32+ character string)* | Signs refresh tokens |
| `COOKIE_SECRET` | *(Click "Generate" or type a random 32+ character string)* | Signs session cookies |
| `COOKIE_SECURE` | `true` | Required for HTTPS cookie transmission |
| `COOKIE_SAME_SITE` | `none` | Required for cross-domain cookies between Vercel and Render |
| `CORS_ORIGIN` | `http://localhost:5173` | Temporary until Step 3 |

5. Click **Create Web Service**.
6. Render will build the shared package, switch Prisma to PostgreSQL, push the database schema, compile TypeScript, and boot the server.
7. Once deployed, note down your Render service URL at the top:
   ```text
   https://hireflow-api.onrender.com
   ```
   Verify it by visiting `https://hireflow-api.onrender.com/health` in your browser. You should see:
   ```json
   {"status":"healthy","uptime":10}
   ```

---

## Step 3: Deploy the Frontend on Vercel

1. Log into [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your `hireflow` repository and click **Import**.
3. Configure the Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Leave as `./` (Root directory, so it has access to `packages/shared`).
   - **Build Command:**
     ```bash
     npm run build:shared && npm run build:web
     ```
   - **Output Directory:**
     ```text
     apps/web/dist
     ```
   - **Install Command:**
     ```bash
     npm install
     ```
4. Expand the **Environment Variables** section and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://hireflow-api.onrender.com/api/v1` | Replace with your Render URL + `/api/v1` |
| `VITE_SOCKET_URL` | `https://hireflow-api.onrender.com` | Replace with your Render URL (no path) |

5. Click **Deploy**.
6. Vercel will compile the React app and deploy it to a global edge URL (e.g. `https://hireflow.vercel.app`).

---

## Step 4: Link Frontend & Backend CORS

1. Copy your live Vercel frontend URL (e.g., `https://hireflow.vercel.app`).
2. Go back to your [Render.com Dashboard](https://dashboard.render.com) -> `hireflow-api` -> **Environment**.
3. Edit the `CORS_ORIGIN` variable to include your Vercel URL:
   ```env
   CORS_ORIGIN=https://hireflow.vercel.app
   ```
   *(Or comma-separated if you want local dev too: `https://hireflow.vercel.app,http://localhost:5173`)*
4. Click **Save Changes**. Render will automatically redeploy the backend with the new allowed origin.

---

## Step 5: Test the Live Application!

Open your live Vercel URL in your browser:
1. Try the instant **Demo Logins**:
   - Workspace Owner / Admin: `admin@hireflow.dev` (Password: `Password123!`)
   - Senior Recruiter: `recruiter@hireflow.dev` (Password: `Password123!`)
   - Hiring Manager: `hiring.manager@hireflow.dev` (Password: `Password123!`)
2. Verify the **Live** badge shows a green pulse in the topbar (confirming authenticated Socket.IO connection).
3. Try dragging candidates across Kanban stages, scheduling an interview, rating candidates with scorecards, or generating job offers!

---

## 💡 Free Tier Tips & Troubleshooting

### 1. Render Free Tier Cold Starts
- On Render's free tier, web services spin down after 15 minutes of inactivity to conserve resources.
- The first request after sleep may take ~30-50 seconds to spin up.
- **Tip:** You can keep your free service active by using a free uptime monitor such as [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org) pinging your `https://hireflow-api.onrender.com/health` endpoint every 10 minutes.

### 2. Cross-Domain Cookie Authorization
- Because your frontend is on `vercel.app` and backend is on `onrender.com`, modern browsers require:
  - `COOKIE_SECURE=true` (both domains use HTTPS).
  - `COOKIE_SAME_SITE=none` (allows third-party cookie transmission with `credentials: 'include'`).
  These are already configured in this guide.

### 3. Database Migrations & Seeds
- If you ever need to reset or re-seed your remote database from your local machine, simply export your Neon `DATABASE_URL` and run:
  ```powershell
  $env:DATABASE_URL="your-neon-url"
  npm run db:postgres
  npm run db:push
  npm run db:seed
  ```

