"use client";

/**
 * Global error boundary — catches unhandled errors in the root layout.
 * In production, React omits the real message and provides a `digest`
 * property instead. We log both so they surface in observability tools.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(
    "[GlobalError]",
    error.message,
    error.digest ? `(digest: ${error.digest})` : ""
  );

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#FAFAF9",
          color: "#1C1C1E",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480, padding: 24 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            An unexpected error occurred. Please try again or contact your
            administrator if the problem persists.
            {error.digest && (
              <span style={{ display: "block", marginTop: 8, fontSize: 13, color: "#999" }}>
                Reference: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              background: "#FF7000",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
