import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Root "/" always redirects:
// → authenticated users go to the HR chat homepage
// → unauthenticated users go to login (middleware handles this too)
export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/chat");
  } else {
    redirect("/login");
  }
}
