# Stripped HR Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Strip the Worldline HR Portal to 3 routes (`/login`, `/chat`, `/policies`), swap Anthropic/OpenAI for Mistral (`open-mistral-nemo` + `mistral-embed`), remove Azure AD in favour of simple credentials auth, and populate policies with comprehensive FR/BE statutory legal references across 9 policy domains.

**Architecture:** Delete all unwanted pages/APIs, simplify NextAuth to a credentials-only provider, replace the LLM layer with Mistral's streaming API, update pgvector column to 1024 dims, then seed the DB with hardcoded FR+BE legal policy text. No new database tables needed.

**Policy Domains Covered (FR + BE for each):**
1. Leave (paid annual leave, unpaid leave, public holidays, sick leave)
2. Global & Local Mobility (transfer process, relocation support)
3. Local Tax Policies (income tax, social contributions)
4. Health Insurance (policy terms, local vendor T&C)
5. Premiums & Benefits (transport, meal vouchers/restaurant tickets, profit sharing, retirement/pension, company share plans, home office allowance)
6. Work Site Terms (remote/hybrid/on-site conditions and eligibility)
7. Onboarding & Offboarding (IT setup, PC/software policies, exit process)

**Tech Stack:** Next.js 14 (App Router), NextAuth v4 (Credentials only), `@mistralai/mistralai` SDK, PostgreSQL + pgvector (1024 dims), Tailwind CSS.

---

## Quick Reference: Key Files

| Purpose | Path |
|---------|------|
| Auth config | `lib/auth.ts` |
| Middleware | `middleware.ts` |
| Login page | `app/login/page.tsx` |
| Sidebar nav | `components/Sidebar.tsx` |
| Chat API | `app/api/chat/route.ts` |
| Embeddings | `lib/rag/embeddings.ts` |
| System prompt | `lib/rag/systemPrompt.ts` |
| Policies static data | `lib/policies-data.ts` |
| Policy detail page | `app/(protected)/policies/[id]/page.tsx` |
| DB schema | `db/schema.sql` |

---

### Task 1: Delete Unwanted Routes & Lib Files

Remove all pages and APIs that won't exist in the stripped portal.

**Files to delete (whole directories unless noted):**
- `app/(protected)/analytics/`
- `app/(protected)/jobs/`
- `app/(protected)/tools/` (just the folder — one file inside)
- `app/(protected)/admin/`
- `app/api/jobs/`
- `app/api/documents/` (admin-only upload pipeline)
- `lib/jobs-data.ts`
- `lib/live-jobs.ts`
- `lib/azure-storage.ts`

**Step 1: Delete analytics**

```bash
rm -rf "app/(protected)/analytics"
```

**Step 2: Delete jobs**

```bash
rm -rf "app/(protected)/jobs"
rm -rf "app/api/jobs"
rm "lib/jobs-data.ts"
rm "lib/live-jobs.ts"
```

**Step 3: Delete tools**

```bash
rm -rf "app/(protected)/tools"
```

**Step 4: Delete admin and document upload API**

```bash
rm -rf "app/(protected)/admin"
rm -rf "app/api/documents"
rm "lib/azure-storage.ts"
```

(All commands run from `worldline-hr-portal/` directory.)

**Step 5: Run type-check to find broken imports**

```bash
npm run type-check
```

Expected: Errors in `components/Sidebar.tsx` referencing deleted routes — that's fine, fixed in Task 2.

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: delete analytics, jobs, tools, admin routes and unused libs"
```

---

### Task 2: Simplify the Sidebar

**Files:**
- Modify: `components/Sidebar.tsx`

**Step 1: Read the current file**

Read `components/Sidebar.tsx` — note all imports, nav item arrays, admin section, tutorial button.

**Step 2: Replace nav arrays**

Find the navigation items definition and replace it with only two items:

```typescript
const mainNav = [
  {
    href: "/chat",
    icon: MessageCircle,
    label: "HR Assistant",
    className: "nav-assistant",
  },
  {
    href: "/policies",
    icon: FileText,
    label: "Policy Library",
    className: "nav-policies",
  },
];
```

**Step 3: Remove unwanted sections from JSX**

Delete from the rendered JSX:
- The "My Space" section (Jobs badge + nav item)
- The "Insights" section (Analytics, HR Tools nav items)
- The entire admin-gated `<div>` block (Documents, User Management)
- The "Start Tutorial" button and its `window.dispatchEvent` handler

Keep: user profile display at the bottom, Sign Out button.

**Step 4: Remove unused icon imports**

From the lucide-react import, remove: `Briefcase`, `BarChart3`, `Wrench`, `FolderOpen`, `Users`.
Keep: `MessageCircle`, `FileText`, `LogOut`, and any used by the user avatar.

**Step 5: Run type-check**

```bash
npm run type-check
```

Expected: No errors related to Sidebar.

**Step 6: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: simplify sidebar to HR Assistant and Policy Library only"
```

---

### Task 3: Simplify Authentication (Remove Azure AD)

**Files:**
- Modify: `lib/auth.ts`
- Modify: `middleware.ts`
- Modify: `app/login/page.tsx`

**Step 1: Read lib/auth.ts**

Note the full structure: Azure AD provider config, token refresh logic, group → role mapping, JWT/session callbacks.

**Step 2: Rewrite lib/auth.ts**

Replace the entire file with a credentials-only config:

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Demo users — passwords are intentionally simple for this internal demo.
// Set AUTH_PASSWORD in .env to override the shared default.
const DEMO_PASSWORD = process.env.AUTH_PASSWORD ?? "demo1234";

const USERS = [
  {
    id: "user-fr-01",
    email: "alice.martin@worldline.com",
    password: DEMO_PASSWORD,
    name: "Alice Martin",
    jobTitle: "Software Engineer",
    country: "France",
    department: "Engineering",
    portalRole: "employee",
  },
  {
    id: "user-be-01",
    email: "jan.peeters@worldline.com",
    password: DEMO_PASSWORD,
    name: "Jan Peeters",
    jobTitle: "HR Business Partner",
    country: "Belgium",
    department: "Human Resources",
    portalRole: "hrbp",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );
        return user ?? null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as (typeof USERS)[0];
        token.id = u.id;
        token.country = u.country;
        token.department = u.department;
        token.jobTitle = u.jobTitle;
        token.portalRole = u.portalRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).country = token.country;
        (session.user as any).department = token.department;
        (session.user as any).jobTitle = token.jobTitle;
        (session.user as any).portalRole = token.portalRole;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

**Step 3: Simplify middleware.ts**

Read current file, then replace with:

```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({ pages: { signIn: "/login" } });

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

(Remove `RefreshAccessTokenError` redirect logic — no longer needed without Azure AD token rotation.)

**Step 4: Rewrite app/login/page.tsx**

Replace the Azure SSO + dev personas layout with a simple email/password form. Keep the two-column layout (branding left, form right) but simplify:

- Left panel: Worldline logo + "HR Assistant Portal" heading + 2-line description
- Right panel: Email input + Password input + "Sign in" button
- Remove: Microsoft SSO button, dev persona cards, Suspense boundary for session errors
- Keep: `signIn("credentials", ...)` from `next-auth/react`

```tsx
"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      router.push("/chat");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-slate-900 text-white w-1/2">
        <div className="text-3xl font-bold mb-4">Worldline HR Portal</div>
        <p className="text-slate-400 max-w-sm">
          Your internal HR assistant for France and Belgium — policies,
          leave rules, and legal references in one place.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-md text-sm"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Demo accounts: alice.martin@worldline.com (FR) · jan.peeters@worldline.com (BE)
            · Password: demo1234
          </p>
        </form>
      </div>
    </div>
  );
}
```

**Step 5: Run type-check**

```bash
npm run type-check
```

Expected: Passing (or only Mistral-related import errors — not yet installed).

**Step 6: Commit**

```bash
git add lib/auth.ts middleware.ts app/login/page.tsx
git commit -m "feat: replace Azure AD auth with simple credentials provider"
```

---

### Task 4: Install Mistral SDK & Remove OpenAI

**Files:**
- `package.json` (via npm)
- `lib/rag/embeddings.ts`
- `db/schema.sql`

**Step 1: Install Mistral, uninstall OpenAI**

```bash
cd worldline-hr-portal
npm install @mistralai/mistralai
npm uninstall openai
```

**Step 2: Read current lib/rag/embeddings.ts**

Note the three exported functions: `generateEmbedding`, `generateEmbeddingsBatch`, `formatEmbedding`.

**Step 3: Rewrite lib/rag/embeddings.ts**

Replace OpenAI `text-embedding-3-small` with Mistral `mistral-embed`.
**Important:** Mistral embeddings are **1024-dimensional** (not 1536).

```typescript
import Mistral from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });
  return response.data[0].embedding;
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  // Mistral allows up to 512 strings per request
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: texts,
  });
  return response.data.map((d) => d.embedding);
}

