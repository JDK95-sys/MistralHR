"use client";

/**
 * Route-level error boundary — catches errors in child routes.
 * Logs the error (including digest when available) for production
 * observability, then shows a user-friendly recovery UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(
    "[Error]",
    error.message,
    error.digest ? `(digest: ${error.digest})` : ""
  );

  return (
    <div
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
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>
          An error occurred while loading this page. Please try again or
          navigate back.
          {error.digest && (
            <span style={{ display: "block", marginTop: 8, fontSize: 13, color: "#777" }}>
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
    </div>
  );
}
