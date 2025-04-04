"use client"

import { useEffect } from "react"
import type { CookieSettings, CookieCategory } from "@/types/cookie-types"

interface CookieScriptLoaderProps {
  settings: CookieSettings
  categories: CookieCategory[]
}

export function CookieScriptLoader({ settings, categories }: CookieScriptLoaderProps) {
  useEffect(() => {
    // Clean up any previously loaded scripts
    const previousScripts = document.querySelectorAll("script[data-cookie-script]")
    previousScripts.forEach((script) => script.remove())

    // Load scripts based on user consent
    categories.forEach((category) => {
      const categorySettings = settings[category.id]

      if (categorySettings?.enabled) {
        // Load scripts for this category
        category.scripts.forEach((script) => {
          // Check if the script's domain is allowed
          const scriptDomain = extractDomain(script.src)
          if (categorySettings.allowedDomains.includes(scriptDomain) || categorySettings.allowedDomains.includes("*")) {
            loadScript(script.src, script.attributes)
          }
        })
      }
    })
  }, [settings, categories])

  return null
}

function loadScript(src: string, attributes?: Record<string, string | boolean>) {
  const script = document.createElement("script")
  script.src = src
  script.setAttribute("data-cookie-script", "true")

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value.toString())
    })
  }

  document.head.appendChild(script)
  return script
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (e) {
    return url
  }
}

