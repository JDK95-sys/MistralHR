import Link from "next/link";

export default function NotFound() {
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
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #FF7000, #FF9A40)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          404
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Page not found
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/chat"
          style={{
            padding: "10px 24px",
            borderRadius: 9999,
            border: "none",
            background: "var(--orange)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to Chat
        </Link>
      </div>
    </div>
  );
}
