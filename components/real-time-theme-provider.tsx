"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { DynamicThemeProvider } from "@/components/dynamic-theme-provider"

interface RealTimeThemeProviderProps {
  initialTheme: any
  children: React.ReactNode
}

export function RealTimeThemeProvider({ initialTheme, children }: RealTimeThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState(initialTheme)
  const [isPolling, setIsPolling] = useState(false)
  const [hasError, setHasError] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastThemeIdRef = useRef(initialTheme?.id)
  const isAdminPageRef = useRef(false)
  const errorCountRef = useRef(0)

  // Check if we're on admin page
  useEffect(() => {
    isAdminPageRef.current = window.location.pathname.startsWith("/admin")
  }, [])

  const fetchActiveTheme = useCallback(async () => {
    // Stop polling if too many errors
    if (errorCountRef.current > 5) {
      console.log("[GC] Too many errors, stopping theme polling")
      setHasError(true)
      return
    }

    try {
      const response = await fetch("/api/theme/active", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const theme = await response.json()

        // Reset error count on success
        errorCountRef.current = 0
        setHasError(false)

        // Only update if theme actually changed
        if (theme?.id && theme.id !== lastThemeIdRef.current) {
          console.log("[GC] Real-time theme update detected:", theme.theme_name)
          setCurrentTheme(theme)
          lastThemeIdRef.current = theme.id

          // Broadcast to other tabs
          localStorage.setItem(
            "theme-update",
            JSON.stringify({
              theme,
              timestamp: Date.now(),
            }),
          )

          // Dispatch custom event for same-tab components
          window.dispatchEvent(new CustomEvent("themeUpdated", { detail: theme }))
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      errorCountRef.current++
      console.error("[GC] Error fetching active theme (attempt", errorCountRef.current, "):", error)

      // If database table doesn't exist, stop polling to prevent infinite loop
      if (error instanceof Error && error.message.includes("table")) {
        console.log("[GC] Database table issue detected, stopping polling")
        setHasError(true)
        // Clear interval directly using ref
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
          setIsPolling(false)
        }
      }
    }
  }, []) // Empty dependency array - this function is stable

  const pollingFunctionsRef = useRef({
    start: () => {},
    stop: () => {},
  })

  useEffect(() => {
    pollingFunctionsRef.current.start = () => {
      if (pollingIntervalRef.current || isPolling || hasError) return

      console.log("[GC] Starting real-time theme polling")
      setIsPolling(true)

      // Poll every 3 seconds when admin is active
      pollingIntervalRef.current = setInterval(fetchActiveTheme, 3000)
    }

    pollingFunctionsRef.current.stop = () => {
      if (pollingIntervalRef.current) {
        console.log("[GC] Stopping real-time theme polling")
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
        setIsPolling(false)
      }
    }
  }, [isPolling, hasError, fetchActiveTheme])

  // Listen for cross-tab theme updates
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme-update" && event.newValue) {
        try {
          const { theme, timestamp } = JSON.parse(event.newValue)

          // Only apply if it's a recent update (within 10 seconds)
          if (Date.now() - timestamp < 10000 && theme?.id !== lastThemeIdRef.current) {
            console.log("[GC] Cross-tab theme update received:", theme.theme_name)
            setCurrentTheme(theme)
            lastThemeIdRef.current = theme.id
          }
        } catch (error) {
          console.error("[GC] Error parsing theme update:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pollingFunctionsRef.current.stop()
      } else if (isAdminPageRef.current && !hasError) {
        pollingFunctionsRef.current.start()
      }
    }

    const handleFocus = () => {
      if (isAdminPageRef.current && !hasError) {
        pollingFunctionsRef.current.start()
        // Immediate check when window gains focus
        fetchActiveTheme()
      }
    }

    const handleBlur = () => {
      // Reduce polling when window loses focus
      pollingFunctionsRef.current.stop()
    }

    // Start polling if on admin page and no errors
    if (isAdminPageRef.current && !hasError) {
      pollingFunctionsRef.current.start()
    }

    // Listen for various events
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("beforeunload", pollingFunctionsRef.current.stop)

    return () => {
      pollingFunctionsRef.current.stop()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("beforeunload", pollingFunctionsRef.current.stop)
    }
  }, [hasError, fetchActiveTheme]) // Only depend on hasError and stable fetchActiveTheme

  useEffect(() => {
    return () => {
      pollingFunctionsRef.current.stop()
    }
  }, []) // Empty deps - only run on mount/unmount

  return <DynamicThemeProvider theme={currentTheme}>{children}</DynamicThemeProvider>
}
