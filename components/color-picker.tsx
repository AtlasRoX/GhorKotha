"use client"

import type React from "react"
import { useState, useCallback, memo, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Palette, Check, Eye, AlertTriangle, Lightbulb } from "lucide-react"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
  contrastWith?: string // For accessibility checking
  showHarmony?: boolean // Show color harmony suggestions
}

const PRESET_COLORS = [
  // Primary colors
  "#0891b2",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  // Secondary colors
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#14b8a6",
  "#f59e0b",
  // Warm colors
  "#ef4444",
  "#f97316",
  "#eab308",
  "#facc15",
  "#a3a3a3",
  "#525252",
  // Cool colors
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#020617",
  // Light colors
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
] as const

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) return 0

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

function generateHarmonyColors(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return []

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const harmonies = []

  // Complementary
  harmonies.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l))

  // Triadic
  harmonies.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l))
  harmonies.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l))

  // Analogous
  harmonies.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l))
  harmonies.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))

  return harmonies.slice(0, 5)
}

function ColorPickerComponent({
  label,
  value,
  onChange,
  description,
  contrastWith,
  showHarmony = false,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const contrastRatio = useMemo(() => {
    if (!contrastWith) return null
    return getContrastRatio(value, contrastWith)
  }, [value, contrastWith])

  const harmonyColors = useMemo(() => {
    if (!showHarmony) return []
    return generateHarmonyColors(value)
  }, [value, showHarmony])

  const getContrastLevel = (ratio: number | null) => {
    if (!ratio) return null
    if (ratio >= 7) return { level: "AAA", color: "text-green-600" }
    if (ratio >= 4.5) return { level: "AA", color: "text-yellow-600" }
    return { level: "Fail", color: "text-red-600" }
  }

  const contrastLevel = getContrastLevel(contrastRatio)

  const handleColorChange = useCallback(
    (color: string) => {
      setInputValue(color)
      onChange(color)
    },
    [onChange],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)

      // Validate hex color format
      if (/^#[0-9A-F]{6}$/i.test(newValue)) {
        onChange(newValue)
      }
    },
    [onChange],
  )

  const handleInputBlur = useCallback(() => {
    // Reset to current value if invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value)
    }
  }, [inputValue, value])

  const handlePresetClick = useCallback(
    (color: string) => {
      handleColorChange(color)
      setIsOpen(false)
    },
    [handleColorChange],
  )

  const iconColor = value === "#ffffff" ? "#000000" : "#ffffff"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${label}`}>{label}</Label>
        {contrastLevel && (
          <Badge variant="outline" className={contrastLevel.color}>
            <Eye className="h-3 w-3 mr-1" />
            {contrastLevel.level} ({contrastRatio?.toFixed(1)})
          </Badge>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={`color-${label}`}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="#000000"
            className="font-mono"
          />
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 bg-transparent transition-colors"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4" style={{ color: iconColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">প্রিসেট রং</h4>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handlePresetClick(color)}
                      className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Select color ${color}`}
                    >
                      {value === color && (
                        <Check
                          className="h-4 w-4 absolute inset-0 m-auto"
                          style={{ color: color === "#ffffff" || color === "#f8fafc" ? "#000000" : "#ffffff" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {showHarmony && harmonyColors.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      রং সমন্বয়
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {harmonyColors.map((color, index) => (
                        <button
                          key={`${color}-${index}`}
                          onClick={() => handlePresetClick(color)}
                          className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          style={{ backgroundColor: color }}
                          title={`Harmony color ${color}`}
                          aria-label={`Select harmony color ${color}`}
                        >
                          {value === color && (
                            <Check
                              className="h-4 w-4 absolute inset-0 m-auto"
                              style={{ color: color === "#ffffff" ? "#000000" : "#ffffff" }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <h4 className="font-medium mb-2">কাস্টম রং</h4>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                    aria-label="Color picker"
                  />
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#000000"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              {contrastWith && contrastLevel && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">অ্যাক্সেসিবিলিটি চেক</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span>কনট্রাস্ট রেশিও:</span>
                      <Badge variant="outline" className={contrastLevel.color}>
                        {contrastRatio?.toFixed(1)} ({contrastLevel.level})
                      </Badge>
                    </div>
                    {contrastLevel.level === "Fail" && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>এই রং কম্বিনেশনটি অ্যাক্সেসিবিলিটি গাইডলাইন মেনে চলে না।</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-4 h-4 rounded border" style={{ backgroundColor: value }} />
        <span>বর্তমান রং: {value}</span>
        {contrastWith && contrastLevel && <span className={contrastLevel.color}>• {contrastLevel.level}</span>}
      </div>
    </div>
  )
}

export const ColorPicker = memo(ColorPickerComponent)
