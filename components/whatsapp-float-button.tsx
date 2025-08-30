"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppFloatButton() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("আসসালামু আলাইকুম! আমি ঘরকথা থেকে পণ্য সম্পর্কে জানতে চাই।")
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || "8801738354089"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">WhatsApp এ যোগাযোগ করুন</span>
    </Button>
  )
}
