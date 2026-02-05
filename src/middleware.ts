import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Auth routes - redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/register"];

// Static files and API routes to skip
const SKIP_ROUTES = ["/_next", "/api", "/favicon.ico", "/images", "/fonts"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (SKIP_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get("jobscout_access_token")?.value;

  // Also check Authorization header for API calls
  const authHeader = request.headers.get("Authorization");
  const hasToken = !!accessToken || !!authHeader;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (hasToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!hasToken && !isPublicRoute) {
    // Store the intended destination for redirect after login
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
