# ReachInbox Email Scheduler

Production-style full-stack take-home implementation using TypeScript, Express, PostgreSQL, Redis, BullMQ, Ethereal SMTP, Elasticsearch and Next.js.

## Features
- Delayed BullMQ jobs; no cron jobs.
- PostgreSQL is the source of truth for email state.
- Redis-backed queue and distributed hourly counters.
- Configurable worker concurrency and minimum send delay.
- Rate-limit hits reschedule jobs instead of dropping them.
- Slack OAuth and live notification on a rate-limit hit.
- Elasticsearch indexing/search endpoint.
- BullMQ dashboard at `/admin/queues` after authentication.
- Restart recovery reconciles scheduled DB rows with BullMQ.
- Idempotent state transition prevents already-sent rows from being sent again by duplicate jobs.
- Google OAuth login.
- CSV/TXT recipient upload, scheduled and sent tables.

## Prerequisites
- Node.js 20+
- Docker Desktop
- Google OAuth credentials
- Ethereal account
- Slack app credentials (optional but required for Slack demo)

## Start infrastructure
```bash
docker compose up -d
```

## Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
In another terminal:
```bash
cd backend
npm run worker
```

## Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Open http://localhost:3000.

## Google OAuth
Create a Google OAuth web client. Authorized redirect URI:
`http://localhost:4000/api/auth/google/callback`
Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`.

## Ethereal
Create an account at https://ethereal.email and copy SMTP host/port/user/password into `.env`. Ethereal provides a preview URL for each test message.

## Slack
Create a Slack app and enable OAuth v2. Redirect URI:
`http://localhost:4000/api/slack/callback`
Set `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, and `SLACK_REDIRECT_URI`. The app requests `chat:write` and posts a DM when a sender hits its hourly limit.

## Architecture
Frontend -> Express API -> PostgreSQL (durable state) + Redis/BullMQ (execution) -> worker -> rate limiter -> Ethereal SMTP. Elasticsearch mirrors searchable email records. On API startup, pending PostgreSQL rows are reconciled into BullMQ if the corresponding job is missing.

## Rate limiting and concurrency
`WORKER_CONCURRENCY`, `MIN_SEND_DELAY_MS`, and `DEFAULT_HOURLY_LIMIT` are configurable. Hourly counters are Redis keys scoped by sender and UTC hour. If the limit is reached, the job is moved to the next hour rather than failed. This works across multiple worker processes because the counter is in Redis.

## Important delivery caveat
SMTP is an external side effect and cannot provide mathematical exactly-once delivery without provider-side idempotency. This implementation makes the application state transition idempotent, uses a deterministic message ID, and never sends rows already marked SENT. For a production provider, provider-side idempotency would be added where supported.

## Demo checklist
1. Show Scheduled Emails.
2. Wait for delivery and show Sent Emails/Ethereal previews.
3. Stop the worker/API, restart, and show future jobs still execute.
4. Set a small hourly limit such as 2, schedule 5 messages, and show later jobs move to the next hour.
5. Connect Slack and demonstrate the real rate-limit notification.

