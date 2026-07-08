import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Auth routes - redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

// Static files and API routes to skip
const SKIP_ROUTES = ["/_next", "/api", "/favicon.ico", "/images", "/fonts"];

// The backend-set httpOnly refresh cookie. Middleware runs server-side, so it
// CAN read httpOnly cookies — this is a UX guard only; the API (which
// validates JWTs + session state) is the actual security boundary.
const REFRESH_COOKIE = "jobscout_refresh";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (SKIP_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Demo mode has no backend and therefore no cookie — let everything through
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const hasSession = !!request.cookies.get(REFRESH_COOKIE)?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user has a session and hits login/register, send them to the app
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // No session on a protected route → login (with return destination)
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
