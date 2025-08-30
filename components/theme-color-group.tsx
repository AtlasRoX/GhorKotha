"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "@/components/color-picker"
import { Badge } from "@/components/ui/badge"
import { Palette } from "lucide-react"

interface ThemeColorGroupProps {
  title: string
  description?: string
  colors: Array<{
    key: string
    label: string
    value: string
    description?: string
  }>
  onChange: (key: string, value: string) => void
  backgroundColor?: string
}

export function ThemeColorGroup({ title, description, colors, onChange, backgroundColor }: ThemeColorGroupProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <Badge variant="secondary">{colors.length} রং</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {colors.map((color) => (
          <ColorPicker
            key={color.key}
            label={color.label}
            value={color.value}
            onChange={(value) => onChange(color.key, value)}
            description={color.description}
            contrastWith={
              color.key.includes("foreground") || color.key.includes("text")
                ? backgroundColor || colors.find((c) => c.key.includes("background"))?.value
                : undefined
            }
            showHarmony={color.key.includes("primary") || color.key.includes("accent")}
          />
        ))}
      </CardContent>
    </Card>
  )
}
