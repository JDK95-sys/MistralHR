import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MistralHR",
    template: "%s | MistralHR",
  },
  description:
    "MistralHR — AI-powered HR platform by Mistral AI. Policies, benefits and HR assistance across 20+ countries.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
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
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("[RootLayout] Failed to fetch server session:", error);
  }

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
