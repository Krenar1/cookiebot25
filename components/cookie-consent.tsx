"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface CookieSettings {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already set cookie preferences
    const consentGiven = localStorage.getItem("cookieConsent")
    if (!consentGiven) {
      setShowBanner(true)
    } else {
      setCookieSettings(JSON.parse(consentGiven))
    }
  }, [])

  const acceptAll = () => {
    const settings = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setCookieSettings(settings)
    localStorage.setItem("cookieConsent", JSON.stringify(settings))
    setShowBanner(false)
    setShowSettings(false)

    // Here you would trigger your actual cookie setting logic
    applyConsent(settings)
  }

  const acceptSelected = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(cookieSettings))
    setShowBanner(false)
    setShowSettings(false)

    // Here you would trigger your actual cookie setting logic
    applyConsent(cookieSettings)
  }

  const rejectAll = () => {
    const settings = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setCookieSettings(settings)
    localStorage.setItem("cookieConsent", JSON.stringify(settings))
    setShowBanner(false)
    setShowSettings(false)

    // Here you would trigger your actual cookie setting logic
    applyConsent(settings)
  }

  const handleToggle = (key: keyof CookieSettings) => {
    if (key === "necessary") return // Necessary cookies can't be toggled
    setCookieSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const applyConsent = (settings: CookieSettings) => {
    // This function would integrate with your actual cookie management system
    // For example, you could call a function that sets cookies based on the settings
    console.log("Applying consent settings:", settings)

    // Example of how you might integrate with a third-party service
    if (typeof window !== "undefined" && window.UC_UI) {
      // This is just a placeholder - you'd need to use the actual Usercentrics API
      window.UC_UI.acceptAllServices()
    }
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  if (!showBanner && !showSettings) {
    return (
      <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50" onClick={() => setShowSettings(true)}>
        Cookie Settings
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Cookie Consent</CardTitle>
            {showSettings && (
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
            traffic.
          </CardDescription>
        </CardHeader>

        {showSettings ? (
          <>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="necessary" className="font-medium">
                    Necessary Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Essential for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <Switch id="necessary" checked={cookieSettings.necessary} disabled />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="functional" className="font-medium">
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable personalized features and remember your preferences.
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={cookieSettings.functional}
                  onCheckedChange={() => handleToggle("functional")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="analytics" className="font-medium">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={cookieSettings.analytics}
                  onCheckedChange={() => handleToggle("analytics")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="marketing" className="font-medium">
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Used to deliver advertisements relevant to you and your interests.
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={cookieSettings.marketing}
                  onCheckedChange={() => handleToggle("marketing")}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={rejectAll}>
                Reject All
              </Button>
              <Button onClick={acceptSelected}>Save Preferences</Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardContent>
              <p className="text-sm">
                By clicking "Accept All", you agree to the storing of cookies on your device to enhance site navigation,
                analyze site usage, and assist in our marketing efforts.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={rejectAll}>
                Reject All
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={openSettings}>
                Customize
              </Button>
              <Button className="w-full sm:w-auto" onClick={acceptAll}>
                Accept All
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

// Add this to make TypeScript happy with the Usercentrics reference
declare global {
  interface Window {
    UC_UI?: {
      acceptAllServices: () => void
    }
  }
}

