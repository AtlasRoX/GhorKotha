"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"
import { Loader2, MessageCircle } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state, clearCart } = useCart()
  const { items = [], total = 0 } = state || {}
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateWhatsAppMessage = () => {
    const orderDetails = items
      .map(
        (item) =>
          `• ${item.name} - ${item.quantity} টি × ৳${item.price} = ৳${(item.price * item.quantity).toLocaleString()}`,
      )
      .join("\n")

    const message = `🛒 *নতুন অর্ডার - ঘরকথা*

👤 *গ্রাহকের তথ্য:*
নাম: ${formData.customerName}
ফোন: ${formData.customerPhone}
ঠিকানা: ${formData.customerAddress}

📦 *অর্ডারের বিবরণ:*
${orderDetails}

💰 *মোট: ৳${total.toLocaleString()}*

${formData.notes ? `📝 *বিশেষ নির্দেশনা:*\n${formData.notes}` : ""}

ধন্যবাদ! 🙏`

    return encodeURIComponent(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "অর্ডার করার জন্য কার্টে পণ্য যোগ করুন।",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const whatsappUrl = `https://wa.me/8801738354089?text=${generateWhatsAppMessage()}`
      window.open(whatsappUrl, "_blank")

      clearCart()
      onClose()

      toast({
        title: "অর্ডার সফল!",
        description: "আপনার অর্ডার WhatsApp এ পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।",
      })

      setFormData({
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        notes: "",
      })
    } catch (error) {
      console.error("WhatsApp redirect error:", error)
      toast({
        title: "সমস্যা হয়েছে",
        description: "WhatsApp খুলতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-lg sm:text-xl">অর্ডার সম্পূর্ণ করুন</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">অর্ডার সারাংশ</h3>
            <div className="space-y-1 text-xs sm:text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-sm sm:text-base">
              <span>মোট:</span>
              <span className="text-primary">৳{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm">
                নাম *
              </Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="আপনার পূর্ণ নাম"
                className="h-11 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-sm">
                ফোন নম্বর *
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="০১৭১২-৩৪৫৬৭৮"
                className="h-11 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="text-sm">
                সম্পূর্ণ ঠিকানা *
              </Label>
              <Textarea
                id="customerAddress"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                placeholder="বাড়ি/ফ্ল্যাট নম্বর, রাস্তা, এলাকা, থানা, জেলা"
                rows={3}
                className="text-base resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm">
                বিশেষ নির্দেশনা (ঐচ্ছিক)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                rows={2}
                className="text-base resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base" size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                অর্ডার প্রক্রিয়াকরণ...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp এ অর্ডার পাঠান
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            অর্ডার করার পর আপনাকে WhatsApp এ রিডাইরেক্ট করা হবে যেখানে আপনার অর্ডারের বিবরণ প্রি-ফিল করা থাকবে।
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
