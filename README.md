# Worldline People Portal

Internal HR platform for Worldline employees across 20+ countries. Built with Next.js 14, Azure AD SSO, and an AI-powered HR assistant (Phase 3).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js + Azure AD |
| Styling | Tailwind CSS + Worldline Design Tokens |
| Language | TypeScript |
| Hosting | Azure App Service |
| CI/CD | GitHub Actions |
| Database (Phase 3) | PostgreSQL + pgvector |
| AI (Phase 3) | Anthropic API (Claude) + RAG |
| Storage (Phase 3) | Azure Blob Storage |

---

## Local Development

### Prerequisites
- Node.js 18.17+
- An Azure AD App Registration (see setup below)

### 1. Clone & install
```bash
git clone https://github.com/worldline/hr-portal.git
cd worldline-hr-portal
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in your Azure AD credentials (see Azure AD Setup below)
```

### 3. Run locally
```bash
npm run dev
# → http://localhost:3000
```

---

## Azure AD App Registration Setup

1. Go to **Azure Portal** → **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `Worldline HR Portal`
3. Supported account types: **Accounts in this organizational directory only**
4. Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
5. After creation, note:
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
6. Go to **Certificates & secrets** → **New client secret** → `AZURE_AD_CLIENT_SECRET`
7. Go to **API permissions** → **Add permission** → **Microsoft Graph** → Add:
   - `openid` (delegated)
   - `profile` (delegated)
   - `email` (delegated)
   - `User.Read` (delegated)
   - `User.ReadBasic.All` (delegated — for profile data)
8. Click **Grant admin consent**
9. For production, add redirect URI: `https://your-app.azurewebsites.net/api/auth/callback/azure-ad`

---

## Azure App Service Deployment

### Manual (first deploy)
1. Create App Service in Azure Portal:
   - **Runtime**: Node.js 20 LTS
   - **OS**: Linux
   - **Region**: West Europe (GDPR compliance)
2. Set App Settings (Configuration → Application settings):
   ```
   NEXTAUTH_URL = https://your-app.azurewebsites.net
   NEXTAUTH_SECRET = <generate with: openssl rand -base64 32>
   AZURE_AD_CLIENT_ID = <from App Registration>
   AZURE_AD_CLIENT_SECRET = <from App Registration>
   AZURE_AD_TENANT_ID = <from App Registration>
   NODE_ENV = production
   ```
3. Run locally: `npm run build` then deploy via ZIP or GitHub Actions

### Automated (GitHub Actions)
1. Add secrets to GitHub repo (Settings → Secrets → Actions):
   - All the env vars above
   - `AZURE_WEBAPP_PUBLISH_PROFILE` — download from Azure Portal → App Service → Get publish profile
2. Update `AZURE_WEBAPP_NAME` in `.github/workflows/azure-deploy.yml`
3. Push to `main` → auto-deploys

---

## Project Structure

```
worldline-hr-portal/
├── app/
│   ├── (protected)/          # All authenticated pages
│   │   ├── layout.tsx        # Shell with Sidebar
│   │   ├── chat/             # AI HR Assistant (homepage)
│   │   ├── analytics/        # HR Analytics dashboard
│   │   ├── jobs/             # Internal Job Board
│   │   ├── performance/      # Performance Goals
│   │   └── admin/            # HR Admin tools (role-gated)
│   ├── login/                # Login page (Azure AD SSO)
│   ├── api/auth/             # NextAuth API routes
│   ├── globals.css           # Design tokens + Tailwind
│   └── layout.tsx            # Root layout
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Topbar.tsx            # Page header
│   └── providers/            # React context providers
├── lib/
│   └── auth.ts               # NextAuth config + Azure AD
├── middleware.ts             # Route protection
├── tailwind.config.js        # Worldline brand tokens
├── web.config                # Azure App Service IIS config
└── .github/workflows/        # CI/CD pipeline
```

---

## Role-Based Access

Roles are derived from **Azure AD group memberships** on sign-in:

| Role | Access |
|---|---|
| `employee` | Chat, Jobs, My Goals, My Performance |
| `hrbp` | + Analytics, team views |
| `hr-admin` | + Document management, user management |
| `exec` | + All analytics, org-wide views |

Update group IDs in `lib/auth.ts` to match your Azure AD groups.

---

## Roadmap

- **Phase 2** ✅ Next.js + Azure AD SSO (this branch)
- **Phase 3** — RAG AI Chatbot (Anthropic API + pgvector)
- **Phase 4** — Document Management System (Azure Blob + admin UI)
- **Phase 5** — Performance, Jobs, Analytics (live data)
- **Phase 6** — HR Tools section

---

## GDPR & EU AI Act Compliance

- All data processed in **Azure West Europe** region
- AI assistant discloses AI-generated nature on every response
- No personal data stored in vector database — only document chunks
- Session tokens stored in JWT (no server-side session storage)
- Token lifetime: 8 hours (working day)
