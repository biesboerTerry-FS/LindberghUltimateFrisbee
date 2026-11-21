# Vercel deployment reference

Two Vercel projects under the `thatdevterry` team. Both are connected to the
`biesboerTerry-FS/LindberghUltimateFrisbee` GitHub repo, so deploys are triggered
from Git. You can also deploy the local working tree from the CLI with
`vercel --prod` as shown below.

Local copy/paste values (including secrets) are in `portfolio/.env.vercel.local`
(git-ignored). Open it in VS Code alongside this file.

---

## 1. Frontend — `lindberghultimatefrisbee`

| Setting | Value |
| --- | --- |
| Production URL | https://lindberghultimatefrisbee-terry-biesboers-projects.vercel.app |
| Root Directory | `.` (deploy from `portfolio/`) |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 24.x |
| `vercel.json` | SPA rewrite: `/(.*)` → `/index.html` |

### Environment variables

| Name | Value | Type | Environments |
| --- | --- | --- | --- |
| `VITE_API_URL` | `https://fast-cyclone-ney3302-terry-biesboers-projects.vercel.app/api` | Config | Production, Preview, Development |

Deploy:
```bash
cd portfolio
vercel --prod --scope thatdevterry
```

---

## 2. Backend API — `fast-cyclone-ney3302`

| Setting | Value |
| --- | --- |
| Production URL | https://fast-cyclone-ney3302-terry-biesboers-projects.vercel.app |
| Root Directory | `portfolio/server` (deploy from repo root) |
| Framework Preset | Other |
| Build Command | (leave default — `vercel.json` uses `@vercel/node`) |
| Output Directory | (default) |
| Install Command | `npm install` |
| Node.js Version | 24.x |
| `vercel.json` | `builds`: `api/index.js` via `@vercel/node`; `routes`: `/api/(.*)` → `/api/index.js` |

### Environment variables

Currently configured on Vercel: `NODE_ENV`, `MONGODB_URI`, `MONGODB_DB_NAME`,
`CORS_ORIGINS`, `ENABLE_DEMO_LOGIN`, `JWT_SECRET`, `FRONTEND_URL`,
`API_PUBLIC_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. The Google OAuth
vars are optional and unused now that social sign-in has been removed from the
UI; they can be removed.

| Name | Value | Type | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | `production` | Config | Required |
| `MONGODB_URI` | Atlas `mongodb+srv://…/lindbergh_ultimate?retryWrites=true&w=majority` | Secret | Required |
| `MONGODB_DB_NAME` | `lindbergh_ultimate` | Config | Required |
| `JWT_SECRET` | long random string (16+ chars) | Secret | Required |
| `JWT_EXPIRES_IN` | `7d` | Config | Optional |
| `CORS_ORIGINS` | `https://lindberghultimatefrisbee-terry-biesboers-projects.vercel.app` | Config | Required |
| `SEED_ADMIN_EMAIL` | admin email | Secret | Needed to seed the admin account |
| `SEED_ADMIN_PASSWORD` | strong password | Secret | Needed to seed the admin account |
| `SEED_DEMO_ADMIN_EMAIL` | `demo-admin@lindberghultimate.com` | Config | Demo login |
| `SEED_DEMO_ADMIN_PASSWORD` | strong demo password | Secret | Demo login |
| `ENABLE_DEMO_LOGIN` | `true` | Secret | Enables the demo admin button |
| `SEED_DEMO_DATA` | `true` | Config | Optional sample records |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Config | Optional |
| `RATE_LIMIT_MAX` | `300` | Config | Optional |
| `PUBLIC_RATE_LIMIT_MAX` | `30` | Config | Optional |
| `LOG_FORMAT` | `json` | Config | Optional |

Deploy:
```bash
cd <repo-root>
vercel --prod --scope thatdevterry   # uses .vercel/project.json -> fast-cyclone-ney3302
```

Seed the admin + demo users against the production database after setting env vars:
```bash
# with production env vars loaded locally
cd portfolio/server
npm run seed:admin
```

---

## 3. CLI commands for env vars

```bash
# Add a value (interactive; secret by default — use --type config for non-secrets)
vercel env add NAME production --scope thatdevterry
vercel env add NAME production --type config --scope thatdevterry

# List / remove
vercel env ls --environment production --scope thatdevterry
vercel env rm NAME production --scope thatdevterry

# Pull env vars into a local file (do NOT commit)
vercel env pull portfolio/.env.vercel.local --scope thatdevterry
```

Need to seed against production? Use `vercel env pull` into `portfolio/server/.env`
temporarily, run `npm run seed`, then restore the local dev `.env`.
