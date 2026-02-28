# LegiRH — Mistral Hackathon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fork the Worldline People Portal into "LegiRH" — a bilingual (FR/EN) AI legal HR assistant for France and Belgium, powered by Mistral AI with an in-memory vector store, for the Mistral Worldwide Hackathon.

**Architecture:** Copy the portal, strip it to Chat + Policies only, replace Anthropic→Mistral and OpenAI embeddings→mistral-embed via the existing OpenAI SDK (just change baseURL). Replace PostgreSQL/pgvector with a JSON-file vector store (pre-computed embeddings, cosine similarity in-process). Write real, sourced HR legal documents for FR and BE in both French and English.

**Tech Stack:** Next.js 14, Mistral API (open-mistral-nemo + mistral-embed), OpenAI SDK (compat layer), in-memory JSON vector store, NextAuth credentials, IBM Plex Sans/Mono fonts, SSE streaming.

**Budget:** ~€0.02 one-time embedding cost for ~30 chunks × 2 languages. Chat: ~€0.0005/query with open-mistral-nemo. €15 covers ~30,000 queries.

---

## Task 1: Copy & bootstrap the project

**Files:**
- Create: `C:\Users\jonat\Downloads\LegiRH\` (new project root)

**Step 1: Copy the portal**

```bash
cp -r "C:\Users\jonat\Downloads\WLHRP\worldline-hr-portal" "C:\Users\jonat\Downloads\LegiRH"
cd "C:\Users\jonat\Downloads\LegiRH"
rm -rf .next node_modules .git
```

**Step 2: Update package.json name**

In `package.json`, change:
```json
"name": "worldline-hr-portal"
```
to:
```json
"name": "legirh"
```

**Step 3: Create .env.local**

Create `C:\Users\jonat\Downloads\LegiRH\.env.local`:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
NEXTAUTH_SECRET=legirh-hackathon-secret-2025
NEXTAUTH_URL=http://localhost:3000
```
(No DATABASE_URL, no ANTHROPIC_API_KEY, no OPENAI_API_KEY, no AZURE_AD vars)

**Step 4: Install dependencies**

```bash
npm install
```

Expected: clean install, no errors.

---

## Task 2: Strip navigation — remove unused pages

**Files:**
- Delete: `app/(protected)/analytics/`
- Delete: `app/(protected)/jobs/`
- Delete: `app/(protected)/tools/`
- Delete: `app/(protected)/admin/`
- Delete: `app/api/jobs/`
- Delete: `lib/jobs-data.ts`
- Delete: `lib/live-jobs.ts`
- Delete: `lib/azure-storage.ts`
- Modify: `components/Sidebar.tsx`
- Modify: `app/(protected)/layout.tsx`

**Step 1: Delete unused page directories**

```bash
rm -rf "app/(protected)/analytics"
rm -rf "app/(protected)/jobs"
rm -rf "app/(protected)/tools"
rm -rf "app/(protected)/admin"
rm -rf "app/api/jobs"
rm -f lib/jobs-data.ts lib/live-jobs.ts lib/azure-storage.ts
```

**Step 2: Rewrite Sidebar.tsx**

Replace the full file content with:
```tsx
"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, FileText, LogOut, Scale } from "lucide-react";

const NAV_ITEMS = [
  { href: "/chat", Icon: MessageCircle, label: "Assistant RH / HR Assistant" },
  { href: "/policies", Icon: FileText, label: "Législation / Legislation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Scale size={18} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <div className="sidebar-logo-text">LegiRH</div>
          <div className="sidebar-logo-sub">FR · BE Legal HR Assistant</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ marginBottom: 20 }}>
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <item.Icon size={18} className="sidebar-nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-footer-btn"
        >
          <LogOut size={18} />
          <span>Se déconnecter / Sign out</span>
        </button>
      </div>
    </aside>
  );
}
```

**Step 3: Remove TutorialClient from layout**

In `app/(protected)/layout.tsx`, remove:
- `import TutorialClient from "@/components/TutorialClient";`
- `<TutorialClient />`

**Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: no import errors, sidebar shows only Chat + Policies.

---

## Task 3: Simplify authentication — credentials only

**Files:**
- Modify: `lib/auth.ts`
- Modify: `app/login/page.tsx`

**Step 1: Rewrite lib/auth.ts**

Remove Azure AD entirely. Add two demo users (France + Belgium), both work in production:

```typescript
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      country?: string;
      department?: string;
      jobTitle?: string;
      preferredLanguage?: string;
      portalRole?: "employee";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    country?: string;
    department?: string;
    jobTitle?: string;
    preferredLanguage?: string;
    portalRole?: "employee";
  }
}

const DEMO_USERS: Record<string, {
  id: string; name: string; email: string; password: string;
  country: string; department: string; jobTitle: string; preferredLanguage: string;
}> = {
  "alice.martin@legirh.eu": {
    id: "user-fr-1",
    name: "Alice Martin",
    email: "alice.martin@legirh.eu",
    password: "hackathon2025",
    country: "France",
    department: "Ressources Humaines",
    jobTitle: "HR Business Partner",
    preferredLanguage: "fr",
  },
  "jan.de.backer@legirh.eu": {
    id: "user-be-1",
    name: "Jan De Backer",
    email: "jan.de.backer@legirh.eu",
    password: "hackathon2025",
    country: "Belgium",
    department: "Human Resources",
    jobTitle: "HR Manager",
    preferredLanguage: "fr",
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "LegiRH",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toLowerCase().trim();
        const password = credentials?.password ?? "";
        const user = DEMO_USERS[email];
        if (!user || user.password !== password) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          department: user.department,
          jobTitle: user.jobTitle,
          preferredLanguage: user.preferredLanguage,
        } as Record<string, string>;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as Record<string, string>;
        token.country = u.country;
        token.department = u.department;
        token.jobTitle = u.jobTitle;
        token.preferredLanguage = u.preferredLanguage;
        token.portalRole = "employee";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.sub ?? "";
      session.user.country = token.country;
      session.user.department = token.department;
      session.user.jobTitle = token.jobTitle;
      session.user.preferredLanguage = token.preferredLanguage;
      session.user.portalRole = "employee";
      return session;
    },
  },

  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  debug: process.env.NODE_ENV === "development",
};
```

**Step 2: Update login page**

In `app/login/page.tsx`, update the credentials form to use `email` + `password` fields (remove persona dropdown). Update the UI copy to say "LegiRH" instead of Worldline. Add demo credential hints:

```tsx
{/* Demo credentials hint */}
<div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "var(--mint-10)", border: "1px solid rgba(70,190,170,0.2)" }}>
  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 6 }}>DEMO ACCOUNTS</div>
  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8 }}>
    🇫🇷 alice.martin@legirh.eu<br />
    🇧🇪 jan.de.backer@legirh.eu<br />
    <span style={{ color: "var(--text-muted)" }}>Password: hackathon2025</span>
  </div>
</div>
```

**Step 3: Verify login works**

```bash
npm run dev
```
Navigate to `http://localhost:3000/login`, sign in with `alice.martin@legirh.eu` / `hackathon2025`.
Expected: redirects to `/chat`.

---

## Task 4: Write HR legal documents — France

**Files:**
- Create: `lib/documents/fr/conges-payes.md`
- Create: `lib/documents/fr/jours-feries.md`
- Create: `lib/documents/fr/periode-essai.md`
- Create: `lib/documents/fr/transparence-salariale.md`
- Create: `lib/documents/fr/smic-salaire-minimum.md`
- Create: `lib/documents/fr/duree-travail.md`
- Create: `lib/documents/fr/conge-parental.md`
- Create: `lib/documents/fr/arret-maladie.md`

**Step 1: Create the directory**

```bash
mkdir -p lib/documents/fr lib/documents/be
```

**Step 2: Create `lib/documents/fr/conges-payes.md`**

