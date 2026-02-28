"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[ProtectedError]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted, #8b8b96)", maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      {error.digest && (
        <p style={{ fontSize: 11, color: "var(--text-muted, #555)", fontFamily: "monospace", marginBottom: 16 }}>
          Error reference: {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "var(--orange, #FF7000)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/chat")}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "1px solid var(--border, #2a2a2f)",
            background: "transparent",
            color: "var(--text-secondary, #c5c5ca)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
