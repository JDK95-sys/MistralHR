"use client";

/**
 * AUDIT CHECKLIST — Policy Detail Page
 * ✅ Data source: fetches from /api/policies/${id} (server-side, country-scoped) — never imports policy data directly
 * ✅ Bundle isolation: only imports `type { Policy }` (erased at compile time — zero bytes)
 * ✅ Error handling: fetch failure → router.replace("/policies") — silent redirect, no error page
 * ✅ No information leakage: removed "Policy not found for your country" error screen entirely
 * ✅ Loading state: skeleton mimics detail layout (icon, title, summary card) with matching design tokens
 * ✅ Visual preservation: all detail elements pixel-identical — header, summary, legal refs, content, sections, AI footer
 * ✅ Content audit: POLICY_SECTIONS cross-country references replaced with neutral language
 *    - leave/Entitlements: removed "6 extra days in Belgium, 3 RTT days in France"
 *    - premiums/Per Diem: removed "€20 (Belgium), €25 (France), €24 (Germany), €20 (Netherlands)"
 *    - health/Supplemental: removed "in Belgium and Netherlands"
 * ✅ Cleanup: useEffect returns cancellation flag to prevent state updates after unmount
 */

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import type { Policy } from "@/lib/policies/types";

// Helper function for time ago display
function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function PolicyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user || !id) return;
        let cancelled = false;
        fetch(`/api/policies/${id}`)
            .then(res => {
                if (!res.ok) {
                    // Policy doesn't belong to user's country or doesn't exist.
                    // Silent redirect — no error page, no country disclosure.
                    router.replace("/policies");
                    return null;
                }
                return res.json();
            })
            .then(data => { if (!cancelled && data) setPolicy(data.policy); })
            .catch(() => { if (!cancelled) router.replace("/policies"); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [session, id, router]);

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                <Topbar>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full animate-pulse" style={{ width: 32, height: 32, background: "var(--glass-strong)" }} />
                        <div className="h-4 rounded-full animate-pulse" style={{ width: 200, background: "var(--glass-strong)" }} />
                    </div>
                </Topbar>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full animate-pulse flex-shrink-0" style={{ width: 64, height: 64, background: "var(--glass-strong)" }} />
                            <div className="flex-1 space-y-3">
                                <div className="h-6 rounded-full animate-pulse" style={{ width: "70%", background: "var(--glass-strong)" }} />
                                <div className="h-4 rounded-full animate-pulse" style={{ width: "40%", background: "var(--glass-strong)" }} />
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl animate-pulse" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", height: 100 }} />
                        <div className="p-5 rounded-2xl animate-pulse" style={{ background: "var(--glass)", border: "1px solid var(--glass-border)", height: 160 }} />
                    </div>
                </main>
            </div>
        );
    }

    if (!policy) return null; // redirect in progress

    return (
        <div className="flex flex-col h-full">
            <Topbar>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/policies")}
                        className="flex items-center justify-center rounded-full transition-all duration-150"
                        style={{
                            width: 32,
                            height: 32,
                            background: "var(--glass)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--text-primary)"
                        }}
                    >
                        ←
                    </button>
                    <div className="text-sm font-bold truncate">
                        {policy.title}
                    </div>
                </div>
            </Topbar>

            <main className="flex-1 overflow-y-auto p-8 relative">
                {/* Background flair */}
                <div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20"
                    style={{ background: policy.ring }}
                />

                <div className="max-w-3xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="ring-motif flex items-center justify-center text-3xl flex-shrink-0"
                                style={{ width: 64, height: 64, background: policy.ring }}
                            >
                                {policy.icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-2">
                                    {policy.title}
                                </h1>
                                <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                                    <span
                                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                            background: "var(--glass)",
                                            border: "1px solid var(--glass-border)",
                                            color: "var(--text-secondary)"
                                        }}
                                    >
                                        {policy.topic}
                                    </span>
                                    <span>🌍 {policy.country}</span>
                                    <span>· Updated {timeAgo(policy.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="p-5 rounded-2xl"
                            style={{
                                background: "var(--glass)",
                                border: "1px solid var(--glass-border)",
                                boxShadow: "var(--shadow-md)"
                            }}
                        >
                            <h3 className="text-sm font-bold mb-2">Policy Summary</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                {policy.description}
                            </p>
                        </div>

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

                        {policy.content && (
                            <div className="mt-6 prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
                                {policy.content}
                            </div>
                        )}
                    </div>

                    {/* Policy content */}
                    <div className="space-y-8">
                        <PolicyContent topic={policy.topic} country={policy.country} title={policy.title} />
                    </div>

                    {/* Ask AI Footer */}
                    <div className="mt-12 pt-8 border-t border-[var(--border)]">
                        <div
                            className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl gap-4"
                            style={{
                                background: "var(--mint-10)",
                                border: "1px solid rgba(70,190,170,0.2)"
                            }}
                        >
                            <div>
                                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                                    Have specific questions?
                                </h3>
                                <p className="text-sm" style={{ color: "var(--sage)" }}>
                                    Our HR Assistant can answer questions directly from this policy document.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/chat?q=Tell me about the ${policy.title}`)}
                                className="px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-transform active:scale-95"
                                style={{
                                    background: "var(--mint)",
                                    color: "white",
                                    boxShadow: "0 4px 12px rgba(70,190,170,0.3)"
                                }}
                            >
                                Ask AI about this policy
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Policy content generator ──────────────────────────────────────
const POLICY_SECTIONS: Record<string, { heading: string; content: string }[]> = {
    leave: [
        { heading: "1. Purpose & Scope", content: "This policy defines the annual, parental, and special leave entitlements for all employees. It applies to permanent and fixed-term contract holders across all applicable jurisdictions." },
        { heading: "2. Entitlements", content: "Standard annual leave is a minimum of 20 working days per year, with additional company-granted days as per local law and company policy. Part-time employees receive entitlements on a pro-rata basis. Refer to your country-specific policy above for exact entitlements." },
        { heading: "3. Booking Procedure", content: "Leave must be requested through Workday Self-Service at least 5 business days in advance for periods of 3+ consecutive days. Manager approval is required before leave is confirmed. Public holidays follow the calendar of your registered work location." },
        { heading: "4. Carry-Over & Forfeiture", content: "Up to 5 unused annual leave days may be carried over into Q1 of the following year. Days not used by 31 March are forfeited unless an exception is approved by Regional HR. Accrued leave is paid out upon termination." },
        { heading: "5. Special Circumstances", content: "Additional leave may be granted for marriage (3 days), bereavement (3–5 days depending on relationship), and moving house (1 day). These are in addition to statutory entitlements and must be supported by documentation." },
    ],
    worksite: [
        { heading: "1. Purpose & Scope", content: "This policy establishes the framework for remote and hybrid working arrangements. It applies to all roles where remote work is operationally feasible, subject to local regulations." },
        { heading: "2. Standard Arrangements", content: "Eligible employees may work remotely up to 3 days per week. A minimum of 2 office days per week is required to maintain team collaboration. Specific arrangements may vary by team and must be agreed with your line manager." },
        { heading: "3. Cross-Border Rules", content: "Remote work from a country other than your employment contract country is limited to 30 calendar days per year. Beyond this threshold, tax and social security implications require prior approval from HR and Legal. The 183-day tax rule applies." },
        { heading: "4. Equipment & Expenses", content: "The company provides a €500 home office setup allowance for new remote workers. Monthly internet reimbursement of €40 is available. All equipment remains company property and must be returned upon departure." },
        { heading: "5. Health & Safety", content: "Employees must ensure their remote workspace meets basic ergonomic standards. A self-assessment checklist must be completed annually. The company maintains employer liability for work-related injuries sustained during remote work hours." },
    ],
    premiums: [
        { heading: "1. Purpose & Scope", content: "This policy governs the reimbursement of business expenses incurred by employees. All expenses must be reasonable, necessary, and directly related to company business activities." },
        { heading: "2. Submission Process", content: "All expense claims must be submitted through SAP Concur within 30 days of the expense date. Original receipts or digital copies must be attached for amounts exceeding €25. Late submissions may be rejected." },
        { heading: "3. Approval Workflow", content: "Expenses up to €500 require line manager approval. Expenses between €500–€2,000 require department head approval. Amounts exceeding €2,000 require VP-level sign-off. Travel bookings should use the approved Concur Travel platform." },
        { heading: "4. Per Diem & Meal Allowances", content: "Daily meal allowances vary by country of employment — refer to your local policy for exact amounts. International travel per diem rates follow the company rate card, updated quarterly." },
        { heading: "5. Non-Reimbursable Items", content: "Personal entertainment, minibar charges, premium class travel (unless pre-approved), parking fines, and spouse/partner travel costs are not reimbursable. Alcohol is limited to €15 per person for client entertainment." },
    ],
    health: [
        { heading: "1. Purpose & Scope", content: "This policy outlines the health, medical, and supplementary benefits provided to employees. Coverage varies by country and employment type." },
        { heading: "2. Group Insurance", content: "All permanent employees are enrolled in the company's group hospitalisation insurance from day one. Coverage extends to dependants (spouse/partner and children under 25). Pre-existing conditions are covered after a 12-month waiting period." },
        { heading: "3. Supplemental Benefits", content: "Additional benefits include dental coverage (up to €1,200/year), optical allowance (€300/2 years), and mental health support through 8 free EAP counselling sessions. Gym membership subsidies may be available depending on your country of employment." },
        { heading: "4. Claims Process", content: "Medical claims are submitted through the online benefits portal. Standard claims are processed within 15 business days. Direct billing is available at network hospitals. Emergency treatment abroad is covered up to €100,000 per incident." },
        { heading: "5. Wellness Programs", content: "The company offers annual health screenings, flu vaccinations, ergonomic assessments, and access to a 24/7 employee assistance programme. Mental health first aiders are available in each major office." },
    ],
    compensation: [
        { heading: "1. Purpose & Scope", content: "This policy outlines the company's compensation philosophy, pay structures, and commitment to equal pay for equal work. It applies to all employees across all countries of operation." },
        { heading: "2. Pay Equity", content: "The company is committed to equal pay for work of equal value. Pay structures are reviewed annually to identify and remediate unjustified gaps, in line with EU Directive 2023/970 on pay transparency." },
        { heading: "3. Conflicts of Interest", content: "Employees must disclose any situation that could create a real or perceived conflict of interest. This includes secondary employment, financial interests in competitors, and personal relationships with business partners." },
        { heading: "4. Transparency", content: "The company provides a confidential reporting channel (EthicsLine) for reporting suspected misconduct. Reports can be made anonymously. Retaliation against whistleblowers is strictly prohibited and subject to disciplinary action." },
        { heading: "5. Compliance Training", content: "Annual compliance training is mandatory for all employees. Completion is tracked through the Learning Management System. Managers must ensure 100% team completion within Q1 each year." },
    ],
    mobility: [
        { heading: "1. Purpose & Scope", content: "This policy governs internal transfers, cross-border assignments, and relocation support for all employees. It applies to permanent employees who request or are asked to move roles or work locations." },
        { heading: "2. Transfer Process", content: "Internal mobility requests are initiated through Workday. The employee's current and receiving managers must both approve before HR confirms the move. A minimum notice period of 30 days applies." },
        { heading: "3. International Assignments", content: "Cross-border assignments lasting more than 3 months require a formal assignment letter. HR and Legal will advise on tax, social-security, and immigration obligations for the destination country." },
        { heading: "4. Relocation Support", content: "Eligible employees receive a one-time relocation allowance and access to a relocation service provider. The amount varies by distance and family size and is subject to tax per local rules." },
        { heading: "5. Return & Reintegration", content: "Employees returning from international assignments are guaranteed a role at their previous grade level. HR will contact the employee 60 days before the end of the assignment to plan reintegration." },
    ],
    onboarding: [
        { heading: "1. Purpose & Scope", content: "This framework establishes the company's commitment to continuous learning and professional development for all employees. It outlines available resources, budget allocations, and the annual learning cycle." },
        { heading: "2. Learning Budget", content: "Each employee receives a €2,500 annual learning budget for external training, conferences, and certifications. Unused budget does not carry over. Requests above €2,500 require VP approval." },
        { heading: "3. LinkedIn Learning", content: "All employees have complimentary access to LinkedIn Learning's library of 20,000+ courses. Completion of at least 2 curated learning paths per year is encouraged. Certifications from the platform are recognised internally." },
        { heading: "4. Certification Support", content: "The company reimburses exam fees for pre-approved professional certifications. Study leave of up to 5 days per year is available for exam preparation. Successful certification results in a one-time bonus of €500." },
        { heading: "5. Annual Learning Cycle", content: "Q1: Learning goals set with manager. Q2–Q3: Active learning period. Q4: Review and certification. Learning activities are integrated into the annual development review and contribute to career progression." },
    ],
};

function PolicyContent({ topic, country, title }: { topic: string; country: string; title: string }) {
    const sections = POLICY_SECTIONS[topic] ?? [
        { heading: "1. Purpose & Scope", content: `This policy outlines the guidelines for ${title.toLowerCase()}. It applies to all employees in: ${country}.` },
        { heading: "2. Key Guidelines", content: "Employees must follow all applicable local regulations and internal procedures. Manager approval is required for most actions under this policy." },
        { heading: "3. Compliance", content: "Non-compliance with this policy may result in disciplinary action. Questions should be directed to your HR Business Partner or the Policy Helpdesk." },
    ];

    return (
        <>
            {sections.map((section) => (
                <div key={section.heading}
                    className="p-5 rounded-2xl"
                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                >
                    <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>{section.heading}</h2>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{section.content}</p>
                </div>
            ))}
        </>
    );
}
