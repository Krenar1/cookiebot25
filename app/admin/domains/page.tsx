"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Copy, Check } from "lucide-react"
import { getAllApiKeys, addAllowedDomain, removeAllowedDomain, createApiKey } from "@/lib/cookie-service"

export default function DomainsPage() {
  const [apiKeys, setApiKeys] = useState<
    Array<{
      key: string
      domains: string[]
      companyName: string
    }>
  >([])
  const [newDomain, setNewDomain] = useState("")
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null)
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [embedCode, setEmbedCode] = useState("")

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    const keys = await getAllApiKeys()
    setApiKeys(keys)

    if (keys.length > 0 && !selectedApiKey) {
      setSelectedApiKey(keys[0].key)
      generateEmbedCode(keys[0].key)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain || !selectedApiKey) return

    await addAllowedDomain(selectedApiKey, newDomain)
    setNewDomain("")
    loadApiKeys()
  }

  const handleRemoveDomain = async (domain: string) => {
    if (!selectedApiKey) return

    await removeAllowedDomain(selectedApiKey, domain)
    loadApiKeys()
  }

  const handleCreateApiKey = async () => {
    if (!newApiKeyName) return

    const apiKey = await createApiKey(newApiKeyName)
    setNewApiKeyName("")
    loadApiKeys()
  }

  const generateEmbedCode = (apiKey: string) => {
    const host = process.env.NEXT_PUBLIC_HOST || window.location.origin
    const code = `<script src="${host}/api/cookie-consent?key=${apiKey}&domain=YOUR_DOMAIN"></script>`
    setEmbedCode(code)
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })
    setTimeout(() => {
      setCopied({ ...copied, [key]: false })
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Domain Management</h1>

      <Tabs defaultValue="domains">
        <TabsList className="mb-4">
          <TabsTrigger value="domains">Allowed Domains</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
        </TabsList>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Manage Allowed Domains</CardTitle>
              <CardDescription>
                Only domains on this list will be able to use your cookie consent system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length > 0 ? (
                <>
                  <div className="mb-4">
                    <Label htmlFor="api-key-select">Select API Key</Label>
                    <select
                      id="api-key-select"
                      className="w-full p-2 border rounded mt-1"
                      value={selectedApiKey || ""}
                      onChange={(e) => {
                        setSelectedApiKey(e.target.value)
                        generateEmbedCode(e.target.value)
                      }}
                    >
                      {apiKeys.map((key) => (
                        <option key={key.key} value={key.key}>
                          {key.companyName} ({key.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
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

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedApiKey &&
                          apiKeys
                            .find((k) => k.key === selectedApiKey)
                            ?.domains.map((domain) => (
                              <TableRow key={domain}>
                                <TableCell>{domain}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveDomain(domain)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}

                        {selectedApiKey && apiKeys.find((k) => k.key === selectedApiKey)?.domains.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                              No domains added yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No API keys found. Create one first.</p>
                  <Button onClick={() => document.getElementById("api-keys-tab")?.click()}>Create API Key</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" id="api-keys-tab">
          <Card>
            <CardHeader>
              <CardTitle>Manage API Keys</CardTitle>
              <CardDescription>Create and manage API keys for your cookie consent system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="new-api-key">Create New API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-api-key"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    placeholder="Company or Website Name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleCreateApiKey()
                      }
                    }}
                  />
                  <Button onClick={handleCreateApiKey}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>API Key</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Domains</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.key}>
                        <TableCell className="font-mono text-xs">{key.key}</TableCell>
                        <TableCell>{key.companyName}</TableCell>
                        <TableCell>{key.domains.length}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.key, key.key)}>
                            {copied[key.key] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {apiKeys.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No API keys created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy this code and paste it into your website to add the cookie consent banner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length > 0 ? (
                <>
                  <div className="mb-4">
                    <Label htmlFor="embed-api-key-select">Select API Key</Label>
                    <select
                      id="embed-api-key-select"
                      className="w-full p-2 border rounded mt-1"
                      value={selectedApiKey || ""}
                      onChange={(e) => {
                        setSelectedApiKey(e.target.value)
                        generateEmbedCode(e.target.value)
                      }}
                    >
                      {apiKeys.map((key) => (
                        <option key={key.key} value={key.key}>
                          {key.companyName} ({key.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="embed-code">Embed Code</Label>
                    <div className="relative mt-1">
                      <textarea
                        id="embed-code"
                        className="w-full h-24 p-2 pr-10 font-mono text-sm border rounded"
                        value={embedCode}
                        readOnly
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(embedCode, "embed-code")}
                      >
                        {copied["embed-code"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Replace YOUR_DOMAIN with your actual domain name (e.g., example.com)
                    </p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Copy the embed code above</li>
                      <li>Replace YOUR_DOMAIN with your actual domain (e.g., example.com)</li>
                      <li>Paste the code just before the closing &lt;/body&gt; tag on your website</li>
                      <li>The cookie consent banner will automatically appear for new visitors</li>
                    </ol>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No API keys found. Create one first.</p>
                  <Button onClick={() => document.getElementById("api-keys-tab")?.click()}>Create API Key</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
