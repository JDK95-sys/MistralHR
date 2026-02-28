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
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-slate-900 text-white w-1/2">
        <div className="text-3xl font-bold mb-4">HR Assistant</div>
        <p className="text-slate-400 max-w-sm">
          Your internal HR assistant for France and Belgium — policies,
          leave rules, and legal references in one place.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-md text-sm"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Demo: alice.martin@mistralhr.demo (FR) · jan.peeters@mistralhr.demo (BE) · Password: demo1234
          </p>
        </form>
      </div>
    </div>
  );
}
