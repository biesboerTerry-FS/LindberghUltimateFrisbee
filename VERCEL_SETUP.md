# Vercel deployment reference

Two Vercel projects under `terry-biesboers-projects`. Both are currently connected
to a different GitHub repo (`biesboerTerry-FS/2610-wdv349-biesboerTerry`), so the
CLI deploys used here upload the local working tree instead of building from Git.
If you want Git-based deploys from `biesboerTerry-FS/LindberghUltimateFrisbee`,
reconnect each project under **Settings → Git**.

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
| Region | iad1 |
| `vercel.json` | SPA rewrite: `/(.*)` → `/index.html` |

### Environment variables

| Name | Value | Type | Environments |
| --- | --- | --- | --- |
| `VITE_API_URL` | `https://fast-cyclone-ney3302-terry-biesboers-projects.vercel.app/api` | Config | Production, Preview, Development |

The following variables also exist on this project but are **not used by the Vite
frontend** and can be removed: `JWT_SECRET`, `SEED_ADMIN_EMAIL`,
`SEED_ADMIN_PASSWORD`, `MONGODB_URI`.

Deploy:
```bash
cd portfolio
vercel --prod
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
| Region | iad1 |
| `vercel.json` | `builds`: `api/index.js` via `@vercel/node`; `routes`: `/api/(.*)` → `/api/index.js` |

### Environment variables

Currently configured on Vercel: `NODE_ENV`, `MONGODB_URI`, `MONGODB_DB_NAME`,
`CORS_ORIGINS`, `ENABLE_DEMO_LOGIN`, `VITE_API_URL` (unused on the API).

Recommended full set (add the missing ones):

| Name | Value | Type | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | `production` | Config | Required |
| `MONGODB_URI` | Atlas `mongodb+srv://…/lindbergh_ultimate?retryWrites=true&w=majority` | Secret | Required |
| `MONGODB_DB_NAME` | `lindbergh_ultimate` | Config | Required |
| `JWT_SECRET` | long random string (16+ chars) | Secret | **Not currently listed — add it** |
| `JWT_EXPIRES_IN` | `7d` | Config | Optional |
| `ADMIN_API_KEY` | shared key for scripts | Secret | Optional |
| `CORS_ORIGINS` | `https://lindberghultimatefrisbee-terry-biesboers-projects.vercel.app` | Config | Required |
| `FRONTEND_URL` | `https://lindberghultimatefrisbee-terry-biesboers-projects.vercel.app` | Config | Needed for OAuth redirects |
| `API_PUBLIC_URL` | `https://fast-cyclone-ney3302-terry-biesboers-projects.vercel.app` | Config | Needed for OAuth callbacks |
| `SEED_ADMIN_EMAIL` | admin email | Secret | Needed to seed the admin account |
| `SEED_ADMIN_PASSWORD` | strong password | Secret | Needed to seed the admin account |
| `SEED_DEMO_ADMIN_EMAIL` | `demo-admin@lindberghultimate.com` | Config | Demo login |
| `SEED_DEMO_ADMIN_PASSWORD` | strong demo password | Secret | Demo login |
| `SEED_DEMO_PUBLIC_EMAIL` | `demo@lindberghultimate.com` | Config | Demo login |
| `SEED_DEMO_PUBLIC_PASSWORD` | strong demo password | Secret | Demo login |
| `ENABLE_DEMO_LOGIN` | `true` | Secret | Already set |
| `SEED_DEMO_DATA` | `true` | Config | Optional sample records |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Config | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Secret | Optional |
| `ADMIN_OAUTH_ALLOWLIST` | comma-separated emails | Config | Optional |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Config | Optional |
| `RATE_LIMIT_MAX` | `300` | Config | Optional |
| `PUBLIC_RATE_LIMIT_MAX` | `30` | Config | Optional |
| `LOG_FORMAT` | `json` | Config | Optional |

Deploy:
```bash
cd <repo-root>
vercel --prod            # uses .vercel/project.json -> fast-cyclone-ney3302
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
vercel env add NAME production
vercel env add NAME production --type config

# List / remove
vercel env ls --environment production
vercel env rm NAME production

# Pull env vars into a local file (do NOT commit)
vercel env pull portfolio/.env.vercel.local
```

Need to seed against production? Use `vercel env pull` into `portfolio/server/.env`
temporarily, run `npm run seed`, then restore the local dev `.env`.
