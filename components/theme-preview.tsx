"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Heart, Star } from "lucide-react"

interface ThemePreviewProps {
  colors: Record<string, string>
}

function ThemePreviewComponent({ colors }: ThemePreviewProps) {
  const previewStyle = useMemo(
    () =>
      ({
        "--primary": colors.primary_color || "#0891b2",
        "--primary-foreground": colors.primary_foreground || "#ffffff",
        "--secondary": colors.secondary_color || "#84cc16",
        "--secondary-foreground": colors.secondary_foreground || "#ffffff",
        "--accent": colors.accent_color || "#f59e0b",
        "--accent-foreground": colors.accent_foreground || "#ffffff",
        "--background": colors.background_color || "#ffffff",
        "--foreground": colors.foreground_color || "#0f172a",
        "--muted": colors.muted_color || "#f1f5f9",
        "--muted-foreground": colors.muted_foreground || "#64748b",
        "--border": colors.border_color || "#e2e8f0",
        "--card": colors.card_color || "#ffffff",
        "--card-foreground": colors.card_foreground || "#0f172a",
      }) as React.CSSProperties,
    [colors],
  )

  const containerStyle = useMemo(
    () => ({
      ...previewStyle,
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      borderColor: "var(--border)",
    }),
    [previewStyle],
  )

  const buttonStyles = useMemo(
    () => ({
      primary: {
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      },
      secondary: {
        backgroundColor: "var(--secondary)",
        color: "var(--secondary-foreground)",
      },
      outline: {
        borderColor: "var(--border)",
      },
      card: {
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
        borderColor: "var(--border)",
      },
      badge: {
        backgroundColor: "var(--secondary)",
        color: "var(--secondary-foreground)",
      },
      input: {
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
      },
    }),
    [],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>থিম প্রিভিউ</CardTitle>
        <p className="text-sm text-muted-foreground">আপনার নির্বাচিত রং কেমন দেখাবে তার একটি নমুনা</p>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg border space-y-4" style={containerStyle}>
          {/* Header Preview */}
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-bold text-lg">ঘরকথা</h3>
            <div className="flex gap-2">
              <Button size="sm" style={buttonStyles.primary}>
                লগইন
              </Button>
            </div>
          </div>

          {/* Product Card Preview */}
          <div className="p-4 rounded border" style={buttonStyles.card}>
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded" style={{ backgroundColor: "var(--muted)" }} />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold">নমুনা পণ্য</h4>
                <div className="flex items-center gap-2">
                  <Badge style={buttonStyles.badge}>নতুন</Badge>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-current" style={{ color: "var(--accent)" }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>
                    ৳১,২০০
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" style={buttonStyles.outline}>
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" style={buttonStyles.primary}>
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">নমুনা ইনপুট</label>
            <Input placeholder="এখানে টাইপ করুন..." style={buttonStyles.input} />
          </div>

          {/* Button Variations */}
          <div className="flex gap-2 flex-wrap">
            <Button style={buttonStyles.primary}>প্রাইমারি</Button>
            <Button variant="secondary" style={buttonStyles.secondary}>
              সেকেন্ডারি
            </Button>
            <Button variant="outline" style={buttonStyles.outline}>
              আউটলাইন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ThemePreview = memo(ThemePreviewComponent)
