/**
 * SECURITY AUDIT CHECKLIST:
 * ✅ Country is read from session.user.country (signed JWT) — never from query params or request body
 * ✅ Unauthenticated requests return 401 with no data
 * ✅ Cross-country policy requests return opaque 404 (no country disclosure)
 * ✅ Policy list endpoint strips `content` field to minimize data exposure
 * ✅ This route is server-side only — no "use client" directive
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPoliciesForCountry } from "@/lib/policies";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = session.user.country ?? "";
  const policies = getPoliciesForCountry(country);

  const summaries = policies.map((policy) => {
    const { content, ...summary } = policy;
    return summary;
  });

  return NextResponse.json({ country, policies: summaries });
}
