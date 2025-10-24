import { NextRequest, NextResponse } from 'next/server';

// Protected routes yang memerlukan authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/super-admin',
  '/admin', // ADMIN routes
];

// Public routes yang tidak memerlukan authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
  '/about',
  '/conferences',
];

// Admin routes mapping
const adminRoutes = {
  '/admin/ICICYTA': 'ADMIN_ICICYTA',
  '/admin/ICODSA': 'ADMIN_ICODSA',
};

// Super admin routes
const superAdminRoutes = [
  '/super-admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware untuk API routes, static files, dan _next
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }


  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Check refresh token exists
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For admin routes, we'll let the client-side handle role verification
    // since server-side user data fetching is complex in middleware
    return NextResponse.next();
  }

  // Handle auth routes (login, register) - redirect if already authenticated
  if ((pathname === '/login' || pathname === '/register') && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};