export function formatEmbedding(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
```

**Step 4: Update db/schema.sql for 1024-dim embeddings**

Find every occurrence of `vector(1536)` and replace with `vector(1024)`.
Also update the `search_chunks` function signature if it casts the parameter.

**Step 5: Create migration file for existing databases**

Create `db/migrations/001-mistral-embeddings.sql`:

```sql
-- Migrate from OpenAI (1536 dims) to Mistral (1024 dims)
-- WARNING: This drops existing embeddings — re-run seed-policies.ts after applying.

ALTER TABLE document_chunks DROP COLUMN IF EXISTS embedding;
ALTER TABLE document_chunks ADD COLUMN embedding vector(1024);

DROP INDEX IF EXISTS idx_chunks_embedding;
CREATE INDEX idx_chunks_embedding
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Step 6: Run type-check**

```bash
npm run type-check
```

Expected: Passing.

**Step 7: Commit**

```bash
git add lib/rag/embeddings.ts db/schema.sql db/migrations/
git commit -m "feat: replace OpenAI embeddings with Mistral mistral-embed (1024 dims)"
```

---

### Task 5: Replace Chat LLM (Claude → Mistral open-mistral-nemo)

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `lib/rag/systemPrompt.ts`

**Step 1: Uninstall Anthropic SDK**

```bash
npm uninstall @anthropic-ai/sdk
```

**Step 2: Read app/api/chat/route.ts**

Understand the streaming SSE flow: status events → text chunks → citations → done event.
Note the `anthropic.messages.stream(...)` call and how it feeds the ReadableStream controller.

**Step 3: Replace the LLM call in route.ts**

Replace the Anthropic streaming block with Mistral streaming.
The SSE event format stays identical — only the LLM call changes:

```typescript
import Mistral from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// Inside the route handler, replace the anthropic.messages.stream(...) block with:
const stream = await mistral.chat.stream({
  model: "open-mistral-nemo",
  messages: [
    { role: "system", content: systemPrompt },
    // map existing messageHistory to Mistral format (same role/content structure)
    ...messageHistory.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ],
});

for await (const chunk of stream) {
  const delta = chunk.data.choices[0]?.delta?.content ?? "";
  if (delta) {
    controller.enqueue(
      encoder.encode(
        `data: ${JSON.stringify({ type: "text", text: delta })}\n\n`
      )
    );
  }
}
```

Remove all imports of `@anthropic-ai/sdk`.

**Step 4: Update lib/rag/systemPrompt.ts**

Change "Worldline HR Assistant powered by Claude" to just "Worldline HR Assistant".
Remove any Claude-specific instructions (e.g., references to `<citations>` XML tags).
Keep: user context injection block, "answer ONLY from retrieved documents" instruction, citation format line.

**Step 5: Run type-check**

```bash
npm run type-check
```

Expected: Passing.

**Step 6: Commit**

```bash
git add app/api/chat/route.ts lib/rag/systemPrompt.ts
git commit -m "feat: replace Claude with Mistral open-mistral-nemo for chat"
```

---

### Task 6: Update Policy Data with Real FR/BE Legal References

**Files:**
- Modify: `lib/policies-data.ts`
- Modify: `app/(protected)/policies/[id]/page.tsx`

**Step 1: Read lib/policies-data.ts**

Note the `Policy` interface — especially which fields exist (id, title, description, countries, topic, icon, updatedAt).

**Step 2: Update the Policy interface and topic type**

```typescript
export type PolicyTopic =
  | "leave"
  | "mobility"
  | "tax"
  | "health"
  | "premiums"
  | "worksite"
  | "onboarding"
  | "compensation"
  | "other";

export interface Policy {
  id: string;
  title: string;
  description: string;
  countries: string[];
  topic: PolicyTopic;
  icon: string;
  updatedAt: string;
  legalRefs: string[];   // ← new
  content: string;       // ← new: full statutory text shown on detail page
}
```

**Step 3: Replace policy array with full FR/BE policies (7 domains × 2 countries = 14+ entries)**

Use the statutory details below — copy them verbatim.

**France (7 domains — expand each into a full Policy object):**

```typescript
// ── DOMAIN 1: LEAVE ─────────────────────────────────────────
{
  id: "fr-annual-leave",
  title: "Congés Payés — France",
  description: "5 semaines de congés payés légaux (30 jours ouvrables). Acquisition: 2,5 jours/mois.",
  countries: ["France"],
  topic: "leave",
  icon: "🏖️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3141-3", "Code du Travail L3141-5", "Loi 22 avril 2024 (extension maladie)"],
  content: `Tout salarié acquiert 2,5 jours ouvrables par mois de travail effectif (L3141-3), soit 30 jours ouvrables (5 semaines) pour une année complète.

Période légale de prise : 1er mai – 31 octobre. Le congé principal doit être d'au moins 12 jours ouvrables consécutifs sur cette période.

Congé non pris : ne peut être payé en cours de contrat. La Loi du 22 avril 2024 permet le report des congés en cas d'arrêt maladie (transposition Dir. UE 2019/1158).`,
},
{
  id: "fr-sick-leave",
  title: "Arrêt Maladie — France",
  description: "Maintien de salaire 90 jours via subrogation. Zéro délai de carence chez Worldline.",
  countries: ["France"],
  topic: "leave",
  icon: "🏥",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1226-1", "Convention Collective Syntec"],
  content: `L1226-1 : maintien de salaire dès 1 an d'ancienneté. Worldline applique la CCN Syntec : maintien 100% salaire pendant 90 jours (subrogation — l'employeur avance le salaire et récupère les IJSS auprès de la CPAM).

Délai de carence IJSS (3 jours) supprimé par accord d'entreprise : le salarié perçoit son salaire dès le 1er jour d'arrêt.

Au-delà de 90 jours : indemnités IJSS + contrat prévoyance collectif Worldline (niveau de remplacement défini dans l'accord de prévoyance).`,
},
{
  id: "fr-holidays",
  title: "Jours Fériés — France",
  description: "11 jours fériés légaux (L3133-1). Worldline les chôme tous.",
  countries: ["France"],
  topic: "leave",
  icon: "🗓️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3133-1"],
  content: `11 jours fériés légaux : 1er jan, Lundi de Pâques, 1er mai (seul obligatoirement chômé), 8 mai, Ascension, Lundi de Pentecôte, 14 juillet, 15 août, 1er nov, 11 nov, 25 déc.

Worldline France chôme l'ensemble des 11 jours fériés avec maintien de salaire. Si un jour férié coïncide avec un jour de RTT ou congé planifié, un jour de remplacement est accordé.`,
},

