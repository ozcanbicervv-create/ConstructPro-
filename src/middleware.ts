import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true;
        }
        // Allow access to public API endpoints
        if (req.nextUrl.pathname.startsWith("/api/health") || 
            req.nextUrl.pathname.startsWith("/api/docs")) {
          return true;
        }
        // Allow access to NextAuth API routes
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }
        // Require token for protected pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protected pages
    "/dashboard/:path*",
    "/projects/:path*",
    "/materials/:path*",
    "/team/:path*",
    "/ar-tools/:path*",
    "/admin/:path*",
    "/profile/:path*",
    // API routes
    "/api/:path*",
    // Static files that need security headers (excluding test-auth)
    "/((?!_next/static|_next/image|favicon.ico|test-auth|api/auth/test-login).*)",
  ],
};