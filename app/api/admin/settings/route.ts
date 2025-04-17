import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateSettings, getConsentSettings } from "@/lib/cookie-service"
import { cookieThemes } from "@/lib/cookie-themes"

export async function POST(request: Request) {
  // Check if user is authenticated
  const adminAccess = cookies().get("admin_access")?.value === "true"
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { apiKey, theme, companyName } = await request.json()

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 })
  }

  // Get current settings
  const currentSettings = await getConsentSettings(apiKey)

  // Update settings
  const newSettings = {
    ...currentSettings,
    theme: cookieThemes[theme] || cookieThemes.classic,
    companyName: companyName || currentSettings.companyName,
  }

  const success = await updateSettings(apiKey, newSettings)

  if (success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
