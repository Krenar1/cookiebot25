"use client"

import { useState, useEffect } from "react"
import { CookieBanner } from "./cookie-banner"
import type { CookieSettings, CookieCategory, ThemeConfig } from "@/types/cookie-types"
import { CookieScriptLoader } from "./cookie-script-loader"
import { Button } from "@/components/ui/button"
import { defaultTheme, defaultCategories } from "@/lib/cookie-defaults"

interface CookieManagerProps {
  categories?: CookieCategory[]
  theme?: ThemeConfig
  position?: "bottom" | "top" | "center"
  companyName?: string
  showSettingsButton?: boolean
}

export function CookieManager({
  categories = defaultCategories,
  theme = defaultTheme,
  position = "bottom",
  companyName = "Our Company",
  showSettingsButton = true,
}: CookieManagerProps) {
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({})
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem("cookieConsent")
    if (savedSettings) {
      setCookieSettings(JSON.parse(savedSettings))
      setConsentGiven(true)
    } else {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = (settings: CookieSettings) => {
    setCookieSettings(settings)
    localStorage.setItem("cookieConsent", JSON.stringify(settings))
    setConsentGiven(true)
    setShowBanner(false)
  }

  const handleReject = () => {
    const requiredOnly = Object.fromEntries(
      categories.filter((cat) => cat.required).map((cat) => [cat.id, { enabled: true, allowedDomains: cat.domains }]),
    ) as CookieSettings

    setCookieSettings(requiredOnly)
    localStorage.setItem("cookieConsent", JSON.stringify(requiredOnly))
    setConsentGiven(true)
    setShowBanner(false)
  }

  return (
    <>
      {showBanner && (
        <CookieBanner
          onAccept={handleAccept}
          onReject={handleReject}
          initialSettings={cookieSettings}
          categories={categories}
          theme={theme}
          position={position}
          companyName={companyName}
        />
      )}

      {consentGiven && <CookieScriptLoader settings={cookieSettings} categories={categories} />}

      {consentGiven && showSettingsButton && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-40"
          onClick={() => setShowBanner(true)}
          style={{
            backgroundColor: theme.settingsButtonColor,
            color: theme.settingsButtonTextColor,
            borderColor: theme.borderColor,
          }}
        >
          Cookie Settings
        </Button>
      )}
    </>
  )
}
