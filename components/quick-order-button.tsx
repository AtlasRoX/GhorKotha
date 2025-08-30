"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { CheckoutModal } from "@/components/checkout-modal"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  name_bn: string
  price: number
  image_url?: string
}

interface QuickOrderButtonProps {
  product: Product
}

export function QuickOrderButton({ product }: QuickOrderButtonProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { addToCart, state } = useCart()

  const handleQuickOrder = () => {
    // Add product to cart if not already there
    const existingItem = state.items.find((item) => item.id === product.id)

    if (!existingItem) {
      addToCart({
        id: product.id,
        name: product.name_bn,
        price: product.price,
        image: product.image_url || "/placeholder.svg?height=200&width=200",
        quantity: 1,
      })
    }

    // Open checkout modal
    setIsCheckoutOpen(true)
  }

  return (
    <>
      <Button onClick={handleQuickOrder} variant="outline" className="w-full bg-transparent" size="sm">
        <MessageCircle className="h-4 w-4 mr-2" />
        দ্রুত অর্ডার
      </Button>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
