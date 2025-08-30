"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, ImageIcon, ExternalLink, Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface MultipleImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  label?: string
  maxImages?: number
}

export function MultipleImageUpload({
  value = [],
  onChange,
  disabled = false,
  label = "পণ্যের ছবিসমূহ",
  maxImages = 5,
}: MultipleImageUploadProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const validateAndAddImage = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
    }

    if (!imageUrl.trim()) {
      toast({
        title: "খালি লিংক",
        description: "অনুগ্রহ করে একটি ছবির লিংক দিন।",
        variant: "destructive",
      })
      return
    }

    if (value.length >= maxImages) {
      toast({
        title: "সর্বোচ্চ সীমা",
        description: `সর্বোচ্চ ${maxImages}টি ছবি যোগ করা যাবে।`,
        variant: "destructive",
      })
      return
    }

    if (value.includes(imageUrl.trim())) {
      toast({
        title: "ডুপ্লিকেট ছবি",
        description: "এই ছবিটি ইতিমধ্যে যোগ করা হয়েছে।",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      toast({
        title: "ভুল লিংক",
        description: "অনুগ্রহ করে একটি সঠিক URL দিন।",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    // Test if image loads
    const img = new window.Image()
    img.onload = () => {
      const newImages = [...value, imageUrl.trim()]
      onChange(newImages)
      setImageUrl("")
      setIsValidating(false)
      toast({
        title: "ছবি যোগ করা হয়েছে",
        description: "ছবি সফলভাবে যোগ করা হয়েছে।",
      })
    }
    img.onerror = () => {
      setIsValidating(false)
      toast({
        title: "ছবি লোড হয়নি",
        description: "এই লিংক থেকে ছবি লোড করা যাচ্ছে না। অন্য লিংক চেষ্টা করুন।",
        variant: "destructive",
      })
    }
    img.src = imageUrl
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = value.filter((_, index) => index !== indexToRemove)
    onChange(newImages)
    toast({
      title: "ছবি মুছে ফেলা হয়েছে",
      description: "ছবিটি সফলভাবে মুছে ফেলা হয়েছে।",
    })
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return

    const newImages = [...value]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {value.length}/{maxImages} ছবি
        </span>
      </div>

      {/* Display existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative h-32 w-full rounded-lg overflow-hidden">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Primary image indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      প্রধান
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Move buttons */}
                <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={disabled}
                      title="বামে সরান"
                    >
                      ←
                    </Button>
                  )}
                  {index < value.length - 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={disabled}
                      title="ডানে সরান"
                    >
                      →
                    </Button>
                  )}
                </div>

                {/* URL display */}
                <div className="mt-2 p-1 bg-muted rounded text-xs break-all">
                  <ExternalLink className="h-2 w-2 inline mr-1" />
                  {url.length > 30 ? `${url.substring(0, 30)}...` : url}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new image */}
      {value.length < maxImages && (
        <Card className="border-dashed border-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {value.length === 0 ? "যেকোনো ইমেজ হোস্টিং সাইট থেকে ছবির লিংক পেস্ট করুন" : "আরও ছবি যোগ করুন"}
                </p>
                <p className="text-xs text-muted-foreground">(imgur, postimg, cloudinary, ইত্যাদি)</p>
                {value.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">প্রথম ছবিটি প্রধান ছবি হিসেবে ব্যবহৃত হবে</p>
                )}
              </div>
              <div className="w-full max-w-md space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  disabled={disabled}
                  className="text-center"
                />
                <Button
                  type="button"
                  onClick={validateAndAddImage}
                  disabled={disabled || isValidating || !imageUrl.trim()}
                  className="w-full"
                >
                  {isValidating ? (
                    "যাচাই করা হচ্ছে..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      ছবি যোগ করুন
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {value.length >= maxImages && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            সর্বোচ্চ {maxImages}টি ছবি যোগ করা হয়েছে। নতুন ছবি যোগ করতে আগে কোনো ছবি মুছে ফেলুন।
          </p>
        </div>
      )}
    </div>
  )
}