// ── DOMAIN 2: MOBILITY ──────────────────────────────────────
{
  id: "fr-mobility",
  title: "Mobilité Globale & Locale — France",
  description: "Processus de transfert interne, détachement international et relocation.",
  countries: ["France"],
  topic: "mobility",
  icon: "✈️",
  updatedAt: "2024-03-01",
  legalRefs: ["Code du Travail L1231-5 (mutation)", "Convention de détachement UE 883/2004"],
  content: `Mobilité interne (locale) : toute mutation géographique doit être prévue par une clause de mobilité dans le contrat ou faire l'objet d'un avenant signé. Un délai de prévenance raisonnable est requis (L1231-5).

Détachement international : pour les missions > 3 mois, un avenant de détachement précise la durée, le maintien du contrat français, les conditions de rémunération et la couverture sociale. La France reste compétente pour la sécurité sociale (règlement UE 883/2004 intra-UE).

Comment démarrer : contacter HR Mobility (hr-mobility@worldline.com) → ouverture d'un dossier → validation manager + Finance → avenant signé → briefing RH destination → logistique relocation (si applicable, budget plafonné selon politique interne).`,
},

// ── DOMAIN 3: TAX ────────────────────────────────────────────
{
  id: "fr-tax",
  title: "Fiscalité Locale — France",
  description: "Impôt sur le revenu, prélèvement à la source et cotisations sociales salariales.",
  countries: ["France"],
  topic: "tax",
  icon: "🧾",
  updatedAt: "2024-01-01",
  legalRefs: ["CGI Art. 197 (barème IR)", "Code de la Sécurité Sociale (cotisations)", "Décret 2018-514 (PAS)"],
  content: `Prélèvement à la source (PAS) depuis 2019 : l'impôt sur le revenu est prélevé directement par l'employeur sur le salaire net imposable au taux personnalisé transmis par la DGFiP. Le salarié peut le modifier sur impots.gouv.fr.

Barème IR 2024 (revenus 2023) :
- 0% jusqu'à 11 294 €
- 11% de 11 294 € à 28 797 €
- 30% de 28 797 € à 82 341 €
- 41% de 82 341 € à 177 106 €
- 45% au-delà

Cotisations sociales salariales (approximatif) : ~22% du salaire brut (assurance maladie, retraite de base CNAV, retraite complémentaire AGIRC-ARRCO, chômage, CSG/CRDS).

À noter : la CSG (9,2%) et la CRDS (0,5%) s'appliquent sur 98,25% du salaire brut.`,
},

// ── DOMAIN 4: HEALTH INSURANCE ───────────────────────────────
{
  id: "fr-health",
  title: "Mutuelle & Prévoyance — France",
  description: "Couverture santé complémentaire obligatoire et prévoyance collective Worldline.",
  countries: ["France"],
  topic: "health",
  icon: "🩺",
  updatedAt: "2024-01-01",
  legalRefs: ["ANI du 11 janvier 2013 (généralisation complémentaire santé)", "Code de la Sécurité Sociale L911-7"],
  content: `Mutuelle santé (complémentaire) : toute entreprise est tenue de proposer une couverture santé collective (ANI 2013, codifié à L911-7 CSS). Worldline France a souscrit un contrat collectif obligatoire auprès de [Prestataire — à confirmer RH].

Niveaux de couverture :
- Base légale (panier de soins minimal) incluse pour tous
- Options renforcées disponibles (optique, dentaire, médecines douces)
- L'employeur prend en charge au minimum 50% de la cotisation de base

Prévoyance : accord de prévoyance collectif couvrant incapacité de travail, invalidité, décès. Taux de remplacement et délais de carence définis dans l'accord (disponible sur l'intranet RH).

Portabilité : en cas de départ, la couverture santé et prévoyance est maintenue pendant la période de chômage (max 12 mois) via le mécanisme de portabilité (L911-8 CSS).`,
},

// ── DOMAIN 5: PREMIUMS & BENEFITS ───────────────────────────
{
  id: "fr-premiums",
  title: "Primes & Avantages — France",
  description: "Titre-restaurant, transport, intéressement, PEE, retraite supplémentaire, prime home office.",
  countries: ["France"],
  topic: "premiums",
  icon: "💶",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3262-1 (TR)", "Code du Travail L3312-1 (intéressement)", "Code Monétaire L214-39 (PEE)"],
  content: `Titre-restaurant : valeur faciale ~10€/jour (L3262-1). Part patronale : 60% (exonérée de charges si ≤ 6,91€ en 2024). Distribués via carte Swile/Ticket Restaurant.

Transport : prise en charge obligatoire de 50% de l'abonnement transport en commun (Navigo, TER, etc.). Forfait mobilités durables jusqu'à 700€/an net pour vélo, covoiturage.

Intéressement / Participation : accord d'intéressement Worldline — versement annuel selon résultats. Participation légale obligatoire si >50 salariés (L3312-1). Versement possible sur PEE ou en numéraire.

PEE / PERCO : Plan d'Épargne Entreprise (abondement employeur) et PERCO/PER Collectif pour la retraite supplémentaire. Fonds disponibles sur l'espace Amundi Worldline.

Actions Worldline : plan d'actionnariat salarié annuel (conditions et prix préférentiel publiés lors de chaque ouverture). Soumis au droit des marchés financiers.

Prime home office : indemnité télétravail fixée par accord d'entreprise (montant exact sur intranet).`,
},

// ── DOMAIN 6: WORK SITE TERMS ───────────────────────────────
{
  id: "fr-worksite",
  title: "Télétravail & Conditions de Travail — France",
  description: "Modalités remote/hybride/présentiel. Accord télétravail Worldline France.",
  countries: ["France"],
  topic: "worksite",
  icon: "🏠",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1222-9 à L1222-11", "ANI Télétravail du 26 novembre 2020"],
  content: `Cadre légal : le télétravail est régi par L1222-9 à L1222-11 (accord collectif ou charte employeur requise). L'ANI du 26 novembre 2020 fixe les principes (volontariat, réversibilité, droit à la déconnexion, prise en charge des équipements).

Accord Worldline France : jusqu'à 3 jours de télétravail par semaine pour les postes éligibles (déterminé avec le manager). Les nouveaux embauchés suivent une période d'intégration sur site (min. 3 mois) avant accès au télétravail régulier.

Équipement : PC portable fourni par Worldline IT (voir politique IT Onboarding). Écran supplémentaire et chaise ergonomique pris en charge via prime home office (voir Primes).

On-site : certains rôles exigent une présence sur site (data center, accueil, production). Ces contraintes sont spécifiées dans la fiche de poste.

Sécurité informatique : connexion VPN obligatoire en télétravail. Usage du réseau Wi-Fi personnel sécurisé WPA2 minimum requis.`,
},

