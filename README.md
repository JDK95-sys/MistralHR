# <img src="https://mistral.ai/favicon.ico" width="32" alt="Mistral AI" /> MistralHR — AI-Powered HR Assistant

> **🚀 Powered entirely by Mistral AI** — no Azure, no OpenAI, no compromise.

MistralHR is an internal HR portal for employees in **France** and **Belgium**, built for the **Mistral AI Hackathon**. It leverages a fully Mistral-native RAG pipeline — `open-mistral-nemo` for chat and `mistral-embed` for semantic search — to answer HR questions grounded in 18 statutory policies. **100% Mistral. Zero Azure.**

---

## 🎯 Hackathon Demo

> **No setup required for hackathon judges and testers.**

The live demo has a **temporary Mistral API key already configured** for the duration of the hackathon. To try it:

1. Open the demo URL
2. Log in with one of the [demo accounts](#demo-accounts) below
3. Start chatting — the AI answers HR questions using `open-mistral-nemo` and performs semantic search across 18 FR/BE statutory policies with `mistral-embed`

> ⚠️ The temporary API key will expire after the hackathon period. See the [Fork & Make It Your Own](#-fork--make-it-your-own) section to set up your own key.

---

## 📸 Screenshots

### HR Assistant — AI Chat
<img width="1908" height="902" alt="image" src="https://github.com/user-attachments/assets/3542a2f3-bac0-43c1-add2-f1e6cd6a8167" />


### Policy Library — Browse & Filter Policies
<img width="1907" height="881" alt="image" src="https://github.com/user-attachments/assets/651a9998-81e3-4352-966f-92268dda4171" />


### Policy Detail — Legal References & Full Content
<img width="1917" height="898" alt="image" src="https://github.com/user-attachments/assets/4fb139a0-4d43-459b-b638-f4f73901a55b" />


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
- 🏢 Work site terms (telework agreements, working time)
- 🚀 Onboarding & offboarding (IT setup, PC/software policy, exit process)
- ⚖️ Pay transparency (EU Dir. 2023/970)

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI — Chat | [![Mistral](https://img.shields.io/badge/Mistral-open--mistral--nemo-FF7000?logo=mistralai&logoColor=white)](https://mistral.ai) |
| AI — Embeddings | [![Mistral](https://img.shields.io/badge/Mistral-mistral--embed-FF7000?logo=mistralai&logoColor=white)](https://mistral.ai) |
| Framework | [![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org) |
| Auth | [![NextAuth](https://img.shields.io/badge/NextAuth.js-Credentials-purple)](https://next-auth.js.org) |
| Database | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector) |
| Styling | [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com) |
| Language | [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Icons | Lucide React |
| Doc Parsing | pdf-parse, mammoth, xlsx |
| Markdown | react-markdown + remark-gfm |

---

## 🍴 Fork & Make It Your Own

Want to adapt MistralHR for your own organization? Here's how:

### 1. Fork & Clone

```bash
# Fork this repo on GitHub, then:
git clone https://github.com/<your-username>/MistralHR.git
cd MistralHR
npm install
```

### 2. Get Your Own Mistral API Key

Visit [console.mistral.ai](https://console.mistral.ai) and create an API key. You'll need it for both:
- **Chat** — `open-mistral-nemo`
- **Embeddings** — `mistral-embed`

### 3. Set Up Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Add your key to `.env.local` for local development, or set it in your hosting platform's environment variable settings (Vercel dashboard, Railway, etc.):

```env
MISTRAL_API_KEY=<your Mistral API key>
DATABASE_URL=postgresql://user:password@host:5432/mistralhr
```

> ⚠️ **Without `MISTRAL_API_KEY`**, the chat falls back to static demo responses. **Without `DATABASE_URL`**, there is no semantic search — the AI answers without policy context.

### 4. Provision a PostgreSQL Database with pgvector

Free-tier options:
- [Neon](https://neon.tech) — serverless PostgreSQL, pgvector built-in
- [Supabase](https://supabase.com) — managed PostgreSQL with pgvector support
- [Railway](https://railway.app) — simple hosted PostgreSQL

See the [pgvector install guide](https://github.com/pgvector/pgvector) if self-hosting.

### 5. Run Schema + Migrations

```bash
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/migrations/001-mistral-embeddings.sql
```

### 6. Customize Policies for Your Organization

The 18 FR/BE statutory policies live in `lib/policies-data.ts`. Edit or replace them with your own organizational policies. After modifying, re-run the seed script to generate new embeddings.

### 7. Seed the Database

Make sure `MISTRAL_API_KEY` is set in `.env.local` before running the seed script (it is read at module load time):

```bash
npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

### 8. Deploy

See the [Deployment](#deployment) section below. After your first deploy, remember to seed the production database from your local machine:

```bash
MISTRAL_API_KEY=<key> DATABASE_URL=<production-db-url> npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | ≥ 18.17 | [nodejs.org](https://nodejs.org) |
| PostgreSQL | ≥ 15 + pgvector | [pgvector install](https://github.com/pgvector/pgvector) |
| Mistral API Key | — | [console.mistral.ai](https://console.mistral.ai) |

### Step 1 — Clone & Install

```bash
git clone https://github.com/JDK95-sys/MistralHR.git
cd MistralHR
npm install
```

### Step 2 — Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

**Auth**
```env
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
AUTH_PASSWORD=hackathon2025
```

**Database**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mistralhr
```

**Mistral AI**
```env
MISTRAL_API_KEY=<your Mistral API key from console.mistral.ai>
```

> **💡 Runtime Modes:**
> - **Full mode** — `MISTRAL_API_KEY` + `DATABASE_URL` set: full RAG chat with embeddings and vector search.
> - **Mistral-only mode** — `MISTRAL_API_KEY` set, no `DATABASE_URL`: chat works but without policy retrieval.
> - **Demo mode** — neither set: app runs with static demo responses, no API calls.

### Step 3 — Set Up Database

```bash
# Enable pgvector extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Create tables
psql $DATABASE_URL -f db/schema.sql

# Apply migrations
psql $DATABASE_URL -f db/migrations/001-mistral-embeddings.sql
```

Expected output:
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
```

### Step 4 — Seed Policies with Mistral Embeddings

> **Note:** `MISTRAL_API_KEY` must be set in `.env.local` before running the seed script, since `lib/rag/embeddings.ts` reads it at module load time.

This generates `mistral-embed` embeddings for all 18 FR/BE policies and stores them in PostgreSQL for RAG chat.

```bash
npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

Expected output:
```
✓ Seeded: Congés Payés — France
✓ Seeded: Arrêt Maladie — France
✓ Seeded: Jours Fériés — France
✓ Seeded: Mobilité Internationale — France
✓ Seeded: Impôt sur le Revenu — France
✓ Seeded: Mutuelle Santé — France
✓ Seeded: Tickets Restaurant & Transport — France
✓ Seeded: Intéressement & Participation — France
✓ Seeded: Télétravail — France
✓ Seeded: Transparence Salariale — France
✓ Seeded: Jaarlijks Verlof — Belgium
✓ Seeded: Ziekteverlof — Belgium
✓ Seeded: Feestdagen — Belgium
✓ Seeded: Internationale Mobiliteit — Belgium
✓ Seeded: Personenbelasting — Belgium
✓ Seeded: Hospitalisatieverzekering — Belgium
✓ Seeded: Maaltijdcheques & Transport — Belgium
✓ Seeded: Thuiswerk — Belgium
✅ All 18 policies seeded successfully.
```

### Step 5 — Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Demo Accounts

| Email | Password | Country | Role |
|---|---|---|---|
| alice.martin@mistralhr.demo | `hackathon2025` | 🇫🇷 France | Employee |
| jan.peeters@mistralhr.demo | `hackathon2025` | 🇧🇪 Belgium | HR Business Partner |

---

## Project Structure

```
MistralHR/
├── app/
│   ├── page.tsx                    # Root redirect
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles (dark theme)
│   ├── login/
│   │   └── page.tsx                # Credentials login form
│   ├── api/
│   │   ├── auth/                   # NextAuth endpoints
│   │   └── chat/
│   │       └── route.ts            # Mistral streaming chat API
│   └── (protected)/
│       ├── layout.tsx              # Authenticated shell with sidebar
│       ├── chat/                   # Mistral RAG chat interface
│       ├── policies/
│       │   ├── page.tsx            # Policy library (filter by country/topic)
│       │   └── [id]/page.tsx       # Policy detail with legal references
│       └── tutorial/               # Guided onboarding tutorial
├── components/
│   ├── Sidebar.tsx                 # Nav: Chat + Policies
│   └── Topbar.tsx                  # Page header
├── lib/
│   ├── auth.ts                     # NextAuth credentials config
│   ├── policies-data.ts            # 18 FR/BE statutory policies
│   └── rag/
│       ├── embeddings.ts           # Mistral mistral-embed
│       ├── vectorSearch.ts         # pgvector similarity search
│       ├── systemPrompt.ts         # Chat system prompt
│       ├── chunker.ts              # Document text splitting
│       └── ingest.ts               # Document ingestion pipeline
├── db/
│   ├── schema.sql                  # PostgreSQL schema (pgvector 1024 dims)
│   └── migrations/
│       └── 001-mistral-embeddings.sql
├── scripts/
│   └── seed-policies.ts            # Seed FR/BE policies with Mistral embeddings
├── docs/
│   └── screenshots/                # App screenshots for README
└── middleware.ts                   # Route protection (NextAuth)
```

---

## Deployment

### Vercel (Recommended)

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the following environment variables in the Vercel dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel deployment URL)
   - `MISTRAL_API_KEY`
   - `DATABASE_URL` (a hosted PostgreSQL instance with pgvector, e.g. Neon or Supabase)
4. Click **Deploy**.
5. **Post-deploy:** Seed the production database from your local machine:
   ```bash
   MISTRAL_API_KEY=<key> DATABASE_URL=<production-db-url> npx ts-node --project tsconfig.json scripts/seed-policies.ts
   ```

### Azure App Service

This repo includes a `web.config` for IIS/Azure App Service compatibility.

```bash
npm run build
# Set environment variables in Azure App Service → Configuration → Application settings
# Deploy via GitHub Actions, Azure DevOps, or zip deploy
```

Set the same environment variables (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `MISTRAL_API_KEY`, `DATABASE_URL`) in the Azure App Service configuration panel.

**Post-deploy:** Seed the production database from your local machine:
```bash
MISTRAL_API_KEY=<key> DATABASE_URL=<production-db-url> npx ts-node --project tsconfig.json scripts/seed-policies.ts
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

Built for the **Mistral AI Hackathon**. This is an internal demo tool — not intended for production use without further security review.

---

<div align="center">

Built with 🧡 and **Mistral AI**

*Next.js · TypeScript · PostgreSQL + pgvector · NextAuth.js · Tailwind CSS*

</div>
