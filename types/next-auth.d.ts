// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      country?: string | null;
      department?: string | null;
      jobTitle?: string | null;
      portalRole?: string | null;
      preferredLanguage?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    country?: string;
    department?: string;
    jobTitle?: string;
    portalRole?: string;
  }
}
