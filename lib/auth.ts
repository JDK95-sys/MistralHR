import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ─── Vercel URL auto-detection ─────────────────────────────────────
// NEXTAUTH_URL must match the deployed origin.
// On Vercel, VERCEL_URL is injected automatically — use it as a
// fallback so the app works without manually setting NEXTAUTH_URL.
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const DEMO_PASSWORD = process.env.AUTH_PASSWORD ?? "hackathon2025";

const USERS = [
  {
    id: "user-fr-01",
    email: "alice.martin@mistralhr.demo",
    password: DEMO_PASSWORD,
    name: "Alice Martin",
    jobTitle: "Software Engineer",
    country: "France",
    department: "Engineering",
    portalRole: "employee",
  },
  {
    id: "user-be-01",
    email: "jan.peeters@mistralhr.demo",
    password: DEMO_PASSWORD,
    name: "Jan Peeters",
    jobTitle: "HR Business Partner",
    country: "Belgium",
    department: "Human Resources",
    portalRole: "hrbp",
  },
];

export const authOptions: NextAuthOptions = {
  // Explicitly pass the secret so NextAuth can find it even when the
  // environment variable name differs across hosting platforms.
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );
        return user ?? null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as (typeof USERS)[0];
        token.id = u.id;
        token.country = u.country;
        token.department = u.department;
        token.jobTitle = u.jobTitle;
        token.portalRole = u.portalRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.country = token.country ?? null;
        session.user.department = token.department ?? null;
        session.user.jobTitle = token.jobTitle ?? null;
        session.user.portalRole = token.portalRole ?? null;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
