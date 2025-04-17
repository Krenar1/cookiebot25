import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDomainSettings, updateDomainSettings } from "@/lib/cookie-service"

export async function GET(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("key")
  const domain = searchParams.get("domain")

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  const settings = await getDomainSettings(apiKey, domain)

  return NextResponse.json({ settings })
}

export async function POST(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { apiKey, domain, settings } = await request.json()

  if (!apiKey || !domain || !settings) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  console.log(`API: Saving domain settings for ${domain}:`, settings)

  const success = await updateDomainSettings(apiKey, domain, settings)

  if (success) {
    // Verify the settings were saved correctly
    const savedSettings = await getDomainSettings(apiKey, domain)
    console.log(`API: Verified saved settings for ${domain}:`, savedSettings)

    return NextResponse.json({ success: true, savedSettings })
  } else {
    return NextResponse.json({ error: "Failed to update domain settings" }, { status: 500 })
  }
}
