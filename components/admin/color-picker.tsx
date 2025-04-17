"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: value }}
              aria-label={`Pick a ${label.toLowerCase()}`}
            />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-2">
              <div className="grid grid-cols-5 gap-1">
                {[
                  "#000000",
                  "#ffffff",
                  "#f8f9fa",
                  "#e9ecef",
                  "#dee2e6",
                  "#6c757d",
                  "#495057",
                  "#343a40",
                  "#212529",
                  "#1e293b",
                  "#ef4444",
                  "#f97316",
                  "#eab308",
                  "#84cc16",
                  "#22c55e",
                  "#14b8a6",
                  "#06b6d4",
                  "#0ea5e9",
                  "#3b82f6",
                  "#6366f1",
                  "#8b5cf6",
                  "#a855f7",
                  "#d946ef",
                  "#ec4899",
                  "#f43f5e",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color)
                      setOpen(false)
                    }}
                  />
                ))}
              </div>
              <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
            </div>
          </PopoverContent>
        </Popover>
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    </div>
  )
}
