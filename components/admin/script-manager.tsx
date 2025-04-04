"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScriptConfig } from "@/types/cookie-types"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ScriptManagerProps {
  scripts: ScriptConfig[]
  onChange: (scripts: ScriptConfig[]) => void
}

export function ScriptManager({ scripts, onChange }: ScriptManagerProps) {
  const [newScriptSrc, setNewScriptSrc] = useState("")
  const [openScripts, setOpenScripts] = useState<Record<number, boolean>>({})

  const addScript = () => {
    if (!newScriptSrc) return

    onChange([
      ...scripts,
      {
        src: newScriptSrc,
        attributes: {},
      },
    ])

    setNewScriptSrc("")
    // Open the newly added script
    setOpenScripts((prev) => ({
      ...prev,
      [scripts.length]: true,
    }))
  }

  const removeScript = (index: number) => {
    const newScripts = [...scripts]
    newScripts.splice(index, 1)
    onChange(newScripts)
  }

  const updateScriptSrc = (index: number, src: string) => {
    const newScripts = [...scripts]
    newScripts[index] = { ...newScripts[index], src }
    onChange(newScripts)
  }

  const addAttribute = (scriptIndex: number) => {
    const newScripts = [...scripts]
    const script = newScripts[scriptIndex]

    newScripts[scriptIndex] = {
      ...script,
      attributes: {
        ...script.attributes,
        [`attr-${Object.keys(script.attributes || {}).length}`]: "",
      },
    }

    onChange(newScripts)
  }

  const updateAttribute = (scriptIndex: number, attrKey: string, newKey: string, value: string) => {
    const newScripts = [...scripts]
    const script = newScripts[scriptIndex]
    const attributes = { ...script.attributes }

    // Remove old key and add new one
    if (attrKey !== newKey) {
      delete attributes[attrKey]
    }

    attributes[newKey] = value

    newScripts[scriptIndex] = {
      ...script,
      attributes,
    }

    onChange(newScripts)
  }

  const removeAttribute = (scriptIndex: number, attrKey: string) => {
    const newScripts = [...scripts]
    const script = newScripts[scriptIndex]
    const attributes = { ...script.attributes }

    delete attributes[attrKey]

    newScripts[scriptIndex] = {
      ...script,
      attributes,
    }

    onChange(newScripts)
  }

  const toggleScript = (index: number) => {
    setOpenScripts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="space-y-4">
      <Label>Scripts</Label>

      {scripts.length > 0 ? (
        <div className="space-y-2">
          {scripts.map((script, index) => (
            <Collapsible
              key={index}
              open={openScripts[index]}
              onOpenChange={() => toggleScript(index)}
              className="border rounded-md"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3">
                <div className="text-sm font-medium truncate max-w-[80%]">{script.src}</div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeScript(index)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  {openScripts[index] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 pt-0 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`script-src-${index}`}>Script URL</Label>
                    <Input
                      id={`script-src-${index}`}
                      value={script.src}
                      onChange={(e) => updateScriptSrc(index, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attributes</Label>

                    {Object.entries(script.attributes || {}).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input
                          value={key}
                          onChange={(e) => updateAttribute(index, key, e.target.value, value.toString())}
                          placeholder="attribute"
                          className="flex-1"
                        />
                        <Input
                          value={value.toString()}
                          onChange={(e) => updateAttribute(index, key, key, e.target.value)}
                          placeholder="value"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeAttribute(index, key)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" onClick={() => addAttribute(index)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">No scripts added yet</CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Input
          value={newScriptSrc}
          onChange={(e) => setNewScriptSrc(e.target.value)}
          placeholder="https://example.com/script.js"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addScript()
            }
          }}
        />
        <Button onClick={addScript} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

