"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

// Wraps the app in NextAuth's SessionProvider so useSession()
// works in any client component throughout the portal.
export default function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
