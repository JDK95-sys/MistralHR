"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted, #8b8b96)", maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
        An unexpected error occurred. Please try again or contact your administrator if the problem persists.
      </p>
      {error.digest && (
        <p style={{ fontSize: 11, color: "var(--text-muted, #555)", fontFamily: "monospace", marginBottom: 16 }}>
          Error reference: {error.digest}
        </p>
      )}
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
    </div>
  );
}
