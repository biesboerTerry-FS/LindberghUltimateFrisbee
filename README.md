# Lindbergh Ultimate

This repository contains the Lindbergh Ultimate program website: a React + Vite
frontend with an Express + MongoDB Atlas backend and a single-administrator
Admin Panel. The application lives in [`portfolio/`](./portfolio/).

## Project

- **Application:** [`portfolio/`](./portfolio/)
- **Frontend README:** [`portfolio/README.md`](./portfolio/README.md)
- **API README:** [`portfolio/server/README.md`](./portfolio/server/README.md)
- **Vercel deployment reference:** [`VERCEL_SETUP.md`](./VERCEL_SETUP.md)

## Run

See [`portfolio/README.md`](./portfolio/README.md) for the full frontend and
backend setup. The short version:

```bash
cd portfolio/server
cp .env.example .env
npm ci
npm run seed
npm run dev
```

In a second terminal:

```bash
cd portfolio
npm ci
npm run dev
```

## Repository notes

- `portfolio/` is a normal directory, not a Git submodule.
- Do not commit `node_modules`, `dist`, `.env`, `portfolio.zip`, or generated
  assets. The `.gitignore` files cover those paths.
- See [`GITHUB_MIGRATION_PLAN.md`](./portfolio/GITHUB_MIGRATION_PLAN.md) for
  historical migration notes.
