# Copilot Instructions for MistralHR

## Project Overview

MistralHR is an AI-powered internal HR portal for employees in **France** and **Belgium**. It uses a fully Mistral-native RAG pipeline — `open-mistral-nemo` for chat and `mistral-embed` for semantic search — to answer HR questions grounded in 18 statutory policies.

Built with **Next.js 14 App Router**, **TypeScript**, **PostgreSQL + pgvector**, **NextAuth.js**, and **Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.4 |
| AI — Chat | Mistral AI `open-mistral-nemo` |
| AI — Embeddings | Mistral AI `mistral-embed` |
| Auth | NextAuth.js v4 (Credentials provider) |
| Database | PostgreSQL ≥ 15 + pgvector (1024-dim embeddings) |
| Styling | Tailwind CSS 3.4 (dark theme only) |
| Icons | Lucide React |
| Doc Parsing | pdf-parse, mammoth, xlsx |
| Markdown | react-markdown + remark-gfm |

---

## Project Structure

```
app/
  page.tsx                    # Root redirect to /chat
  layout.tsx                  # Root layout (metadata, fonts)
  globals.css                 # Global styles — dark theme CSS variables
  login/page.tsx              # Credentials login form
  api/
    auth/                     # NextAuth endpoints
    chat/route.ts             # Mistral streaming chat API (SSE)
  (protected)/
    layout.tsx                # Authenticated shell with sidebar
    chat/                     # Mistral RAG chat interface
    policies/
      page.tsx                # Policy library (filter by country/topic)
      [id]/page.tsx           # Policy detail with legal references
    tutorial/                 # Guided onboarding tutorial
components/
  Sidebar.tsx                 # Nav: Chat + Policies links
  Topbar.tsx                  # Page header
lib/
  auth.ts                     # NextAuth credentials config
  policies-data.ts            # 18 FR/BE statutory policies (source of truth)
  rag/
    embeddings.ts             # Mistral mistral-embed integration
    vectorSearch.ts           # pgvector similarity search
    systemPrompt.ts           # Chat system prompt builder
    chunker.ts                # Document text splitting
    ingest.ts                 # Document ingestion pipeline
db/
  schema.sql                  # PostgreSQL schema
  migrations/
    001-mistral-embeddings.sql
scripts/
  seed-policies.ts            # Seeds FR/BE policies with Mistral embeddings
middleware.ts                 # Route protection (NextAuth session check)
```

---

## Coding Conventions

- **TypeScript everywhere** — no `any` types; use explicit interfaces and types.
- **Next.js App Router** — use server components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs).
- **No test framework is configured** — do not add tests unless the user explicitly requests it.
- **Dark theme only** — the app uses a unified dark theme. CSS variables are defined in `app/globals.css`. Use CSS variables (e.g. `var(--orange)`, `var(--card)`) and Tailwind utility classes; do not hardcode colors.
- **Tailwind CSS** — use utility classes. Custom design tokens (colors, spacing) are in `tailwind.config.js`.
- **Error boundaries** — use Next.js `error.tsx` files at three levels: `app/global-error.tsx`, `app/error.tsx`, `app/(protected)/error.tsx`.
- **Server-side errors** — wrap all `getServerSession` calls and database queries in `try-catch`.
- **Environment variables** — secrets go in `.env.local` (never committed). See `.env.example` for required variables.
- **Streaming** — the chat API uses Server-Sent Events (SSE). Keep SSE handling in `app/api/chat/route.ts`.

---

## Key Architectural Decisions

- **RAG pipeline**: User queries are embedded with `mistral-embed`, matched against policy embeddings stored in pgvector, and top results are injected into the `open-mistral-nemo` system prompt.
- **Policies data**: The canonical list of 18 HR policies lives in `lib/policies-data.ts`. The seed script reads this file to generate and store embeddings. When adding or modifying policies, update this file and re-run the seed script.
- **Auth**: NextAuth.js Credentials provider — passwords are checked against `AUTH_PASSWORD` env var. Session is validated in `middleware.ts` for protected routes.
- **Database**: PostgreSQL with the `pgvector` extension. Embeddings are 1024 dimensions (Mistral `mistral-embed` output). Schema defined in `db/schema.sql`.

---

## Build & Development Commands

```bash
# Install dependencies
npm install

# Run development server (Turbo)
npm run dev          # → http://localhost:3000

# Build for production
npm run build

# Lint (ESLint via Next.js)
npm run lint

# Type-check (TypeScript, no emit)
npm run type-check

# Seed policies into PostgreSQL with Mistral embeddings
# (requires MISTRAL_API_KEY and DATABASE_URL in .env.local)
npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

---

## Environment Variables

Required variables (see `.env.example`):

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret for NextAuth session signing |
| `NEXTAUTH_URL` | Base URL of the deployment (e.g. `http://localhost:3000`) |
| `AUTH_PASSWORD` | Shared password for demo accounts |
| `MISTRAL_API_KEY` | Mistral AI API key (from console.mistral.ai) |
| `DATABASE_URL` | PostgreSQL connection string with pgvector enabled |

**Runtime modes:**
- **Full mode** — `MISTRAL_API_KEY` + `DATABASE_URL` set: full RAG chat with embeddings and vector search.
- **Mistral-only mode** — `MISTRAL_API_KEY` set, no `DATABASE_URL`: chat works but without policy retrieval.
- **Demo mode** — neither set: app runs with static demo responses.

---

## Demo Accounts

> ⚠️ These are local/hackathon demo credentials only. Never use them in production environments.

| Email | Password | Country |
|---|---|---|
| alice.martin@mistralhr.demo | value of `AUTH_PASSWORD` env var | 🇫🇷 France |
| jan.peeters@mistralhr.demo | value of `AUTH_PASSWORD` env var | 🇧🇪 Belgium |
