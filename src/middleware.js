// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value; // example: get from cookie

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/Login", request.url));
  }

  // If token exists but user tries to access `/Invoice`
  if (request.nextUrl.pathname.startsWith("/Invoice")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Otherwise continue
  return NextResponse.next();
}

// Paths to apply this middleware
export const config = {
  matcher: [ "/Reports/:path*", "/"], // adjust as needed
};
