import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple JWT payload parser (Edge-safe, uses atob).
 * Expects a standard JWT: header.payload.signature
 */
function parseJwtPayload(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const jsonPayload = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip static, api, _next, assets, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Protect all /super-admin routes
  if (pathname.startsWith("/super-admin")) {
    // try to read non-httpOnly cookie 'accessToken' (we set this client-side)
    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      // no token -> redirect to login
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = parseJwtPayload(accessToken);
    if (!payload || !payload.role) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // allow only SUPER_ADMIN
    // adapt condition if payload.role format differs (string or array)
    const role = payload.role;
    if (role !== "SUPER_ADMIN") {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // allowed
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Apply middleware only to /super-admin routes
export const config = {
  matcher: ["/super-admin/:path*"],
};