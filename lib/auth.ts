import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).country = token.country;
        (session.user as any).department = token.department;
        (session.user as any).jobTitle = token.jobTitle;
        (session.user as any).portalRole = token.portalRole;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
