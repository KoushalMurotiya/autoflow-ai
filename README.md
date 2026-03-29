# AutoFlow AI

Turn meeting notes into structured tasks with owners and deadlines, track them on a dashboard, and surface overdue work automatically.

## Problem statement

Teams capture decisions and action items in meetings, but turning unstructured notes into accountable tasks—with clear owners and dates—is slow and error-prone. Follow-up often lives in docs or chat instead of a single system of record.

## Solution overview

**AutoFlow AI** uses a **Groq** LLM to extract tasks (task text, owner, deadline in `YYYY-MM-DD` format) from pasted meeting text. Tasks are stored in **Supabase** (PostgreSQL). The **React** frontend submits notes and lists tasks; a **Node.js** API runs extraction, persistence, and deadline escalation (marking tasks as delayed when past due).

## Features

- **Meeting processing** — Paste notes; receive a structured task list and persist it to the database.
- **Task dashboard** — View tasks, update status (pending / done), color-coded labels (pending / delayed / done).
- **Alerts** — Delayed tasks are listed via a dedicated API and highlighted on the dashboard.
- **Deadline escalation** — Backend checks deadlines and updates status for overdue, non-done work.

## Tech stack

| Layer    | Technology |
|----------|------------|
| LLM      | Groq (OpenAI-compatible Chat Completions) |
| Database | Supabase (Postgres + Row Level Security) |
| API      | Node.js, Express |
| Frontend | React (Vite), Tailwind CSS |

## Project structure

```
├── backend/          # Express API (Groq + Supabase)
│   ├── src/
│   │   ├── server.js
│   │   ├── env.js           # Loads backend/.env
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── lib/
│   └── package.json
├── frontend/         # Vite + React SPA
│   ├── src/
│   └── package.json
├── sql/              # Optional schema reference
└── .env.example      # Template for secrets (copy to backend/.env)
```

## Prerequisites

- **Node.js** 18+
- **Groq** API key ([Groq Console](https://console.groq.com/))
- **Supabase** project with a `tasks` table (see [Database setup](#database-setup))

## Environment variables

**Never commit real keys.** Copy the root `.env.example` to `backend/.env` and fill in values.

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key |
| `SUPABASE_URL` | Yes | Full project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_KEY` or `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GROQ_MODEL` | No | Chat model ID (default: `llama-3.3-70b-versatile`) |
| `PORT` | No | API port (default: `5000`) |

**Frontend** (optional): copy `frontend/.env.example` to `frontend/.env`. Only variables prefixed with `VITE_` are exposed to the browser—use `VITE_API_BASE` if your API is not served under `/api`.

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

Or install each app:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cp .env.example backend/.env
# Edit backend/.env with your GROQ_API_KEY, SUPABASE_URL, and SUPABASE_KEY
```

### 3. Database setup

In Supabase → **SQL Editor**, run the script in `sql/create_tasks_table.sql` to create the `tasks` table and policies (adjust RLS for production).

### 4. Run locally

Use **two terminals** (backend on port `5000`, frontend on port `5173` with proxy to the API):

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

**Terminal 2 — UI**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**.

Root shortcuts (from repo root):

```bash
npm run dev:backend
npm run dev:frontend
```

### 5. Production build (frontend)

```bash
cd frontend
npm run build
```

Serve the `frontend/dist` static files behind your host; configure the API base URL via `VITE_API_BASE` at build time if the API is not same-origin under `/api`.

## Demo flow

1. Start **backend** and **frontend** as above.
2. Open the home page, paste meeting notes, and submit to **process** the meeting.
3. Open **Task dashboard** — confirm tasks appear with owners and deadlines.
4. Use status controls to mark work **done**; past-due items can be escalated to **delayed** and show under **Alerts**.

## API overview (development)

With the Vite dev server, the UI calls paths under `/api`, which proxy to `http://127.0.0.1:5000` (see `frontend/vite.config.js`).

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/process-meeting` | Extract and save tasks from `{ "text": "..." }` |
| `GET` | `/tasks` | List tasks |
| `PATCH` | `/tasks/:id` | Update task (e.g. status) |
| `GET` | `/alerts` | Delayed tasks (runs escalation check) |
| `GET` | `/health` | Health check |

## Security notes for public repos

- Keep `.env` and `backend/.env` out of git (see `.gitignore`).
- Use the **anon** key only with RLS policies you trust; tighten policies for production.
- Rotate any key that was ever committed or shared.

## License

Private / hackathon — add a license file if you open-source the project.
