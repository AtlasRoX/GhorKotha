"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MessageCircle, Save, TestTube, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateWhatsAppSettings } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface WhatsAppSettingsProps {
  settings: {
    phone_number: string
    is_enabled: boolean
    welcome_message: string
    order_message_template: string
  }
}

export function WhatsAppSettings({ settings }: WhatsAppSettingsProps) {
  const router = useRouter()
  const [updateState, setUpdateState] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const [formData, setFormData] = useState({
    phone_number: settings.phone_number || "",
    is_enabled: settings.is_enabled || true,
    welcome_message: settings.welcome_message || "আসসালামু আলাইকুম! আমি ঘরকথা থেকে পণ্য সম্পর্কে জানতে চাই।",
    order_message_template:
      settings.order_message_template ||
      `🛒 *নতুন অর্ডার - ঘরকথা*

👤 *গ্রাহকের তথ্য:*
নাম: {customer_name}
ফোন: {customer_phone}
ঠিকানা: {customer_address}

📦 *অর্ডারের বিবরণ:*
{order_details}

💰 *মোট: ৳{total_amount} + Delivary Charge*

{notes}

ধন্যবাদ! 🙏`,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (formDataObj: FormData) => {
    // Clear the FormData and rebuild it with current state
    formDataObj.delete("phone_number")
    formDataObj.delete("is_enabled")
    formDataObj.delete("welcome_message")
    formDataObj.delete("order_message_template")

    // Append current form state to FormData
    formDataObj.append("phone_number", formData.phone_number)
    formDataObj.append("is_enabled", formData.is_enabled.toString())
    formDataObj.append("welcome_message", formData.welcome_message)
    formDataObj.append("order_message_template", formData.order_message_template)

    const result = await updateWhatsAppSettings(null, formDataObj)
    setUpdateState(result)

    if (result?.success) {
      toast({
        title: "সেটিংস আপডেট করা হয়েছে",
        description: "WhatsApp সেটিংস সফলভাবে আপডেট করা হয়েছে।",
      })
      router.refresh()
    } else if (result?.error) {
      toast({
        title: "ত্রুটি",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleTestWhatsApp = async () => {
    if (!formData.phone_number) {
      toast({
        title: "ফোন নম্বর প্রয়োজন",
        description: "টেস্ট করার জন্য প্রথমে ফোন নম্বর দিন।",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)

    try {
      const testMessage = encodeURIComponent("🧪 টেস্ট মেসেজ - ঘরকথা অ্যাডমিন প্যানেল থেকে পাঠানো হয়েছে।")
      const whatsappUrl = `https://wa.me/${formData.phone_number.replace(/[^0-9]/g, "")}?text=${testMessage}`

      window.open(whatsappUrl, "_blank")

      toast({
        title: "টেস্ট মেসেজ পাঠানো হয়েছে",
        description: "WhatsApp এ টেস্ট মেসেজ পাঠানো হয়েছে।",
      })
    } catch (error) {
      toast({
        title: "টেস্ট ব্যর্থ",
        description: "টেস্ট মেসেজ পাঠাতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp সেটিংস
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formDataObj = new FormData(e.target as HTMLFormElement)
              handleSubmit(formDataObj)
            }}
            className="space-y-6"
          >
            {/* Enable/Disable WhatsApp */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_enabled" className="text-base font-medium">
                  WhatsApp ইন্টিগ্রেশন
                </Label>
                <p className="text-sm text-muted-foreground">WhatsApp ফ্লোট বাটন এবং অর্ডার মেসেজিং চালু/বন্ধ করুন</p>
              </div>
              <Switch
                id="is_enabled"
                name="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => handleSwitchChange("is_enabled", checked)}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">WhatsApp ফোন নম্বর *</Label>
              <div className="flex gap-2">
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="8801902637437 (দেশের কোড সহ)"
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWhatsApp}
                  disabled={isTesting || !formData.phone_number}
                >
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">উদাহরণ: 8801902637437 (বাংলাদেশের জন্য 880 দিয়ে শুরু করুন)</p>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <Label htmlFor="welcome_message">স্বাগত বার্তা</Label>
              <Textarea
                id="welcome_message"
                name="welcome_message"
                value={formData.welcome_message}
                onChange={handleInputChange}
                rows={3}
                placeholder="ফ্লোট বাটনে ক্লিক করলে যে বার্তা পাঠানো হবে"
              />
              <p className="text-xs text-muted-foreground">এই বার্তাটি ফ্লোট বাটনে ক্লিক করলে প্রি-ফিল হয়ে যাবে</p>
            </div>

            {/* Order Message Template */}
            <div className="space-y-2">
              <Label htmlFor="order_message_template">অর্ডার মেসেজ টেমপ্লেট</Label>
              <Textarea
                id="order_message_template"
                name="order_message_template"
                value={formData.order_message_template}
                onChange={handleInputChange}
                rows={12}
                placeholder="অর্ডার করার সময় যে বার্তা পাঠানো হবে"
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>ব্যবহারযোগ্য ভেরিয়েবল:</strong>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>• {"{customer_name}"} - গ্রাহকের নাম</span>
                  <span>• {"{customer_phone}"} - ফোন নম্বর</span>
                  <span>• {"{customer_address}"} - ঠিকানা</span>
                  <span>• {"{order_details}"} - অর্ডারের বিবরণ</span>
                  <span>• {"{total_amount}"} - মোট টাকা</span>
                  <span>• {"{notes}"} - বিশেষ নির্দেশনা</span>
                </div>
              </div>
            </div>

            {/* Current Settings Preview */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">বর্তমান সেটিংস:</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>স্ট্যাটাস:</strong> {formData.is_enabled ? "চালু" : "বন্ধ"}
                </p>
                <p>
                  <strong>ফোন:</strong> {formData.phone_number || "সেট করা হয়নি"}
                </p>
                <p>
                  <strong>স্বাগত বার্তা:</strong> {formData.welcome_message.substring(0, 50)}...
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                সেটিংস সেভ করুন
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">সাহায্য ও নির্দেশনা</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">ফোন নম্বর ফরম্যাট:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• বাংলাদেশ: 8801902637437</li>
              <li>• ভারত: 919876543210</li>
              <li>• পাকিস্তান: 923001234567</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">টিপস:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• ফোন নম্বরে দেশের কোড অবশ্যই দিতে হবে</li>
              <li>• টেস্ট বাটন দিয়ে নম্বর যাচাই করুন</li>
              <li>• মেসেজ টেমপ্লেটে ইমোজি ব্যবহার করতে পারেন</li>
              <li>• সেটিংস পরিবর্তনের পর সাইট রিফ্রেশ করুন</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
