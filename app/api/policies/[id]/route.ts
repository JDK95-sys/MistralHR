/**
 * SECURITY AUDIT CHECKLIST:
 * ✅ Country is read from session.user.country (signed JWT) — never from query params or request body
 * ✅ Unauthenticated requests return 401 with no data
 * ✅ Cross-country policy requests return opaque 404 (no country disclosure)
 * ✅ Policy detail endpoint returns full policy content only for authenticated, in-country requests
 * ✅ This route is server-side only — no "use client" directive
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPolicyByIdForCountry } from "@/lib/policies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = session.user.country ?? "";
  const policy = getPolicyByIdForCountry(params.id, country);

  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  return NextResponse.json({ country, policy });
}
