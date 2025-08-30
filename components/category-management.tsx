"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface CategoryManagementProps {
  categories: any[]
}

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    description: "",
    description_bn: "",
    is_active: true,
    image_url: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image_url: "" }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      name_bn: "",
      description: "",
      description_bn: "",
      is_active: true,
      image_url: "",
    })
  }

  const handleAddCategory = async (formData: FormData) => {
    setIsCreating(true)

    try {
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "is_active") {
          formData.append(key, value.toString())
        } else {
          formData.append(key, value.toString())
        }
      })

      const result = await createCategory(null, formData)
      console.log(result) // Placeholder for setCreateState

      if (result?.success) {
        toast({
          title: "ক্যাটেগরি যোগ করা হয়েছে",
          description: "নতুন ক্যাটেগরি সফলভাবে যোগ করা হয়েছে।",
        })
        resetForm()
        setIsAddDialogOpen(false)
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
        description: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCategory = async (formData: FormData) => {
    if (!selectedCategory) return

    setIsUpdating(true)

    try {
      formData.append("id", selectedCategory.id)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "is_active") {
          formData.append(key, value.toString())
        } else {
          formData.append(key, value.toString())
        }
      })

      const result = await updateCategory(null, formData)
      console.log(result) // Placeholder for setUpdateState

      if (result?.success) {
        toast({
          title: "ক্যাটেগরি আপডেট করা হয়েছে",
          description: "ক্যাটেগরির তথ্য সফলভাবে আপডেট করা হয়েছে।",
        })
        resetForm()
        setIsEditDialogOpen(false)
        setSelectedCategory(null)
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
        description: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    setIsDeleting(categoryId)

    try {
      const result = await deleteCategory(categoryId)

      if (result?.success) {
        toast({
          title: "সফল",
          description: result.message || "ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে।",
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
        description: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const openEditDialog = (category: any) => {
    setFormData({
      name: category.name || "",
      name_bn: category.name_bn || "",
      description: category.description || "",
      description_bn: category.description_bn || "",
      is_active: category.is_active || false,
      image_url: category.image_url || "",
    })
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ক্যাটেগরি ম্যানেজমেন্ট</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন ক্যাটেগরি
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>নতুন ক্যাটেগরি যোগ করুন</DialogTitle>
                </DialogHeader>
                <form action={handleAddCategory} className="space-y-4">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={handleImageUpload}
                    onRemove={handleImageRemove}
                    label="ক্যাটেগরির ছবি"
                  />
                  <input type="hidden" name="image_url" value={formData.image_url} />

                  <div className="space-y-2">
                    <Label htmlFor="name">নাম (ইংরেজি)</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_bn">নাম (বাংলা)</Label>
                    <Input id="name_bn" name="name_bn" value={formData.name_bn} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_bn">বিবরণ (বাংলা)</Label>
                    <Textarea
                      id="description_bn"
                      name="description_bn"
                      value={formData.description_bn}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">সক্রিয়</Label>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isCreating}
                    >
                      বাতিল
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          যোগ করা হচ্ছে...
                        </>
                      ) : (
                        "যোগ করুন"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="relative">
                <CardContent className="p-4">
                  <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20">
                    <Image
                      src={category.image_url || "/placeholder.svg?height=128&width=200"}
                      alt={category.name_bn}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{category.name_bn}</h3>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>

                    {category.description_bn && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{category.description_bn}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isDeleting === category.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {isDeleting === category.id ? (
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

            {categories.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">কোন ক্যাটেগরি পাওয়া যায়নি।</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ক্যাটেগরি সম্পাদনা করুন</DialogTitle>
          </DialogHeader>
          <form action={handleEditCategory} className="space-y-4">
            <ImageUpload
              value={formData.image_url}
              onChange={handleImageUpload}
              onRemove={handleImageRemove}
              label="ক্যাটেগরির ছবি"
            />
            <input type="hidden" name="image_url" value={formData.image_url} />

            <div className="space-y-2">
              <Label htmlFor="edit_name">নাম (ইংরেজি)</Label>
              <Input id="edit_name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_name_bn">নাম (বাংলা)</Label>
              <Input id="edit_name_bn" name="name_bn" value={formData.name_bn} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_description_bn">বিবরণ (বাংলা)</Label>
              <Textarea
                id="edit_description_bn"
                name="description_bn"
                value={formData.description_bn}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
              />
              <Label htmlFor="edit_is_active">সক্রিয়</Label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                বাতিল
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    আপডেট করা হচ্ছে...
                  </>
                ) : (
                  "আপডেট করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
