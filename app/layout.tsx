import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HR Assistant",
    template: "%s | HR Assistant",
  },
  description:
    "Your intelligent HR hub — policies, jobs, analytics, and AI across 20+ countries.",
  robots: {
    index: false, // Internal tool — never index
    follow: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session server-side and pass to provider
  // This avoids the loading flash on initial render
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
