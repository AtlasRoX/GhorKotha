"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface ProductManagementProps {
  products: any[]
  categories: any[]
}

export function ProductManagement({ products, categories }: ProductManagementProps) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [createState, setCreateState] = useState<any>(null)
  const [updateState, setUpdateState] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    description: "",
    description_bn: "",
    price: "",
    original_price: "",
    category_id: "",
    stock_quantity: "",
    is_active: true,
    is_featured: false,
    image_urls: [] as string[], // Changed from single image_url to multiple image_urls
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, image_urls: urls }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      name_bn: "",
      description: "",
      description_bn: "",
      price: "",
      original_price: "",
      category_id: "",
      stock_quantity: "",
      is_active: true,
      is_featured: false,
      image_urls: [], // Reset to empty array
    })
  }

  const handleAddProduct = async (formDataObj: FormData) => {
    setIsCreating(true)

    try {
      const fields = [
        "name",
        "name_bn",
        "description",
        "description_bn",
        "price",
        "original_price",
        "category_id",
        "stock_quantity",
        "is_active",
        "is_featured",
        "image_urls",
      ]
      fields.forEach((field) => formDataObj.delete(field))

      formDataObj.append("name", formData.name)
      formDataObj.append("name_bn", formData.name_bn)
      formDataObj.append("description", formData.description)
      formDataObj.append("description_bn", formData.description_bn)
      formDataObj.append("price", formData.price)
      formDataObj.append("original_price", formData.original_price)
      formDataObj.append("category_id", formData.category_id)
      formDataObj.append("stock_quantity", formData.stock_quantity)
      formDataObj.append("is_active", formData.is_active.toString())
      formDataObj.append("is_featured", formData.is_featured.toString())
      formDataObj.append("image_urls", JSON.stringify(formData.image_urls))

      const result = await createProduct(null, formDataObj)
      setCreateState(result)

      if (result?.success) {
        toast({
          title: "পণ্য যোগ করা হয়েছে",
          description: "নতুন পণ্য সফলভাবে যোগ করা হয়েছে।",
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

  const handleEditProduct = async (formDataObj: FormData) => {
    if (!selectedProduct) return

    setIsUpdating(true)

    try {
      const fields = [
        "id",
        "name",
        "name_bn",
        "description",
        "description_bn",
        "price",
        "original_price",
        "category_id",
        "stock_quantity",
        "is_active",
        "is_featured",
        "image_urls",
      ]
      fields.forEach((field) => formDataObj.delete(field))

      formDataObj.append("id", selectedProduct.id)
      formDataObj.append("name", formData.name)
      formDataObj.append("name_bn", formData.name_bn)
      formDataObj.append("description", formData.description)
      formDataObj.append("description_bn", formData.description_bn)
      formDataObj.append("price", formData.price)
      formDataObj.append("original_price", formData.original_price)
      formDataObj.append("category_id", formData.category_id)
      formDataObj.append("stock_quantity", formData.stock_quantity)
      formDataObj.append("is_active", formData.is_active.toString())
      formDataObj.append("is_featured", formData.is_featured.toString())
      formDataObj.append("image_urls", JSON.stringify(formData.image_urls))

      const result = await updateProduct(null, formDataObj)
      setUpdateState(result)

      if (result?.success) {
        toast({
          title: "পণ্য আপডেট করা হয়েছে",
          description: "পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে।",
        })
        resetForm()
        setIsEditDialogOpen(false)
        setSelectedProduct(null)
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

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(productId)

    try {
      const result = await deleteProduct(productId)

      if (result?.success) {
        toast({
          title: "সফল",
          description: result.message || "পণ্য সফলভাবে মুছে ফেলা হয়েছে।",
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

  const openEditDialog = (product: any) => {
    setFormData({
      name: product.name || "",
      name_bn: product.name_bn || "",
      description: product.description || "",
      description_bn: product.description_bn || "",
      price: product.price?.toString() || "",
      original_price: product.original_price?.toString() || "",
      category_id: product.category_id || "",
      stock_quantity: product.stock_quantity?.toString() || "",
      is_active: product.is_active || false,
      is_featured: product.is_featured || false,
      image_urls: product.image_urls || (product.image_url ? [product.image_url] : []), // Handle both single and multiple images
    })
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>পণ্য ম্যানেজমেন্ট</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন পণ্য
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
                </DialogHeader>
                <form action={handleAddProduct} className="space-y-4">
                  <MultipleImageUpload
                    value={formData.image_urls}
                    onChange={handleImageUpload}
                    label="পণ্যের ছবিসমূহ"
                    maxImages={5}
                  />

                  {/* ... existing form fields ... */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">নাম (ইংরেজি)</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_bn">নাম (বাংলা)</Label>
                      <Input
                        id="name_bn"
                        name="name_bn"
                        value={formData.name_bn}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">দাম</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_price">আসল দাম</Label>
                      <Input
                        id="original_price"
                        name="original_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id">ক্যাটেগরি</Label>
                      <Select
                        name="category_id"
                        value={formData.category_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name_bn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">স্টক</Label>
                      <Input
                        id="stock_quantity"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                      />
                      <Label htmlFor="is_active">সক্রিয়</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                      />
                      <Label htmlFor="is_featured">বিশেষ পণ্য</Label>
                    </div>
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
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=64&width=64"}
                    alt={product.name_bn}
                    fill
                    className="object-cover"
                  />
                  {product.image_urls && product.image_urls.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-tl">
                      +{product.image_urls.length - 1}
                    </div>
                  )}
                </div>

                {/* ... existing product display code ... */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{product.name_bn}</h3>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                    {product.is_featured && <Badge variant="outline">বিশেষ</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.categories?.name_bn} • স্টক: {product.stock_quantity}
                  </p>
                  <p className="font-semibold text-primary">৳{Number.parseFloat(product.price).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isDeleting === product.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {isDeleting === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {products.length === 0 && <div className="text-center py-8 text-muted-foreground">কোন পণ্য পাওয়া যায়নি।</div>}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>পণ্য সম্পাদনা করুন</DialogTitle>
          </DialogHeader>
          <form action={handleEditProduct} className="space-y-4">
            <MultipleImageUpload
              value={formData.image_urls}
              onChange={handleImageUpload}
              label="পণ্যের ছবিসমূহ"
              maxImages={5}
            />

            {/* ... existing form fields ... */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">নাম (ইংরেজি)</Label>
                <Input id="edit_name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_name_bn">নাম (বাংলা)</Label>
                <Input
                  id="edit_name_bn"
                  name="name_bn"
                  value={formData.name_bn}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_price">দাম</Label>
                <Input
                  id="edit_price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_original_price">আসল দাম</Label>
                <Input
                  id="edit_original_price"
                  name="original_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.original_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_category_id">ক্যাটেগরি</Label>
                <Select
                  name="category_id"
                  value={formData.category_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name_bn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_stock_quantity">স্টক</Label>
                <Input
                  id="edit_stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                />
                <Label htmlFor="edit_is_active">সক্রিয়</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                />
                <Label htmlFor="edit_is_featured">বিশেষ পণ্য</Label>
              </div>
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
