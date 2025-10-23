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

  console.log("Middleware Path:", request.nextUrl.pathname);
  console.log(
    "Middleware Retrieved token:",
    token ? "Token present" : "No token",
  );

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      isAuthenticated = true;
      console.log("Middleware: Token successfully verified with JOSE.");
    } catch (error: any) {
      isAuthenticated = false;
      console.error(
        "Middleware: JOSE token verification failed:",
        error.message,
      );
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
