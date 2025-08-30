"use client"

import type React from "react"
import { useEffect, useRef, useCallback, useState } from "react"

interface DynamicThemeProviderProps {
  theme: any
  children: React.ReactNode
}

const colorCache = new Map<string, string>()

function hexToOklch(hex: string): string {
  if (colorCache.has(hex)) {
    return colorCache.get(hex)!
  }

  if (!hex || !hex.startsWith("#")) {
    const fallback = "oklch(0.5 0 0)"
    colorCache.set(hex, fallback)
    return fallback
  }

  // Handle both 3 and 6 character hex codes
  let normalizedHex = hex
  if (hex.length === 4) {
    normalizedHex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }

  if (normalizedHex.length !== 7) {
    const fallback = "oklch(0.5 0 0)"
    colorCache.set(hex, fallback)
    return fallback
  }

  try {
    const r = Number.parseInt(normalizedHex.slice(1, 3), 16) / 255
    const g = Number.parseInt(normalizedHex.slice(3, 5), 16) / 255
    const b = Number.parseInt(normalizedHex.slice(5, 7), 16) / 255

    // Improved RGB to OKLCH conversion
    const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    const rLinear = toLinear(r)
    const gLinear = toLinear(g)
    const bLinear = toLinear(b)

    const l = Math.sqrt(0.299 * rLinear + 0.587 * gLinear + 0.114 * bLinear)
    const a = (r - g) * 0.5
    const bComponent = (r + g - 2 * b) * 0.25
    const c = Math.sqrt(a * a + bComponent * bComponent) * 0.4
    let h = Math.atan2(bComponent, a) * (180 / Math.PI)
    if (h < 0) h += 360

    const result = `oklch(${Math.max(0, Math.min(1, l)).toFixed(3)} ${Math.max(0, Math.min(0.4, c)).toFixed(3)} ${h.toFixed(1)})`
    colorCache.set(hex, result)
    return result
  } catch (error) {
    console.warn(`[GC] Invalid hex color: ${hex}, using fallback`)
    const fallback = "oklch(0.5 0 0)"
    colorCache.set(hex, fallback)
    return fallback
  }
}

const defaultThemeColors = {
  primary: "oklch(0.574 0.191 221.2)",
  "primary-foreground": "oklch(0.98 0 0)",
  secondary: "oklch(0.961 0.013 252.9)",
  "secondary-foreground": "oklch(0.176 0.014 252.9)",
  accent: "oklch(0.768 0.166 78.7)",
  "accent-foreground": "oklch(0.176 0.014 252.9)",
  background: "oklch(1 0 0)",
  foreground: "oklch(0.176 0.014 252.9)",
  muted: "oklch(0.961 0.013 252.9)",
  "muted-foreground": "oklch(0.478 0.013 252.9)",
  border: "oklch(0.898 0.013 252.9)",
  input: "oklch(1 0 0)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.176 0.014 252.9)",
  destructive: "oklch(0.628 0.258 29.2)",
  "destructive-foreground": "oklch(0.98 0 0)",
  ring: "oklch(0.574 0.191 221.2)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.176 0.014 252.9)",
} as const

export function DynamicThemeProvider({ theme, children }: DynamicThemeProviderProps) {
  const previousThemeRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Mark as hydrated after component mounts
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const applyTheme = useCallback((themeToApply: any) => {
    const root = document.documentElement

    if (!themeToApply) {
      console.log("[GC] No custom theme found, applying default theme")
      Object.entries(defaultThemeColors).forEach(([property, value]) => {
        root.style.setProperty(`--${property}`, value)
      })
      return
    }

    try {
      console.log("[GC] Applying custom theme:", themeToApply.theme_name)

      const themeColors = {
        primary: hexToOklch(themeToApply.primary_color),
        "primary-foreground": hexToOklch(themeToApply.primary_foreground),
        secondary: hexToOklch(themeToApply.secondary_color),
        "secondary-foreground": hexToOklch(themeToApply.secondary_foreground),
        accent: hexToOklch(themeToApply.accent_color),
        "accent-foreground": hexToOklch(themeToApply.accent_foreground),
        background: hexToOklch(themeToApply.background_color),
        foreground: hexToOklch(themeToApply.foreground_color),
        muted: hexToOklch(themeToApply.muted_color),
        "muted-foreground": hexToOklch(themeToApply.muted_foreground),
        border: hexToOklch(themeToApply.border_color),
        input: hexToOklch(themeToApply.input_color),
        card: hexToOklch(themeToApply.card_color),
        "card-foreground": hexToOklch(themeToApply.card_foreground),
        destructive: hexToOklch(themeToApply.destructive_color),
        "destructive-foreground": hexToOklch(themeToApply.destructive_foreground),
        ring: hexToOklch(themeToApply.ring_color),
        popover: hexToOklch(themeToApply.card_color),
        "popover-foreground": hexToOklch(themeToApply.card_foreground),
      }

      // Apply smooth transition
      root.style.transition = "color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out"

      Object.entries(themeColors).forEach(([property, value]) => {
        root.style.setProperty(`--${property}`, value)
      })

      // Clear transition after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        root.style.transition = ""
      }, 200)

      console.log("[GC] Theme applied successfully:", themeToApply.theme_name)
    } catch (error) {
      console.error("[GC] Error applying theme:", error)
      Object.entries(defaultThemeColors).forEach(([property, value]) => {
        root.style.setProperty(`--${property}`, value)
      })
    }
  }, [])

  useEffect(() => {
    // Only apply theme after hydration is complete to prevent mismatch
    if (!isHydrated) return

    // Only apply theme if it's different from the previous one
    if (previousThemeRef.current?.id === theme?.id) {
      return
    }

    applyTheme(theme)
    previousThemeRef.current = theme

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      const root = document.documentElement
      root.style.transition = ""
    }
  }, [theme, applyTheme, isHydrated])

  useEffect(() => {
    if (theme && previousThemeRef.current && previousThemeRef.current.id !== theme.id) {
      console.log("[GC] Theme changed, dispatching event")
      setTimeout(() => {
        const event = new CustomEvent("themeChanged", { detail: theme })
        window.dispatchEvent(event)
      }, 100)
    }
  }, [theme])

  return <>{children}</>
}
