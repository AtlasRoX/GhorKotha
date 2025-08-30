"use client"

import type React from "react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CheckoutModal } from "@/components/checkout-modal"
import Image from "next/image"
import { useState } from "react"

interface CartSheetProps {
  children: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const cartItems = state?.items || []
  const cartTotal = state?.total || 0

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setIsOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-right text-lg sm:text-xl">আপনার কার্ট ({cartItems.length} টি পণ্য)</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">আপনার কার্ট খালি</p>
                  <Button onClick={() => setIsOpen(false)} className="h-11 px-6">
                    কেনাকাটা শুরু করুন
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto py-2 sm:py-4 -mx-2 px-2">
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg"
                      >
                        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-primary font-semibold">৳{item.price.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <Badge variant="secondary" className="min-w-[2rem] justify-center text-sm">
                            {item.quantity}
                          </Badge>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive ml-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart Footer */}
                <div className="border-t pt-4 space-y-4 mt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>মোট:</span>
                    <span className="text-primary">৳{cartTotal.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button
                      onClick={handleCheckout}
                      className="w-full h-12 text-base"
                      size="lg"
                      disabled={cartItems.length === 0}
                    >
                      অর্ডার করুন
                    </Button>
                    <Button variant="outline" onClick={clearCart} className="w-full bg-transparent h-10" size="sm">
                      কার্ট খালি করুন
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </>
  )
}
