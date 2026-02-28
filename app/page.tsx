import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Root "/" always redirects:
// → authenticated users go to the HR chat homepage
// → unauthenticated users go to login (middleware handles this too)
export default async function RootPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // If session check fails, treat as unauthenticated
    console.error("[RootPage] Failed to fetch server session");
  }

  if (session) {
    redirect("/chat");
  } else {
    redirect("/login");
  }
}
