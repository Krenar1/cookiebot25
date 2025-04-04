"use client"

import { useState, useEffect } from "react"
import { CookieScriptLoader } from "@/components/cookie-script-loader"

export default function CookieManager() {
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const savedSettings = localStorage.getItem("cookieConsent")
    if (savedSettings) {
      setCookieSettings(JSON.parse(savedSettings))
    }
  }, [])

  return <CookieScriptLoader settings={cookieSettings} />
}

