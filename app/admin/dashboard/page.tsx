"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Plus, Copy, Check, LogOut, ArrowRight, Settings, Code, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cookieThemes } from "@/lib/cookie-themes"

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string>("demo-api-key")
  const [domains, setDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("domains")
  const [domainSettings, setDomainSettings] = useState<
    Record<
      string,
      {
        theme: string
        companyName: string
      }
    >
  >({})
  const [embedCode, setEmbedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDomains()
  }, [apiKey])

  const loadDomains = async () => {
    try {
      const response = await fetch(`/api/admin/domains?key=${apiKey}`)
      const data = await response.json()

      if (response.ok) {
        setDomains(data.domains || [])

        // Load settings for each domain
        const settings: Record<string, any> = {}
        for (const domain of data.domains) {
          const settingsResponse = await fetch(`/api/admin/domain-settings?key=${apiKey}&domain=${domain}`)
          if (settingsResponse.ok) {
            const domainData = await settingsResponse.json()
            settings[domain] = domainData.settings || { theme: "classic", companyName: "My Company" }
          }
        }

        setDomainSettings(settings)
      }
    } catch (error) {
      console.error("Failed to load domains", error)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain) return

    try {
      const response = await fetch("/api/admin/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          domain: newDomain,
        }),
      })

      if (response.ok) {
        setNewDomain("")
        loadDomains()
      }
    } catch (error) {
      console.error("Failed to add domain", error)
    }
  }

  const handleRemoveDomain = async (domain: string) => {
    try {
      const response = await fetch("/api/admin/domains", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          domain,
        }),
      })

      if (response.ok) {
        loadDomains()
        if (selectedDomain === domain) {
          setSelectedDomain(null)
        }
      }
    } catch (error) {
      console.error("Failed to remove domain", error)
    }
  }

  // Update the embed code to be simpler and more reliable
  const generateEmbedCode = (domain: string) => {
    // Hardcode the base URL to ensure it's always correct
    const baseUrl = "https://cookiebot25.vercel.app"

    return `<script>
(function() {
  // Create container for the cookie consent
  const container = document.createElement('div');
  container.id = 'cookie-consent-container';
  document.body.appendChild(container);
  
  // Get the current domain dynamically
  const currentDomain = window.location.hostname;
  
  // Create the cookie consent script
  const script = document.createElement('script');
  script.src = "${baseUrl}/api/cookie-consent?key=${apiKey}&domain=" + currentDomain;
  script.async = true;
  document.body.appendChild(script);
})();
</script>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      router.push("/admin/login")
    } catch (error) {
      console.error("Failed to logout", error)
    }
  }

  // Replace the handleSaveDomainSettings function with this:
  const handleSaveDomainSettings = async (domain: string) => {
    if (!domain) return

    try {
      setSaving(true)

      // Log what we're saving
      console.log(`Saving settings for ${domain}:`, domainSettings[domain])

      const response = await fetch("/api/admin/domain-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          domain,
          settings: domainSettings[domain] || { theme: "classic", companyName: "My Company" },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Settings saved successfully:", data)

        // Reload the domains to get fresh settings
        await loadDomains()

        alert(`Settings for ${domain} saved successfully!`)

        // Update embed code after saving
        setEmbedCode(generateEmbedCode(domain))
      } else {
        const data = await response.json()
        console.error("Error saving settings:", data)
        alert(`Error saving settings: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Failed to save domain settings", error)
      alert(`Failed to save domain settings: ${error}`)
    } finally {
      setSaving(false)
    }
  }

  const configureDomain = (domain: string) => {
    setSelectedDomain(domain)
    setEmbedCode(generateEmbedCode(domain))
    setActiveTab("configure")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cookie Consent Manager</h1>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {!selectedDomain ? (
        // Domain List View
        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
            <CardDescription>Manage domains that can use your cookie consent system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="new-domain">Add Domain</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="new-domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddDomain()
                    }
                  }}
                />
                <Button onClick={handleAddDomain}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use * to allow all domains or specific domains like example.com
              </p>
            </div>

            {domains.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain) => (
                      <TableRow key={domain}>
                        <TableCell>{domain}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => configureDomain(domain)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveDomain(domain)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-muted-foreground mb-4">No domains added yet</p>
                <p className="text-sm text-muted-foreground">Add a domain above to get started with cookie consent</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Domain Configuration View
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedDomain(null)
                setActiveTab("domains")
              }}
            >
              ← Back to Domains
            </Button>
            <h2 className="text-xl font-semibold">
              Configuring: <span className="font-mono text-primary">{selectedDomain}</span>
            </h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="configure">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="embed">
                <Code className="h-4 w-4 mr-2" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure">
              <Card>
                <CardHeader>
                  <CardTitle>Cookie Consent Settings</CardTitle>
                  <CardDescription>
                    Customize how the cookie consent banner will appear on {selectedDomain}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={domainSettings[selectedDomain]?.companyName || "My Company"}
                      onChange={(e) => {
                        setDomainSettings({
                          ...domainSettings,
                          [selectedDomain]: {
                            ...(domainSettings[selectedDomain] || { theme: "classic" }),
                            companyName: e.target.value,
                          },
                        })
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Select Theme</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                      {Object.entries(cookieThemes).map(([id, theme]) => (
                        <div
                          key={id}
                          className={`border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${
                            (domainSettings[selectedDomain]?.theme || "classic") === id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => {
                            setDomainSettings({
                              ...domainSettings,
                              [selectedDomain]: {
                                ...(domainSettings[selectedDomain] || { companyName: "My Company" }),
                                theme: id,
                              },
                            })
                          }}
                        >
                          <div className="h-16 rounded-md mb-2" style={{ backgroundColor: theme.backgroundColor }}>
                            <div className="flex justify-end p-2">
                              <div
                                className="w-8 h-4 rounded-full"
                                style={{ backgroundColor: theme.acceptButtonColor }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-center font-medium capitalize">{id}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cookie Preview Section */}
                  <div className="mt-8">
                    <Label className="text-lg font-medium mb-4 block">Preview</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-2 border-b">
                        <div className="w-full h-6 bg-gray-200 rounded-full mb-2"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="p-4 relative" style={{ minHeight: "300px" }}>
                        {/* Cookie Consent Preview */}
                        <div
                          className="absolute bottom-0 left-0 right-0 shadow-lg"
                          style={{
                            backgroundColor:
                              cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].backgroundColor,
                            color: cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].textColor,
                            borderColor: cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].borderColor,
                            borderWidth: "1px",
                            borderRadius: cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].borderRadius,
                          }}
                        >
                          <div className="p-4">
                            <h3
                              className="text-lg font-bold mb-2"
                              style={{
                                color: cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].headingColor,
                              }}
                            >
                              Cookie Consent
                            </h3>
                            <p
                              className="text-sm mb-4"
                              style={{
                                color:
                                  cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].descriptionColor,
                              }}
                            >
                              {domainSettings[selectedDomain]?.companyName || "My Company"} uses cookies to enhance your
                              browsing experience.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <button
                                className="px-3 py-1.5 text-sm rounded"
                                style={{
                                  backgroundColor:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].rejectButtonColor,
                                  color:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"]
                                      .rejectButtonTextColor,
                                  borderColor:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].borderColor,
                                  borderWidth: "1px",
                                }}
                              >
                                Reject All
                              </button>
                              <button
                                className="px-3 py-1.5 text-sm rounded"
                                style={{
                                  backgroundColor:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"]
                                      .customizeButtonColor,
                                  color:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"]
                                      .customizeButtonTextColor,
                                  borderColor:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].borderColor,
                                  borderWidth: "1px",
                                }}
                              >
                                Customize
                              </button>
                              <button
                                className="px-3 py-1.5 text-sm rounded"
                                style={{
                                  backgroundColor:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"].acceptButtonColor,
                                  color:
                                    cookieThemes[domainSettings[selectedDomain]?.theme || "classic"]
                                      .acceptButtonTextColor,
                                }}
                              >
                                Accept All
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDomain(null)
                      setActiveTab("domains")
                    }}
                  >
                    Cancel
                  </Button>
                  <div className="space-x-2">
                    <Button onClick={() => handleSaveDomainSettings(selectedDomain)} disabled={saving}>
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        handleSaveDomainSettings(selectedDomain)
                        setActiveTab("embed")
                      }}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save & Get Embed Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="embed">
              <Card>
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy this code and add it to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Label htmlFor="embed-code">Embed Code for {selectedDomain}</Label>
                    <div className="relative mt-1">
                      <textarea
                        id="embed-code"
                        className="w-full h-24 p-3 pr-10 font-mono text-sm border rounded bg-gray-50"
                        value={generateEmbedCode(selectedDomain)}
                        readOnly
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateEmbedCode(selectedDomain))}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Copy the embed code above</li>
                      <li>Paste it just before the closing &lt;/body&gt; tag on your website</li>
                      <li>The cookie consent banner will appear automatically</li>
                    </ol>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("configure")}>
                    Back to Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDomain(null)
                      setActiveTab("domains")
                    }}
                  >
                    Done
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
