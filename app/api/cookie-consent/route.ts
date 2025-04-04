import { NextResponse } from "next/server"
import { getAllowedDomains, getDomainSettings } from "@/lib/cookie-service"
import { cookieThemes } from "@/lib/cookie-themes"

// Define default categories
const defaultCategories = [
  {
    id: "necessary",
    name: "Necessary",
    description: "These cookies are essential for the website to function properly.",
    isEssential: true,
    isChecked: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    isEssential: false,
    isChecked: false,
  },
  {
    id: "marketing",
    name: "Marketing",
    description:
      "These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.",
    isEssential: false,
    isChecked: false,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get("domain")
  const apiKey = searchParams.get("key")
  const configParam = searchParams.get("config")

  if (!domain || !apiKey) {
    return NextResponse.json({ error: "Missing domain or API key" }, { status: 400 })
  }

  // Verify if the domain is allowed to use this cookie consent
  const allowedDomains = await getAllowedDomains(apiKey)

  // Check if the exact domain is in the allowed list or if there's a wildcard
  const isDomainAllowed = allowedDomains.includes(domain) || allowedDomains.includes("*")

  if (!isDomainAllowed) {
    return NextResponse.json({ error: "Domain not authorized", authorized: false }, { status: 403 })
  }

  // Get domain-specific settings
  const domainSettings = await getDomainSettings(apiKey, domain)

  // Get the theme configuration
  const themeId = domainSettings.theme || "classic"
  const themeConfig = cookieThemes[themeId] || cookieThemes.classic

  // Set CORS headers to allow the script to be loaded from the authorized domain
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", `https://${domain}`)
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Content-Type", "application/javascript")

  // Use cookiebot25.vercel.app as the base URL
  const baseUrl = "https://cookiebot25.vercel.app";
  
  // Generate the JavaScript code that will be injected into the client's website
  const jsCode = `
    (function() {
      // Cookie Consent Configuration
      window.CookieConsentConfig = {
        allowedDomain: "${domain}",
        companyName: "${domainSettings.companyName || "My Company"}",
        theme: ${JSON.stringify(themeConfig)},
        categories: ${JSON.stringify(defaultCategories)}
      };
      
      // Verify domain
      const currentDomain = window.location.hostname;
      if (currentDomain !== "${domain}") {
        console.error("Cookie consent not authorized for this domain");
        return;
      }
      
      // Create container for the cookie consent
      const container = document.createElement('div');
      container.id = 'cookie-consent-container';
      document.body.appendChild(container);
      
      // Load the cookie consent styles
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = '${baseUrl}/api/cookie-consent/styles?key=${apiKey}&domain=${domain}';
      document.head.appendChild(style);
      
      // Load the cookie consent script
      const script = document.createElement('script');
      script.src = '${baseUrl}/api/cookie-consent/script?key=${apiKey}&domain=${domain}';
      script.defer = true;
      document.body.appendChild(script);
    })();
  `

  return new Response(jsCode, {
    headers,
  })
}

