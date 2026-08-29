import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Step 6 (Decision 3): the tester portal is magic-link authenticated. Assignment and reminder
// emails deep-link straight to /tester/assignments/<id>; if the tester's session has expired, this
// middleware captures the intended destination as ?next=... and hands it to the tester sign-in
// page, which passes it back to better-auth as the magic link's callbackURL. The tester therefore
// lands on the assignment they were emailed about, not a generic dashboard.
//
// This is a cheap cookie-presence check only - it is NOT the authorization boundary. Every
// /tester route still runs requireActiveTester() server-side (see src/app/tester/(portal)/layout.tsx).
// Owner/admin routes are deliberately not matched here; /login is untouched.
export function middleware(request: NextRequest) {
  // The sign-in page itself is public - never bounce it, or the redirect would loop.
  if (request.nextUrl.pathname.startsWith("/tester/login")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request, { cookiePrefix: "kavri" });

  if (!sessionCookie) {
    const signInUrl = new URL("/tester/login", request.url);
    const next = request.nextUrl.pathname + request.nextUrl.search;
    signInUrl.searchParams.set("next", next);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tester", "/tester/:path*"],
};
