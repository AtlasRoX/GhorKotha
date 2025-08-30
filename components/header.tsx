"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const { state } = useCart()
  const itemCount = state?.itemCount || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg sm:text-xl">ঘ</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">ঘরকথা</span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Cart */}
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-9 sm:w-9">
                <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </CartSheet>

            {/* Theme toggle */}
            <div className="ml-1">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