// ── DOMAIN 7: ONBOARDING / OFFBOARDING ──────────────────────
{
  id: "fr-onboarding",
  title: "Onboarding & Offboarding — France",
  description: "Processus d'intégration, IT setup, politique PC/logiciels et procédure de départ.",
  countries: ["France"],
  topic: "onboarding",
  icon: "🚀",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1221-1 (contrat)", "RGPD Art. 17 (droit à l'effacement)"],
  content: `Onboarding (J-1 à J+90) :
- J-1 : accueil IT, remise PC, création comptes (AD, Microsoft 365, Slack, Jira, Workday)
- J1 : Welcome Day France — présentation RH, politique sécurité, visite site
- J7 : accès Worldline Academy (catalogue formations en ligne)
- J30 : point d'étonnement avec le manager
- J90 : fin période d'intégration, bilan avec RH

Politique PC & Logiciels :
- PC standard : Windows 11, Office 365, Teams, Zoom
- Logiciels supplémentaires : demande via ServiceNow (validation RSSI requise pour outils non-catalogue)
- BYOD : non autorisé pour accès aux systèmes Worldline

Offboarding :
- Préavis : selon convention collective et ancienneté (voir clause contrat)
- Restitution matériel : PC, badge, carte carburant sous 5 jours ouvrés après départ
- Accès systèmes : révocation J0 du départ (automatique via AD)
- Solde de tout compte : remis lors du dernier jour ou par courrier recommandé
- Données personnelles : suppression conforme au RGPD (Art. 17) dans les 30 jours suivant le départ`,
},
{
  id: "fr-pay-transparency",
  title: "Pay Transparency — France",
  description: "Égalité salariale et reporting sur l'écart femmes-hommes (EU Dir. 2023/970).",
  countries: ["France"],
  topic: "compensation",
  icon: "⚖️",
  updatedAt: "2024-06-01",
  legalRefs: ["Code du Travail L3221-1 à L3221-7", "EU Directive 2023/970"],
  content: `L3221-1 pose le principe d'égalité de rémunération pour un travail de valeur égale. L'employeur est tenu de supprimer les écarts injustifiés (L3221-2).

Index Égalité Professionnelle : publication annuelle avant le 1er mars pour toute entreprise ≥ 50 salariés.

EU Dir. 2023/970 (applicable 2026) : droit individuel à l'information salariale, interdiction des clauses de confidentialité sur salaires, obligation de reporting public par genre et catégorie.`,
},
{
  id: "fr-probation",
  title: "Période d'Essai — France",
  description: "Durées légales: 2 mois (employés), 3 mois (techniciens), 4 mois (cadres) — L1221-19.",
  countries: ["France"],
  topic: "onboarding",
  icon: "📋",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1221-19", "Code du Travail L1221-25"],
  content: `L1221-19 — Durées maximales CDI (renouvelables 1 fois si accord de branche) :
- Ouvriers/Employés : 2 mois → 4 mois max
- Agents maîtrise/Techniciens : 3 mois → 6 mois max
- Cadres : 4 mois → 8 mois max

CDD (L1242-10) : 1 jour/semaine, max 2 semaines pour ≤ 6 mois, 1 mois pour > 6 mois.

Rupture : aucune motivation requise. Délais de prévenance (L1221-25) : 24h (<8j), 48h (8j-1mois), 2 semaines (>1mois), 1 mois (>3mois de présence).`,
},
{
  id: "fr-working-time",
  title: "Durée du Travail — France",
  description: "35h/semaine légale. Heures supp: +25%/+50%. Forfait cadre 218j.",
  countries: ["France"],
  topic: "worksite",
  icon: "⏱️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3121-27", "Code du Travail L3121-64"],
  content: `Durée légale : 35h/semaine (L3121-27). Heures supplémentaires : +25% pour les 8 premières (36h-43h), +50% au-delà. Maximum : 10h/jour, 48h/semaine (44h sur 12 semaines).

Forfait cadre (L3121-64) : 218 jours/an maximum pour les cadres autonomes. Accord collectif requis. RTT définis dans l'accord Worldline (Syntec ou accord d'entreprise).`,
},

```

**Belgium (7 domains — same structure):**

```typescript
// ── DOMAIN 1: LEAVE ─────────────────────────────────────────
{
  id: "be-annual-leave",
  title: "Congé Annuel — Belgique",
  description: "20 jours légaux (4 semaines) pour temps plein 38h. Pécule double ~92% salaire mensuel.",
  countries: ["Belgium"],
  topic: "leave",
  icon: "🏖️",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 28 juin 1971 relative aux vacances annuelles", "Arrêté Royal du 30 mars 1967", "Loi 17 juillet 2023 (report maladie)"],
  content: `4 semaines (20 jours ouvrables) pour un CDI à temps plein 38h/semaine. Droits calculés sur l'année de référence N-1.

Pécule simple : salaire normal pendant le congé.
Pécule double (simple vacances) : ~92% du salaire mensuel brut, versé par l'employeur annuellement (généralement en mai/juin).

Pour les ouvriers : pécule géré par les Caisses de Vacances (paiement direct au travailleur).

Report en cas de maladie ou congé parental : désormais autorisé par la Loi du 17 juillet 2023 (transposition Dir. UE 2019/1158) — report possible jusqu'à 24 mois.`,
},
{
  id: "be-sick-leave",
  title: "Arrêt Maladie — Belgique",
  description: "Salaire garanti 30 jours (Art. 52 Loi 3 juillet 1978), puis indemnités INAMI.",
  countries: ["Belgium"],
  topic: "leave",
  icon: "🏥",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 3 juillet 1978, Art. 52-70", "Loi coordonnée 14 juillet 1994 (INAMI)"],
  content: `Phase 1 — Salaire Garanti (employés) : 30 premiers jours à charge de l'employeur, dès le 1er jour, sans délai de carence. Certificat médical requis dans les 2 jours ouvrables.

Pour les ouvriers : 7 jours garantis dès le 1er épisode à partir de la 2ème absence.

Phase 2 — INAMI (à partir du 31ème jour) :
- Incapacité primaire (an 1) : 60% du salaire plafonné via mutualité
- Invalidité (> 1 an) : 65% (isolé/chef de famille) ou 40% (cohabitant)

Prévoyance Worldline BE : complémentaire aux indemnités INAMI (niveau de remplacement défini dans le contrat de groupe).`,
},
{
  id: "be-holidays",
  title: "Jours Fériés — Belgique",
  description: "10 jours fériés nationaux légaux. Jour de remplacement si férié = dimanche.",
  countries: ["Belgium"],
  topic: "leave",
  icon: "🗓️",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 4 janvier 1974 relative aux jours fériés"],
  content: `10 jours fériés nationaux : 1er jan, Lundi de Pâques, 1er mai, Ascension, Lundi de Pentecôte, 21 juillet, 15 août, 1er nov, 11 nov, 25 déc.

Si un férié tombe un dimanche ou jour non travaillé : un jour de remplacement est accordé, à fixer par accord employeur/délégués.

Tous les fériés sont rémunérés. Worldline Belgium octroie les 10 jours à tous les collaborateurs avec maintien de salaire.`,
},

// ── DOMAIN 2: MOBILITY ──────────────────────────────────────
{
  id: "be-mobility",
  title: "Mobilité Globale & Locale — Belgique",
  description: "Mutation interne, détachement UE/hors-UE, relocation et clause de mobilité.",
  countries: ["Belgium"],
  topic: "mobility",
  icon: "✈️",
  updatedAt: "2024-03-01",
  legalRefs: ["Loi du 3 juillet 1978 Art. 37 (mutation)", "Règlement UE 883/2004 (sécurité sociale)", "Directive 96/71/CE (détachement)"],
  content: `Mobilité interne : une clause de mobilité dans le contrat ou un avenant est nécessaire pour toute mutation géographique significative. Préavis raisonnable obligatoire.

Détachement international : pour missions > 3 mois hors Belgique, avenant de détachement précisant durée, maintien du contrat belge, conditions salariales et protection sociale (formulaire A1 pour UE).

Comment démarrer : contacter HR Mobility BE (hr-be@worldline.com) → dossier de mobilité → validation manager + Legal → avenant → brief destination → support relocation (budget selon politique interne — à confirmer avec RH).

Split payroll (missions longues) : possible selon la durée et le pays d'accueil — à analyser avec le Payroll Manager.`,
},

