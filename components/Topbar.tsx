"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

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

// ─── Coming-soon popover ───────────────────────────────────────────
function ComingSoonPopover({ label }: { label: string }) {
  return (
    <div className="topbar-popover" role="status">
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Coming soon</span>
    </div>
  );
}

interface TopbarProps {
  children?: React.ReactNode;
}

export default function Topbar({ children }: TopbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const country = session?.user?.country;

  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const topbarRef = useRef<HTMLElement>(null);

  const toggle = useCallback((id: string) => {
    setOpenPopover((prev) => (prev === id ? null : id));
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!openPopover) return;
    function handleClick(e: MouseEvent) {
      if (topbarRef.current && !topbarRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openPopover]);

  // Close on Escape
  useEffect(() => {
    if (!openPopover) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPopover(null);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [openPopover]);

  return (
    <header className="topbar" ref={topbarRef}>
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        {/* Country context */}
        {country && (
          <div style={{ position: "relative" }}>
            <button
              className="topbar-pill"
              aria-label={`Country: ${country}`}
              aria-expanded={openPopover === "country"}
              aria-haspopup="true"
              onClick={() => toggle("country")}
            >
              <span>{COUNTRY_FLAGS[country] ?? "🌍"}</span>
              {country}
            </button>
            {openPopover === "country" && (
              <ComingSoonPopover label="Country Selector" />
            )}
          </div>
        )}

        {/* Slot for page-specific actions */}
        {children}

        {/* AI status */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-pill"
            aria-label="Mistral AI status"
            aria-expanded={openPopover === "mistral"}
            aria-haspopup="true"
            onClick={() => toggle("mistral")}
            style={{ gap: 6, background: "var(--mistral-gradient)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white", boxShadow: "0 0 6px rgba(255, 112, 0, 0.3)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em", color: "white" }}>MISTRAL AI</span>
          </button>
          {openPopover === "mistral" && (
            <ComingSoonPopover label="Mistral AI" />
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-pill"
            aria-label="Notifications"
            aria-expanded={openPopover === "notifications"}
            aria-haspopup="true"
            onClick={() => toggle("notifications")}
            style={{ padding: "6px 10px" }}
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
          {openPopover === "notifications" && (
            <ComingSoonPopover label="Notifications" />
          )}
        </div>
      </div>
    </header>
  );
}
