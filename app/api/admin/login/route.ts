import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// The admin passcode - in production, use an environment variable
const ADMIN_PASSCODE = "cookie123"

export async function POST(request: Request) {
  const { passcode } = await request.json()

  if (passcode === ADMIN_PASSCODE) {
    // Set a cookie to indicate admin access
    cookies().set("admin_access", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid passcode" }, { status: 401 })
}

