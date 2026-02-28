import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isDbAvailable } from "@/lib/db";
import { NextRequest } from "next/server";

// ─── Request schema ────────────────────────────────────────────────
interface ChatRequest {
  message: string;
  sessionId?: string;
  topic?: string;
}

// ─── Canned demo responses ─────────────────────────────────────────
// Used when both DATABASE_URL and MISTRAL_API_KEY are missing.
// Country-specific responses are keyed with country suffix (e.g., "mobility:France")
const DEMO_RESPONSES: Record<string, string> = {
  "leave": `**Annual Leave Entitlement** 🏖️

Based on the Congés Payés Policy (fr-annual-leave), your entitlement:

| Statutory | Company (RTT) | Total |
|-----------|---------------|-------|
| 25 days | 3 RTT days | **28 days** |

**Key rules:**
- Leave accrues at 2.5 working days per month (2,5 jours ouvrables/mois)
- Up to 5 unused days can carry over to Q1 of the next year
- Requests of 3+ consecutive days need manager approval 5 business days in advance

💡 *Book leave through Workday Self-Service → Time Off → Request Absence.*

📄 Source: Congés Payés — France · Effective Jan 2024`,

  "parental": `**Parental Leave** 👶

The company provides the following parental leave entitlements in France:

**Maternity Leave:**
- 16 weeks at full pay (congé maternité légal)

**Paternity / Co-parent Leave:**
- 25 days at full pay (congé paternité et d'accueil)

**How to apply:**
1. Notify your manager and HRBP at least 3 months before expected date
2. Submit the Parental Leave form via Workday
3. HR will confirm your dates and arrange cover

📄 Source: Parental Leave Policy — France · Effective Jan 2024`,

  "expense": `**Submitting Expense Claims** 💶

Use **SAP Concur** to submit all expense reports. Here's a quick guide:

**Step-by-step:**
1. Log in to SAP Concur (via HR Tools)
2. Click "Create New Report"
3. Add each expense line with receipt photo
4. Submit for manager approval

**Key limits:**
- Meals: Up to €25/person for business meals (€50 for client dinners)
- Travel: Economy class for flights under 6 hours
- Hotels: Up to €180/night in Paris
- Office supplies: Pre-approved up to €100

**Timeline:** Submit within 30 days of the expense. Reimbursement typically processes in 5-7 business days after approval.

📄 Source: Expense & Travel Policy · Effective Dec 2024`,

  "remote": `**Remote & Hybrid Work Policy** 🏠

The company supports hybrid working in France (accord télétravail):

**Standard arrangement:**
- Up to **3 days remote** per week for eligible roles
- Minimum **2 days in office** for collaboration
- New hires: minimum 3 months on-site before regular remote access

**Cross-border remote work:**
- Up to 30 days/year from another EU country
- Requires manager + HRBP approval for tax/social security reasons

**Equipment provided:**
- Laptop + ergonomic chair via home office allowance
- €500 one-time home office setup allowance
- Ergonomic assessment available on request

📄 Source: Télétravail & Conditions de Travail — France · Effective Jan 2024`,

  "healthcare": `**Healthcare & Medical Insurance** ⚕️

**France:**
- Mutuelle complémentaire obligatoire — minimum 50% employer / employee contribution
- 100% coverage for hospitalisation
- Options for enhanced dental, optical, and alternative medicine coverage
- Teleconsultation via your mutuelle network

**Prévoyance (disability/death cover):**
- Collective prévoyance agreement covering incapacity, invalidity, and death
- Portability maintained up to 12 months after departure (L911-8 CSS)

**How to enroll:** You're automatically enrolled at onboarding. Update dependents via Workday → Benefits → Life Events.

📄 Source: Mutuelle & Prévoyance — France · Effective Jan 2024`,

  "mobility": `**Mobility — France** ✈️

Internal and international mobility for France-based employees:

**Internal transfer:**
- Requires a mobility clause in your contract or a signed amendment
- Reasonable advance notice is required (L1231-5)

**International assignment:**
- Assignments > 3 months require a formal detachment amendment
- French social security coverage maintained within EU (Regulation 883/2004)
- Contact hr-mobility@mistralhr.demo to open a mobility file

**Process:** HR Mobility → manager + Finance validation → signed amendment → destination HR briefing → relocation logistics (budget capped per internal policy).

📄 Source: Mobilité Globale & Locale — France · Effective Mar 2024`,

  "default": `I'd be happy to help with your HR question! As an AI HR Assistant, I can provide information about:

- 🏖️ **Leave policies** — annual leave, parental leave, sick leave
- 💶 **Expenses** — submitting claims, travel reimbursement
- 🏠 **Remote work** — hybrid arrangements, cross-border rules
- ⚕️ **Benefits** — healthcare, pension, wellness programs
- 📋 **Company policies** — code of conduct, data protection
- 💼 **Career** — internal jobs, learning & development
- ✈️ **Mobility** — international assignments, relocation

Try asking a specific question like *"What is my annual leave entitlement?"* or *"How do I submit an expense claim?"*

*Note: This is a demo environment. For full AI-powered answers, connect the MISTRAL_API_KEY in your .env.local file.*`,
};

