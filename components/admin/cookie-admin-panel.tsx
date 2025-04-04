"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { CookieCategory, ThemeConfig } from "@/types/cookie-types"
import { defaultTheme, defaultCategories } from "@/lib/cookie-defaults"
import { ColorPicker } from "./color-picker"
import { CookiePreview } from "./cookie-preview"
import { ScriptManager } from "./script-manager"
import { DomainManager } from "./domain-manager"

interface CookieAdminPanelProps {
  initialCategories?: CookieCategory[]
  initialTheme?: ThemeConfig
  onSave?: (categories: CookieCategory[], theme: ThemeConfig) => void
}

export function CookieAdminPanel({
  initialCategories = defaultCategories,
  initialTheme = defaultTheme,
  onSave,
}: CookieAdminPanelProps) {
  const [categories, setCategories] = useState<CookieCategory[]>(initialCategories)
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme)
  const [companyName, setCompanyName] = useState("Our Company")
  const [previewPosition, setPreviewPosition] = useState<"bottom" | "top" | "center">("bottom")

  const handleSave = () => {
    if (onSave) {
      onSave(categories, theme)
    }

    // Save to localStorage for demo purposes
    localStorage.setItem(
      "cookieAdminSettings",
      JSON.stringify({
        categories,
        theme,
        companyName,
      }),
    )

    alert("Settings saved successfully!")
  }

  const updateCategory = (index: number, updatedCategory: Partial<CookieCategory>) => {
    const newCategories = [...categories]
    newCategories[index] = { ...newCategories[index], ...updatedCategory }
    setCategories(newCategories)
  }

  const addCategory = () => {
    const newId = `category-${categories.length + 1}`
    setCategories([
      ...categories,
      {
        id: newId,
        name: `New Category`,
        description: "Description for this cookie category",
        required: false,
        domains: ["*"],
        scripts: [],
      },
    ])
  }

  const removeCategory = (index: number) => {
    if (categories[index].required) {
      alert("Cannot remove required categories")
      return
    }

    const newCategories = [...categories]
    newCategories.splice(index, 1)
    setCategories(newCategories)
  }

  const updateTheme = (key: keyof ThemeConfig, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const exportSettings = () => {
    const settings = {
      categories,
      theme,
      companyName,
    }

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cookie-consent-settings.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result as string)
        setCategories(settings.categories || defaultCategories)
        setTheme(settings.theme || defaultTheme)
        setCompanyName(settings.companyName || "Our Company")
      } catch (error) {
        alert("Invalid settings file")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cookie Consent Manager</h1>

      <div className="flex justify-end mb-4 gap-2">
        <Button variant="outline" onClick={exportSettings}>
          Export Settings
        </Button>
        <div className="relative">
          <Input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button variant="outline">Import Settings</Button>
        </div>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Cookie Categories</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="space-y-6">
            <div className="grid gap-4">
              {categories.map((category, index) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory(index, { name: e.target.value })}
                        className="font-bold text-lg"
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`required-${category.id}`}>Required</Label>
                        <Switch
                          id={`required-${category.id}`}
                          checked={category.required}
                          onCheckedChange={(checked) => updateCategory(index, { required: checked })}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`description-${category.id}`}>Description</Label>
                      <Textarea
                        id={`description-${category.id}`}
                        value={category.description}
                        onChange={(e) => updateCategory(index, { description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <DomainManager
                      domains={category.domains}
                      onChange={(domains) => updateCategory(index, { domains })}
                    />

                    <ScriptManager
                      scripts={category.scripts}
                      onChange={(scripts) => updateCategory(index, { scripts })}
                    />
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button variant="destructive" onClick={() => removeCategory(index)} disabled={category.required}>
                      Remove Category
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Button onClick={addCategory}>Add Cookie Category</Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label>Banner Position</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={previewPosition === "bottom" ? "default" : "outline"}
                      onClick={() => setPreviewPosition("bottom")}
                      className="flex-1"
                    >
                      Bottom
                    </Button>
                    <Button
                      variant={previewPosition === "top" ? "default" : "outline"}
                      onClick={() => setPreviewPosition("top")}
                      className="flex-1"
                    >
                      Top
                    </Button>
                    <Button
                      variant={previewPosition === "center" ? "default" : "outline"}
                      onClick={() => setPreviewPosition("center")}
                      className="flex-1"
                    >
                      Center
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <Input
                    id="border-radius"
                    value={theme.borderRadius}
                    onChange={(e) => updateTheme("borderRadius", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={theme.backgroundColor}
                    onChange={(value) => updateTheme("backgroundColor", value)}
                  />

                  <ColorPicker
                    label="Text Color"
                    value={theme.textColor}
                    onChange={(value) => updateTheme("textColor", value)}
                  />

                  <ColorPicker
                    label="Heading Color"
                    value={theme.headingColor}
                    onChange={(value) => updateTheme("headingColor", value)}
                  />

                  <ColorPicker
                    label="Description Color"
                    value={theme.descriptionColor}
                    onChange={(value) => updateTheme("descriptionColor", value)}
                  />

                  <ColorPicker
                    label="Border Color"
                    value={theme.borderColor}
                    onChange={(value) => updateTheme("borderColor", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <ColorPicker
                    label="Accept Button Color"
                    value={theme.acceptButtonColor}
                    onChange={(value) => updateTheme("acceptButtonColor", value)}
                  />

                  <ColorPicker
                    label="Accept Button Text"
                    value={theme.acceptButtonTextColor}
                    onChange={(value) => updateTheme("acceptButtonTextColor", value)}
                  />

                  <ColorPicker
                    label="Reject Button Color"
                    value={theme.rejectButtonColor}
                    onChange={(value) => updateTheme("rejectButtonColor", value)}
                  />

                  <ColorPicker
                    label="Reject Button Text"
                    value={theme.rejectButtonTextColor}
                    onChange={(value) => updateTheme("rejectButtonTextColor", value)}
                  />

                  <ColorPicker
                    label="Customize Button Color"
                    value={theme.customizeButtonColor}
                    onChange={(value) => updateTheme("customizeButtonColor", value)}
                  />

                  <ColorPicker
                    label="Customize Button Text"
                    value={theme.customizeButtonTextColor}
                    onChange={(value) => updateTheme("customizeButtonTextColor", value)}
                  />

                  <ColorPicker
                    label="Settings Button Color"
                    value={theme.settingsButtonColor}
                    onChange={(value) => updateTheme("settingsButtonColor", value)}
                  />

                  <ColorPicker
                    label="Settings Button Text"
                    value={theme.settingsButtonTextColor}
                    onChange={(value) => updateTheme("settingsButtonTextColor", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <ColorPicker
                    label="Switch Active Color"
                    value={theme.switchActiveColor}
                    onChange={(value) => updateTheme("switchActiveColor", value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Consent Preview</CardTitle>
                <CardDescription>This is how your cookie consent banner will look to visitors</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[500px] relative border rounded-md">
                <div className="absolute inset-0">
                  <CookiePreview
                    categories={categories}
                    theme={theme}
                    position={previewPosition}
                    companyName={companyName}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}

