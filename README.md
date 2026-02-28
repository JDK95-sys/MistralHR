# <img src="https://mistral.ai/favicon.ico" width="32" alt="Mistral AI" /> MistralHR — AI-Powered HR Assistant

> **🚀 Powered entirely by Mistral AI** — no Azure, no OpenAI, no compromise.

MistralHR is an internal HR portal for employees in **France** and **Belgium**, built for the **Mistral AI Hackathon**. It leverages a fully Mistral-native RAG pipeline — `open-mistral-nemo` for chat and `mistral-embed` for semantic search — to answer HR questions grounded in 18 statutory policies. **100% Mistral. Zero Azure.**

---

## 🌟 Features at a Glance

| Feature | Details |
|---|---|
| 🤖 AI Chat | `open-mistral-nemo` with streaming responses |
| 📚 Policy Library | 18 FR/BE statutory HR policies |
| 🔐 Secure Login | NextAuth.js Credentials provider |
| 📄 Document Parsing | PDF, DOCX, TXT, XLSX support |
| ⚡ Streaming Responses | Server-Sent Events (SSE) |
| 🎓 Guided Onboarding | In-app tutorial for new users |
| 🌙 Modern UI | Dark theme, Tailwind CSS |

**Policy domains covered:**
- 🏖️ Leave (annual leave, sick leave, public holidays)
- 🌍 Mobility (global & local mobility)
- 🧾 Tax (IR/IPP barèmes, ONSS/cotisations)
- 🏥 Health insurance (mutuelle/hospitalisation)
- 💰 Premiums & benefits (meal vouchers, transport, profit sharing, pension, shares, home office)
| 🏢 Work site terms (telework agreements, working time)
| 🚀 Onboarding & offboarding (IT setup, PC/software policy, exit process)
| ⚖️ Pay transparency (EU Dir. 2023/970)
- Work site terms (telework agreements, working time)
- Onboarding & offboarding (IT setup, PC/software policy, exit process)
- Pay transparency (EU Dir. 2023/970)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js — Credentials only (no Azure AD) |
| AI — Chat | **Mistral `open-mistral-nemo`** |
| AI — Embeddings | **Mistral `mistral-embed` (1024 dims)** |
| Database | PostgreSQL + pgvector |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Getting Started

### Prerequisites

- Node.js 18.17+
- PostgreSQL with the `pgvector` extension
- A [Mistral API key](https://console.mistral.ai/)

### 1. Clone & install

```bash
git clone https://github.com/JDK95-sys/MistralHR.git
cd MistralHR
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost:5432/mistralhr

MISTRAL_API_KEY=<your Mistral API key>

AUTH_PASSWORD=demo1234
```

### 3. Set up the database

```bash
# Enable pgvector
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create tables
psql $DATABASE_URL -f db/schema.sql
```

### 4. Seed policies

This generates Mistral embeddings for all 18 FR/BE policies and stores them in the database for RAG chat.

```bash
npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

Expected output:
```
✓ Seeded: Congés Payés — France
✓ Seeded: Arrêt Maladie — France
...
✅ All 18 policies seeded successfully.
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Demo Accounts

| Email | Password | Country | Role |
|---|---|---|---|
| alice.martin@mistralhr.demo | hackathon2025 | France | Employee |
| jan.peeters@mistralhr.demo | hackathon2025 | Belgium | HR Business Partner |

---

## Project Structure

```
MistralHR/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx          # Authenticated shell with sidebar
│   │   ├── chat/               # Mistral RAG chat interface
│   │   └── policies/
│   │       ├── page.tsx        # Policy library (filter by country/topic)
│   │       └── [id]/page.tsx   # Policy detail with legal references
│   ├── api/
│   │   ├── auth/               # NextAuth endpoints
│   │   └── chat/route.ts       # Mistral streaming chat API
│   └── login/page.tsx          # Credentials login form
├── components/
│   ├── Sidebar.tsx             # Nav: Chat + Policies only
│   └── Topbar.tsx              # Page header
├── lib/
│   ├── auth.ts                 # NextAuth credentials config
│   ├── db.ts                   # PostgreSQL pool
│   ├── policies-data.ts        # 18 FR/BE statutory policies
│   └── rag/
│       ├── embeddings.ts       # Mistral mistral-embed
│       ├── vectorSearch.ts     # pgvector similarity search
│       ├── systemPrompt.ts     # Chat system prompt
│       ├── chunker.ts          # Document text splitting
│       └── ingest.ts           # Document ingestion pipeline
├── db/
│   ├── schema.sql              # PostgreSQL schema (pgvector 1024 dims)
│   └── migrations/
│       └── 001-mistral-embeddings.sql  # Migrate from 1536 → 1024 dims
├── scripts/
│   └── seed-policies.ts        # Seed FR/BE policies with Mistral embeddings
├── docs/plans/
│   └── 2026-02-28-stripped-hr-portal.md  # Implementation plan
└── middleware.ts               # Route protection (NextAuth)
```

---

## How the RAG Chat Works

```
User question
     │
     ▼
Generate embedding (mistral-embed)
     │
     ▼
Vector search in PostgreSQL (pgvector cosine similarity)
Returns top 6 most relevant policy chunks for the user's country
     │
     ▼
Build context from chunks + user profile (country, department, role)
     │
     ▼
Stream response from open-mistral-nemo
     │
     ▼
Citations surfaced from source chunks
```

The assistant answers **only from retrieved documents** — it will not hallucinate policy details not in the database. **Powered by Mistral AI**.

---

## Policy Legal References

All policies reference real statutory sources:

**France:** Code du Travail (L1221-19, L1226-1, L3121-27, L3133-1, L3141-3, L3221-1+), EU Directive 2023/970, ANI Télétravail 2020, CCN Syntec

**Belgium:** Loi du 26 déc. 2013 (Statut Unique), Loi du 22 avril 2012, Loi du 3 juillet 1978, Loi du 28 juin 1971, CCT n°85, EU Directive 2023/970, ONSS/INAMI regulations

---

## If You Already Have a Database with OpenAI Embeddings

Run the migration to switch from 1536 → 1024 dimensions, then re-seed:

```bash
psql $DATABASE_URL -f db/migrations/001-mistral-embeddings.sql
npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `MISTRAL_API_KEY` | Mistral API key from console.mistral.ai |
| `AUTH_PASSWORD` | Shared password for demo accounts (default: `hackathon2025`) |
