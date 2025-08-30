"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface Theme {
  id: string
  theme_name: string
  is_active: boolean
  primary_color: string
  primary_foreground: string
  secondary_color: string
  secondary_foreground: string
  accent_color: string
  accent_foreground: string
  background_color: string
  foreground_color: string
  muted_color: string
  muted_foreground: string
  border_color: string
  input_color: string
  card_color: string
  card_foreground: string
  destructive_color: string
  destructive_foreground: string
  ring_color: string
  created_at: string
  updated_at?: string
  created_by: string
}

export async function getActiveTheme() {
  try {
    console.log("[GC] Fetching active theme from database...")
    const supabase = createClient()

    const { data: theme, error } = await supabase.from("theme_settings").select("*").eq("is_active", true).single()

    if (error) {
      console.log("[GC] Database error in getActiveTheme:", error.message)
      return null
    }

    if (!theme) {
      console.log("[GC] No active theme found")
      return null
    }

    console.log("[GC] Successfully loaded active theme:", theme.theme_name)
    return theme
  } catch (error) {
    console.log("[GC] Exception in getActiveTheme:", error)
    return null
  }
}

export async function getAllThemes() {
  try {
    console.log("[GC] Fetching all themes from database...")
    const supabase = createClient()

    const { data: themes, error } = await supabase
      .from("theme_settings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.log("[GC] Database error in getAllThemes:", error.message)
      return []
    }

    console.log("[GC] Successfully loaded", themes?.length || 0, "themes")
    return themes || []
  } catch (error) {
    console.log("[GC] Exception in getAllThemes:", error)
    return []
  }
}