const DEMO_RESPONSES_BE: Record<string, string> = {
  "leave": `**Annual Leave Entitlement** 🏖️

Based on the Congé Annuel Policy (be-annual-leave), your entitlement:

| Statutory | Company Extra | Total |
|-----------|---------------|-------|
| 20 days | 6 days | **26 days** |

**Key rules:**
- Rights calculated based on the reference year N-1
- Pécule double (~92% of monthly gross salary) paid annually by employer
- Up to 5 unused days can carry over to Q1 of the next year
- Requests of 3+ consecutive days need manager approval 5 business days in advance

💡 *Book leave through Workday Self-Service → Time Off → Request Absence.*

📄 Source: Congé Annuel — Belgique · Effective Jan 2024`,

  "parental": `**Parental Leave** 👶

The company provides the following parental leave entitlements in Belgium:

**Maternity Leave:**
- 15 weeks statutory + 2 weeks company top-up at full pay

**Paternity / Co-parent Leave:**
- 20 days at full pay (congé de naissance/coparentalité)

**How to apply:**
1. Notify your manager and HRBP at least 3 months before expected date
2. Submit the Parental Leave form via Workday
3. HR will confirm your dates and arrange cover

📄 Source: Parental Leave Policy — Belgique · Effective Jan 2024`,

  "expense": `**Submitting Expense Claims** 💶

Use **SAP Concur** to submit all expense reports. Here's a quick guide:

**Step-by-step:**
1. Log in to SAP Concur (via HR Tools)
2. Click "Create New Report"
3. Add each expense line with receipt photo
4. Submit for manager approval

**Key limits:**
- Meals: Up to €20/person for business meals (€50 for client dinners)
- Travel: Economy class for flights under 6 hours
- Hotels: Up to €150/night in Brussels
- Office supplies: Pre-approved up to €100

**Timeline:** Submit within 30 days of the expense. Reimbursement typically processes in 5-7 business days after approval.

📄 Source: Expense & Travel Policy · Effective Dec 2024`,

  "remote": `**Remote & Hybrid Work Policy** 🏠

The company supports hybrid working in Belgium (CCT n°85 + accord collectif BE):

**Standard arrangement:**
- Up to **3 days remote** per week for eligible roles
- Minimum **2 days in office** for collaboration
- Home office indemnity: up to €151.70/month (ONSS cap 2024) for structural teleworkers (>5 days/month)

**Cross-border remote work:**
- Up to 30 days/year from another EU country
- Requires manager + HRBP approval for tax/social security reasons

**Equipment provided:**
- Laptop provided by IT; additional equipment via home office indemnity

📄 Source: Télétravail & Conditions de Travail — Belgique · Effective Jan 2024`,

  "healthcare": `**Healthcare & Medical Insurance** ⚕️

**Belgium:**
- Statutory mutualité (INAMI) — every employee must be affiliated to a mutuality of their choice
- Group hospitalisation insurance (collective) — covers hospital room, doctor fees above INAMI tariffs, and pre/post-hospitalisation care
- Portability: individual conversion available within 30 days of contract end (no medical questionnaire)

**How to enroll:** You're automatically enrolled at onboarding. Update dependents via Workday → Benefits → Life Events.

📄 Source: Assurance Santé & Hospitalisation — Belgique · Effective Jan 2024`,

  // ─── France-specific mobility/transportation response ───────────
  "mobility:France": `**Transport & Mobility Benefits — France** 🚆

As a French employee, you benefit from several statutory and company mobility advantages:

**Transport en commun (Public Transit):**
- **50% reimbursement** of your Navigo/transport subscription (mandatory under Code du Travail L3261-2)
- Submit your monthly pass via SAP Concur or Workday for automatic payroll reimbursement

**Forfait Mobilités Durables (Sustainable Mobility Allowance):**
- Up to **€700/year tax-free** for eco-friendly commuting
- Covers: bicycle, electric bike, carpooling, scooter sharing
- Can be combined with public transit reimbursement (up to €900/year total)

**Vélo (Company Bike Program):**
- Bike leasing available through our provider (€30-80/month deducted pre-tax)
- Maintenance and insurance included
- Option to purchase at end of lease

**Remote Work Allowance:**
- Home office equipment allowance as per our télétravail agreement (ANI 2020)
- Indemnité télétravail for structural remote workers

**How to apply:**
1. Transport: Upload your Navigo pass in SAP Concur monthly
2. Forfait Mobilités: Declare your eco-mobility use annually via Workday → Benefits
3. Bike leasing: Contact HR-France@mistralhr.demo

📄 Source: Primes & Avantages — France · Code du Travail L3261-2, L3261-3 · Effective Jan 2024`,

  // ─── Belgium-specific mobility/transportation response ──────────
  "mobility:Belgium": `**Mobility Budget — Belgium** 🚲

As a Belgian employee, you can benefit from the federal mobility budget scheme:

**How it works:**
You trade your company car (or right to one) for a flexible budget that can be spent on:

| Pillar | Options | Tax Treatment |
|--------|---------|---------------|
| Pillar 1 | Eco-friendly company car | Benefit in kind |
| Pillar 2 | Public transport, bike leasing, e-scooter, car sharing | Tax-free |
| Pillar 3 | Cash payout | Taxed at ~38% |

**Typical budget:** €6,000 – €14,000/year depending on your car category.

**Popular choices:**
- Electric bike leasing (€50-120/month)
- NMBS/SNCB annual rail pass
- Combination of e-bike + public transport

**Train Reimbursement:**
- 100% reimbursement of SNCB 2nd class season tickets
- Or bike allowance: €0.27/km (tax-free up to 40km round trip)

**Home Office Allowance:**
- Up to €151.70/month for structural teleworkers (>5 days/month at home)

Apply via Workday → Benefits → Mobility Budget. Changes take effect the month after approval.

📄 Source: Primes & Avantages — Belgique · Loi mobilité budget fédéral · Effective Jan 2025`,

  // ─── Generic mobility response (fallback for other countries) ───
  "mobility": `**Mobility & Transport Benefits** 🚲

Transport benefits vary by country. Here's an overview:

**France:**
- 50% public transport reimbursement (Navigo, TER)
- Forfait Mobilités Durables: up to €700/year for eco-mobility (bike, carpool)

**Belgium:**
- Mobility Budget: flexible scheme to trade company car for alternatives
- 100% train reimbursement (SNCB 2nd class)
- Bike allowance: €0.27/km

**Germany:**
- Job ticket subsidies
- Deutschlandticket reimbursement where applicable

For detailed information specific to your country, please check the policy library or contact your local HRBP.

📄 Source: Mobility & Transport Policies · Effective Jan 2025`,

  "default": `I'd be happy to help with your HR question! As an AI HR Assistant, I can provide information about:

- 🏖️ **Leave policies** — annual leave, parental leave, sick leave
- 💶 **Expenses** — submitting claims, travel reimbursement
- 🏠 **Remote work** — hybrid arrangements, cross-border rules
- ⚕️ **Benefits** — healthcare, pension, wellness programs
- 📋 **Company policies** — code of conduct, data protection
- 💼 **Career** — internal jobs, learning & development
- 🚲 **Mobility** — mobility budget, commuting allowances

Try asking a specific question like *"What is my annual leave entitlement?"* or *"How do I submit an expense claim?"*

*Note: This is a demo environment. For full AI-powered answers, connect the MISTRAL_API_KEY in your .env.local file.*`,
};