// ── DOMAIN 3: TAX ────────────────────────────────────────────
{
  id: "be-tax",
  title: "Fiscalité Locale — Belgique",
  description: "IPP, précompte professionnel, cotisations ONSS (13,07% salariales).",
  countries: ["Belgium"],
  topic: "tax",
  icon: "🧾",
  updatedAt: "2024-01-01",
  legalRefs: ["Code des Impôts sur les Revenus 1992 (CIR92)", "Loi du 27 juin 1969 (ONSS)"],
  content: `Impôt des Personnes Physiques (IPP) — Barème fédéral 2024 :
- 25% jusqu'à 15 200 €
- 40% de 15 200 € à 26 830 €
- 45% de 26 830 € à 46 440 €
- 50% au-delà de 46 440 €

+ additionnels communaux (5 à 9% de l'IPP de base selon commune).

Précompte professionnel : retenu mensuellement par l'employeur sur base des barèmes SPF Finances (rôle de l'employeur similaire au PAS français).

Cotisations ONSS salariales : 13,07% du salaire brut (sécurité sociale — pension, chômage, soins de santé, allocations familiales).

Avantages de toute nature (ATN) : voiture de société, GSM, PC privé imposés sur base forfaitaire (barèmes fixés annuellement par SPF Finances).`,
},

// ── DOMAIN 4: HEALTH INSURANCE ───────────────────────────────
{
  id: "be-health",
  title: "Assurance Santé & Hospitalisation — Belgique",
  description: "Assurance hospitalisation collective + mutualité légale INAMI. Couverture Worldline.",
  countries: ["Belgium"],
  topic: "health",
  icon: "🩺",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi coordonnée 14 juillet 1994 (assurance maladie-invalidité)", "Loi du 25 juin 1992 (assurances privées)"],
  content: `Mutualité légale (INAMI) : tout salarié belge est affilié à une mutualité de son choix (Mutualité Chrétienne, Solidaris, Partenamut, etc.). Elle rembourse une partie des soins de santé ambulatoires sur base des tarifs INAMI.

Assurance hospitalisation collective Worldline BE : couverture des frais hospitaliers (chambre individuelle ou double selon option), y compris honoraires médecins au-delà des tarifs INAMI, soins avant/après hospitalisation (30/60 jours selon police). Fournisseur : [à confirmer RH — ex. AG Insurance / DKV].

Assurance ambulatoire (option) : certains plans incluent dentaire et optique renforcés — vérifier avec HR Benefits BE.

Portabilité : maintien de la couverture hospitalisation possible après départ (conversion en police individuelle, sans questionnaire médical, dans les 30 jours suivant la fin du contrat).`,
},

// ── DOMAIN 5: PREMIUMS & BENEFITS ───────────────────────────
{
  id: "be-premiums",
  title: "Primes & Avantages — Belgique",
  description: "Chèques-repas, transport, participation bénéfices, pension complémentaire, prime home office.",
  countries: ["Belgium"],
  topic: "premiums",
  icon: "💶",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 22 avril 2012 (chèques-repas)", "Loi du 28 avril 2003 (pension complémentaire — LPC)", "CIR92 Art. 38 §1 19° (home working)"],
  content: `Chèques-repas (titres-repas) : valeur faciale 8€/jour prestés (limite exonération ONSS 2024 : 8€). Part patronale : 6,91€ max exonéré. Distribués via Edenred/Sodexo.

Intervention transport : remboursement abonnement train (100% SNCB 2e classe), ou forfait vélo 0,27€/km (exonéré ONSS jusqu'à 40km aller-retour). Voiture de société selon niveau de fonction (avantage de toute nature imposable).

Participation bénéfices / Prime collective : plan de bonus annuel Worldline selon objectifs collectifs et individuels. Participation aux bénéfices régie par la Loi du 22 mars 2001 (non soumise à ONSS si conditions remplies).

Pension complémentaire (2e pilier — LPC 2003) : plan de pension de groupe Worldline BE, cotisations employeur + éventuellement salariales, capital disponible à la pension légale. Rendement légal garanti minimum.

Actions Worldline : plan d'actionnariat salarié (même programme que FR) — conditions publiées lors de chaque ouverture.

Intervention home office : indemnité forfaitaire nette 151,70€/mois maximum (plafond ONSS 2024) pour les télétravailleurs structurels (> 5 jours/mois à domicile).`,
},

// ── DOMAIN 6: WORK SITE TERMS ───────────────────────────────
{
  id: "be-worksite",
  title: "Télétravail & Conditions de Travail — Belgique",
  description: "Accord collectif télétravail, 38h/semaine, flexibilité et droit à la déconnexion.",
  countries: ["Belgium"],
  topic: "worksite",
  icon: "🏠",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 5 mars 2017 (travail faisable et maniable)", "CCT n°85 (télétravail)", "Code du Bien-être au Travail"],
  content: `Durée du travail : 38h/semaine légale. Heures supplémentaires : +50% (semaine) ou +100% (dimanche/nuit). Contingent libre 143h/an.

Télétravail (CCT n°85 + accord Worldline BE) : jusqu'à 3 jours/semaine pour postes éligibles, avec accord écrit (avenant ou annexe au contrat). Matériel fourni par l'employeur.

Travail faisable (Loi 2017) : droit au crédit-temps (réduction de carrière), annualisation du temps de travail possible, travail de nuit et de week-end encadré par CCT sectorielle.

Droit à la déconnexion : obligation légale (depuis 2022) pour entreprises >20 salariés de définir une politique de déconnexion (accords ou charte interne Worldline BE).

On-site obligatoire : rôles spécifiques (salle serveurs, accueil physique) — précisé dans la description de fonction.`,
},

// ── DOMAIN 7: ONBOARDING / OFFBOARDING ──────────────────────
{
  id: "be-onboarding",
  title: "Onboarding & Offboarding — Belgique",
  description: "Intégration J1-J90, politique IT/PC, procédure de départ et solde de tout compte.",
  countries: ["Belgium"],
  topic: "onboarding",
  icon: "🚀",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 3 juillet 1978 Art. 37 (préavis)", "Loi 26 déc. 2013 (statut unique — délais de préavis)"],
  content: `Onboarding (J-1 à J+90) :
- J-1 : remise PC, création comptes (AD, M365, Slack, Jira, Workday, ServiceNow)
- J1 : Welcome Day Belgium — présentation RH, bien-être au travail, politique sécurité IT
- J7 : accès Worldline Academy + enregistrement à la pension complémentaire
- J30 : point d'étonnement manager
- J90 : bilan RH, confirmation période sans essai (statut unique)

Politique IT & PC :
- PC : Windows 11 standard. Exceptions (Mac) : validation IT Manager requise
- Logiciels : catalogue approuvé via ServiceNow. Installation hors catalogue → validation RSSI
- BYOD non autorisé. Accès VPN obligatoire en télétravail

Offboarding (Loi Statut Unique — délais de préavis depuis 2014) :
- Préavis calculé sur ancienneté totale (Art. 37/2 Loi 3 juillet 1978)
  Ex. : 1 sem. (0-3 mois), 3 sem. (3-6 mois), 6 sem. (6-9 mois)...
- Restitution matériel : PC, badge, GSM dans les 3 jours ouvrés suivant le départ
- Accès systèmes : révocation le jour du départ effectif
- Documents remis : certificat de travail + formulaire C4 (chômage) + attestation de pension
- Solde de tout compte : signé le dernier jour de présence ou sous 5 jours ouvrés`,
},
{
  id: "be-pay-transparency",
  title: "Pay Transparency — Belgique",
  description: "Égalité salariale (Loi 22 avril 2012) et EU Dir. 2023/970.",
  countries: ["Belgium"],
  topic: "compensation",
  icon: "⚖️",
  updatedAt: "2024-06-01",
  legalRefs: ["Loi du 22 avril 2012 visant à lutter contre l'écart salarial", "EU Directive 2023/970"],
  content: `Loi du 22 avril 2012 : entreprises ≥ 50 salariés → analyse bisannuelle de la structure des rémunérations par genre. Plan d'action si écarts injustifiés. Rapport annuel pour entreprises ≥ 100 salariés.

EU Dir. 2023/970 (transposition requise avant juin 2026) : droit individuel à l'information salariale, interdiction clauses de confidentialité sur salaires.

Contrôle : Institut pour l'Égalité des Femmes et des Hommes + Inspection sociale.`,
},
{
  id: "be-probation",
  title: "Période d'Essai — Belgique",
  description: "Abolie depuis le 1er janvier 2014 (Loi Statut Unique — Loi 26 déc. 2013).",
  countries: ["Belgium"],
  topic: "onboarding",
  icon: "📋",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 26 décembre 2013 concernant l'introduction d'un statut unique"],
  content: `Depuis le 1er janvier 2014, la période d'essai est supprimée pour les CDI. Tout contrat démarre sans période probatoire.

L'employeur peut mettre fin au contrat à tout moment en respectant les délais de préavis légaux (dès le 1er jour), calculés sur l'ancienneté totale.

Barème de préavis (extrait — Art. 37/2) :
- 0-3 mois : 1 semaine
- 3-6 mois : 3 semaines
- 6-9 mois : 6 semaines
- 9-12 mois : 7 semaines
- Par tranche de 6 mois supplémentaires : +1 semaine (jusqu'à 5 ans)
- Au-delà : +3 sem./année entamée`,
},

