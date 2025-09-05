import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

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
        // Require token for protected pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/materials/:path*",
    "/team/:path*",
    "/ar-tools/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};