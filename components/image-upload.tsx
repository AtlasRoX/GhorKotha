"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X, ImageIcon, ExternalLink } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  label = "ছবির লিংক যোগ করুন",
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value || "")
  const [isValidating, setIsValidating] = useState(false)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const validateAndSetImage = async (e?: React.MouseEvent) => {
    e?.preventDefault()

    if (!imageUrl.trim()) {
      toast({
        title: "খালি লিংক",
        description: "অনুগ্রহ করে একটি ছবির লিংক দিন।",
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
    const img = new Image()
    img.onload = () => {
      onChange(imageUrl)
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

  const handleRemove = () => {
    onRemove()
    setImageUrl("")
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {value ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <Image src={value || "/placeholder.svg"} alt="Product image" fill className="object-cover" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 p-2 bg-muted rounded text-xs break-all">
              <ExternalLink className="h-3 w-3 inline mr-1" />
              {value}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">যেকোনো ইমেজ হোস্টিং সাইট থেকে ছবির লিংক পেস্ট করুন</p>
                <p className="text-xs text-muted-foreground">(imgur, postimg, cloudinary, ইত্যাদি)</p>
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
                  onClick={validateAndSetImage}
                  disabled={disabled || isValidating || !imageUrl.trim()}
                  className="w-full"
                >
                  {isValidating ? "যাচাই করা হচ্ছে..." : "ছবি যোগ করুন"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