// ─── Keyword groups for demo response matching ─────────────────────
const DEMO_KEYWORDS = {
  leave: ["leave", "annual", "holiday", "vacation", "entitlement", "days off"],
  parental: ["parental", "maternity", "paternity", "baby"],
  expense: ["expense", "concur", "reimburs", "receipt", "claim"],
  remote: ["remote", "hybrid", "work from home", "wfh", "home office"],
  healthcare: ["health", "medical", "insurance", "doctor", "hospital", "dental"],
  mobility: ["mobility", "bike", "transport", "commut", "car", "train", "navigo", "vélo"],
};

// Helper function to check if message contains any of the keywords
const matchesKeywords = (lower: string, keywords: string[]) =>
  keywords.some(keyword => lower.includes(keyword));

function matchDemoResponse(message: string, country: string = "Unknown"): string {
  const lower = message.toLowerCase();
  const responses = country === "Belgium" ? DEMO_RESPONSES_BE : DEMO_RESPONSES_FR;

  if (lower.includes("leave") && matchesKeywords(lower, DEMO_KEYWORDS.leave)) {
    return DEMO_RESPONSES["leave"];
  }
  if (matchesKeywords(lower, DEMO_KEYWORDS.parental)) {
    return DEMO_RESPONSES["parental"];
  }
  if (matchesKeywords(lower, DEMO_KEYWORDS.expense)) {
    return DEMO_RESPONSES["expense"];
  }
  if (matchesKeywords(lower, DEMO_KEYWORDS.remote)) {
    return DEMO_RESPONSES["remote"];
  }
  if (matchesKeywords(lower, DEMO_KEYWORDS.healthcare)) {
    return DEMO_RESPONSES["healthcare"];
  }
  if (matchesKeywords(lower, DEMO_KEYWORDS.mobility)) {
    // Return country-specific mobility response if available, otherwise generic
    const countryKey = `mobility:${country}`;
    return DEMO_RESPONSES[countryKey] ?? DEMO_RESPONSES["mobility"];
  }

  return responses["default"];
}

