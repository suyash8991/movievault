import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/watchlist'];

/**
 * Check if a route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Next.js Middleware for Route Protection
 *
 * This middleware runs on every request and:
 * 1. Checks if the user has valid authentication tokens
 * 2. Redirects unauthenticated users away from protected routes
 * 3. Redirects authenticated users away from auth pages (login/register)
 * 4. Preserves the intended destination for post-login redirect
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication tokens from cookies or headers
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      // Store the intended destination
      const url = new URL('/login', request.url);
      url.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register pages
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    // Check if there's a returnTo parameter
    const returnTo = request.nextUrl.searchParams.get('returnTo');
    const destination = returnTo || '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
