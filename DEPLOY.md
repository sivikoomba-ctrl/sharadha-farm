# Deployment Guide — sharadha.neviai.ai

Architecture: **Cloudflare Pages** (frontend) + **Render** (backend API) + **Neon PostgreSQL** (database)

---

## 1. Set Up Neon PostgreSQL (Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project: `sharadha-farm`
3. Copy the connection string — it looks like:
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — you'll need it for Render

---

## 2. Deploy Backend on Render

### Option A: Blueprint (Recommended)
1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repo
3. Render will detect `render.yaml` and create the services
4. Set the `DATABASE_URL` environment variable to your **Neon** connection string (from step 1)
5. The `JWT_SECRET` will be auto-generated

### Option B: Manual Setup
1. Go to Render → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `sharadha-farm-api`
   - **Root Directory:** `Source`
   - **Runtime:** Docker
   - **Dockerfile Path:** `server/Dockerfile`
   - **Plan:** Free
4. Add environment variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `PORT` | `3001` |
   | `CORS_ORIGIN` | `https://sharadha.neviai.ai` |
   | `JWT_SECRET` | (generate a random 32+ char string) |
   | `NODE_ENV` | `production` |

5. Deploy — Render will build the Docker image and run migrations automatically

6. Note your Render URL: `https://sharadha-farm-api.onrender.com`

---

## 3. Deploy Frontend on Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create a project
2. Connect your GitHub repo
3. Configure build settings:
   - **Project name:** `sharadha-farm`
   - **Production branch:** `main`
   - **Framework preset:** None (custom)
   - **Build command:**
     ```
     cd Source/client && npm install && npm run build
     ```
   - **Build output directory:** `Source/client/dist`
   - **Root directory:** `/` (leave default)
4. Add environment variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://sharadha-farm-api.onrender.com/api` |
5. Deploy

---

## 4. Configure DNS in Cloudflare

1. Go to Cloudflare Dashboard → your `neviai.ai` zone → DNS
2. Add a **CNAME** record:
   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `sharadha` | `sharadha-farm.pages.dev` | Proxied (orange cloud) |

3. In Cloudflare Pages → Custom domains → Add `sharadha.neviai.ai`
4. Cloudflare will auto-provision an SSL certificate

---

## 5. Update API URL After Deploy

Once your Render service is live, update the Cloudflare Pages environment variable:

```
VITE_API_BASE_URL=https://sharadha-farm-api.onrender.com/api
```

Then trigger a redeploy in Cloudflare Pages.

Also update `CORS_ORIGIN` on Render to match your actual domain:
```
CORS_ORIGIN=https://sharadha.neviai.ai
```

---

## 6. Seed the Database (First Time)

SSH into Render shell or use the Render console:

```bash
npx tsx node_modules/.bin/knex seed:run --knexfile knexfile.ts
```

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Cloudflare Pages | Free | $0/mo |
| Render Web Service | Free | $0/mo |
| Neon PostgreSQL | Free (0.5GB) | $0/mo |
| **Total** | | **$0/mo** |

> Note: Render free tier services spin down after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to $7/mo Starter plan to keep it always-on.
