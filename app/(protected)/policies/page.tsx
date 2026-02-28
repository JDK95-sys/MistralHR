"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";
import { getPoliciesForCountry } from "@/lib/policies";

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

// Display label → data topic value mapping
const TOPIC_MAP: Record<string, string> = {
  "Leave":            "leave",
  "Mobility":         "mobility",
  "Tax":              "tax",
  "Health & Benefits":"health",
  "Premiums":         "premiums",
  "Remote Work":      "worksite",
  "Onboarding":       "onboarding",
  "Compensation":     "compensation",
};

const TOPICS = ["All", ...Object.keys(TOPIC_MAP)];

export default function PoliciesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTopic, setActiveTopic] = useState("All");
    const [search, setSearch] = useState("");
    const country = session?.user?.country ?? "";

    const sorted = getPoliciesForCountry(country).filter((p) => {
        const matchesTopic = activeTopic === "All" || p.topic === TOPIC_MAP[activeTopic];
        const matchesSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        return matchesTopic && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full">
            <Topbar>
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                        background: "var(--mint-10)",
                        border: "1px solid rgba(70,190,170,0.2)",
                        color: "var(--sage)",
                    }}
                >
                    💡 Ask the AI for answers
                </div>
            </Topbar>

            <main className="flex-1 overflow-y-auto p-6">
                {/* Search bar */}
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                    style={{ background: "var(--glass)", border: "1px solid var(--glass-border)" }}
                >
                    <span className="text-base opacity-40">🔍</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search policies…"
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-xs" style={{ color: "var(--text-muted)" }}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Topic filters */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {TOPICS.map((topic) => (
                        <button
                            key={topic}
                            onClick={() => setActiveTopic(topic)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                            style={{
                                background: activeTopic === topic ? "var(--mint)" : "var(--glass-strong)",
                                color: activeTopic === topic ? "var(--pepper)" : "var(--text-muted)",
                                border: `1.5px solid ${activeTopic === topic ? "var(--mint)" : "var(--border)"}`,
                            }}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Policy cards */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>
                        {country ? (
                            <>No policies found for &ldquo;{search}&rdquo; in {country}</>
                        ) : (
                            <>Please log in to view policies for your country</>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((policy) => {
                            return (
                                <div
                                    key={policy.id}
                                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer animate-fade-in hover-card"
                                    style={{
                                        background: "var(--glass)",
                                        border: "1.5px solid var(--border)",
                                        boxShadow: "var(--shadow-md)",
                                    }}
                                    onClick={() => router.push(`/policies/${policy.id}`)}
                                >
                                    {/* Icon */}
                                    <div
                                        className="ring-motif flex items-center justify-center text-xl flex-shrink-0"
                                        style={{ width: 44, height: 44, background: policy.ring }}
                                    >
                                        {policy.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-bold tracking-snug">{policy.title}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                                            {policy.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                            <span>🌍 {policy.country}</span>
                                            <span>· Updated {timeAgo(policy.updatedAt)}</span>
                                        </div>
                                    </div>

                                    {/* Topic + arrow */}
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <span
                                            className="px-2.5 py-1 rounded-full"
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 10,
                                                letterSpacing: "0.08em",
                                                background: "transparent",
                                                border: "1px solid var(--glass-border)",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {policy.topic.toUpperCase()}
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: "var(--mint)" }}>
                                            View Policy →
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
