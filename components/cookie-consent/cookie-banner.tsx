"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { CookieSettings, CookieCategory, ThemeConfig } from "@/types/cookie-types"
import { CookiePreferences } from "./cookie-preferences"
import { defaultTheme, defaultCookieSettings } from "@/lib/cookie-defaults"

interface CookieBannerProps {
  onAccept: (settings: CookieSettings) => void
  onReject: () => void
  initialSettings?: CookieSettings
  categories: CookieCategory[]
  theme?: ThemeConfig
  position?: "bottom" | "top" | "center"
  companyName?: string
}

export function CookieBanner({
  onAccept,
  onReject,
  initialSettings = defaultCookieSettings,
  categories,
  theme = defaultTheme,
  position = "bottom",
  companyName = "Our Company",
}: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>(initialSettings)

  useEffect(() => {
    // Check if user has already set cookie preferences
    const consentGiven = localStorage.getItem("cookieConsent")
    if (!consentGiven) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = Object.fromEntries(
      categories.map((category) => [category.id, { enabled: true, allowedDomains: category.domains }]),
    ) as CookieSettings

    setCookieSettings(allAccepted)
    onAccept(allAccepted)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptSelected = () => {
    onAccept(cookieSettings)
    setShowBanner(false)
    setShowSettings(false)
  }

  const rejectAll = () => {
    const allRejected = Object.fromEntries(
      categories.map((category) => [
        category.id,
        {
          enabled: category.required,
          allowedDomains: category.required ? category.domains : [],
        },
      ]),
    ) as CookieSettings

    setCookieSettings(allRejected)
    onReject()
    setShowBanner(false)
    setShowSettings(false)
  }

  const updateCategorySettings = (categoryId: string, enabled: boolean, domains: string[]) => {
    setCookieSettings((prev) => ({
      ...prev,
      [categoryId]: {
        enabled,
        allowedDomains: enabled ? domains : [],
      },
    }))
  }

  const positionClasses = {
    bottom: "fixed bottom-0 left-0 right-0 mb-0 z-50 p-4",
    top: "fixed top-0 left-0 right-0 mt-0 z-50 p-4",
    center: "fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4",
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className={positionClasses[position]}>
      <Card
        className="w-full max-w-4xl mx-auto"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          borderColor: theme.borderColor,
          borderRadius: theme.borderRadius,
        }}
      >
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle style={{ color: theme.headingColor }}>Cookie Consent</CardTitle>
            {showSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                style={{ color: theme.buttonTextColor }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription style={{ color: theme.descriptionColor }}>
            {companyName} uses cookies to enhance your browsing experience. Please select which cookies you want to
            allow on this website.
          </CardDescription>
        </CardHeader>

        {showSettings ? (
          <CookiePreferences
            categories={categories}
            settings={cookieSettings}
            onChange={updateCategorySettings}
            theme={theme}
          />
        ) : (
          <CardContent>
            <p className="text-sm" style={{ color: theme.textColor }}>
              By clicking "Accept All", you agree to the storing of cookies on your device to enhance site navigation,
              analyze site usage, and assist in our marketing efforts. You can customize which cookies you allow or
              reject all optional cookies.
            </p>
          </CardContent>
        )}

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={rejectAll}
            style={{
              backgroundColor: theme.rejectButtonColor,
              color: theme.rejectButtonTextColor,
              borderColor: theme.borderColor,
            }}
          >
            Reject All
          </Button>

          {!showSettings && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowSettings(true)}
              style={{
                backgroundColor: theme.customizeButtonColor,
                color: theme.customizeButtonTextColor,
                borderColor: theme.borderColor,
              }}
            >
              Customize
            </Button>
          )}

          <Button
            className="w-full sm:w-auto"
            onClick={showSettings ? acceptSelected : acceptAll}
            style={{
              backgroundColor: theme.acceptButtonColor,
              color: theme.acceptButtonTextColor,
            }}
          >
            {showSettings ? "Save Preferences" : "Accept All"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