```markdown
---
title: "Congés Payés — France / Paid Leave — France"
country: FR
topic: annual-leave
language: fr-en
source: "Code du Travail, Art. L3141-1 à L3141-33 — legifrance.gouv.fr"
effectiveDate: "2024-01-01"
---

# Congés Payés en France / Paid Annual Leave in France

## Droit au congé / Leave Entitlement

Tout salarié a droit à **2,5 jours ouvrables de congé** par mois de travail effectif chez le même employeur (Art. L3141-3 du Code du Travail).

Pour une année complète de travail, cela représente **30 jours ouvrables** soit **5 semaines** de congés payés.

Every employee is entitled to **2.5 working days of leave** per month of effective work with the same employer. For a full year, this amounts to **30 working days (5 weeks)** of paid annual leave.

## Calcul / Calculation

La période de référence légale est du **1er juin au 31 mai** (sauf accord d'entreprise prévoyant une autre période). Les congés acquis pendant cette période peuvent être pris à partir du 1er juin de l'année suivante.

The legal reference period runs from **1 June to 31 May**. Leave acquired during this period may be taken from 1 June of the following year.

## Rémunération / Pay During Leave

Le salarié perçoit une **indemnité de congés payés** calculée selon la méthode la plus favorable :
- **1/10 de la rémunération totale** perçue pendant la période de référence, ou
- Le **maintien du salaire** habituel

The employee receives whichever is more favourable: 1/10 of total remuneration during the reference period, or continuation of normal salary.

## Prise des congés / Taking Leave

- Les congés principaux (12 jours ouvrables consécutifs minimum) doivent être pris entre le **1er mai et le 31 octobre**.
- La **5ème semaine** peut être prise à tout moment de l'année.
- Le fractionnement au-delà de 12 jours ouvre droit à des jours supplémentaires de fractionnement.
- The main holiday (minimum 12 consecutive working days) must be taken between **1 May and 31 October**.

## Report / Carryover

Les congés payés non pris sont en principe perdus à la fin de la période. Toutefois, un accord d'entreprise peut autoriser le report sur une **Compte Épargne Temps (CET)**. Suite à la jurisprudence européenne (CJUE), les congés non pris pour cause de maladie peuvent être reportés jusqu'à **15 mois**.

Unused leave is generally forfeited at period end. European Court of Justice rulings allow leave untaken due to illness to be carried over up to 15 months.

## Source légale / Legal Source

- Code du Travail, Articles L3141-1 à L3141-33
- legifrance.gouv.fr
- Directive européenne 2003/88/CE concernant le temps de travail
```

**Step 3: Create `lib/documents/fr/jours-feries.md`**

```markdown
---
title: "Jours Fériés — France / Public Holidays — France"
country: FR
topic: public-holidays
language: fr-en
source: "Code du Travail Art. L3133-1 — legifrance.gouv.fr"
effectiveDate: "2024-01-01"
---

# Jours Fériés en France / Public Holidays in France

## Les 11 jours fériés légaux / The 11 Legal Public Holidays

Selon l'article L3133-1 du Code du Travail, les jours fériés légaux en France sont :

| Date | Jour Férié (FR) | Public Holiday (EN) |
|------|-----------------|---------------------|
| 1er janvier | Jour de l'An | New Year's Day |
| Lundi de Pâques | Lundi de Pâques | Easter Monday |
| 1er mai | Fête du Travail | Labour Day |
| 8 mai | Victoire 1945 | Victory in Europe Day |
| Jeudi de l'Ascension | Ascension | Ascension Day |
| Lundi de Pentecôte | Lundi de Pentecôte | Whit Monday |
| 14 juillet | Fête Nationale | Bastille Day |
| 15 août | Assomption | Assumption of Mary |
| 1er novembre | Toussaint | All Saints' Day |
| 11 novembre | Armistice 1918 | Armistice Day |
| 25 décembre | Noël | Christmas Day |

## Le 1er mai — Statut particulier / 1 May — Special Status

Le 1er mai est le seul jour férié **obligatoirement chômé et payé** pour tous les salariés (Art. L3133-4). Aucun accord d'entreprise ne peut y déroger.

1 May is the only public holiday that is **compulsorily non-working and paid** for all employees. No company agreement can override this.

## Jours fériés travaillés / Working on Public Holidays

Sauf le 1er mai, le travail les jours fériés est autorisé dans certains secteurs. Les modalités de récupération et de majoration dépendent de la convention collective applicable :
- En l'absence de disposition conventionnelle : **pas de majoration légale** (hors 1er mai)
- Beaucoup de conventions collectives prévoient une majoration de **100%**

For holidays other than 1 May, work is allowed in some sectors. Compensation depends on the applicable collective agreement.

## Alsace-Moselle (régime local)

Les salariés en Alsace et en Moselle bénéficient de **2 jours fériés supplémentaires** : le Vendredi Saint et le 26 décembre (2ème jour de Noël).

Employees in Alsace and Moselle have 2 additional public holidays: Good Friday and 26 December.

## Source légale / Legal Source

- Code du Travail, Articles L3133-1 à L3133-7
- legifrance.gouv.fr
```

**Step 4: Create `lib/documents/fr/periode-essai.md`**

```markdown
---
title: "Période d'Essai — France / Probation Period — France"
country: FR
topic: probation
language: fr-en
source: "Code du Travail Art. L1221-19 à L1221-25 — legifrance.gouv.fr"
effectiveDate: "2024-01-01"
---

# Période d'Essai en France / Probation Period in France

## Durées légales maximales / Maximum Legal Durations

La période d'essai n'est pas obligatoire. Si elle est prévue, les durées maximales légales (Art. L1221-19) sont :

| Catégorie | Durée initiale | Renouvellement | Durée totale max |
|-----------|---------------|----------------|-----------------|
| Ouvriers / Employés | 2 mois | 2 mois | 4 mois |
| Agents de maîtrise / Techniciens | 3 mois | 3 mois | 6 mois |
| Cadres | 4 mois | 4 mois | 8 mois |

The probation period is not mandatory. If included, maximum legal durations are: workers/employees 2+2 months, supervisors/technicians 3+3 months, executives 4+4 months.

## Renouvellement / Renewal

Le renouvellement n'est possible que si :
1. La convention collective le prévoit expressément
2. Le salarié a donné son accord **écrit** avant la fin de la période initiale

Renewal is only possible if the collective agreement provides for it and the employee gives written consent before the initial period ends.

## Rupture pendant la période d'essai / Termination During Probation

Pendant la période d'essai, chacune des parties peut rompre le contrat **sans motif** et sans indemnité de licenciement. Un délai de prévenance doit toutefois être respecté :

**Rupture par l'employeur :**
- < 8 jours de présence : 24 heures
- Entre 8 jours et 1 mois : 48 heures
- Entre 1 et 3 mois : 2 semaines
- Après 3 mois : 1 mois

**Rupture par le salarié :**
- < 8 jours : 24 heures
- Après 8 jours : 48 heures

During probation, either party may terminate without cause or severance pay, but must respect notice periods as above.

## Absence d'essai / No Probation Period

Il n'y a **aucune période d'essai automatique** en France. Elle doit être expressément stipulée dans le contrat de travail ou la lettre d'engagement.

There is no automatic probation period in France. It must be expressly stated in the employment contract.

## Source légale / Legal Source

- Code du Travail, Articles L1221-19 à L1221-25
- legifrance.gouv.fr
```

**Step 5: Create `lib/documents/fr/transparence-salariale.md`**

