"use client";

// global-error.tsx catches errors that occur in the root layout.
// It must provide its own <html> and <body> tags because it
// completely replaces the root layout when active.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#0e0f11", color: "#e8e8ed" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#8b8b96", maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
            An unexpected error occurred. Please try again or contact your administrator if the problem persists.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 16 }}>
              Error reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#FF7000",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
