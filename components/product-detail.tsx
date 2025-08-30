"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Zap,
  Truck,
  Shield,
  Star,
  Facebook,
  Copy,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { CheckoutModal } from "@/components/checkout-modal"

interface Product {
  id: string
  name: string
  name_bn: string
  description?: string
  description_bn?: string
  price: number
  original_price?: number
  image_url?: string
  image_urls?: string[]
  stock_quantity: number
  category_id: string
  is_active: boolean
  is_featured: boolean
  categories?: {
    id: string
    name: string
    name_bn: string
  }
}

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const { addToCart, state } = useCart()

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsWishlisted(wishlist.includes(product.id))
  }, [product.id])

  // Get all available images
  const allImages = []
  if (product.image_url) allImages.push(product.image_url)
  if (product.image_urls && Array.isArray(product.image_urls)) {
    allImages.push(...product.image_urls)
  }

  // Remove duplicates and filter out empty strings
  const uniqueImages = [...new Set(allImages)].filter(Boolean)
  const displayImages = uniqueImages.length > 0 ? uniqueImages : ["/placeholder.svg?height=400&width=400"]

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount
    ? Math.round((((product.original_price ?? 0) - product.price) / (product.original_price ?? 1)) * 100)
    : 0

  const handleAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      addToCart({
        id: product.id,
        name: product.name_bn || product.name,
        price: product.price,
        image: displayImages[0],
        quantity: quantity,
      })
      toast.success(`${quantity} টি ${product.name_bn || product.name} কার্টে যোগ করা হয়েছে`)
    } catch (error) {
      toast.error("কার্টে যোগ করতে সমস্যা হয়েছে")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleQuickBuy = async () => {
    setIsAddingToCart(true)

    try {
      addToCart({
        id: product.id,
        name: product.name_bn || product.name,
        price: product.price,
        image: displayImages[0],
        quantity: quantity,
      })
      setIsCheckoutOpen(true)
    } catch (error) {
      toast.error("কার্টে যোগ করতে সমস্যা হয়েছে")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlist = async () => {
    setIsTogglingWishlist(true)

    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      if (isWishlisted) {
        const newWishlist = wishlist.filter((id: string) => id !== product.id)
        localStorage.setItem("wishlist", JSON.stringify(newWishlist))
        setIsWishlisted(false)
        toast.success("উইশলিস্ট থেকে সরানো হয়েছে")
      } else {
        wishlist.push(product.id)
        localStorage.setItem("wishlist", JSON.stringify(wishlist))
        setIsWishlisted(true)
        toast.success("উইশলিস্টে যোগ করা হয়েছে")
      }
    } catch (error) {
      toast.error("উইশলিস্ট আপডেট করতে সমস্যা হয়েছে")
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const handleShare = async (platform?: string) => {
    const url = window.location.href
    const title = product.name_bn || product.name
    const text = `${title} - ৳${product.price} - ঘরকথা থেকে অর্ডার করুন`

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank",
      )
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank")
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url)
      toast.success("লিংক কপি করা হয়েছে")
    } else {
      // Native share or fallback
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url })
        } catch (error) {
          navigator.clipboard.writeText(url)
          toast.success("লিংক কপি করা হয়েছে")
        }
      } else {
        navigator.clipboard.writeText(url)
        toast.success("লিংক কপি করা হয়েছে")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb with Cart Icon */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            হোম
          </Link>
          <span>/</span>
          <span>{product.categories?.name_bn || product.categories?.name}</span>
          <span>/</span>
          <span className="text-foreground">{product.name_bn || product.name}</span>
        </div>

        <div className="relative">
          <Button variant="outline" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">কার্ট</span>
            </Link>
          </Button>
          {(state?.itemCount || 0) > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
              {state?.itemCount || 0}
            </Badge>
          )}
        </div>
      </div>

      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ফিরে যান
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Enhanced Image Gallery */}
        <div className="space-y-4">
          {/* Main Image with zoom */}
          <div
            className="aspect-square relative overflow-hidden rounded-lg border cursor-zoom-in"
            onClick={() => setIsImageZoomed(!isImageZoomed)}
          >
            <Image
              src={displayImages[selectedImageIndex] || "/placeholder.svg"}
              alt={product.name_bn || product.name}
              fill
              className={`object-cover transition-transform duration-300 ${isImageZoomed ? "scale-150" : "scale-100"}`}
              priority
            />
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
            )}
            {product.stock_quantity === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  স্টক শেষ
                </Badge>
              </div>
            )}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <Badge className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600">
                মাত্র {product.stock_quantity} টি বাকি!
              </Badge>
            )}
          </div>

          {/* Thumbnail Images */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name_bn || product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name_bn || product.name}</h1>
            {product.categories && (
              <Badge variant="secondary" className="mb-4">
                {product.categories.name_bn || product.categories.name}
              </Badge>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(৪.৮ রেটিং, ১২৩ রিভিউ)</span>
            </div>
          </div>

          {/* Enhanced Price Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">৳{product.price.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  ৳{product.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600 font-medium">
                আপনি সাশ্রয় করছেন ৳{((product.original_price || 0) - product.price).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">হোম ডেলিভারি</p>
              <p className="text-xs text-muted-foreground">সারাদেশে</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">১০০% অরিজিনাল</p>
              <p className="text-xs text-muted-foreground">গ্যারান্টি সহ</p>
            </div>
            <div className="text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">দ্রুত ডেলিভারি</p>
              <p className="text-xs text-muted-foreground">২৪ ঘন্টায়</p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">স্টক: </span>
            <span
              className={`font-medium ${product.stock_quantity > 5 ? "text-green-600" : product.stock_quantity > 0 ? "text-orange-600" : "text-red-600"}`}
            >
              {product.stock_quantity > 0 ? `${product.stock_quantity} টি উপলব্ধ` : "স্টক শেষ"}
            </span>
          </div>

          {/* Enhanced Quantity Selector */}
          {product.stock_quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">পরিমাণ:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  মোট: ৳{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || isAddingToCart}
                className="flex-1"
                size="lg"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    যোগ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    কার্টে যোগ করুন
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
                disabled={isTogglingWishlist}
                className={isWishlisted ? "text-red-500 border-red-500" : ""}
              >
                {isTogglingWishlist ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                )}
              </Button>
            </div>

            <Button
              onClick={handleQuickBuy}
              disabled={product.stock_quantity === 0 || isAddingToCart}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  প্রক্রিয়াকরণ...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  এখনই কিনুন
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShare("facebook")} className="flex-1">
                <Facebook className="h-4 w-4 mr-1" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleShare("copy")} className="flex-1">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">বিবরণ</TabsTrigger>
            <TabsTrigger value="specifications">বৈশিষ্ট্য</TabsTrigger>
            <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">পণ্যের বিবরণ</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description_bn || product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">পণ্যের বৈশিষ্ট্য</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">ব্র্যান্ড</span>
                    <span>ঘরকথা</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">ক্যাটেগরি</span>
                    <span>{product.categories?.name_bn || product.categories?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">স্টক</span>
                    <span>{product.stock_quantity} টি</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">গ্যারান্টি</span>
                    <span>১ বছর</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">কাস্টমার রিভিউ</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">রহিম উদ্দিন</p>
                      <p className="text-sm text-muted-foreground">খুবই ভালো পণ্য। দ্রুত ডেলিভারি পেয়েছি।</p>
                    </div>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>আরো রিভিউ শীঘ্রই যোগ করা হবে</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">সম্পর্কিত পণ্য</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <Link href={`/products/${relatedProduct.id}`}>
                  <CardContent className="p-4">
                    <div className="aspect-square relative mb-3 overflow-hidden rounded-md">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg?height=200&width=200&query=product"}
                        alt={relatedProduct.name_bn || relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {relatedProduct.name_bn || relatedProduct.name}
                    </h3>
                    <p className="text-primary font-bold">৳{relatedProduct.price.toLocaleString()}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  )
}