```markdown
---
title: "Transparence Salariale — France / Pay Transparency — France"
country: FR
topic: pay-transparency
language: fr-en
source: "Directive UE 2023/970 du 10 mai 2023 — Journal Officiel de l'UE"
effectiveDate: "2026-06-07"
---

# Transparence Salariale / Pay Transparency

## Directive Européenne 2023/970

La **Directive (UE) 2023/970** du Parlement européen et du Conseil du 10 mai 2023 vise à renforcer l'application du principe d'égalité de rémunération entre femmes et hommes.

The **EU Directive 2023/970** of 10 May 2023 aims to strengthen the application of equal pay between men and women.

## Calendrier de transposition / Transposition Timeline

Les États membres avaient jusqu'au **7 juin 2026** pour transposer la directive en droit national. La France prépare sa législation de transposition.

Member States had until **7 June 2026** to transpose the directive. France is preparing its transposition legislation.

## Obligations principales / Key Obligations

### Pour les candidats / For Job Candidates
- Droit à recevoir une **fourchette salariale** ou le salaire minimum avant l'entretien
- Interdiction pour l'employeur de demander l'**historique salarial** du candidat

Candidates have the right to receive a **salary range** before the interview. Employers are prohibited from asking about salary history.

### Pour les salariés / For Employees
- Droit de demander des informations sur les **niveaux de rémunération moyens** par catégorie de poste
- Droit à une réponse dans un délai de **2 mois**

Employees can request information on average pay levels per job category, with a 2-month response deadline.

### Obligations de reporting (Art. 9) / Reporting Obligations
| Taille d'entreprise | Fréquence |
|--------------------|-----------|
| > 250 salariés | Annuelle (dès 2027) |
| 150–249 salariés | Tous les 3 ans (dès 2031) |
| 100–149 salariés | Tous les 3 ans (dès 2031) |
| < 100 salariés | Non obligatoire |

### Écart de rémunération / Pay Gap Reporting
Si l'écart de rémunération entre femmes et hommes dépasse **5%** sans justification objective, l'employeur doit réaliser une **évaluation conjointe** avec les représentants des salariés.

If the gender pay gap exceeds 5% without objective justification, the employer must conduct a joint pay assessment with employee representatives.

## Index Égalité Professionnelle (existant)

En France, les entreprises de **50 salariés et plus** publient déjà chaque année leur **Index de l'Égalité Professionnelle** (note sur 100 points). Un score inférieur à 75 points impose des mesures correctives.

Companies with 50+ employees already publish an annual Professional Equality Index (score out of 100). A score below 75 requires corrective measures.

## Source légale / Legal Source

- Directive (UE) 2023/970 du 10 mai 2023 — JOUE L 132/21
- Index Égalité Professionnelle : Décret n° 2019-15 du 8 janvier 2019
- travail-emploi.gouv.fr
```

**Step 6: Create `lib/documents/fr/smic-salaire-minimum.md`**

```markdown
---
title: "SMIC — Salaire Minimum Interprofessionnel de Croissance / France Minimum Wage"
country: FR
topic: minimum-wage
language: fr-en
source: "Code du Travail Art. L3231-1 — Décret n°2024-1503 du 30 décembre 2024"
effectiveDate: "2025-01-01"
---

# SMIC — Salaire Minimum en France / Minimum Wage in France

## Montant au 1er janvier 2025 / Amount from 1 January 2025

- **SMIC horaire brut :** 11,88 € / heure
- **SMIC mensuel brut :** 1 801,80 € (base 35h/semaine, soit 151,67h/mois)
- **SMIC mensuel net :** environ 1 426 € (après déduction des cotisations salariales)

- **Gross hourly minimum wage:** €11.88/hour
- **Gross monthly minimum wage:** €1,801.80 (based on 35h/week, 151.67h/month)
- **Net monthly minimum wage:** approximately €1,426/month

## Revalorisation / Indexation

Le SMIC est revalorisé automatiquement lorsque l'**Indice des Prix à la Consommation (IPC)** augmente d'au moins **2%** par rapport au niveau de référence. Une revalorisation annuelle obligatoire a lieu chaque **1er janvier**.

The SMIC is automatically increased when the Consumer Price Index rises by at least 2% from its reference level. A mandatory annual increase occurs on 1 January each year.

## Historique récent / Recent History

| Date | SMIC horaire brut |
|------|------------------|
| 1er janvier 2025 | 11,88 € |
| 1er novembre 2024 | 11,88 € |
| 1er janvier 2024 | 11,65 € |
| 1er mai 2023 | 11,52 € |
| 1er janvier 2023 | 11,27 € |

## Salariés concernés / Applicable Employees

Tout salarié travaillant en France est protégé par le SMIC, quelle que soit la convention collective applicable. Aucune convention ne peut prévoir une rémunération inférieure au SMIC.

All employees working in France are protected by the minimum wage, regardless of their collective agreement. No agreement can provide for a lower remuneration.

## Source légale / Legal Source

- Code du Travail, Articles L3231-1 à L3232-5
- Décret n°2024-1503 du 30 décembre 2024 portant relèvement du SMIC
- travail-emploi.gouv.fr
```

**Step 7: Create `lib/documents/fr/duree-travail.md`**

```markdown
---
title: "Durée du Travail — France / Working Time — France"
country: FR
topic: working-time
language: fr-en
source: "Code du Travail Art. L3121-1 — legifrance.gouv.fr"
effectiveDate: "2024-01-01"
---

# Durée du Travail en France / Working Time in France

## Durée légale / Legal Working Time

La **durée légale du travail** est fixée à **35 heures par semaine** (Art. L3121-27 du Code du Travail).

The legal working time is set at **35 hours per week**.

## Heures supplémentaires / Overtime

Les heures effectuées au-delà de 35h sont des heures supplémentaires. Elles sont majorées :

| Heures supplémentaires | Majoration |
|------------------------|------------|
| 1ère à 8ème heure (36h à 43h) | **25%** |
| Au-delà de la 8ème heure (44h+) | **50%** |

Les heures supplémentaires peuvent aussi faire l'objet d'un **repos compensateur** (récupération) à la place d'une majoration salariale, si un accord d'entreprise le prévoit.

Overtime hours are compensated at 25% (hours 36-43) and 50% (44+), or may be replaced by equivalent compensatory rest.

## Durées maximales / Maximum Working Hours

- **Maximum quotidien :** 10 heures (peut être porté à 12h par accord collectif ou dérogation)
- **Maximum hebdomadaire :** 48 heures (sur une semaine isolée)
- **Maximum hebdomadaire moyen :** 44 heures sur 12 semaines consécutives
- **Maximum annuel d'heures supplémentaires (contingent) :** 220 heures (sauf accord différent)

- Daily maximum: 10 hours (extendable to 12h)
- Weekly maximum: 48 hours (single week)
- 12-week rolling average maximum: 44 hours
- Annual overtime quota: 220 hours

## Temps de repos / Rest Periods

- **Repos quotidien minimum :** 11 heures consécutives entre deux journées de travail
- **Repos hebdomadaire :** 35 heures consécutives minimum (24h + 11h quotidiennes)
- **Pause :** au moins 20 minutes après 6 heures de travail consécutif

- Minimum daily rest: 11 consecutive hours
- Weekly rest: 35 consecutive hours minimum
- Break: at least 20 minutes after 6 consecutive hours

## Conventions de forfait / Flat-Rate Agreements (Cadres)

Les cadres autonomes peuvent être soumis à une **convention de forfait en jours**, limitée à **218 jours par an** maximum. Ce régime déconnecte leur temps de travail du décompte horaire.

Autonomous executives may work under a "flat-rate in days" agreement, capped at 218 working days per year.

## Source légale / Legal Source

- Code du Travail, Articles L3121-1 à L3121-69
- legifrance.gouv.fr
```

**Step 8: Create `lib/documents/fr/conge-parental.md`**

