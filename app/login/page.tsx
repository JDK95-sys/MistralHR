"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import MistralMark from "@/components/icons/MistralMark";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a server configuration problem. Please contact your administrator.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. Please request a new one.",
  Default: "An error occurred during sign in. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(AUTH_ERROR_MESSAGES[urlError] ?? AUTH_ERROR_MESSAGES.Default);
    }
  }, [searchParams]);

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
      style={{ background: "var(--bg)", fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #FF7000, #FF9A40)",
            }}
          >
            <MistralMark size={20} strokeWidth={2.8} />
          </div>
          <div>
            <div
              className="font-bold leading-tight"
              style={{ fontSize: 17, letterSpacing: "-0.025em", color: "var(--text-primary)" }}
            >
              MistralHR
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              Powered by Mistral AI · FR &amp; BE
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--mistral-shadow)",
          }}
        >
          <h1
            className="font-bold mb-1"
            style={{ fontSize: 20, letterSpacing: "-0.025em", color: "var(--text-primary)" }}
          >
            Sign in to MistralHR
          </h1>
          <p className="mb-6" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Powered by Mistral AI · Secure and compliant
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
            background: "var(--orange-soft)",
            border: "1px solid var(--orange-border)",
          }}
        >
          <p style={{ fontSize: 11.5, color: "var(--orange)", fontWeight: 600, marginBottom: 4 }}>
            Demo credentials
          </p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            alice.martin@mistralhr.demo <span style={{ color: "var(--text-muted)" }}>(France)</span>
            <br />
            jan.peeters@mistralhr.demo <span style={{ color: "var(--text-muted)" }}>(Belgium)</span>
            <br />
            Password: <span style={{ fontFamily: "var(--font-mono)" }}>hackathon2025</span>
            <br />
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Powered by Mistral AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
