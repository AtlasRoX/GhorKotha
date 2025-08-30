import type React from "react"
import type { Metadata } from "next"
import { Hind_Siliguri } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { RealTimeThemeProvider } from "@/components/real-time-theme-provider"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { getActiveTheme } from "@/lib/theme-actions"
import "./globals.css"

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hind-siliguri",
})

export const metadata: Metadata = {
  title: "ঘরকথা - আপনার ঘরের জন্য সব কিছু",
  description: "ঘরের প্রয়োজনীয় সব কিছু এক জায়গায়। মানসম্পন্ন পণ্য, সাশ্রয়ী দাম।",
  generator: "GhostCache_",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let activeTheme = null
  try {
    activeTheme = await getActiveTheme()
  } catch (error) {
    console.error("[GC] Failed to load active theme in layout:", error)
  }

  return (
    <html lang="bn" className={hindSiliguri.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <RealTimeThemeProvider initialTheme={activeTheme}>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </RealTimeThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
