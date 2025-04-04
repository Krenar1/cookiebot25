import { NextResponse } from "next/server"
import { getAllowedDomains, getConsentSettings } from "@/lib/cookie-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("key")
  const domain = searchParams.get("domain")

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  // Verify if the domain is allowed to use this cookie consent
  const allowedDomains = await getAllowedDomains(apiKey)

  // Check if the exact domain is in the allowed list or if there's a wildcard
  const isDomainAllowed = allowedDomains.includes(domain) || allowedDomains.includes("*")

  if (!isDomainAllowed) {
    return NextResponse.json({ error: "Domain not authorized", authorized: false }, { status: 403 })
  }

  // Get the cookie consent settings for this API key
  const settings = await getConsentSettings(apiKey)
  const theme = settings.theme || {}

  // Set CORS headers
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", `https://${domain}`)
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Content-Type", "text/css")

  // Generate CSS with the theme settings
  const css = `
    #cookie-consent-container {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .cookie-consent-banner, .cookie-consent-preferences {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: ${theme.backgroundColor || "#ffffff"};
      color: ${theme.textColor || "#333333"};
      border-top: 1px solid ${theme.borderColor || "#e2e8f0"};
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      max-width: 1200px;
      margin: 0 auto;
      border-radius: ${theme.borderRadius || "0.5rem"} ${theme.borderRadius || "0.5rem"} 0 0;
      overflow: hidden;
    }
    
    .cookie-consent-content {
      padding: 1.5rem;
    }
    
    .cookie-consent-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: ${theme.headingColor || "#111111"};
    }
    
    .cookie-consent-header p {
      margin: 0 0 1rem 0;
      color: ${theme.descriptionColor || "#666666"};
    }
    
    .cookie-consent-body {
      margin-bottom: 1.5rem;
    }
    
    .cookie-consent-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    .cookie-consent-footer button {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
    }
    
    .accept-all-btn {
      background-color: ${theme.acceptButtonColor || "#2563eb"};
      color: ${theme.acceptButtonTextColor || "#ffffff"};
    }
    
    .reject-all-btn {
      background-color: ${theme.rejectButtonColor || "#ffffff"};
      color: ${theme.rejectButtonTextColor || "#333333"};
      border-color: ${theme.borderColor || "#e2e8f0"} !important;
    }
    
    .customize-btn {
      background-color: ${theme.customizeButtonColor || "#ffffff"};
      color: ${theme.customizeButtonTextColor || "#333333"};
      border-color: ${theme.borderColor || "#e2e8f0"} !important;
    }
    
    .save-preferences-btn {
      background-color: ${theme.acceptButtonColor || "#2563eb"};
      color: ${theme.acceptButtonTextColor || "#ffffff"};
    }
    
    .cookie-settings-btn {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      background-color: ${theme.settingsButtonColor || "#ffffff"};
      color: ${theme.settingsButtonTextColor || "#333333"};
      border: 1px solid ${theme.borderColor || "#e2e8f0"};
      border-radius: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
      z-index: 9998;
    }
    
    .cookie-category {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid ${theme.borderColor || "#e2e8f0"};
    }
    
    .cookie-category:last-child {
      border-bottom: none;
    }
    
    .cookie-category-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .cookie-category-header h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: ${theme.headingColor || "#111111"};
    }
    
    .cookie-category-header p {
      margin: 0;
      font-size: 0.875rem;
      color: ${theme.descriptionColor || "#666666"};
    }
    
    /* Toggle switch styles */
    .toggle {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 24px;
      margin-left: 1rem;
    }
    
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
      background-color: ${theme.switchActiveColor || "#2563eb"};
    }
    
    input:disabled + .toggle-slider {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
    
    /* Responsive styles */
    @media (max-width: 640px) {
      .cookie-consent-footer {
        flex-direction: column;
      }
      
      .cookie-consent-footer button {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  `

  return new Response(css, {
    headers,
  })
}