```markdown
---
title: "Congé Parental — France / Parental Leave — France"
country: FR
topic: parental-leave
language: fr-en
source: "Code du Travail Art. L1225-1 — legifrance.gouv.fr / securite-sociale.fr"
effectiveDate: "2024-01-01"
---

# Congé Parental en France / Parental Leave in France

## Congé Maternité / Maternity Leave

### Durée / Duration
| Situation | Avant accouchement | Après accouchement | Total |
|-----------|-------------------|-------------------|-------|
| 1er ou 2ème enfant | 6 semaines | 10 semaines | **16 semaines** |
| 3ème enfant et + | 8 semaines | 18 semaines | **26 semaines** |
| Naissances multiples (jumeaux) | 12 semaines | 22 semaines | **34 semaines** |

### Indemnités / Pay
Indemnité journalière de la Sécurité Sociale (IJSS) : **100% du salaire net** plafonné à environ 3 428 € brut/mois (plafond mensuel de la Sécurité Sociale). L'employeur peut compléter selon la convention collective.

Maternity allowance from Social Security: 100% of net salary up to approximately €3,428 gross/month.

## Congé Paternité et d'Accueil / Paternity and Partner Leave

Depuis le **1er juillet 2021** : **25 jours calendaires** (32 jours pour naissances multiples).
- 4 jours obligatoires immédiatement après la naissance
- 21 jours restants à prendre dans les **6 mois** suivant la naissance

Since 1 July 2021: **25 calendar days** (32 for multiple births), with 4 mandatory days immediately after birth.

Indemnisé par la Sécurité Sociale à **100% du salaire net** (dans les mêmes limites que la maternité).

## Congé Parental d'Éducation / Parental Education Leave

Après la naissance ou l'adoption, chaque parent peut bénéficier d'un **congé parental d'éducation** :
- Durée : jusqu'aux **3 ans de l'enfant** (prises de congé par périodes de 6 mois renouvelables)
- Indemnisation : **PreParE** (Prestation Partagée d'Éducation de l'Enfant) versée par la CAF
  - Taux plein : 454,21 €/mois (si inactivité totale)
  - Taux partiel : selon quotité de travail

After birth or adoption, each parent may take parental education leave until the child turns 3, compensated by the CAF (family benefit fund) at ~€454/month.

## Source légale / Legal Source

- Code du Travail, Articles L1225-1 à L1225-28
- Code de la Sécurité Sociale, Articles L331-3 à L331-11
- ameli.fr / securite-sociale.fr / legifrance.gouv.fr
```

**Step 9: Create `lib/documents/fr/arret-maladie.md`**

```markdown
---
title: "Arrêt Maladie — France / Sick Leave — France"
country: FR
topic: sick-leave
language: fr-en
source: "Code du Travail Art. L1226-1 — Code de la Sécurité Sociale — ameli.fr"
effectiveDate: "2024-01-01"
---

# Arrêt Maladie en France / Sick Leave in France

## Démarches / Procedure

En cas de maladie, le salarié doit :
1. Consulter un médecin qui établit un **arrêt de travail**
2. Envoyer les volets 1 et 2 à sa **CPAM** sous 48 heures
3. Envoyer le volet 3 à son **employeur** sous 48 heures

The employee must obtain a medical certificate, send copies to their health insurance fund (CPAM) within 48h and to their employer within 48h.

## Délai de Carence / Waiting Period

**3 jours de carence** pour les arrêts maladie ordinaires : l'indemnité journalière de la Sécurité Sociale n'est versée qu'à partir du **4ème jour**.

**Exception :** Pas de carence en cas d'accident du travail, maladie professionnelle, affection de longue durée (ALD), ou maternité.

**3-day waiting period** applies before Social Security daily allowances are paid (day 4 onwards). No waiting period for work accidents or long-term illness.

## Indemnités Journalières de la Sécurité Sociale (IJSS)

- **Montant :** 50% du salaire journalier de base (limité à 1,8 SMIC)
- **Plafond :** 53,70 €/jour (2025)
- **Durée :** jusqu'à **360 jours** sur 3 ans consécutifs (maladie ordinaire) ou 3 ans par affection (ALD)

Social Security pays 50% of daily base salary (capped at €53.70/day in 2025), for up to 360 days over 3 years.

## Maintien de Salaire par l'Employeur (Art. L1226-1)

Après **1 an d'ancienneté**, l'employeur doit maintenir une partie du salaire pendant l'arrêt (déduction faite des IJSS) :

| Ancienneté | Maintien à 90% | Maintien à 66,66% |
|------------|---------------|-------------------|
| 1 à 5 ans | 30 jours | 30 jours |
| 6 à 10 ans | 40 jours | 40 jours |
| 11 à 15 ans | 50 jours | 50 jours |
| 16 à 20 ans | 60 jours | 60 jours |
| 21 ans et + | 70 jours | 70 jours |

After 1 year of seniority, the employer must supplement Social Security pay (90% then 66.67% of normal salary) for increasing durations based on seniority.

## Source légale / Legal Source

- Code du Travail, Articles L1226-1 à L1226-4
- Code de la Sécurité Sociale, Articles L313-1, L321-1
- ameli.fr
```

---

## Task 5: Write HR legal documents — Belgium

**Files:**
- Create: `lib/documents/be/conges-annuels.md`
- Create: `lib/documents/be/jours-feries.md`
- Create: `lib/documents/be/periode-essai.md`
- Create: `lib/documents/be/transparence-salariale.md`
- Create: `lib/documents/be/salaire-minimum.md`
- Create: `lib/documents/be/duree-travail.md`
- Create: `lib/documents/be/conge-parental.md`
- Create: `lib/documents/be/salaire-garanti-maladie.md`

**Step 1: Create `lib/documents/be/conges-annuels.md`**

```markdown
---
title: "Congés Annuels — Belgique / Annual Leave — Belgium"
country: BE
topic: annual-leave
language: fr-en
source: "Loi du 4 janvier 1974 relative aux jours fériés — emploi.belgique.be — onem.be"
effectiveDate: "2024-01-01"
---

# Congés Annuels en Belgique / Annual Leave in Belgium

## Droit légal / Legal Entitlement

En Belgique, le droit aux congés annuels est basé sur le travail effectué l'**année précédente** (année de référence). Pour une année complète de travail à temps plein :

- **20 jours légaux** (pour un régime de 5 jours/semaine)
- **24 jours** (pour un régime de 6 jours/semaine)

In Belgium, annual leave entitlement is based on work done in the **previous calendar year**. For a full year worked: **20 days** (5-day week) or 24 days (6-day week).

## Calcul / Calculation

**Formule (ouvriers) / Formula (workers):**
Jours de congé = (Jours de travail effectif en année N-1 / 312) × 24

**Employés / White-collar employees:**
Pour les employés, le calcul est similaire mais intègre les jours assimilés (maladie, chômage temporaire, crédit-temps, etc.).

For white-collar employees, the calculation also includes equivalent days (sick leave, temporary unemployment, time credit, etc.).

## Pécule de Vacances / Holiday Pay

Chaque travailleur perçoit un **double pécule de vacances** (prime de vacances) en plus de son salaire pendant les congés :

- **Simple pécule :** salaire normal pendant les jours de congé
- **Double pécule :** environ **92% d'un mois de salaire brut** (versé généralement en mai/juin)

Workers receive "double holiday pay": normal salary during leave days plus a holiday bonus of approximately 92% of one month's gross salary.

**Ouvriers :** le pécule est géré par la **caisse de vacances** (ONVA ou caisse sectorielle) et payé directement au travailleur.

**Employés :** le pécule est payé par l'employeur.

## Congé jeune travailleur / Youth Leave ("Jeunes travailleurs")

Les jeunes qui commencent à travailler avant d'avoir constitué un an de travail effectif peuvent prendre des **jours de congé jeune** pour compléter leurs droits. Ces jours sont payés par l'ONEM.

## Source légale / Legal Source

- Loi du 4 janvier 1974 relative aux jours fériés
- Loi sur les vacances annuelles des travailleurs (1971)
- Arrêté royal du 30 mars 1967
- emploi.belgique.be / onem.be
```

**Step 2: Create `lib/documents/be/jours-feries.md`**

