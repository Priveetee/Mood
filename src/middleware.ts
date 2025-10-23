import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const adminPathPrefix = "/admin";
  const loginPath = "/login";
  const pollClosedPath = "/poll/closed";

  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      isAuthenticated = true;
    } catch (error: any) {
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