export async function createTheme(prevState: any, formData: FormData) {
  try {
    console.log("[GC] Creating new theme...")
    const supabase = createClient()

    const themeName = formData.get("theme_name") as string
    if (!themeName || themeName.trim() === "") {
      return { error: "থিমের নাম প্রয়োজন" }
    }

    const isActive = formData.get("is_active") === "true"

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "অনুমতি নেই" }
    }

    const newTheme = {
      theme_name: themeName.trim(),
      is_active: isActive,
      primary_color: (formData.get("primary_color") as string) || "#0891b2",
      primary_foreground: (formData.get("primary_foreground") as string) || "#ffffff",
      secondary_color: (formData.get("secondary_color") as string) || "#f1f5f9",
      secondary_foreground: (formData.get("secondary_foreground") as string) || "#0f172a",
      accent_color: (formData.get("accent_color") as string) || "#84cc16",
      accent_foreground: (formData.get("accent_foreground") as string) || "#0f172a",
      background_color: (formData.get("background_color") as string) || "#ffffff",
      foreground_color: (formData.get("foreground_color") as string) || "#0f172a",
      muted_color: (formData.get("muted_color") as string) || "#f1f5f9",
      muted_foreground: (formData.get("muted_foreground") as string) || "#64748b",
      border_color: (formData.get("border_color") as string) || "#e2e8f0",
      input_color: (formData.get("input_color") as string) || "#ffffff",
      card_color: (formData.get("card_color") as string) || "#ffffff",
      card_foreground: (formData.get("card_foreground") as string) || "#0f172a",
      destructive_color: (formData.get("destructive_color") as string) || "#ef4444",
      destructive_foreground: (formData.get("destructive_foreground") as string) || "#ffffff",
      ring_color: (formData.get("ring_color") as string) || "#0891b2",
      created_by: user.id,
    }

    if (isActive) {
      console.log("[GC] Deactivating other themes...")
      await supabase
        .from("theme_settings")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000")
    }

    const { data: createdTheme, error } = await supabase.from("theme_settings").insert([newTheme]).select().single()

    if (error) {
      console.log("[GC] Database error in createTheme:", error.message)
      return { error: "থিম তৈরি করতে সমস্যা হয়েছে: " + error.message }
    }

    console.log("[GC] Theme created successfully:", createdTheme.theme_name)

    if (isActive) {
      // Trigger real-time update for all clients
      console.log("[GC] Broadcasting theme change for real-time updates")
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: createdTheme }
  } catch (error) {
    console.log("[GC] Exception in createTheme:", error)
    return { error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function updateTheme(prevState: any, formData: FormData) {
  try {
    console.log("[GC] Updating theme...")
    const supabase = createClient()

    const themeId = formData.get("id") as string
    const themeName = formData.get("theme_name") as string

    if (!themeId || !themeName || themeName.trim() === "") {
      return { error: "থিমের আইডি এবং নাম প্রয়োজন" }
    }

    const updatedTheme = {
      theme_name: themeName.trim(),
      primary_color: (formData.get("primary_color") as string) || "#0891b2",
      primary_foreground: (formData.get("primary_foreground") as string) || "#ffffff",
      secondary_color: (formData.get("secondary_color") as string) || "#f1f5f9",
      secondary_foreground: (formData.get("secondary_foreground") as string) || "#0f172a",
      accent_color: (formData.get("accent_color") as string) || "#84cc16",
      accent_foreground: (formData.get("accent_foreground") as string) || "#0f172a",
      background_color: (formData.get("background_color") as string) || "#ffffff",
      foreground_color: (formData.get("foreground_color") as string) || "#0f172a",
      muted_color: (formData.get("muted_color") as string) || "#f1f5f9",
      muted_foreground: (formData.get("muted_foreground") as string) || "#64748b",
      border_color: (formData.get("border_color") as string) || "#e2e8f0",
      input_color: (formData.get("input_color") as string) || "#ffffff",
      card_color: (formData.get("card_color") as string) || "#ffffff",
      card_foreground: (formData.get("card_foreground") as string) || "#0f172a",
      destructive_color: (formData.get("destructive_color") as string) || "#ef4444",
      destructive_foreground: (formData.get("destructive_foreground") as string) || "#ffffff",
      ring_color: (formData.get("ring_color") as string) || "#0891b2",
    }

    const { data: theme, error } = await supabase
      .from("theme_settings")
      .update(updatedTheme)
      .eq("id", themeId)
      .select()
      .single()

    if (error) {
      console.log("[GC] Database error in updateTheme:", error.message)
      return { error: "থিম আপডেট করতে সমস্যা হয়েছে: " + error.message }
    }

    if (!theme) {
      return { error: "থিম খুঁজে পাওয়া যায়নি" }
    }

    console.log("[GC] Theme updated successfully:", theme.theme_name)
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: theme }
  } catch (error) {
    console.log("[GC] Exception in updateTheme:", error)
    return { error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function activateTheme(themeId: string) {
  try {
    console.log("[GC] Activating theme:", themeId)
    const supabase = createClient()

    const { data: themeToActivate, error: fetchError } = await supabase
      .from("theme_settings")
      .select("*")
      .eq("id", themeId)
      .single()

    if (fetchError || !themeToActivate) {
      console.log("[GC] Theme not found:", fetchError?.message)
      return { error: "থিম খুঁজে পাওয়া যায়নি" }
    }

    console.log("[GC] Deactivating all themes...")
    await supabase.from("theme_settings").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000")

    const { error: activateError } = await supabase.from("theme_settings").update({ is_active: true }).eq("id", themeId).select().single()

    if (activateError) {
      console.log("[GC] Database error in activateTheme:", activateError.message)
      return { error: "থিম সক্রিয় করতে সমস্যা হয়েছে: " + activateError.message }
    }

    console.log("[GC] Theme activated successfully:", themeToActivate.theme_name)

    console.log("[GC] Broadcasting theme activation for real-time updates")

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: { ...themeToActivate, is_active: true } }
  } catch (error) {
    console.log("[GC] Exception in activateTheme:", error)
    return { error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function deleteTheme(themeId: string) {
  try {
    console.log("[GC] Deleting theme:", themeId)
    const supabase = createClient()

    const { data: themeToDelete, error: fetchError } = await supabase
      .from("theme_settings")
      .select("*")
      .eq("id", themeId)
      .single()

    if (fetchError || !themeToDelete) {
      console.log("[GC] Theme not found:", fetchError?.message)
      return { error: "থিম খুঁজে পাওয়া যায়নি" }
    }

    if (themeToDelete.is_active) {
      return { error: "সক্রিয় থিম মুছে ফেলা যাবে না" }
    }

    const { error } = await supabase.from("theme_settings").delete().eq("id", themeId)

    if (error) {
      console.log("[GC] Database error in deleteTheme:", error.message)
      return { error: "থিম মুছতে সমস্যা হয়েছে: " + error.message }
    }

    console.log("[GC] Theme deleted successfully:", themeToDelete.theme_name)
    revalidatePath("/admin")
    return { success: true, message: "থিম সফলভাবে মুছে ফেলা হয়েছে" }
  } catch (error) {
    console.log("[GC] Exception in deleteTheme:", error)
    return { error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}
