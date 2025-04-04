import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the admin access cookie
  cookies().delete("admin_access")

  return NextResponse.json({ success: true })
}

