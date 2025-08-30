"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, Palette, Eye, Trash2, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ThemeColorGroup } from "@/components/theme-color-group"
import { ThemePreview } from "@/components/theme-preview"
import { createTheme, updateTheme, activateTheme, deleteTheme } from "@/lib/theme-actions"
import { useRouter } from "next/navigation"

interface ThemeManagementProps {
  themes: any[]
}

const validateHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

const validateThemeName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50
}

const validateFormData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validateThemeName(data.theme_name)) {
    errors.push("থিমের নাম ২-৫০ অক্ষরের মধ্যে হতে হবে")
  }

  const colorFields = [
    "primary_color",
    "primary_foreground",
    "secondary_color",
    "secondary_foreground",
    "accent_color",
    "accent_foreground",
    "background_color",
    "foreground_color",
    "muted_color",
    "muted_foreground",
    "border_color",
    "input_color",
    "card_color",
    "card_foreground",
    "destructive_color",
    "destructive_foreground",
    "ring_color",
  ]

  colorFields.forEach((field) => {
    if (!validateHexColor(data[field])) {
      errors.push(`${field} সঠিক হেক্স কালার ফরম্যাটে নেই`)
    }
  })

  return { isValid: errors.length === 0, errors }
}

export function ThemeManagement({ themes }: ThemeManagementProps) {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [formData, setFormData] = useState({
    theme_name: "",
    is_active: false,
    primary_color: "#0891b2",
    primary_foreground: "#ffffff",
    secondary_color: "#84cc16",
    secondary_foreground: "#ffffff",
    accent_color: "#f59e0b",
    accent_foreground: "#ffffff",
    background_color: "#ffffff",
    foreground_color: "#0f172a",
    muted_color: "#f1f5f9",
    muted_foreground: "#64748b",
    border_color: "#e2e8f0",
    input_color: "#ffffff",
    card_color: "#ffffff",
    card_foreground: "#0f172a",
    destructive_color: "#ef4444",
    destructive_foreground: "#ffffff",
    ring_color: "#0891b2",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleColorChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const resetForm = () => {
    setFormData({
      theme_name: "",
      is_active: false,
      primary_color: "#0891b2",
      primary_foreground: "#ffffff",
      secondary_color: "#84cc16",
      secondary_foreground: "#ffffff",
      accent_color: "#f59e0b",
      accent_foreground: "#ffffff",
      background_color: "#ffffff",
      foreground_color: "#0f172a",
      muted_color: "#f1f5f9",
      muted_foreground: "#64748b",
      border_color: "#e2e8f0",
      input_color: "#ffffff",
      card_color: "#ffffff",
      card_foreground: "#0f172a",
      destructive_color: "#ef4444",
      destructive_foreground: "#ffffff",
      ring_color: "#0891b2",
    })
    setValidationErrors([])
  }

  const handleCreateTheme = async () => {
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast({
        title: "ফর্ম ত্রুটি",
        description: "অনুগ্রহ করে সব ক্ষেত্র সঠিকভাবে পূরণ করুন।",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString())
      })

      const result = await createTheme(null, formDataObj)

      if (result?.success) {
        toast({
          title: "থিম তৈরি করা হয়েছে",
          description: "নতুন থিম সফলভাবে তৈরি করা হয়েছে।",
        })
        resetForm()
        setIsCreateDialogOpen(false)
        router.refresh()
      } else if (result?.error) {
        toast({
          title: "ত্রুটি",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "থিম তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTheme = async () => {
    if (!selectedTheme) return

    const validation = validateFormData(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast({
        title: "ফর্ম ত্রুটি",
        description: "অনুগ্রহ করে সব ক্ষেত্র সঠিকভাবে পূরণ করুন।",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("id", selectedTheme.id)
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "is_active") {
          // Don't update is_active in edit mode
          formDataObj.append(key, value.toString())
        }
      })

      const result = await updateTheme(null, formDataObj)

      if (result?.success) {
        toast({
          title: "থিম আপডেট করা হয়েছে",
          description: "থিম সফলভাবে আপডেট করা হয়েছে।",
        })
        resetForm()
        setIsEditDialogOpen(false)
        setSelectedTheme(null)
        router.refresh()
      } else if (result?.error) {
        toast({
          title: "ত্রুটি",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "থিম আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivateTheme = async (themeId: string) => {
    try {
      const result = await activateTheme(themeId)

      if (result?.success) {
        toast({
          title: "থিম সক্রিয় করা হয়েছে",
          description: "নতুন থিম সক্রিয় করা হয়েছে।",
        })
        router.refresh()
      } else if (result?.error) {
        toast({
          title: "ত্রুটি",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "থিম সক্রিয় করতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTheme = async (themeId: string) => {
    setIsDeleting(themeId)
    try {
      const result = await deleteTheme(themeId)

      if (result?.success) {
        toast({
          title: "থিম মুছে ফেলা হয়েছে",
          description: result.message || "থিম সফলভাবে মুছে ফেলা হয়েছে।",
        })
        router.refresh()
      } else if (result?.error) {
        toast({
          title: "ত্রুটি",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "থিম মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const openEditDialog = (theme: any) => {
    setFormData({
      theme_name: theme.theme_name || "",
      is_active: theme.is_active || false,
      primary_color: theme.primary_color || "#0891b2",
      primary_foreground: theme.primary_foreground || "#ffffff",
      secondary_color: theme.secondary_color || "#84cc16",
      secondary_foreground: theme.secondary_foreground || "#ffffff",
      accent_color: theme.accent_color || "#f59e0b",
      accent_foreground: theme.accent_foreground || "#ffffff",
      background_color: theme.background_color || "#ffffff",
      foreground_color: theme.foreground_color || "#0f172a",
      muted_color: theme.muted_color || "#f1f5f9",
      muted_foreground: theme.muted_foreground || "#64748b",
      border_color: theme.border_color || "#e2e8f0",
      input_color: theme.input_color || "#ffffff",
      card_color: theme.card_color || "#ffffff",
      card_foreground: theme.card_foreground || "#0f172a",
      destructive_color: theme.destructive_color || "#ef4444",
      destructive_foreground: theme.destructive_foreground || "#ffffff",
      ring_color: theme.ring_color || "#0891b2",
    })
    setSelectedTheme(theme)
    setValidationErrors([])
    setIsEditDialogOpen(true)
  }

  const colorGroups = [
    {
      title: "প্রাইমারি রং",
      description: "মূল ব্র্যান্ড রং এবং প্রধান বাটনের জন্য",
      colors: [
        { key: "primary_color", label: "প্রাইমারি", value: formData.primary_color },
        { key: "primary_foreground", label: "প্রাইমারি টেক্সট", value: formData.primary_foreground },
      ],
    },
    {
      title: "সেকেন্ডারি রং",
      description: "দ্বিতীয় গুরুত্বপূর্ণ রং এবং অ্যাকসেন্ট",
      colors: [
        { key: "secondary_color", label: "সেকেন্ডারি", value: formData.secondary_color },
        { key: "secondary_foreground", label: "সেকেন্ডারি টেক্সট", value: formData.secondary_foreground },
        { key: "accent_color", label: "অ্যাকসেন্ট", value: formData.accent_color },
        { key: "accent_foreground", label: "অ্যাকসেন্ট টেক্সট", value: formData.accent_foreground },
      ],
    },
    {
      title: "ব্যাকগ্রাউন্ড রং",
      description: "পেজের পটভূমি এবং কার্ডের রং",
      colors: [
        { key: "background_color", label: "ব্যাকগ্রাউন্ড", value: formData.background_color },
        { key: "foreground_color", label: "মূল টেক্সট", value: formData.foreground_color },
        { key: "card_color", label: "কার্ড ব্যাকগ্রাউন্ড", value: formData.card_color },
        { key: "card_foreground", label: "কার্ড টেক্সট", value: formData.card_foreground },
      ],
    },
    {
      title: "অন্যান্য রং",
      description: "বর্ডার, ইনপুট এবং অন্যান্য UI এলিমেন্ট",
      colors: [
        { key: "muted_color", label: "মিউটেড ব্যাকগ্রাউন্ড", value: formData.muted_color },
        { key: "muted_foreground", label: "মিউটেড টেক্সট", value: formData.muted_foreground },
        { key: "border_color", label: "বর্ডার", value: formData.border_color },
        { key: "input_color", label: "ইনপুট ব্যাকগ্রাউন্ড", value: formData.input_color },
        { key: "destructive_color", label: "ডিলিট/ডেঞ্জার", value: formData.destructive_color },
        { key: "destructive_foreground", label: "ডেঞ্জার টেক্সট", value: formData.destructive_foreground },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                থিম ম্যানেজমেন্ট
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">আপনার ওয়েবসাইটের রং এবং থিম কাস্টমাইজ করুন</p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open)
                if (!open) {
                  resetForm()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন থিম
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>নতুন থিম তৈরি করুন</DialogTitle>
                </DialogHeader>

                {validationErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">ফর্ম ত্রুটি:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme_name">থিমের নাম *</Label>
                      <Input
                        id="theme_name"
                        name="theme_name"
                        value={formData.theme_name}
                        onChange={handleInputChange}
                        placeholder="যেমন: গ্রীষ্মকালীন থিম"
                        required
                        className={
                          validationErrors.some((error) => error.includes("থিমের নাম")) ? "border-destructive" : ""
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                      />
                      <Label htmlFor="is_active">তৈরি করার সাথে সাথে সক্রিয় করুন</Label>
                    </div>

                    {colorGroups.map((group) => (
                      <ThemeColorGroup
                        key={group.title}
                        title={group.title}
                        description={group.description}
                        colors={group.colors}
                        onChange={handleColorChange}
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <ThemePreview colors={{ ...formData, is_active: formData.is_active.toString() }} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
                    বাতিল
                  </Button>
                  <Button onClick={handleCreateTheme} disabled={isSaving || !formData.theme_name.trim()}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        তৈরি করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        থিম তৈরি করুন
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <Card key={theme.id} className="relative">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{theme.theme_name}</h3>
                      <Badge variant={theme.is_active ? "default" : "secondary"}>
                        {theme.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>

                    {/* Color Preview */}
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.primary_color }}
                        title={`প্রাইমারি: ${theme.primary_color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.secondary_color }}
                        title={`সেকেন্ডারি: ${theme.secondary_color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.accent_color }}
                        title={`অ্যাকসেন্ট: ${theme.accent_color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.background_color }}
                        title={`ব্যাকগ্রাউন্ড: ${theme.background_color}`}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {!theme.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateTheme(theme.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(theme)}>
                        <Palette className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTheme(theme.id)}
                        disabled={isDeleting === theme.id || theme.is_active}
                        className="text-destructive hover:text-destructive"
                      >
                        {isDeleting === theme.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {themes.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                কোন কাস্টম থিম পাওয়া যায়নি। নতুন থিম তৈরি করুন।
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetForm()
            setSelectedTheme(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>থিম সম্পাদনা করুন</DialogTitle>
          </DialogHeader>

          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">ফর্ম ত্রুটি:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit_theme_name">থিমের নাম *</Label>
                <Input
                  id="edit_theme_name"
                  name="theme_name"
                  value={formData.theme_name}
                  onChange={handleInputChange}
                  required
                  className={validationErrors.some((error) => error.includes("থিমের নাম")) ? "border-destructive" : ""}
                />
              </div>

              {colorGroups.map((group) => (
                <ThemeColorGroup
                  key={group.title}
                  title={group.title}
                  description={group.description}
                  colors={group.colors}
                  onChange={handleColorChange}
                />
              ))}
            </div>

            <div className="space-y-4">
              <ThemePreview colors={{ ...formData, is_active: formData.is_active.toString() }} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              বাতিল
            </Button>
            <Button onClick={handleUpdateTheme} disabled={isSaving || !formData.theme_name.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  আপডেট করা হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  থিম আপডেট করুন
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
