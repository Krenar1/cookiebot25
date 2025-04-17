import type { CookieCategory, CookieSettings, ThemeConfig } from "@/types/cookie-types"

export const defaultTheme: ThemeConfig = {
  backgroundColor: "#ffffff",
  textColor: "#333333",
  headingColor: "#111111",
  descriptionColor: "#666666",
  borderColor: "#e2e8f0",
  borderRadius: "0.5rem",

  acceptButtonColor: "#2563eb",
  acceptButtonTextColor: "#ffffff",
  rejectButtonColor: "#ffffff",
  rejectButtonTextColor: "#333333",
  customizeButtonColor: "#ffffff",
  customizeButtonTextColor: "#333333",
  settingsButtonColor: "#ffffff",
  settingsButtonTextColor: "#333333",

  switchActiveColor: "#2563eb",
}

export const defaultCategories: CookieCategory[] = [
  {
    id: "necessary",
    name: "Necessary Cookies",
    description: "These cookies are essential for the website to function properly.",
    required: true,
    domains: ["*"],
    scripts: [
      {
        src: "https://web.cmp.usercentrics.eu/modules/autoblocker.js",
        attributes: {},
      },
    ],
  },
  {
    id: "functional",
    name: "Functional Cookies",
    description: "These cookies enable personalized features and remember your preferences.",
    required: false,
    domains: ["yourdomain.com", "cdn.yourdomain.com"],
    scripts: [],
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description: "These cookies help us understand how visitors interact with our website.",
    required: false,
    domains: ["google-analytics.com", "googletagmanager.com"],
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=YOUR-ID",
        attributes: { async: true },
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description: "These cookies are used to deliver advertisements relevant to you.",
    required: false,
    domains: ["doubleclick.net", "facebook.net", "ads-twitter.com"],
    scripts: [],
  },
]

export const defaultCookieSettings: CookieSettings = {
  necessary: {
    enabled: true,
    allowedDomains: ["*"],
  },
  functional: {
    enabled: false,
    allowedDomains: [],
  },
  analytics: {
    enabled: false,
    allowedDomains: [],
  },
  marketing: {
    enabled: false,
    allowedDomains: [],
  },
}
