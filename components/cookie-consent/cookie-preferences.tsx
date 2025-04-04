"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import type { CookieCategory, CookieSettings, ThemeConfig } from "@/types/cookie-types"

interface CookiePreferencesProps {
  categories: CookieCategory[]
  settings: CookieSettings
  onChange: (categoryId: string, enabled: boolean, domains: string[]) => void
  theme: ThemeConfig
}

export function CookiePreferences({ categories, settings, onChange, theme }: CookiePreferencesProps) {
  const handleToggle = (category: CookieCategory) => {
    if (category.required) return

    const isEnabled = settings[category.id]?.enabled || false
    onChange(category.id, !isEnabled, !isEnabled ? category.domains : [])
  }

  const handleDomainToggle = (category: CookieCategory, domain: string) => {
    if (category.required) return

    const currentDomains = settings[category.id]?.allowedDomains || []
    const newDomains = currentDomains.includes(domain)
      ? currentDomains.filter((d) => d !== domain)
      : [...currentDomains, domain]

    onChange(category.id, settings[category.id]?.enabled || false, newDomains)
  }

  return (
    <CardContent className="space-y-4">
      {categories.map((category) => {
        const isEnabled = settings[category.id]?.enabled || false
        const allowedDomains = settings[category.id]?.allowedDomains || []

        return (
          <Accordion type="single" collapsible key={category.id}>
            <AccordionItem value={category.id}>
              <div className="flex items-center justify-between space-x-2 py-2">
                <div className="flex-1">
                  <Label htmlFor={category.id} className="font-medium" style={{ color: theme.headingColor }}>
                    {category.name}
                  </Label>
                  <p className="text-sm" style={{ color: theme.descriptionColor }}>
                    {category.description}
                  </p>
                </div>
                <Switch
                  id={category.id}
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(category)}
                  disabled={category.required}
                  style={{
                    backgroundColor: isEnabled ? theme.switchActiveColor : undefined,
                  }}
                />
              </div>

              <AccordionTrigger className="py-0" style={{ color: theme.textColor }}>
                Website access
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 ml-6 mt-2">
                  {category.domains.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.id}-${domain}`}
                        checked={isEnabled && allowedDomains.includes(domain)}
                        onCheckedChange={() => handleDomainToggle(category, domain)}
                        disabled={category.required}
                      />
                      <Label htmlFor={`${category.id}-${domain}`} style={{ color: theme.textColor }}>
                        {domain}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      })}
    </CardContent>
  )
}

