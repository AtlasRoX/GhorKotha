"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Loader2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface Product {
  id: string
  name: string
  name_bn: string
  description_bn?: string
  price: number
  original_price?: number
  image_url?: string
  stock_quantity: number
  categories?: {
    id: string
    name: string
    name_bn: string
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { state, addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock_quantity <= 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই।",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      addToCart({
        id: product.id,
        name: product.name_bn,
        price: product.price,
        image: product.image_url || "/placeholder.svg?height=200&width=200",
        quantity: 1,
      })

      toast({
        title: "কার্টে যোগ করা হয়েছে",
        description: `${product.name_bn} কার্টে যোগ করা হয়েছে।`,
      })
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "কার্টে যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <CardContent className="p-0">
          <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-lg">
            <Image
              src={product.image_url || "/placeholder.svg?height=200&width=300"}
              alt={product.name_bn}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Discount badge */}
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
                {discountPercentage}% ছাড়
              </Badge>
            )}

            {/* Stock status */}
            {product.stock_quantity <= 0 && (
              <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground text-xs">স্টক নেই</Badge>
            )}

            {/* Wishlist button - hidden on mobile for better UX */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background hidden sm:flex h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Add to wishlist logic here
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3 sm:p-4">
            {product.categories && (
              <Badge variant="secondary" className="mb-2 text-xs">
                {product.categories.name_bn}
              </Badge>
            )}

            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
              {product.name_bn}
            </h3>

            {product.description_bn && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{product.description_bn}</p>
            )}

            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-base sm:text-lg font-bold text-primary">৳{product.price.toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  ৳{product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground mb-2 sm:mb-3">
              স্টক: {product.stock_quantity > 0 ? `${product.stock_quantity} টি` : "নেই"}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0 || isAddingToCart}
            className="w-full h-9 sm:h-8 text-sm"
            size="sm"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                যোগ করা হচ্ছে...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock_quantity <= 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
