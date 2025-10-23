import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "a-fallback-secret-if-env-is-missing";

export async function middleware(request: NextRequest) {
  const adminPathPrefix = "/admin";
  const loginPath = "/login";
  const pollClosedPath = "/poll/closed";

  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  const isAccessingAdminRoute =
    request.nextUrl.pathname.startsWith(adminPathPrefix);
  const isAccessingLoginRoute = request.nextUrl.pathname.startsWith(loginPath);

  if (isAuthenticated) {
    if (isAccessingLoginRoute) {
      return NextResponse.redirect(new URL(adminPathPrefix, request.url));
    }
    return NextResponse.next();
  } else {
    if (isAccessingAdminRoute) {
      const redirectUrl = new URL(pollClosedPath, request.url);
      redirectUrl.searchParams.set("auth_error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/login", "/admin/:path*"],
};
