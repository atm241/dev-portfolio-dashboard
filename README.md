# Dev Portfolio Dashboard

A personal dashboard that aggregates my **GitHub activity**, **LeetCode progress**, and **job application pipeline** in one place — built with the stack it's showcasing.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS 4 + TanStack Query + Recharts
- **Backend:** Node.js + Express + TypeScript, pulling from the GitHub REST API and LeetCode's GraphQL API (with server-side TTL caching)
- **Database:** PostgreSQL for the job application tracker
- **DevOps:** Docker multi-stage build, Docker Compose, GitHub Actions CI building a **multi-arch image (amd64 + arm64)** to GHCR — runs identically on a laptop or a Raspberry Pi

The GitHub/LeetCode overview is public. The job tracker is **fully private**: the tab doesn't exist until you log in with the admin password.

## Quick start (Docker)

```bash
cp .env.example .env   # then edit ADMIN_PASSWORD, JWT_SECRET, usernames
docker compose up --build
```

Open http://localhost:3001.

## Local development

```bash
# Postgres only, in Docker:
docker compose up db -d

# Terminal 1 — API with hot reload on :3001
cd server && npm install && npm run dev

# Terminal 2 — Vite dev server on :5173 (proxies /api to :3001)
cd client && npm install && npm run dev
```

Open http://localhost:5173.

## Configuration

All config is environment variables — see [.env.example](.env.example).

| Variable | Purpose |
| --- | --- |
| `GITHUB_USERNAME` / `LEETCODE_USERNAME` | Whose stats to display |
| `GITHUB_TOKEN` | Optional; raises GitHub rate limit 60 → 5000 req/hr |
| `ADMIN_PASSWORD` | Login for the private job tracker |
| `JWT_SECRET` | Signs session cookies — use a long random string |
| `DATABASE_URL` | Postgres connection string |

## Tests

```bash
cd server && npm test
```

## Deploying to a Raspberry Pi

CI pushes a multi-arch image on every merge to `main`, so the Pi needs no build step:

1. Install Docker on the Pi (`curl -fsSL https://get.docker.com | sh`).
2. Copy `docker-compose.yml` and your `.env` to the Pi.
3. In `docker-compose.yml`, replace `build: .` with `image: ghcr.io/atm241/dev-portfolio-dashboard:latest`.
4. `docker compose up -d` — the arm64 layer is pulled automatically.
5. To update: `docker compose pull && docker compose up -d`.

For public access, put it behind a reverse proxy with TLS (e.g. Caddy) or a Cloudflare Tunnel.

## API

| Route | Auth | Description |
| --- | --- | --- |
| `GET /api/stats/github/profile` · `/repos` · `/activity` | public | GitHub data, cached 10 min |
| `GET /api/stats/leetcode` | public | Solved counts, ranking, recent ACs |
| `POST /api/auth/login` · `/logout`, `GET /api/auth/me` | public | Session management (httpOnly JWT cookie) |
| `GET/POST /api/jobs`, `PUT/DELETE /api/jobs/:id`, `GET /api/jobs/stats` | private | Job application CRUD + pipeline stats |
