import { NextRequest, NextResponse } from 'next/server';

// Protected routes yang memerlukan authentication
const protectedRoutes = [
  '/profile',
  '/super-admin',
  '/admin',
];

// Public routes yang tidak memerlukan authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
  '/about',
  '/user',
  '/user/ICICYTA',
  '/user/ICODSA',
];

// Admin routes mapping
const adminRoutes = {
  '/admin/ICICyTA': 'ADMIN_ICICYTA',
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
  if (isProtectedRoute) {
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle auth routes (login, register) - redirect if already authenticated
  if ((pathname === '/login' || pathname === '/register') && refreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};