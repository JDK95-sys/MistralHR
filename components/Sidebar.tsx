"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  FileText,
  LogOut,
} from "lucide-react";
import MistralMark from "@/components/icons/MistralMark";

// ─── Nav structure ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/chat", Icon: MessageCircle, label: "HR Assistant", tutorialClass: "nav-assistant" },
  { href: "/policies", Icon: FileText, label: "Policy Library", tutorialClass: "nav-policies" },
];

// ─── Avatar initials ───────────────────────────────────────────────
function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const ROLE_GRADIENTS: Record<string, string> = {
  "hr-admin": "linear-gradient(135deg, #F08791, #7850B4)",
  "hrbp": "linear-gradient(135deg, #41B4D2, #46BEAA)",
  "exec": "linear-gradient(135deg, #E15A46, #FFEB78)",
  "employee": "linear-gradient(135deg, #FF7000, #FF9A40)",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  return (
    <aside className="sidebar">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: "var(--mistral-gradient)" }}>
          <MistralMark size={18} />
        </div>
        <div>
          <div className="sidebar-logo-text" style={{ color: "var(--mistral-orange)" }}>MistralHR</div>
          <div className="sidebar-logo-sub">Powered by Mistral AI</div>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        <div style={{ marginBottom: 20 }}>
          <div className="sidebar-section-label">Main</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${item.tutorialClass} ${isActive ? "active" : ""}`}
              >
                <item.Icon size={18} className="sidebar-nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── User profile (bottom) ─────────────────────────────── */}
      {user && (
        <div className="sidebar-user-bottom">
          <div
            className="sidebar-avatar"
            style={{
              background: ROLE_GRADIENTS[user.portalRole ?? "employee"],
              color: user.portalRole === "exec" ? "#000" : "white",
            }}
          >
            {getInitials(user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div className="sidebar-user-role mono-label">{user.jobTitle ?? user.portalRole}</div>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-footer-btn"
        >
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
