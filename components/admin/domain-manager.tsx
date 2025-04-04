"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"

interface DomainManagerProps {
  domains: string[]
  onChange: (domains: string[]) => void
}

export function DomainManager({ domains, onChange }: DomainManagerProps) {
  const [newDomain, setNewDomain] = useState("")

  const addDomain = () => {
    if (!newDomain) return

    if (!domains.includes(newDomain)) {
      onChange([...domains, newDomain])
    }

    setNewDomain("")
  }

  const removeDomain = (domain: string) => {
    onChange(domains.filter((d) => d !== domain))
  }

  return (
    <div className="space-y-2">
      <Label>Allowed Domains</Label>

      <div className="flex flex-wrap gap-2 mb-2">
        {domains.map((domain) => (
          <div key={domain} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
            <span>{domain}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1 rounded-full"
              onClick={() => removeDomain(domain)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="example.com"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addDomain()
            }
          }}
        />
        <Button onClick={addDomain} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Use * for all domains or specific domains like example.com</p>
    </div>
  )
}