```
  title: "Pay Transparency — France",
  description: "Obligation d'égalité de rémunération et reporting sur l'écart salarial femmes-hommes.",
  countries: ["France"],
  topic: "compensation",
  icon: "⚖️",
  updatedAt: "2024-06-01",
  legalRefs: ["Code du Travail L3221-1 à L3221-7", "EU Directive 2023/970 (applicable from 2026)"],
  content: `L'article L3221-1 du Code du Travail pose le principe d'égalité de rémunération entre les femmes et les hommes pour un travail de valeur égale. L'employeur est tenu de supprimer les écarts de rémunération non justifiés (L3221-2).

La Directive européenne 2023/970 renforce ces obligations à compter de juin 2026 : les entreprises de plus de 100 salariés devront publier leur écart de rémunération et répondre aux demandes individuelles d'information salariale (art. 7 et 9 de la Directive).

Index Égalité Professionnelle : toute entreprise de plus de 50 salariés doit calculer et publier son index chaque année avant le 1er mars (décret 2019-15).`,
},
{
  id: "fr-holidays",
  title: "Jours Fériés — France",
  description: "11 jours fériés légaux selon le Code du Travail L3133-1.",
  countries: ["France"],
  topic: "leave",
  icon: "🗓️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3133-1"],
  content: `L'article L3133-1 du Code du Travail fixe la liste des 11 jours fériés légaux en France :

