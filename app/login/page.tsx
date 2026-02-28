"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.ok) {
      router.push("/chat");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#FFFAEB", fontFamily: "var(--font-sans)", position: "relative", overflow: "hidden" }}
    >
      {/* Decorative radial-gradient orb — top right */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(255,130,5,0.15) 0%, rgba(255,175,0,0.08) 40%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-sm" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo / wordmark */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {/* Mistral pixel-M SVG */}
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Row 1: cols 1,2 and 6,7 */}
            <rect x="0"  y="0"  width="5" height="5" fill="#FFD800" />
            <rect x="6"  y="0"  width="5" height="5" fill="#FFD800" />
            <rect x="33" y="0"  width="5" height="5" fill="#FA500F" />
            <rect x="39" y="0"  width="5" height="5" fill="#E10500" />
            {/* Row 2: cols 1,2,3 and 5,6,7 */}
            <rect x="0"  y="6"  width="5" height="5" fill="#FFD800" />
            <rect x="6"  y="6"  width="5" height="5" fill="#FFD800" />
            <rect x="13" y="6"  width="5" height="5" fill="#FF8205" />
            <rect x="26" y="6"  width="5" height="5" fill="#FA500F" />
            <rect x="33" y="6"  width="5" height="5" fill="#FA500F" />
            <rect x="39" y="6"  width="5" height="5" fill="#E10500" />
            {/* Row 3: cols 1,3,4,5,7 */}
            <rect x="0"  y="13" width="5" height="5" fill="#FFD800" />
            <rect x="13" y="13" width="5" height="5" fill="#FF8205" />
            <rect x="20" y="13" width="5" height="5" fill="#FF8205" />
            <rect x="26" y="13" width="5" height="5" fill="#FA500F" />
            <rect x="39" y="13" width="5" height="5" fill="#E10500" />
            {/* Row 4: cols 1,4,7 */}
            <rect x="0"  y="20" width="5" height="5" fill="#FFD800" />
            <rect x="20" y="20" width="5" height="5" fill="#FF8205" />
            <rect x="39" y="20" width="5" height="5" fill="#E10500" />
            {/* Row 5: cols 1,7 */}
            <rect x="0"  y="27" width="5" height="5" fill="#FFD800" />
            <rect x="39" y="27" width="5" height="5" fill="#E10500" />
          </svg>
          <div>
            <div
              className="font-bold leading-tight"
              style={{ fontSize: 20, letterSpacing: "-0.03em", color: "var(--text-primary)" }}
            >
              MistralHR
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              HR Policy Assistant · France &amp; Belgium
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)",
            border: "1px solid #E9E2CB",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h1
            className="font-bold mb-1"
            style={{ fontSize: 20, letterSpacing: "-0.025em", color: "var(--text-primary)" }}
          >
            Sign in
          </h1>
          <p className="mb-6" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Access your HR policy assistant
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--orange)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--orange-soft)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                className="block mb-1.5"
                style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--orange)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px var(--orange-soft)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: loading ? "var(--orange-hover)" : "var(--orange)",
                color: "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? "none" : "var(--orange-shadow)",
                fontFamily: "var(--font-sans)",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "linear-gradient(90deg, #FF8205, #FFAF00)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--orange)";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block rounded-full border-2"
                    style={{
                      width: 14,
                      height: 14,
                      borderColor: "rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-4 px-4 py-3 rounded-xl text-center"
          style={{
            background: "#FFF0C3",
            border: "1px solid #E9E2CB",
          }}
        >
          <p style={{ fontSize: 11.5, color: "#FA500F", fontWeight: 600, marginBottom: 4 }}>
            Demo credentials
          </p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            alice.martin@mistralhr.demo <span style={{ color: "var(--text-muted)" }}>(France)</span>
            <br />
            jan.peeters@mistralhr.demo <span style={{ color: "var(--text-muted)" }}>(Belgium)</span>
            <br />
            Password: <span style={{ fontFamily: "var(--font-mono)" }}>demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
