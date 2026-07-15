import { NextRequest, NextResponse } from "next/server";

/**
 * UX-only route gating based on the `edusubmit_role` cookie set at login.
 * This is NOT the security boundary — every API call is independently
 * authorized by the Django backend via the Bearer token. This middleware
 * just avoids flashing the wrong dashboard / bouncing users to /login early.
 */

const ROLE_PREFIXES: Record<string, string> = {
  "/student": "student",
  "/lecturer": "lecturer",
  "/admin": "admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("edusubmit_role")?.value;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) => pathname.startsWith(p));
  if (!matchedPrefix) return NextResponse.next();

  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (role !== ROLE_PREFIXES[matchedPrefix]) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/lecturer/:path*", "/admin/:path*"],
};