```markdown
---
title: "Jours Fériés — Belgique / Public Holidays — Belgium"
country: BE
topic: public-holidays
language: fr-en
source: "Loi du 4 janvier 1974 — emploi.belgique.be"
effectiveDate: "2024-01-01"
---

# Jours Fériés en Belgique / Public Holidays in Belgium

## Les 10 jours fériés légaux / The 10 Legal Public Holidays

| Date | Jour Férié (FR) | Public Holiday (EN) |
|------|-----------------|---------------------|
| 1er janvier | Jour de l'An | New Year's Day |
| Lundi de Pâques | Lundi de Pâques | Easter Monday |
| 1er mai | Fête du Travail | Labour Day |
| Jeudi de l'Ascension | Ascension | Ascension Thursday |
| Lundi de Pentecôte | Lundi de Pentecôte | Whit Monday |
| 21 juillet | Fête Nationale | Belgian National Day |
| 15 août | Assomption | Assumption of Mary |
| 1er novembre | Toussaint | All Saints' Day |
| 11 novembre | Armistice | Armistice Day |
| 25 décembre | Noël | Christmas Day |

**Total : 10 jours fériés nationaux / Total: 10 national public holidays**

## Jours fériés régionaux / Regional Holidays

En plus des 10 jours fériés nationaux, chaque région a ses propres jours fériés :

- **Région wallonne :** 27 septembre (Fête de la Communauté française) — certains secteurs
- **Communauté germanophone :** 15 novembre (Fête du Roi, Fête de la Communauté germanophone)
- **Région flamande :** 11 juillet (Fête de la Communauté flamande)
- **Bruxelles-Capitale :** 27 septembre (Fête de la Communauté française)

Regional holidays vary: Wallonia (27 Sept), Flanders (11 July), German Community (15 Nov), Brussels (27 Sept).

## Travail un jour férié / Working on a Public Holiday

Si un salarié travaille un jour férié, il a droit à :
1. Un **salaire normal** pour la journée travaillée
2. Un **jour de repos compensatoire** à prendre dans les 6 semaines (salaire normal maintenu)

If an employee works on a public holiday, they receive normal pay plus a paid compensatory rest day within 6 weeks.

## Jour Férié Tombant le Weekend / Holiday Falling on Weekend

Si un jour férié tombe un dimanche ou un jour habituel d'inactivité, un **jour de remplacement** est accordé. Le remplacement peut être déterminé par convention collective ou accord entre l'employeur et les représentants du personnel.

If a holiday falls on a Sunday or regular non-working day, a replacement day must be granted.

## Source légale / Legal Source

- Loi du 4 janvier 1974 relative aux jours fériés
- Arrêté royal du 18 avril 1974
- emploi.belgique.be
```

**Step 3: Create `lib/documents/be/periode-essai.md`**

```markdown
---
title: "Période d'Essai — Belgique / Probation Period — Belgium"
country: BE
topic: probation
language: fr-en
source: "Loi du 26 décembre 2013 — Statut unique ouvriers-employés — emploi.belgique.be"
effectiveDate: "2014-01-01"
---

# Période d'Essai en Belgique / Probation Period in Belgium

## Suppression de la période d'essai / Abolition of Probation Period

**La période d'essai a été supprimée en Belgique depuis le 1er janvier 2014** dans le cadre de la réforme du statut unique ouvriers-employés (Loi du 26 décembre 2013).

**Probation periods were abolished in Belgium on 1 January 2014** as part of the unified worker-employee statute reform.

Il n'est donc **plus possible** de prévoir une période d'essai dans les contrats de travail à durée indéterminée (CDI) conclus depuis cette date.

It is no longer possible to include a probation period in open-ended employment contracts signed since that date.

## Préavis réduit en début de contrat / Short Notice Periods at Start of Contract

Bien que la période d'essai n'existe plus, la réforme a prévu des **délais de préavis réduits** en début de contrat pour permettre une certaine flexibilité :

| Période d'ancienneté | Préavis employeur | Préavis travailleur |
|---------------------|------------------|---------------------|
| 0 à 3 mois | **2 semaines** | 1 semaine |
| 3 à 6 mois | **4 semaines** | 2 semaines |
| 6 à 9 mois | **6 semaines** | 3 semaines |
| 9 à 12 mois | **7 semaines** | 3 semaines |

Although probation no longer exists, short notice periods apply in the first year: employer must give 2 weeks notice in the first 3 months, increasing progressively.

## Contrats à durée déterminée (CDD) / Fixed-Term Contracts

Pour les CDD, une clause d'essai reste possible dans des conditions strictes :
- Maximum **1 période d'essai** par travailleur par employeur (Art. 67, §1 loi 3 juillet 1978)
- Durée minimale : 7 jours civils
- Durée maximale : selon la durée du CDD

For fixed-term contracts, a trial clause remains possible with strict conditions.

## Travail Intérimaire / Temporary Work

Pour les travailleurs intérimaires, les 3 premiers jours de chaque mission constituent la **période d'essai** (sauf accord sectoriel différent).

For temporary workers, the first 3 days of each assignment constitute the trial period.

## Source légale / Legal Source

- Loi du 26 décembre 2013 concernant l'introduction d'un statut unique entre ouvriers et employés
- Loi du 3 juillet 1978 relative aux contrats de travail
- emploi.belgique.be / juridat.be
```

**Step 4: Create remaining Belgium documents**

Create `lib/documents/be/transparence-salariale.md`:
- Same EU Directive 2023/970 content as FR, adapted for Belgium
- Add: Loi du 22 avril 2012 visant à lutter contre l'écart salarial entre hommes et femmes
- Belgium transposition deadline: 7 juin 2026
- Institute for Equality of Women and Men (IEFH) role

Create `lib/documents/be/salaire-minimum.md`:
- RMMMG (Revenu minimum mensuel moyen garanti): **€2,070.48/mois brut** (janvier 2025)
- Conditions: 18 ans et plus, 6 mois d'ancienneté
- Montants progressifs selon âge (18 ans: €1,885.86, moins de 18 ans: barèmes spéciaux)
- Source: CNT/NAR — Accord interprofessionnel

Create `lib/documents/be/duree-travail.md`:
- Durée légale: **38 heures/semaine** (Loi du 16 mars 1971)
- Heures supplémentaires: majorées de 50% (100% les dimanches et jours fériés)
- Durée maximale: 11h/jour, 50h/semaine
- Repos quotidien: 11 heures consécutives

Create `lib/documents/be/conge-parental.md`:
- Congé maternité: **15 semaines** (7 avant + 8 après obligatoires), possibilité d'étendre à 17 semaines
- Congé paternité (congé de naissance): **20 jours calendaires** dans les 4 mois suivant la naissance (indemnisé à 82% par la mutuelle)
- Congé parental: 4 mois (temps plein), 8 mois (mi-temps), ou 20 mois (1/5 temps)

Create `lib/documents/be/salaire-garanti-maladie.md`:
- Salaire garanti : **30 jours** à 100% du salaire (employés) ou salaire garanti semaine/mois (ouvriers)
- Pas de délai de carence pour les employés
- Ensuite: indemnités de la mutuelle (60% du salaire plafonné)

---

## Task 6: Replace embeddings with Mistral

**Files:**
- Modify: `lib/rag/embeddings.ts`

**Step 1: Rewrite lib/rag/embeddings.ts**

Replace the full file:
```typescript
import OpenAI from "openai";

// Mistral embeddings via OpenAI-compatible API
// Model: mistral-embed — 1024 dimensions
// Cost: €0.1/1M tokens

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY!,
  baseURL: "https://api.mistral.ai/v1",
});

const EMBEDDING_MODEL = "mistral-embed";
export const EMBEDDING_DIMENSIONS = 1024;

export async function generateEmbedding(text: string): Promise<number[]> {
  // mistral-embed max input: ~8192 tokens (~32K chars)
  const truncated = text.slice(0, 30000);

  const response = await mistral.embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncated,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.slice(0, 30000));

    const response = await mistral.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Results are returned in order
    results.push(...response.data.map((d) => d.embedding));

    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
}
```

---

## Task 7: Build in-memory JSON vector store

**Files:**
- Create: `lib/rag/jsonVectorStore.ts`
- Modify: `lib/rag/vectorSearch.ts`
- Create: `data/vectors.json` (empty initially, populated by seed script)

**Step 1: Create `lib/rag/jsonVectorStore.ts`**

