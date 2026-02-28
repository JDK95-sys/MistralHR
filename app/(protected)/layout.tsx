import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TutorialClient from "@/components/TutorialClient";

// This layout wraps every protected page.
// Server-side session check here is a safety net —
// the middleware.ts handles the primary redirect.

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--sidebar-bg)", position: "relative" }}>
      {/* Animated background mesh */}
      <div className="app-bg" />
      <div className="bg-orb-2" />

      {/* Sidebar — fixed width, full height */}
      <Sidebar />
      <TutorialClient />

      {/* Main content area — scrollable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  );
}
