"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProtectedErrorBoundary] Unhandled error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--orange)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 24,
            color: "#fff",
          }}
        >
          ⚠️
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4, lineHeight: 1.6 }}>
          We encountered an error loading this page. Please try again or navigate back to the chat.
        </p>
        {error.digest && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, fontFamily: "var(--font-mono)" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              border: "none",
              background: "var(--orange)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/chat"
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Go to Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