```typescript
import path from "path";
import fs from "fs";

export interface VectorEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    docTitle: string;
    country: string;       // "FR" | "BE" | "BOTH"
    topic: string;
    source: string;
    language: string;
    effectiveDate: string;
  };
}

// Load vectors.json once at startup
let _store: VectorEntry[] | null = null;

export function loadVectorStore(): VectorEntry[] {
  if (_store) return _store;

  const vectorPath = path.join(process.cwd(), "data", "vectors.json");

  if (!fs.existsSync(vectorPath)) {
    console.warn("[VectorStore] data/vectors.json not found — run: npx tsx scripts/seed-vectors.ts");
    return (_store = []);
  }

  try {
    _store = JSON.parse(fs.readFileSync(vectorPath, "utf-8")) as VectorEntry[];
    console.log(`[VectorStore] Loaded ${_store.length} vectors from data/vectors.json`);
    return _store;
  } catch (err) {
    console.error("[VectorStore] Failed to parse vectors.json:", err);
    return (_store = []);
  }
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Search the vector store
export function searchVectors(
  queryEmbedding: number[],
  options: { country: string; topK?: number; threshold?: number }
): Array<VectorEntry & { similarity: number }> {
  const { country, topK = 6, threshold = 0.6 } = options;
  const store = loadVectorStore();

  // Filter by country (BOTH means applies to FR and BE)
  const filtered = store.filter(
    (e) => e.metadata.country === country || e.metadata.country === "BOTH"
  );

  // Score all entries
  const scored = filtered.map((entry) => ({
    ...entry,
    similarity: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  // Sort by similarity descending, apply threshold, take topK
  return scored
    .filter((e) => e.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
```

**Step 2: Rewrite `lib/rag/vectorSearch.ts`**

```typescript
import { generateEmbedding } from "./embeddings";
import { searchVectors } from "./jsonVectorStore";

export interface SearchResult {
  id: string;
  content: string;
  docTitle: string;
  policyRef: string | null;
  countryCodes: string[];
  topic: string | null;
  effectiveDate: string | null;
  similarity: number;
}

export interface SearchOptions {
  country: string;
  topK?: number;
  threshold?: number;
  topic?: string;
}

export async function searchDocuments(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const { country, topK = 6, threshold = 0.6, topic } = options;

  const embedding = await generateEmbedding(query);

  let results = searchVectors(embedding, { country, topK, threshold });

  if (topic) {
    const topicFiltered = results.filter((r) => r.metadata.topic === topic);
    if (topicFiltered.length > 0) results = topicFiltered;
  }

  return results.map((r) => ({
    id: r.id,
    content: r.content,
    docTitle: r.metadata.docTitle,
    policyRef: null,
    countryCodes: [r.metadata.country],
    topic: r.metadata.topic,
    effectiveDate: r.metadata.effectiveDate || null,
    similarity: r.similarity,
  }));
}

export function buildContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) {
    return "No relevant legal HR documents found for this query.";
  }
  return chunks
    .map((chunk, i) => {
      const meta = [
        `Document: ${chunk.docTitle}`,
        chunk.effectiveDate
          ? `Effective: ${new Date(chunk.effectiveDate).toLocaleDateString("fr-BE", { month: "long", year: "numeric" })}`
          : null,
        `Countries: ${chunk.countryCodes.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" | ");
      return `[Context ${i + 1}] ${meta}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

export interface Citation {
  chunkId: string;
  docTitle: string;
  policyRef: string | null;
  effectiveDate: string | null;
}

export function buildCitations(chunks: SearchResult[]): Citation[] {
  const seen = new Set<string>();
  return chunks
    .filter((c) => { if (seen.has(c.docTitle)) return false; seen.add(c.docTitle); return true; })
    .map((c) => ({ chunkId: c.id, docTitle: c.docTitle, policyRef: null, effectiveDate: c.effectiveDate }));
}
```

**Step 3: Create `data/` directory and empty vectors.json**

```bash
mkdir -p data
echo "[]" > data/vectors.json
```

---

## Task 8: Create the seed script

**Files:**
- Create: `scripts/seed-vectors.ts`

**Step 1: Create `scripts/seed-vectors.ts`**

```typescript
/**
 * Seed script — run once to embed HR legal documents into vectors.json
 * Usage: npx tsx scripts/seed-vectors.ts
 *
 * Requirements:
 * - MISTRAL_API_KEY must be set in .env.local
 * - lib/documents/fr/ and lib/documents/be/ must contain .md files
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

if (!process.env.MISTRAL_API_KEY) {
  console.error("ERROR: MISTRAL_API_KEY not set in .env.local");
  process.exit(1);
}

import OpenAI from "openai";

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

interface FrontMatter {
  title: string;
  country: string;
  topic: string;
  language: string;
  source: string;
  effectiveDate: string;
}

function parseFrontMatter(content: string): { meta: FrontMatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("No front matter found");

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...val] = line.split(":");
    if (key && val.length) meta[key.trim()] = val.join(":").trim().replace(/^"|"$/g, "");
  }

  return {
    meta: meta as unknown as FrontMatter,
    body: match[2].trim(),
  };
}

function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const sentences = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + "\n\n" + sentence).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(" ");
      current = words.slice(-Math.floor(overlap / 5)).join(" ") + "\n\n" + sentence;
    } else {
      current = current ? current + "\n\n" + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

async function main() {
  const docDirs = [
    { dir: path.join(process.cwd(), "lib/documents/fr"), country: "FR" },
    { dir: path.join(process.cwd(), "lib/documents/be"), country: "BE" },
  ];

  const vectors: object[] = [];
  let totalChunks = 0;

  for (const { dir, country } of docDirs) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    console.log(`\nProcessing ${files.length} documents for ${country}...`);

    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      const { meta, body } = parseFrontMatter(content);
      const chunks = chunkText(body);

      console.log(`  ${file}: ${chunks.length} chunks`);

      // Embed in batches of 10
      const BATCH = 10;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const embeddings = await embedBatch(batch);

        for (let j = 0; j < batch.length; j++) {
          vectors.push({
            id: `${country.toLowerCase()}-${path.basename(file, ".md")}-${i + j}`,
            content: batch[j],
            embedding: embeddings[j],
            metadata: {
              docTitle: meta.title,
              country: meta.country || country,
              topic: meta.topic,
              language: meta.language,
              source: meta.source,
              effectiveDate: meta.effectiveDate || "",
            },
          });
        }

        totalChunks += batch.length;

        // Rate limit: small delay between batches
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  const outputPath = path.join(process.cwd(), "data", "vectors.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(vectors, null, 2));

  console.log(`\n✓ Done! Embedded ${totalChunks} chunks from ${vectors.length > 0 ? "all" : "0"} documents`);
  console.log(`✓ Saved to: ${outputPath}`);
  console.log(`\nEstimated cost: ~€${((totalChunks * 200) / 1_000_000 * 0.1).toFixed(4)} (at €0.1/1M tokens)`);
}

main().catch(console.error);
```

**Step 2: Add tsx to dev dependencies**

```bash
npm install --save-dev tsx dotenv
```

**Step 3: Run the seed script**

```bash
npx tsx scripts/seed-vectors.ts
```

Expected output:
```
Processing 8 documents for FR...
  conges-payes.md: 4 chunks
  jours-feries.md: 2 chunks
  ...
Processing 8 documents for BE...
  ...
✓ Done! Embedded ~45 chunks
✓ Saved to: .../data/vectors.json
Estimated cost: ~€0.0009
```

---

## Task 9: Replace Anthropic with Mistral in chat API

**Files:**
- Modify: `app/api/chat/route.ts`
- Modify: `lib/rag/systemPrompt.ts`

**Step 1: Rewrite `app/api/chat/route.ts`**

Replace the full file:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import OpenAI from "openai";

interface ChatRequest {
  message: string;
  sessionId?: string;
}

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

function createSSEStream(handler: (send: (data: object) => void) => Promise<void>) {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* closed */ }
      };
      try {
        await handler(send);
      } catch (error) {
        send({ type: "error", message: error instanceof Error ? error.message : "Unexpected error" });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body: ChatRequest = await req.json();
  const { message } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const country = session.user.country ?? "FR";

  return createSSEStream(async (send) => {
    const [
      { searchDocuments, buildContext, buildCitations },
      { buildSystemPrompt },
    ] = await Promise.all([
      import("@/lib/rag/vectorSearch"),
      import("@/lib/rag/systemPrompt"),
    ]);

    send({ type: "status", message: "Recherche dans les documents juridiques…" });

    const chunks = await searchDocuments(message, { country, topK: 6, threshold: 0.6 });
    const context = buildContext(chunks);
    const citations = buildCitations(chunks);
    const systemPrompt = buildSystemPrompt(session, context);

    send({ type: "status", message: "Génération de la réponse…" });

    const stream = await mistral.chat.completions.create({
      model: "open-mistral-nemo",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) send({ type: "text", text });
    }

    send({ type: "citations", citations });
    send({ type: "done", sessionId: null });
  });
}
```

**Step 2: Rewrite `lib/rag/systemPrompt.ts`**

```typescript
import type { Session } from "next-auth";

