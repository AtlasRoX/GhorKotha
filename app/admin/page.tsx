import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getWhatsAppSettings } from "@/lib/actions"
import { getAllThemes } from "@/lib/theme-actions"

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/admin/login")
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .eq("is_active", true)
    .maybeSingle()

  if (adminError || !adminUser) {
    console.error("Admin check failed:", adminError)
    redirect("/admin/login")
  }

  const [ordersResult, productsResult, categoriesResult, themes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("products").select("*, categories(name_bn)").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("created_at", { ascending: false }),
    getAllThemes(),
  ])

  let whatsappSettings
  try {
    whatsappSettings = await getWhatsAppSettings()
    // Ensure the settings object is serializable
    if (typeof whatsappSettings !== "object" || whatsappSettings === null) {
      throw new Error("Invalid settings format")
    }
  } catch (error) {
    console.error("WhatsApp settings fetch error:", error)
    // Provide fallback default settings
    whatsappSettings = {
      phone_number: "8801902637437",
      is_enabled: true,
      welcome_message: "আসসালামু আলাইকুম! আমি ঘরকথা থেকে পণ্য সম্পর্কে জানতে চাই।",
      order_message_template: `🛒 *নতুন অর্ডার - ঘরকথা*

👤 *গ্রাহকের তথ্য:*
নাম: {customer_name}
ফোন: {customer_phone}
ঠিকানা: {customer_address}

📦 *অর্ডারের বিবরণ:*
{order_details}

💰 *মোট: ৳{total_amount}*

{notes}

ধন্যবাদ! 🙏`,
    }
  }

  return (
    <AdminDashboard
      adminUser={adminUser}
      orders={ordersResult.data || []}
      products={productsResult.data || []}
      categories={categoriesResult.data || []}
      whatsappSettings={whatsappSettings}
      themes={themes}
    />
  )
}
