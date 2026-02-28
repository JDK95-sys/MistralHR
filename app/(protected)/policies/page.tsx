"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";
import { policies, timeAgo } from "@/lib/policies-data";

const TOPICS = ["All", "Leave", "Remote Work", "Expenses", "Health & Benefits", "Code of Conduct", "Data & Privacy", "Learning"];



export default function PoliciesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTopic, setActiveTopic] = useState("All");
    const [search, setSearch] = useState("");
    const country = session?.user?.country ?? "";

    const filtered = policies.filter((p) => {
        const matchesTopic = activeTopic === "All" || p.topic === activeTopic;
        const matchesSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.desc.toLowerCase().includes(search.toLowerCase());
        return matchesTopic && matchesSearch;
    });

    // Policies that apply to user's country sort first
    const sorted = [...filtered].sort((a, b) => {
        const aApplies = a.countries.includes("All countries") || a.countries.includes(country);
        const bApplies = b.countries.includes("All countries") || b.countries.includes(country);
        if (aApplies && !bApplies) return -1;
        if (!aApplies && bApplies) return 1;
        return 0;
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
                {sorted.length === 0 ? (
                    <div className="text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>
                        No policies found for &ldquo;{search}&rdquo;
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sorted.map((policy) => {
                            const appliesToUser =
                                policy.countries.includes("All countries") || policy.countries.includes(country);
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
                                            {appliesToUser && (
                                                <span
                                                    className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                    style={{
                                                        background: "var(--mint-10)",
                                                        border: "1px solid rgba(70,190,170,0.2)",
                                                        color: "var(--sage)",
                                                    }}
                                                >
                                                    ✓ Applies to you
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                                            {policy.desc}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                            <span>🌍 {policy.countries.join(", ")}</span>
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