export function buildSystemPrompt(session: Session, retrievedContext: string): string {
  const user = session.user;
  const country = user.country ?? "France";
  const language = user.preferredLanguage ?? "fr";
  const today = new Date().toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });

  const langInstruction = language === "fr"
    ? "Réponds principalement en français, mais tu peux utiliser l'anglais pour les termes techniques si nécessaire."
    : "Answer primarily in English, but French legal terms may be used where appropriate.";

  return `You are LegiRH — an AI legal HR assistant specialized in French and Belgian employment law.

## Your Identity
- You are an AI assistant trained on official French and Belgian HR legal documents
- You cover: France (Code du Travail) and Belgium (Loi du 26 décembre 2013, statut unique)
- You are NOT a lawyer — you provide informational guidance only, not legal advice
- Tone: precise, professional, helpful — like a knowledgeable HR colleague

## User Context
- Name: ${user.name ?? "Unknown"}
- Country: ${country}
- Department: ${user.department ?? "HR"}
- Today: ${today}
- Language preference: ${language === "fr" ? "Français" : "English"}

## Language Instruction
${langInstruction}

## Retrieved Legal Documents
The following excerpts are from official legal texts applicable to **${country}**:

---
${retrievedContext}
---

## Response Guidelines

**DO:**
- Base your answer strictly on the retrieved documents
- Cite specific articles (e.g., "Art. L3141-3 du Code du Travail") and exact figures
- Distinguish between French and Belgian law clearly
- Structure long answers with headers and tables
- Cite the source document at the end

**DON'T:**
- Invent or extrapolate legal details not in the documents
- Give personal legal advice or make binding statements
- Answer questions unrelated to HR and employment law

**When no document covers the question:**
Say: "Je n'ai pas de document juridique couvrant ce point précis pour ${country}. Je vous recommande de consulter un juriste spécialisé en droit social ou de contacter l'inspection du travail."

**Citation format:**
End every answer with:
📄 *Source: [Document Title] — [Legal Article if available]*

## Legal Disclaimer
LegiRH est un assistant IA. Les informations fournies sont à titre informatif uniquement. Pour toute décision juridique, consultez un avocat spécialisé en droit du travail.
`;
}
```

---

## Task 10: Update the Policies page

**Files:**
- Modify: `lib/policies-data.ts`
- Modify: `app/(protected)/policies/page.tsx`
- Modify: `app/(protected)/policies/[id]/page.tsx`

**Step 1: Replace mock policies with real document metadata in `lib/policies-data.ts`**

Replace the POLICIES array with entries matching the real documents:
```typescript
export interface Policy {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  topic: string;
  countries: string[];
  updated: string;
  icon: string;
  ring: string;
  source: string;
  sourceUrl: string;
}

export const POLICIES: Policy[] = [
  {
    id: "fr-conges-payes", title: "Congés Payés", titleEn: "Paid Annual Leave",
    desc: "5 semaines légales (30 jours ouvrables). Calcul, prise de congés, pécule et report selon le Code du Travail.",
    topic: "Congés", countries: ["France"], updated: "2025-01-01",
    icon: "🏖️", ring: "linear-gradient(135deg, rgba(70,190,170,0.3), rgba(65,180,210,0.2))",
    source: "Code du Travail, Art. L3141-1", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-jours-feries", title: "Jours Fériés France", titleEn: "French Public Holidays",
    desc: "11 jours fériés légaux. Statut particulier du 1er mai, dispositions Alsace-Moselle.",
    topic: "Jours fériés", countries: ["France"], updated: "2024-01-01",
    icon: "🎉", ring: "linear-gradient(135deg, rgba(251,146,60,0.3), rgba(253,200,48,0.2))",
    source: "Code du Travail, Art. L3133-1", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-periode-essai", title: "Période d'Essai France", titleEn: "Probation Period France",
    desc: "Durées maximales légales selon catégorie (2 à 4 mois cadres). Renouvellement et rupture.",
    topic: "Contrat", countries: ["France"], updated: "2024-01-01",
    icon: "📋", ring: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(255,107,138,0.2))",
    source: "Code du Travail, Art. L1221-19", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-smic", title: "SMIC 2025", titleEn: "French Minimum Wage 2025",
    desc: "€11,88/heure brut — €1 801,80/mois brut au 1er janvier 2025.",
    topic: "Rémunération", countries: ["France"], updated: "2025-01-01",
    icon: "💶", ring: "linear-gradient(135deg, rgba(92,224,200,0.3), rgba(70,190,170,0.2))",
    source: "Décret n°2024-1503 du 30 décembre 2024", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-transparence", title: "Transparence Salariale France", titleEn: "Pay Transparency France",
    desc: "Directive UE 2023/970 : obligations de reporting salarial et index égalité professionnelle.",
    topic: "Rémunération", countries: ["France"], updated: "2026-06-07",
    icon: "⚖️", ring: "linear-gradient(135deg, rgba(65,180,210,0.3), rgba(70,190,170,0.2))",
    source: "Directive (UE) 2023/970", sourceUrl: "https://eur-lex.europa.eu",
  },
  {
    id: "fr-duree-travail", title: "Durée du Travail France", titleEn: "Working Time France",
    desc: "35h légales. Heures supplémentaires (+25%/+50%). Durées maximales et repos obligatoires.",
    topic: "Temps de travail", countries: ["France"], updated: "2024-01-01",
    icon: "⏱️", ring: "linear-gradient(135deg, rgba(251,146,60,0.25), rgba(253,200,48,0.15))",
    source: "Code du Travail, Art. L3121-27", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-conge-parental", title: "Congé Parental France", titleEn: "Parental Leave France",
    desc: "Maternité 16 semaines. Paternité 25 jours. Congé parental d'éducation jusqu'aux 3 ans.",
    topic: "Congés", countries: ["France"], updated: "2024-07-01",
    icon: "👶", ring: "linear-gradient(135deg, rgba(255,107,138,0.25), rgba(167,139,250,0.2))",
    source: "Code du Travail, Art. L1225-1", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "fr-arret-maladie", title: "Arrêt Maladie France", titleEn: "Sick Leave France",
    desc: "3 jours de carence. IJSS à 50%. Maintien de salaire par l'employeur selon ancienneté.",
    topic: "Santé", countries: ["France"], updated: "2024-01-01",
    icon: "🏥", ring: "linear-gradient(135deg, rgba(70,190,170,0.25), rgba(65,180,210,0.15))",
    source: "Code du Travail, Art. L1226-1", sourceUrl: "https://www.legifrance.gouv.fr",
  },
  {
    id: "be-conges-annuels", title: "Congés Annuels Belgique", titleEn: "Annual Leave Belgium",
    desc: "20 jours légaux. Calcul sur année de référence précédente. Double pécule de vacances.",
    topic: "Congés", countries: ["Belgium"], updated: "2024-01-01",
    icon: "🏖️", ring: "linear-gradient(135deg, rgba(70,190,170,0.3), rgba(65,180,210,0.2))",
    source: "Loi vacances annuelles 1971 — onem.be", sourceUrl: "https://www.onem.be",
  },
  {
    id: "be-jours-feries", title: "Jours Fériés Belgique", titleEn: "Belgian Public Holidays",
    desc: "10 jours fériés nationaux + jours régionaux. Jour de remplacement si week-end.",
    topic: "Jours fériés", countries: ["Belgium"], updated: "2024-01-01",
    icon: "🎉", ring: "linear-gradient(135deg, rgba(251,146,60,0.3), rgba(253,200,48,0.2))",
    source: "Loi du 4 janvier 1974 — emploi.belgique.be", sourceUrl: "https://emploi.belgique.be",
  },
  {
    id: "be-periode-essai", title: "Période d'Essai Belgique", titleEn: "Probation Period Belgium",
    desc: "Supprimée depuis le 1er janvier 2014 (Loi statut unique). Préavis réduits en début de contrat.",
    topic: "Contrat", countries: ["Belgium"], updated: "2014-01-01",
    icon: "📋", ring: "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(255,107,138,0.2))",
    source: "Loi du 26 décembre 2013 — emploi.belgique.be", sourceUrl: "https://emploi.belgique.be",
  },
  {
    id: "be-salaire-minimum", title: "Salaire Minimum Belgique", titleEn: "Belgium Minimum Wage",
    desc: "RMMMG : €2 070,48/mois brut (janvier 2025). Conditions d'âge et ancienneté.",
    topic: "Rémunération", countries: ["Belgium"], updated: "2025-01-01",
    icon: "💶", ring: "linear-gradient(135deg, rgba(92,224,200,0.3), rgba(70,190,170,0.2))",
    source: "CNT — Accord interprofessionnel", sourceUrl: "https://cnt-nar.be",
  },
  {
    id: "be-transparence", title: "Transparence Salariale Belgique", titleEn: "Pay Transparency Belgium",
    desc: "Directive UE 2023/970 et Loi du 22 avril 2012 sur l'écart salarial hommes-femmes.",
    topic: "Rémunération", countries: ["Belgium"], updated: "2026-06-07",
    icon: "⚖️", ring: "linear-gradient(135deg, rgba(65,180,210,0.3), rgba(70,190,170,0.2))",
    source: "Directive (UE) 2023/970 — IEFH", sourceUrl: "https://igvm-iefh.belgium.be",
  },
  {
    id: "be-duree-travail", title: "Durée du Travail Belgique", titleEn: "Working Time Belgium",
    desc: "38h/semaine légale. Heures supplémentaires (+50%, +100% weekend). Maxima quotidiens.",
    topic: "Temps de travail", countries: ["Belgium"], updated: "2024-01-01",
    icon: "⏱️", ring: "linear-gradient(135deg, rgba(251,146,60,0.25), rgba(253,200,48,0.15))",
    source: "Loi du 16 mars 1971 — emploi.belgique.be", sourceUrl: "https://emploi.belgique.be",
  },
  {
    id: "be-conge-parental", title: "Congé Parental Belgique", titleEn: "Parental Leave Belgium",
    desc: "Maternité 15 semaines. Paternité 20 jours (82% indemnisé). Crédit-temps parental.",
    topic: "Congés", countries: ["Belgium"], updated: "2024-01-01",
    icon: "👶", ring: "linear-gradient(135deg, rgba(255,107,138,0.25), rgba(167,139,250,0.2))",
    source: "Code du Bien-être au Travail — onem.be", sourceUrl: "https://www.onem.be",
  },
  {
    id: "be-salaire-garanti", title: "Salaire Garanti Maladie Belgique", titleEn: "Guaranteed Salary Belgium",
    desc: "30 jours de salaire garanti à 100% en cas de maladie. Pas de délai de carence pour employés.",
    topic: "Santé", countries: ["Belgium"], updated: "2024-01-01",
    icon: "🏥", ring: "linear-gradient(135deg, rgba(70,190,170,0.25), rgba(65,180,210,0.15))",
    source: "Loi du 3 juillet 1978 — emploi.belgique.be", sourceUrl: "https://emploi.belgique.be",
  },
];