// ─── Stream helper ─────────────────────────────────────────────────
function createSSEStream(handler: (send: (data: object) => void) => Promise<void>) {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Controller may be closed
        }
      };
      try {
        await handler(send);
      } catch (error) {
        console.error("[Chat API] Error:", error);
        send({
          type: "error",
          message: error instanceof Error ? error.message : "An unexpected error occurred.",
        });
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

// ─── Simulate streaming by sending text word-by-word ────────────────
async function streamText(text: string, send: (data: object) => void, delayMs = 15) {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = (i > 0 ? " " : "") + words[i];
    send({ type: "text", text: word });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// ─── Send demo response (used as fallback) ─────────────────────────
async function sendDemoResponse(message: string, country: string, send: (data: object) => void) {
async function sendDemoResponse(message: string, send: (data: object) => void, country: string = "GLOBAL") {
  send({ type: "status", message: "Searching policy documents…" });
  await new Promise((resolve) => setTimeout(resolve, 400));
  send({ type: "status", message: "Generating response…" });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const response = matchDemoResponse(message, country);
  await streamText(response, send);
  send({ type: "done", sessionId: null });
}

// ─── POST /api/chat ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body: ChatRequest = await req.json();
  const { message: rawMessage, sessionId, topic } = body;
  const message = rawMessage?.trim() ?? "";

  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (message.length > 4000) {
    return new Response(JSON.stringify({ error: "Message too long. Please keep it under 4000 characters." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hasMistralKey = !!process.env.MISTRAL_API_KEY;
  const hasDb = isDbAvailable();
  const country = session.user.country ?? "GLOBAL";

  // ─── Mode 1: Full stack (Mistral + DB) ───────────────────────
  if (hasMistralKey && hasDb) {
    return createSSEStream(async (send) => {
      try {
        const [
          { db },
          { searchDocuments, buildContext, buildCitations },
          { buildSystemPrompt },
          { Mistral },
        ] = await Promise.all([
          import("@/lib/db"),
          import("@/lib/rag/vectorSearch"),
          import("@/lib/rag/systemPrompt"),
          import("@mistralai/mistralai").then((m) => m.Mistral),
        ]);

        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

        let activeSessionId = sessionId;
        if (!activeSessionId) {
          const sessionResult = await db!.query<{ id: string }>(
            `INSERT INTO chat_sessions (user_id, user_email, user_country)
             VALUES ($1, $2, $3) RETURNING id`,
            [session.user.id, session.user.email, country]
          );
          activeSessionId = sessionResult.rows[0].id;
        } else {
          await db!.query("UPDATE chat_sessions SET last_active = NOW() WHERE id = $1", [activeSessionId]);
        }

        await db!.query(
          `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`,
          [activeSessionId, message]
        );

        send({ type: "status", message: "Searching policy documents…" });
        const chunks = await searchDocuments(message, { country, topK: 6, threshold: 0.62, topic });
        const context = buildContext(chunks);
        const citations = buildCitations(chunks);
        const systemPrompt = buildSystemPrompt(session, context);

        const historyResult = await db!.query<{ role: "user" | "assistant"; content: string }>(
          `SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 6`,
          [activeSessionId]
        );
        const messages = historyResult.rows.reverse().slice(0, -1).map((r) => ({ role: r.role, content: r.content }));

        send({ type: "status", message: "Generating response…" });
        let fullResponse = "";

        const stream = await mistral.chat.stream({
          model: "open-mistral-nemo",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: message },
          ],
        });

        for await (const chunk of stream) {
          const delta = chunk.data.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullResponse += delta;
            send({ type: "text", text: delta });
          }
        }

        const chunkIds = chunks.map((c) => c.id);
        await db!.query(
          `INSERT INTO chat_messages (session_id, role, content, source_chunks, model, tokens_used)
           VALUES ($1, 'assistant', $2, $3, $4, $5)`,
          [activeSessionId, fullResponse, chunkIds, "open-mistral-nemo", Math.ceil(fullResponse.length / 4)]
        );

        send({ type: "citations", citations });
        send({ type: "done", sessionId: activeSessionId });
      } catch (err) {
        console.warn("[Chat API] Full-stack mode failed, falling back to demo:", err);
        await sendDemoResponse(message, send, country);
      }
    });
  }

  // ─── Mode 2: Mistral only (no DB) — skip persistence ─────────
  if (hasMistralKey && !hasDb) {
    return createSSEStream(async (send) => {
      try {
        const [{ buildSystemPrompt }, { Mistral }] = await Promise.all([
          import("@/lib/rag/systemPrompt"),
          import("@mistralai/mistralai").then((m) => m.Mistral),
        ]);

        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

        send({ type: "status", message: "Generating response…" });

        const systemPrompt = buildSystemPrompt(session, "No policy documents available in demo mode. Answer based on your general HR knowledge for European multinationals.");

        const stream = await mistral.chat.stream({
          model: "open-mistral-nemo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        });

        for await (const chunk of stream) {
          const delta = chunk.data.choices[0]?.delta?.content ?? "";
          if (delta) {
            send({ type: "text", text: delta });
          }
        }

        send({ type: "done", sessionId: null });
      } catch (err) {
        // Mistral key may be invalid or have no credits — fall back to demo
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error("[Chat API] Mistral Mode 2 failed:", errMsg, err);
        // Send warn to client so user knows what happened
        send({ type: "status", message: `Mistral API error: ${errMsg.slice(0, 100)} — using demo mode` });
        await sendDemoResponse(message, send, country);
      }
    });
  }

  // ─── Mode 3: Demo mode (no API key, no DB) — canned responses ─
  return createSSEStream(async (send) => {
    await sendDemoResponse(message, send, country);
  });
}
