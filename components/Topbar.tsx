"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell } from "lucide-react";

// ─── Page title map ────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/chat": "HR Assistant",
  "/policies": "Policy Library",
  "/jobs": "Internal Job Board",
  "/analytics": "People Analytics",
  "/tools": "HR Tools",
  "/admin": "Admin",
};

function getPageTitle(pathname: string): string {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;
  const prefix = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + "/"));
  return prefix ? PAGE_TITLES[prefix] : "People Portal";
}

const COUNTRY_FLAGS: Record<string, string> = {
  Belgium: "🇧🇪", Germany: "🇩🇪", France: "🇫🇷", Netherlands: "🇳🇱",
  Poland: "🇵🇱", Spain: "🇪🇸", UK: "🇬🇧", India: "🇮🇳",
};

interface TopbarProps {
  children?: React.ReactNode;
}

export default function Topbar({ children }: TopbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const country = session?.user?.country;
  const [notifToast, setNotifToast] = useState(false);

  const handleNotifClick = () => {
    setNotifToast(true);
    setTimeout(() => setNotifToast(false), 2500);
  };

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        {/* Country context */}
        {country && (
          <div className="topbar-pill">
            <span>{COUNTRY_FLAGS[country] ?? "🌍"}</span>
            {country}
          </div>
        )}

        {/* Slot for page-specific actions */}
        {children}

        {/* AI status */}
        <div className="topbar-pill" style={{ gap: 6, cursor: "default", background: "var(--mistral-gradient)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white", boxShadow: "0 0 6px rgba(255, 112, 0, 0.3)", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", color: "white" }}>MISTRAL AI</span>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-pill"
            aria-label="Notifications"
            onClick={handleNotifClick}
            style={{ padding: "6px 10px", position: "relative" }}
          >
            <Bell size={15} />
            <span
              style={{
                position: "absolute",
                top: 5, right: 6,
                width: 6, height: 6,
                borderRadius: "50%",
                background: "#E10500",
                border: "1.5px solid var(--surface-solid)",
              }}
            />
          </button>
          {notifToast && (
            <div
              className="animate-fade-in"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                whiteSpace: "nowrap",
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                zIndex: 50,
              }}
            >
              🔔 Notifications coming soon
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
