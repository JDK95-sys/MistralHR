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
          <div
            className="topbar-pill topbar-pill--static"
            title="Current country context"
          >
            <span>{COUNTRY_FLAGS[country] ?? "🌍"}</span>
            {country}
          </div>
        )}

        {/* Slot for page-specific actions */}
        {children}

        {/* AI status */}
        <div
          className="topbar-pill topbar-pill--static"
          title="Mistral AI — connected"
          style={{ gap: 6, background: "var(--mistral-gradient)", borderColor: "transparent" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white", boxShadow: "0 0 6px rgba(255, 112, 0, 0.3)", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", color: "white" }}>MISTRAL AI</span>
        </div>

        {/* Notifications */}
        <button
          className="topbar-pill"
          aria-label="Notifications"
          title="Notifications — coming soon"
          disabled
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
      </div>
    </header>
  );
}
