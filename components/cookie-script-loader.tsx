"use client"

import { useEffect } from "react"

interface CookieScriptLoaderProps {
  settings: {
    necessary: boolean
    functional: boolean
    analytics: boolean
    marketing: boolean
  }
}

export function CookieScriptLoader({ settings }: CookieScriptLoaderProps) {
  useEffect(() => {
    // Only load scripts if the user has consented
    if (settings.necessary) {
      // Load necessary scripts
      loadScript("https://web.cmp.usercentrics.eu/modules/autoblocker.js")
    }

    if (settings.functional) {
      // Load functional scripts
      // Example: loadScript("https://functional-script-url.js")
    }

    if (settings.analytics) {
      // Load analytics scripts
      // Example: loadScript("https://analytics-script-url.js")
    }

    if (settings.marketing) {
      // Load marketing scripts
      // Example: loadScript("https://marketing-script-url.js")
    }

    // Load Usercentrics CMP if any cookies are enabled
    if (settings.necessary) {
      loadScript("https://web.cmp.usercentrics.eu/ui/loader.js", {
        id: "usercentrics-cmp",
        "data-settings-id": "RqrHVnVLkJzwCj",
        async: true,
      })
    }
  }, [settings])

  return null
}

function loadScript(src: string, attributes?: Record<string, string | boolean>) {
  const script = document.createElement("script")
  script.src = src

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value.toString())
    })
  }

  document.head.appendChild(script)

  return script
}

