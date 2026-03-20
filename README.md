# TaskQueueSystem

A Node.js backend service for managing asynchronous job queues for sending **emails** and **Telegram notifications**. Built with BullMQ and Redis, it includes a visual dashboard, monitoring, and alert capabilities.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** v5 — REST API
- **BullMQ** v5 — Queue management
- **Redis** (via ioredis) — Queue backend
- **Nodemailer** — Email delivery
- **node-telegram-bot-api** — Telegram notifications
- **Bull Board** — Visual queue dashboard

## Features

- Separate email and Telegram queues with independent workers
- Visual dashboard at `/admin/queues`
- Job retry with exponential backoff (max 3 attempts)
- Queue health monitoring with configurable alert thresholds
- Concurrent job processing (5 parallel jobs per worker)
- Job history: last 100 completed, 500 failed

## Prerequisites

- **Node.js** v18+
- **Redis** server running on `localhost:6379`
- SMTP credentials (for email queue)
- Telegram Bot Token (for Telegram queue)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskQueueSystem
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # leave empty if no auth

# Email
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Redis Queue Manager <your@gmail.com>
EMAIL_ALERT_RECIPIENT=alerts@example.com

# Telegram
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_DEFAULT_CHAT_ID=your-chat-id
```

> **Gmail users:** Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

## Running the App

The system runs as **two separate processes**: the API server and the worker. Both must be running for jobs to be queued and processed.

### Development (with auto-reload)

Open two terminal windows:

**Terminal 1 — API Server:**
```bash
npm run dev:api
```

**Terminal 2 — Worker:**
```bash
npm run dev:worker
```

### Production

**Build first:**
```bash
npm run build
```

**Then start both processes:**

```bash
# Terminal 1 — API Server
npm run start:api

# Terminal 2 — Worker
npm run start:worker
```

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/email` | Queue an email job |
| POST | `/notification` | Queue a Telegram notification job |
| GET | `/admin/queues` | Bull Board dashboard UI |
| GET | `/admin/queues/stats` | Queue statistics |

### Example: Queue an email

```bash
curl -X POST http://localhost:3000/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello",
    "body": "This is a test email"
  }'
```

### Example: Queue a Telegram notification

```bash
curl -X POST http://localhost:3000/notification \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from TaskQueueSystem!"
  }'
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Start API server with auto-reload |
| `npm run dev:worker` | Start worker with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:api` | Start API server (production) |
| `npm run start:worker` | Start worker (production) |
| `npm run clean` | Remove `dist/` directory |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── api.ts                    # Express server entry point
├── config/
│   ├── config.ts             # Environment config
│   └── redis.ts              # Redis connection
├── controllers/
│   ├── emailRoutes.ts        # Email API routes
│   └── telegramRoutes.ts     # Telegram API routes
├── jobs/
│   ├── emailJobs.ts          # Email job processor
│   └── telegramJobs.ts       # Telegram job processor
├── queues/
│   └── queueFactory.ts       # BullMQ queue factory
├── services/
│   ├── EmailService.ts       # Email sending logic
│   └── TelegramService.ts    # Telegram sending logic
├── types/
│   └── jobs.ts               # TypeScript interfaces
├── utils/
│   └── queueMonitor.ts       # Monitoring & alerting
├── validations/
│   └── validations.ts        # Input validation
└── workers/
    ├── worker.ts              # Worker entry point
    └── jobProcessorRegistry.ts
```

## Troubleshooting

**Redis connection error:**
- Make sure Redis is running: `redis-cli ping` should return `PONG`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

**Emails not sending:**
- Verify SMTP credentials and that `EMAIL_ENABLED=true`
- For Gmail, ensure you're using an App Password, not your account password

**Telegram messages not sending:**
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_DEFAULT_CHAT_ID`
- Make sure the bot has been started by the target user (`/start` command)

**Jobs stuck in waiting:**
- Ensure the worker process is running (`npm run dev:worker`)
