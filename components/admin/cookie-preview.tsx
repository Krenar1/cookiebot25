"use client"

import { useState } from "react"
import type { CookieCategory, ThemeConfig } from "@/types/cookie-types"
import { CookieBanner } from "../cookie-consent/cookie-banner"
import { defaultCookieSettings } from "@/lib/cookie-defaults"

interface CookiePreviewProps {
  categories: CookieCategory[]
  theme: ThemeConfig
  position: "bottom" | "top" | "center"
  companyName: string
}

export function CookiePreview({ categories, theme, position, companyName }: CookiePreviewProps) {
  const [showPreview, setShowPreview] = useState(true)

  if (!showPreview) {
    return (
      <div className="flex items-center justify-center h-full">
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowPreview(true)}>
          Show Preview Again
        </button>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <div className="p-4 bg-white border-b">
        <h3 className="text-lg font-medium">Example Website</h3>
      </div>

      <div className="flex-1 p-4">
        <p className="text-gray-600">This is example website content.</p>
      </div>

      <CookieBanner
        onAccept={() => setShowPreview(false)}
        onReject={() => setShowPreview(false)}
        initialSettings={defaultCookieSettings}
        categories={categories}
        theme={theme}
        position={position}
        companyName={companyName}
      />
    </div>
  )
}