export function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "aujourd'hui";
  if (days < 30) return `${days} jours`;
  if (days < 365) return `${Math.floor(days / 30)} mois`;
  return `${Math.floor(days / 365)} an(s)`;
}
```

**Step 2: Update policies page topic filters**

In `app/(protected)/policies/page.tsx`, update TOPICS to match new topics:
```typescript
const TOPICS = ["All", "Congés", "Jours fériés", "Contrat", "Rémunération", "Temps de travail", "Santé"];
```

Update the country filter to use "France" and "Belgium" instead of session country matching.

**Step 3: Update policy detail page**

In `app/(protected)/policies/[id]/page.tsx`, update to show the source URL as an external link:
```tsx
<a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer"
   style={{ color: "var(--mint)", textDecoration: "none" }}>
  {policy.source} ↗
</a>
```

---

## Task 11: Update branding & chat welcome state

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/(protected)/chat/page.tsx`
- Modify: `components/Topbar.tsx`

**Step 1: Update page title in `app/layout.tsx`**

```tsx
export const metadata = {
  title: "LegiRH — Assistant Juridique RH",
  description: "Assistant IA spécialisé en droit social français et belge",
};
```

**Step 2: Update chat welcome state in `chat/page.tsx`**

Update suggested questions to be legally-focused:
```typescript
const SUGGESTED_QUESTIONS = [
  { emoji: "📅", text: "Combien de jours de congés ai-je droit en France ?" },
  { emoji: "🏖️", text: "Quels sont les jours fériés légaux en Belgique ?" },
  { emoji: "🤝", text: "La période d'essai existe-t-elle encore en Belgique ?" },
  { emoji: "💶", text: "Quel est le SMIC en France en 2025 ?" },
  { emoji: "⚖️", text: "Quelles sont les obligations de transparence salariale ?" },
  { emoji: "👶", text: "Quelle est la durée du congé paternité en France ?" },
];
```

Update the welcome subtitle:
```tsx
<p className="chat-welcome-sub">
  Posez vos questions sur le droit social français et belge. / Ask questions about French and Belgian employment law.
</p>
```

**Step 3: Update Topbar country pill**

In `components/Topbar.tsx`, update the country pill to show FR/BE flag only:
```tsx
const FLAG: Record<string, string> = { France: "🇫🇷", Belgium: "🇧🇪" };
```

---

## Task 12: Final cleanup & run

**Files:**
- Modify: `package.json` (remove unused scripts)
- Delete: `components/TutorialClient.tsx`
- Delete: `lib/rag/ingest.ts`, `lib/rag/chunker.ts`, `lib/rag/parser.ts` (replaced by seed script)

**Step 1: Remove unused components**

```bash
rm -f components/TutorialClient.tsx
rm -f lib/rag/ingest.ts lib/rag/chunker.ts lib/rag/parser.ts
rm -f lib/azure-storage.ts
```

**Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Run seed script**

```bash
npx tsx scripts/seed-vectors.ts
```

Expected: vectors.json created with ~50-60 chunks.

**Step 4: Start dev server and test**

```bash
npm run dev
```

1. Navigate to `http://localhost:3000/login`
2. Sign in as `alice.martin@legirh.eu` / `hackathon2025` (France)
3. Ask: "Combien de jours de congés ai-je droit ?" → should return FR legal answer with citation
4. Sign in as `jan.de.backer@legirh.eu` → Belgium context
5. Ask: "La période d'essai existe-t-elle en Belgique ?" → should explain abolition since 2014
6. Navigate to `/policies` → 16 real policy cards, filterable by topic

**Step 5: Commit**

```bash
git init
git add -A
git commit -m "feat: LegiRH — Mistral hackathon — FR/BE legal HR assistant"
```

---

## Environment Variables Reference

```env
# Required
MISTRAL_API_KEY=sk-...

# NextAuth
NEXTAUTH_SECRET=any-random-string-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# NOT needed (removed)
# ANTHROPIC_API_KEY
# OPENAI_API_KEY
# DATABASE_URL
# AZURE_AD_*
```

## Demo Credentials

| Email | Password | Country | Language |
|-------|----------|---------|----------|
| alice.martin@legirh.eu | hackathon2025 | France | Français |
| jan.de.backer@legirh.eu | hackathon2025 | Belgium | Français |

## Cost Estimate (€15 budget)

| Action | Cost |
|--------|------|
| Seed script (embed ~50 chunks × 200 tokens) | ~€0.001 |
| Each chat query (2K in + 1K out, open-mistral-nemo) | ~€0.0005 |
| 1000 demo queries | ~€0.50 |
| Buffer for development/testing | ~€2.00 |
| **Total estimate** | **< €3.00** |
