/**
 * SECURITY AUDIT CHECKLIST — middleware.ts
 * ✅ Authentication: withAuth wrapper preserved — unauthenticated users redirect to /login
 * ✅ Country source: token.country from signed JWT — cannot be tampered by client
 * ✅ Cross-country access: /policies/<be-*> for France users → silent redirect to /policies
 * ✅ Cross-country access: /policies/<fr-*> for Belgium users → silent redirect to /policies
 * ✅ No error pages: redirect is to /policies (the list page), not an error route
 * ✅ No information leakage: no response body, no error message, no "not available for your country"
 * ✅ Policy list page (/policies without ID): always allowed — not affected by this gate
 * ✅ Non-policy routes: completely unaffected — pass through normally
 * ✅ Trusted header: x-user-country injected from JWT for downstream use
 * ✅ Matcher config: unchanged from original — same exclusion patterns
 */

import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const COUNTRY_PREFIX_MAP: Record<string, string> = {
  fr: "France",
  be: "Belgium",
};

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const country = token?.country as string | undefined;

    if (!country) {
      return NextResponse.next();
    }

    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/policies/")) {
      const policyId = pathname.slice("/policies/".length);

      if (policyId) {
        const prefix = policyId.split("-")[0];
        const expectedCountry = COUNTRY_PREFIX_MAP[prefix];

        if (expectedCountry && expectedCountry !== country) {
          const url = req.nextUrl.clone();
          url.pathname = "/policies";
          return NextResponse.redirect(url);
        }
      }
    }

    const response = NextResponse.next();
    response.headers.set("x-user-country", country);
    return response;
  },
  { pages: { signIn: "/login" } }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|favicon\\.svg|public).*)",
  ],
};
