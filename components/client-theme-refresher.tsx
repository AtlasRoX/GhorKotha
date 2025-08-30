"use client"

import { useEffect, useCallback } from "react"

export function ClientThemeRefresher() {
  const triggerThemeUpdate = useCallback(() => {
    // Dispatch event to trigger real-time theme polling
    window.dispatchEvent(new CustomEvent("adminThemeChange"))

    // Also trigger immediate theme check
    window.dispatchEvent(new CustomEvent("themeChangeRequested"))
  }, [])

  useEffect(() => {
    const handleThemeChanged = (event: CustomEvent) => {
          triggerThemeUpdate()
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme-changed") {
        triggerThemeUpdate()
      }
    }

    window.addEventListener("themeChanged", handleThemeChanged as EventListener)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("themeChangeRequested", triggerThemeUpdate)

    return () => {
      window.removeEventListener("themeChanged", handleThemeChanged as EventListener)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("themeChangeRequested", triggerThemeUpdate)
    }
  }, [triggerThemeUpdate])

  return null
}
