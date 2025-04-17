import { NextResponse } from "next/server"
import { getAllowedDomains, getDomainSettings } from "@/lib/cookie-service"
import { cookieThemes } from "@/lib/cookie-themes"

// Define default categories
const defaultCategories = [
  {
    id: "necessary",
    name: "Necessary",
    description: "These cookies are essential for the website to function properly.",
    required: true,
    domains: ["*"],
    scripts: [],
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
    domains: ["google-analytics.com", "googletagmanager.com"],
    scripts: [],
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.",
    required: false,
    domains: ["doubleclick.net", "facebook.net", "ads-twitter.com"],
    scripts: [],
  },
]

// Update the GET function to better handle localhost and CORS
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get("domain")
  const apiKey = searchParams.get("key")
  const debug = searchParams.get("debug") === "true"

  if (!domain || !apiKey) {
    return NextResponse.json({ error: "Missing domain or API key" }, { status: 400 })
  }

  // Special handling for localhost testing
  const isLocalhost = domain === "localhost" || domain === "127.0.0.1" || domain.includes(".local")

  // Verify if the domain is allowed to use this cookie consent
  const allowedDomains = await getAllowedDomains(apiKey)

  // For localhost, be more permissive with domain verification
  let isDomainAllowed = allowedDomains.includes(domain) || allowedDomains.includes("*")

  // If testing on localhost, also check if any test domains are configured
  if (isLocalhost && !isDomainAllowed) {
    // Check if any test domains are allowed that we can use for localhost
    const testDomain = allowedDomains.find((d) => d !== "*" && !d.includes("localhost"))
    if (testDomain) {
      isDomainAllowed = true
      if (debug) console.log(`Using test domain ${testDomain} for localhost testing`)
    }
  }

  if (!isDomainAllowed) {
    return NextResponse.json({ error: "Domain not authorized", authorized: false }, { status: 403 })
  }

  // Get domain-specific settings
  const domainToUse = isLocalhost ? (allowedDomains[0] !== "*" ? allowedDomains[0] : "example.com") : domain
  const domainSettings = await getDomainSettings(apiKey, domainToUse)

  // Get the theme configuration
  const themeId = domainSettings.theme || "classic"
  const themeConfig = cookieThemes[themeId] || cookieThemes.classic

  if (debug) {
    console.log(`Main API: Using theme ${themeId} for domain ${domainToUse}:`, domainSettings)
  }

  // Set CORS headers to allow the script to be loaded from any domain during development
  // In production, this would be more restrictive
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", "*") // Allow from any origin for testing
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Content-Type", "application/javascript")
  // Add cache control to prevent caching
  headers.set("Cache-Control", "no-store, max-age=0")

  // Hardcode the base URL to ensure it's always correct
  const baseUrl = "https://cookiebot25.vercel.app"

  // Generate the JavaScript code that will be injected into the client's website
  const jsCode = `
  (function() {
    // Cookie Consent Configuration
    window.CookieConsentConfig = {
      allowedDomain: "${domain}",
      companyName: "${domainSettings.companyName || "My Company"}",
      theme: ${JSON.stringify(themeConfig || cookieThemes.classic)},
      themeId: "${themeId || "classic"}",
      categories: ${JSON.stringify(defaultCategories)}
    };
    
    // Debug info
    if (${debug}) {
      console.log("Cookie Consent: Using theme " + window.CookieConsentConfig.themeId);
      console.log("Cookie Consent: Theme config", window.CookieConsentConfig.theme);
    }
    
    // Create container for the cookie consent
    const container = document.createElement('div');
    container.id = 'cookie-consent-container';
    document.body.appendChild(container);
    
    // Apply theme directly to container
    const theme = window.CookieConsentConfig.theme;
    if (theme) {
      // Set container styles directly
      container.style.setProperty('--cookie-bg-color', theme.backgroundColor || '#ffffff');
      container.style.setProperty('--cookie-text-color', theme.textColor || '#333333');
      container.style.setProperty('--cookie-heading-color', theme.headingColor || '#111111');
      container.style.setProperty('--cookie-desc-color', theme.descriptionColor || '#666666');
      container.style.setProperty('--cookie-border-color', theme.borderColor || '#e2e8f0');
      container.style.setProperty('--cookie-border-radius', theme.borderRadius || '0.5rem');
      container.style.setProperty('--cookie-accept-btn-color', theme.acceptButtonColor || '#2563eb');
      container.style.setProperty('--cookie-accept-text-color', theme.acceptButtonTextColor || '#ffffff');
      container.style.setProperty('--cookie-reject-btn-color', theme.rejectButtonColor || '#ffffff');
      container.style.setProperty('--cookie-reject-text-color', theme.rejectButtonTextColor || '#333333');
      container.style.setProperty('--cookie-customize-btn-color', theme.customizeButtonColor || '#ffffff');
      container.style.setProperty('--cookie-customize-text-color', theme.customizeButtonTextColor || '#333333');
      container.style.setProperty('--cookie-settings-btn-color', theme.settingsButtonColor || '#ffffff');
      container.style.setProperty('--cookie-settings-text-color', theme.settingsButtonTextColor || '#333333');
      container.style.setProperty('--cookie-switch-active-color', theme.switchActiveColor || '#2563eb');
    }
    
    // Load the cookie consent styles
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = "${baseUrl}/api/cookie-consent/styles?key=${apiKey}&domain=${domain}&debug=${debug}";
    document.head.appendChild(style);
    
    // Load the cookie consent script
    const script = document.createElement('script');
    script.src = "${baseUrl}/api/cookie-consent/script?key=${apiKey}&domain=${domain}&debug=${debug}";
    script.defer = true;
    document.body.appendChild(script);
  })();
`

  return new Response(jsCode, {
    headers,
  })
}
