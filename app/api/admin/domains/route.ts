import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllowedDomains, addAllowedDomain, removeAllowedDomain } from "@/lib/cookie-service"

export async function GET(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("key")

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 })
  }

  const domains = await getAllowedDomains(apiKey)

  return NextResponse.json({ domains })
}

export async function POST(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { apiKey, domain } = await request.json()

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  const success = await addAllowedDomain(apiKey, domain)

  if (success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: "Failed to add domain" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { apiKey, domain } = await request.json()

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  const success = await removeAllowedDomain(apiKey, domain)

  if (success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: "Failed to remove domain" }, { status: 500 })
  }
}
