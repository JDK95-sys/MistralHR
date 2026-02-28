"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  FileText,
  LogOut,
} from "lucide-react";

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
  "employee": "linear-gradient(135deg, #46BEAA, #277777)",
};

const COUNTRY_FLAGS: Record<string, string> = {
  Belgium: "🇧🇪", Germany: "🇩🇪", France: "🇫🇷", Netherlands: "🇳🇱",
  Poland: "🇵🇱", Spain: "🇪🇸", Italy: "🇮🇹", Portugal: "🇵🇹",
  UK: "🇬🇧", India: "🇮🇳", Australia: "🇦🇺", Singapore: "🇸🇬",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  return (
    <aside className="sidebar">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: "transparent", borderRadius: 0 }}>
          {/* Mistral pixel-M SVG — 7-col × 5-row grid, rainbow left→right */}
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Row 1: cols 1,2 and 6,7 filled (M ears) */}
            <rect x="0"  y="0"  width="4" height="4" fill="#FFD800" />
            <rect x="5"  y="0"  width="4" height="4" fill="#FFD800" />
            <rect x="25" y="0"  width="4" height="4" fill="#FA500F" />
            <rect x="30" y="0"  width="4" height="4" fill="#E10500" />
            {/* Row 2: cols 1,2,3 and 5,6,7 filled */}
            <rect x="0"  y="5"  width="4" height="4" fill="#FFD800" />
            <rect x="5"  y="5"  width="4" height="4" fill="#FFD800" />
            <rect x="10" y="5"  width="4" height="4" fill="#FF8205" />
            <rect x="20" y="5"  width="4" height="4" fill="#FA500F" />
            <rect x="25" y="5"  width="4" height="4" fill="#FA500F" />
            <rect x="30" y="5"  width="4" height="4" fill="#E10500" />
            {/* Row 3: cols 1,3,4,5,7 filled */}
            <rect x="0"  y="10" width="4" height="4" fill="#FFD800" />
            <rect x="10" y="10" width="4" height="4" fill="#FF8205" />
            <rect x="15" y="10" width="4" height="4" fill="#FF8205" />
            <rect x="20" y="10" width="4" height="4" fill="#FA500F" />
            <rect x="30" y="10" width="4" height="4" fill="#E10500" />
            {/* Row 4: cols 1,4,7 filled (M legs) */}
            <rect x="0"  y="15" width="4" height="4" fill="#FFD800" />
            <rect x="15" y="15" width="4" height="4" fill="#FF8205" />
            <rect x="30" y="15" width="4" height="4" fill="#E10500" />
            {/* Row 5: cols 1,7 filled (M feet) */}
            <rect x="0"  y="20" width="4" height="4" fill="#FFD800" />
            <rect x="30" y="20" width="4" height="4" fill="#E10500" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">MistralHR</div>
          <div className="sidebar-logo-sub">Powered by Mistral</div>
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
