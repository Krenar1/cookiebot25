import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// The admin passcode - in production, use an environment variable
const ADMIN_PASSCODE = "cookie123"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect admin routes
  if (pathname.startsWith("/admin")) {
    // Check if the user has the admin cookie
    const hasAdminAccess = request.cookies.has("admin_access") && request.cookies.get("admin_access")?.value === "true"

    // If accessing the login page and already authenticated, redirect to admin
    if (pathname === "/admin/login" && hasAdminAccess) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    // If accessing any admin page except login and not authenticated, redirect to login
    if (pathname !== "/admin/login" && !hasAdminAccess) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