1. 1er janvier (Jour de l'An)
2. Lundi de Pâques
3. 1er mai (Fête du Travail) — seul jour férié chômé et payé de droit pour tous les salariés
4. 8 mai (Victoire 1945)
5. Ascension (jeudi, 40 jours après Pâques)
6. Lundi de Pentecôte
7. 14 juillet (Fête Nationale)
8. 15 août (Assomption)
9. 1er novembre (Toussaint)
10. 11 novembre (Armistice)
11. 25 décembre (Noël)

Le chômage des jours fériés (autres que le 1er mai) dépend de la convention collective applicable. Worldline applique le chômage de tous les jours fériés légaux.`,
},
{
  id: "fr-probation",
  title: "Période d'Essai — France",
  description: "Durées légales de la période d'essai selon L1221-19.",
  countries: ["France"],
  topic: "onboarding",
  icon: "📋",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1221-19", "Code du Travail L1221-20", "Code du Travail L1221-25"],
  content: `L'article L1221-19 du Code du Travail fixe les durées maximales de la période d'essai pour les CDI :

- Ouvriers et employés : 2 mois (renouvelable 1 fois → 4 mois max)
- Agents de maîtrise et techniciens : 3 mois (renouvelable 1 fois → 6 mois max)
- Cadres : 4 mois (renouvelable 1 fois → 8 mois max)

Le renouvellement n'est possible que si prévu par un accord de branche étendu (L1221-21).

Pour les CDD, la période d'essai est proportionnelle à la durée du contrat : 1 jour par semaine, dans la limite de 2 semaines pour les contrats ≤ 6 mois, et 1 mois pour les contrats > 6 mois (L1242-10).

Rupture pendant la période d'essai : aucune motivation requise, mais délais de prévenance obligatoires selon la durée de présence (L1221-25).`,
},
{
  id: "fr-annual-leave",
  title: "Congés Payés — France",
  description: "Droit à 5 semaines de congés payés annuels (L3141-3).",
  countries: ["France"],
  topic: "leave",
  icon: "🏖️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3141-3", "Code du Travail L3141-5"],
  content: `L'article L3141-3 du Code du Travail accorde à tout salarié un droit à congé payé de 2,5 jours ouvrables par mois de travail effectif, soit 30 jours ouvrables (5 semaines) pour une année complète.

Période de référence : du 1er juin de l'année N au 31 mai de l'année N+1 (sauf accord collectif différent).

Les congés acquis doivent être pris entre le 1er mai et le 31 octobre (période légale). Le congé principal (au moins 12 jours ouvrables consécutifs) doit être pris pendant cette période.

Report et monétisation : les congés non pris ne peuvent pas être payés en cours de contrat sauf dérogation légale (maladie longue durée). La Loi du 22 avril 2024 a étendu les droits à congés en cas d'arrêt maladie.`,
},
{
  id: "fr-working-time",
  title: "Durée du Travail — France",
  description: "Durée légale 35h/semaine, heures supplémentaires et forfait cadre (L3121-27).",
  countries: ["France"],
  topic: "remote-work",
  icon: "⏱️",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L3121-27", "Code du Travail L3121-22", "Code du Travail L3121-64"],
  content: `L'article L3121-27 fixe la durée légale de travail effectif à 35 heures par semaine civile.

Heures supplémentaires (L3121-28) : toute heure accomplie au-delà de 35h constitue une heure supplémentaire, majorée au minimum de :
- 25 % pour les 8 premières heures supplémentaires (36h-43h)
- 50 % au-delà

Durées maximales (L3121-18 et L3121-20) :
- 10 heures par jour
- 48 heures par semaine (ou 44h en moyenne sur 12 semaines)

Forfait annuel en jours (L3121-64) : les cadres autonomes peuvent être soumis à un forfait jours (218 jours/an maximum), permettant de ne pas appliquer les 35h. Un accord collectif est requis.

Chez Worldline France, les cadres au forfait bénéficient de jours de RTT conformément à la convention collective applicable (Syntec ou accord d'entreprise).`,
},
{
  id: "fr-sick-leave",
  title: "Arrêt Maladie — France",
  description: "Maintien de salaire 90 jours via subrogation et Sécurité Sociale.",
  countries: ["France"],
  topic: "benefits",
  icon: "🏥",
  updatedAt: "2024-01-01",
  legalRefs: ["Code du Travail L1226-1", "Convention Collective Syntec"],
  content: `L'article L1226-1 du Code du Travail prévoit le maintien de salaire en cas de maladie sous conditions d'ancienneté :

- Au moins 1 an d'ancienneté : droit au maintien du salaire
- Durée : jusqu'à 90 jours (selon la convention collective Syntec applicable à Worldline)

Mécanisme : l'employeur verse le salaire (subrogation) et récupère les indemnités journalières de la Sécurité Sociale (IJSS). Le salarié perçoit ainsi son salaire net habituel pendant la période de maintien.

Délai de carence Sécu : 3 jours de carence pour les IJSS (sauf accord d'entreprise supprimant la carence). Worldline supprime le délai de carence dès le 1er jour d'arrêt.

Au-delà des 90 jours, le salarié perçoit uniquement les IJSS + éventuellement une prévoyance complémentaire (contrat prévoyance Worldline).`,
},
```

**Belgium (6 policies):**

```typescript
{
  id: "be-pay-transparency",
  title: "Pay Transparency — Belgium",
  description: "Égalité salariale et transparence des rémunérations (Loi 22 avril 2012 + EU Dir. 2023/970).",
  countries: ["Belgium"],
  topic: "compensation",
  icon: "⚖️",
  updatedAt: "2024-06-01",
  legalRefs: ["Loi du 22 avril 2012 visant à lutter contre l'écart salarial", "EU Directive 2023/970 (applicable from 2026)"],
  content: `La Loi du 22 avril 2012 oblige les entreprises de plus de 50 salariés à analyser la structure des rémunérations selon le genre tous les deux ans. Un plan d'action doit être défini si des écarts injustifiés sont constatés.

Les entreprises de plus de 100 salariés doivent établir un rapport de rémunération annuel incluant les écarts moyens par catégorie de fonctions.

La Directive européenne 2023/970 (transposition requise en Belgique avant juin 2026) renforcera ces obligations : droit individuel à l'information salariale, interdiction des clauses de confidentialité sur les salaires, et obligation de reporting public.

Organes de contrôle : l'Institut pour l'Égalité des Femmes et des Hommes et l'Inspection sociale peuvent imposer des amendes en cas de non-conformité.`,
},
{
  id: "be-holidays",
  title: "Jours Fériés — Belgique",
  description: "10 jours fériés nationaux légaux.",
  countries: ["Belgium"],
  topic: "leave",
  icon: "🗓️",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 4 janvier 1974 relative aux jours fériés"],
  content: `La loi belge fixe 10 jours fériés nationaux :

1. 1er janvier (Jour de l'An)
2. Lundi de Pâques
3. 1er mai (Fête du Travail)
4. Ascension
5. Lundi de Pentecôte
6. 21 juillet (Fête Nationale belge)
7. 15 août (Assomption)
8. 1er novembre (Toussaint)
9. 11 novembre (Armistice)
10. 25 décembre (Noël)

Si un jour férié tombe un dimanche ou un jour habituellement non travaillé, un jour de remplacement est accordé, à fixer par accord entre l'employeur et les travailleurs (ou le délégué syndical).

Les jours fériés sont obligatoirement rémunérés. Worldline Belgium octroie les 10 jours fériés nationaux à l'ensemble des collaborateurs.`,
},
{
  id: "be-probation",
  title: "Période d'Essai — Belgique",
  description: "Période d'essai abolie depuis le 1er janvier 2014 (Loi 26 décembre 2013).",
  countries: ["Belgium"],
  topic: "onboarding",
  icon: "📋",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 26 décembre 2013 concernant l'introduction d'un statut unique"],
  content: `Depuis le 1er janvier 2014, la Loi du 26 décembre 2013 (dite « Loi Statut Unique ») a supprimé la période d'essai pour les contrats à durée indéterminée (CDI) en Belgique.

Avant 2014 : les ouvriers et employés bénéficiaient de périodes d'essai distinctes, sources d'inégalité de traitement.

Depuis 2014 : tout nouveau contrat CDI démarre sans période d'essai. L'employeur peut mettre fin au contrat à tout moment en respectant les délais de préavis légaux, qui démarrent dès le 1er jour de travail.

Délais de préavis (à titre d'exemple) :
- 1 semaine de préavis pour les 3 premiers mois
- 3 semaines par trimestre entamé jusqu'à 5 ans d'ancienneté
- (barème complet : Art. 37/2 de la Loi du 3 juillet 1978)

Exception : les contrats à durée déterminée (CDD) peuvent prévoir une clause de résiliation anticipée, dont les modalités sont encadrées par la loi.`,
},
{
  id: "be-annual-leave",
  title: "Congé Annuel — Belgique",
  description: "20 jours légaux de congé annuel (4 semaines) pour temps plein.",
  countries: ["Belgium"],
  topic: "leave",
  icon: "🏖️",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 28 juin 1971 relative aux vacances annuelles", "Arrêté Royal du 30 mars 1967"],
  content: `En Belgique, le régime légal des vacances annuelles prévoit 4 semaines de congé (20 jours ouvrables) pour un emploi à temps plein (38h/semaine).

Calcul des droits : les droits sont calculés sur base de l'année de référence (N-1). Un salarié ayant travaillé toute l'année N-1 acquiert 20 jours pour l'année N.

Pécule de vacances : les employés reçoivent un pécule simple (salaire normal pendant le congé) et un pécule double (supplément annuel de vacances, versé par l'employeur, correspondant approximativement à 92% du salaire mensuel brut). Pour les ouvriers, le pécule est géré par les Caisses de Vacances.

Obligation de prise : les congés doivent être pris dans l'année civile et ne peuvent pas être reportés (sauf arrêt maladie ou congé parental). Le report en cas de maladie a été étendu par la loi du 17 juillet 2023.`,
},
{
  id: "be-working-time",
  title: "Durée du Travail — Belgique",
  description: "38h/semaine légale, heures supplémentaires et flexibilité.",
  countries: ["Belgium"],
  topic: "remote-work",
  icon: "⏱️",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 16 mars 1971 sur le travail", "Loi du 5 mars 2017 concernant le travail faisable et maniable"],
  content: `La Loi du 16 mars 1971 fixe la durée normale de travail à 8 heures par jour et 38 heures par semaine (depuis la loi du 22 décembre 1989 qui a abaissé de 40h à 38h).

Heures supplémentaires : toute heure prestée au-delà de 9h/jour ou 40h/semaine est considérée comme heure supplémentaire (sursalaire de 50% ou 100% selon le moment — nuit, dimanche). Un contingent de 143h/an est autorisé sans accord collectif.

Loi Travail Faisable (2017) : introduit la possibilité d'un régime « +143h » annualisé, le télétravail occasionnel jusqu'à 3 jours/semaine, et des formules de travail flexible.

Chez Worldline Belgium : la durée contractuelle est de 38h/semaine. Des arrangements de travail hybride (2-3 jours télétravail) sont possibles selon accord de fonction.`,
},
{
  id: "be-sick-leave",
  title: "Arrêt Maladie — Belgique",
  description: "Salaire garanti 30 jours par l'employeur, puis indemnités INAMI.",
  countries: ["Belgium"],
  topic: "benefits",
  icon: "🏥",
  updatedAt: "2024-01-01",
  legalRefs: ["Loi du 3 juillet 1978 relative aux contrats de travail (Art. 52-70)", "Loi coordonnée du 14 juillet 1994 (assurance maladie-invalidité)"],
  content: `En Belgique, la protection en cas de maladie est organisée en deux phases :

Phase 1 — Salaire Garanti (Art. 52 de la Loi du 3 juillet 1978) :
L'employeur est tenu de verser le salaire normal pendant les 30 premiers jours d'incapacité de travail (pour les employés). Pour les ouvriers, la durée varie selon l'ancienneté (7 jours garantis dès le 1er jour pour les maladies à partir du 2ème épisode).

Pas de délai de carence : le salaire garanti est dû dès le 1er jour de maladie, à condition de respecter les formalités (certificat médical dans les 2 jours ouvrables).

Phase 2 — Indemnités INAMI (à partir du 31ème jour) :
L'INAMI (Institut National d'Assurance Maladie-Invalidité) prend le relais via les mutualités. Les indemnités représentent :
- 60% du salaire plafonné pendant la période d'incapacité primaire (1 an max)
- Passage en invalidité si l'incapacité dépasse 1 an (66% du salaire plafonné)

Assurance invalidité Worldline : un contrat de prévoyance collectif complète les indemnités INAMI pour atteindre un niveau de revenu supérieur.`,
},
```

**Step 4: Run type-check**

```bash
npm run type-check
```

Expected: No type errors (new fields are additive).

**Step 5: Commit**

```bash
git add lib/policies-data.ts
git commit -m "feat: replace generic policies with real FR/BE statutory references"
```

---

### Task 7: Update Policy Detail Page to Render Legal Content

**Files:**
- Modify: `app/(protected)/policies/[id]/page.tsx`

**Step 1: Read the current detail page**

Note how it renders the policy — likely shows icon, title, description, metadata fields.

**Step 2: Add `legalRefs` section**

After the existing metadata (country, topic, dates), add:

```tsx
{policy.legalRefs && policy.legalRefs.length > 0 && (
  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
    <h3 className="text-sm font-semibold text-slate-700 mb-2">Legal References</h3>
    <ul className="space-y-1">
      {policy.legalRefs.map((ref) => (
        <li key={ref} className="text-sm text-slate-600 flex items-start gap-2">
          <span className="text-slate-400 mt-0.5">•</span>
          <span>{ref}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

**Step 3: Add policy `content` body**

Render the full statutory text below the metadata block:

```tsx
{policy.content && (
  <div className="mt-6 prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
    {policy.content}
  </div>
)}
```

(`whitespace-pre-line` preserves the paragraph breaks in the hardcoded content strings.)

**Step 4: Run type-check**

```bash
npm run type-check
```

**Step 5: Commit**

```bash
git add "app/(protected)/policies/[id]/page.tsx"
git commit -m "feat: render legal refs and statutory content on policy detail page"
```

---

### Task 8: Create DB Seed Script for RAG

The chat's RAG needs the FR/BE policy text embedded and stored in PostgreSQL so the assistant can answer questions.

**Files:**
- Create: `scripts/seed-policies.ts`

**Step 1: Create the seed script**

```typescript
// scripts/seed-policies.ts
// Run with: npx ts-node --project tsconfig.json scripts/seed-policies.ts

import { Pool } from "pg";
import { generateEmbedding, formatEmbedding } from "../lib/rag/embeddings";
import { policies } from "../lib/policies-data";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing seeded policies
    await client.query(
      "DELETE FROM hr_documents WHERE uploaded_by = 'seed-script@worldline.com'"
    );

    for (const policy of policies) {
      const country = policy.countries[0] ?? "GLOBAL";

      // Insert document record
      const docResult = await client.query(
        `INSERT INTO hr_documents
           (title, description, file_name, file_type, country_codes, topic,
            language, policy_ref, status, chunk_count, uploaded_by)
         VALUES ($1, $2, $3, 'txt', $4, $5, $6, $7, 'ready', 1, 'seed-script@worldline.com')
         RETURNING id`,
        [
          policy.title,
          policy.description,
          `${policy.id}.txt`,
          [country],
          policy.topic,
          country === "France" ? "fr" : "nl",
          policy.legalRefs?.[0] ?? policy.id,
        ]
      );
      const docId = docResult.rows[0].id;

      // Generate embedding for the policy content
      const embedding = await generateEmbedding(
        `${policy.title}\n\n${policy.description}\n\n${policy.content}`
      );

      // Insert chunk
      await client.query(
        `INSERT INTO document_chunks
           (document_id, content, chunk_index, token_count, country_codes,
            topic, language, policy_ref, doc_title, embedding)
         VALUES ($1, $2, 0, $3, $4, $5, $6, $7, $8, $9::vector)`,
        [
          docId,
          policy.content,
          Math.ceil(policy.content.length / 4), // rough token estimate
          [country],
          policy.topic,
          country === "France" ? "fr" : "nl",
          policy.legalRefs?.[0] ?? policy.id,
          policy.title,
          formatEmbedding(embedding),
        ]
      );

      console.log(`✓ Seeded: ${policy.title}`);
    }

    await client.query("COMMIT");
    console.log("\nAll policies seeded successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
```

**Step 2: Ensure tsconfig allows ts-node execution**

Check `tsconfig.json` — confirm `"module"` is `"commonjs"` or add a `tsconfig.seed.json` override if needed.

**Step 3: Apply the DB migration first (if DB exists)**

```bash
psql $DATABASE_URL -f db/migrations/001-mistral-embeddings.sql
```

**Step 4: Run the seed script**

```bash
MISTRAL_API_KEY=your_key DATABASE_URL=your_db_url npx ts-node scripts/seed-policies.ts
```

Expected output:
```
✓ Seeded: Pay Transparency — France
✓ Seeded: Jours Fériés — France
... (12 lines total)
All policies seeded successfully.
```

**Step 5: Commit**

```bash
git add scripts/seed-policies.ts
git commit -m "feat: add seed script for FR/BE statutory policy RAG content"
```

---

### Task 9: Update Environment Variables

**Files:**
- Modify/Create: `.env.example` (if it exists, otherwise create it)
- Modify: `.env.local` (not committed — user updates manually)

**Step 1: Check if .env.example exists**

```bash
ls .env* 2>/dev/null || echo "no env files found"
```

**Step 2: Write .env.example**

```bash
# Required
NEXTAUTH_SECRET=your-secret-here            # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Database (PostgreSQL with pgvector)
DATABASE_URL=postgresql://user:password@localhost:5432/wlhrp

# Mistral AI (replaces both OpenAI and Anthropic)
MISTRAL_API_KEY=your-mistral-api-key

# Auth (shared demo password for all demo accounts)
AUTH_PASSWORD=demo1234

# Removed — no longer needed:
# AZURE_AD_CLIENT_ID
# AZURE_AD_CLIENT_SECRET
# AZURE_AD_TENANT_ID
# AZURE_AD_GROUP_HR_ADMIN
# AZURE_AD_GROUP_EXEC
# AZURE_AD_GROUP_HRBP
# AZURE_STORAGE_CONNECTION_STRING
# AZURE_STORAGE_CONTAINER_NAME
# OPENAI_API_KEY
# ANTHROPIC_API_KEY
```

**Step 3: Final type-check and lint**

```bash
npm run type-check && npm run lint
```

Expected: All passing.

**Step 4: Final commit**

```bash
git add .env.example
git commit -m "chore: update env vars — Mistral only, remove Azure/OpenAI"
```

---

## Verification Checklist

After completing all tasks, verify manually:

- [ ] `npm run dev` starts without errors
- [ ] `/login` — email/password form works for both demo users (alice.martin FR + jan.peeters BE)
- [ ] `/chat` — Mistral streams responses, citations from seeded policies appear
- [ ] `/policies` — shows ~22 policies, filter by "France" / "Belgium" works
- [ ] `/policies/fr-annual-leave` — legal refs section + statutory content renders
- [ ] `/policies/be-onboarding` — full IT onboarding content visible
- [ ] `/chat` — asking "How many vacation days do I have in Belgium?" returns correct answer with citation
- [ ] `/analytics`, `/jobs`, `/tools`, `/admin` — all return 404
- [ ] Sidebar shows only "HR Assistant" + "Policy Library"
- [ ] Policies filter topics: leave, mobility, tax, health, premiums, worksite, onboarding all work
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

---

## Environment Setup for New Developer

```bash
# 1. Clone and install
cd worldline-hr-portal
npm install

# 2. Set up env
cp .env.example .env.local
# Edit .env.local: set MISTRAL_API_KEY, DATABASE_URL, NEXTAUTH_SECRET

# 3. Set up database
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql $DATABASE_URL -f db/schema.sql

# 4. Seed policies
npx ts-node scripts/seed-policies.ts

# 5. Run
npm run dev
# → http://localhost:3000/login
```
