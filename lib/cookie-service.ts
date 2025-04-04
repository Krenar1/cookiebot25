import type { CookieCategory, ThemeConfig } from "@/types/cookie-types"
import { defaultCategories, defaultTheme } from "@/lib/cookie-defaults"

// In a real application, this would be stored in a database
// For this example, we'll use an in-memory store
const apiKeys: Record<
  string,
  {
    allowedDomains: string[]
    settings: {
      categories: CookieCategory[]
      theme: ThemeConfig
      companyName: string
    }
  }
> = {
  "demo-api-key": {
    allowedDomains: ["example.com", "test.com", "localhost"],
    settings: {
      categories: defaultCategories,
      theme: defaultTheme,
      companyName: "Demo Company",
    },
  },
}

// Store domain-specific settings
const domainSettings: Record<string, Record<string, any>> = {}

export async function getAllowedDomains(apiKey: string): Promise<string[]> {
  // In a real application, this would fetch from a database
  if (!apiKeys[apiKey]) {
    return []
  }

  return apiKeys[apiKey].allowedDomains
}

export async function getConsentSettings(apiKey: string) {
  // In a real application, this would fetch from a database
  if (!apiKeys[apiKey]) {
    return {
      categories: defaultCategories,
      theme: defaultTheme,
      companyName: "Default Company",
    }
  }

  return apiKeys[apiKey].settings
}

export async function addAllowedDomain(apiKey: string, domain: string) {
  // In a real application, this would update a database
  if (!apiKeys[apiKey]) {
    return false
  }

  if (!apiKeys[apiKey].allowedDomains.includes(domain)) {
    apiKeys[apiKey].allowedDomains.push(domain)
  }

  return true
}

export async function removeAllowedDomain(apiKey: string, domain: string) {
  // In a real application, this would update a database
  if (!apiKeys[apiKey]) {
    return false
  }

  apiKeys[apiKey].allowedDomains = apiKeys[apiKey].allowedDomains.filter((d) => d !== domain)

  return true
}

export async function updateSettings(apiKey: string, settings: any) {
  // In a real application, this would update a database
  if (!apiKeys[apiKey]) {
    return false
  }

  apiKeys[apiKey].settings = settings

  return true
}

export async function createApiKey(name: string): Promise<string> {
  // In a real application, this would create a new API key in the database
  const apiKey = `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  apiKeys[apiKey] = {
    allowedDomains: [],
    settings: {
      categories: defaultCategories,
      theme: defaultTheme,
      companyName: name,
    },
  }

  return apiKey
}

export async function getAllApiKeys() {
  // In a real application, this would fetch all API keys from the database
  return Object.keys(apiKeys).map((key) => ({
    key,
    domains: apiKeys[key].allowedDomains,
    companyName: apiKeys[key].settings.companyName,
  }))
}

export async function getDomainSettings(apiKey: string, domain: string) {
  // In a real application, this would fetch from a database
  const key = `${apiKey}:${domain}`

  if (!domainSettings[key]) {
    // Return default settings if none exist
    return {
      theme: "classic",
      companyName: "My Company",
    }
  }

  return domainSettings[key]
}

export async function updateDomainSettings(apiKey: string, domain: string, settings: any) {
  // In a real application, this would update a database
  const key = `${apiKey}:${domain}`

  domainSettings[key] = settings

  return true
}

