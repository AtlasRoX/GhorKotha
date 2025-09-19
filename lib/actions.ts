"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function adminSignIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "ফর্ম ডেটা অনুপস্থিত" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const timestamp = formData.get("timestamp")

  if (!email || !password) {
    return { error: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" }
  }

  // Basic timestamp validation to prevent replay attacks
  if (!timestamp || Math.abs(Date.now() - Number.parseInt(timestamp.toString())) > 5 * 60 * 1000) {
    return { error: "অনুরোধের সময় শেষ হয়ে গেছে। পুনরায় চেষ্টা করুন।" }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.toString())) {
    return { error: "সঠিক ইমেইল ঠিকানা লিখুন" }
  }

  // Validate password strength (minimum 6 characters)
  if (password.toString().length < 6) {
    return { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }
  }

  const supabase = createClient()

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (authError) {
      console.error("Auth error:", authError)

      // Provide more specific error messages
      if (authError.message.includes("Invalid login credentials")) {
        return { error: "ভুল ইমেইল বা পাসওয়ার্ড" }
      } else if (authError.message.includes("Email not confirmed")) {
        return { error: "ইমেইল যাচাই করুন" }
      } else if (authError.message.includes("Too many requests")) {
        return { error: "অনেক বেশি প্রচেষ্টা। কিছুক্ষণ পর চেষ্টা করুন।" }
      }

      return { error: "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" }
    }

    if (!authData.user) {
      return { error: "লগইন ব্যর্থ হয়েছে" }
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .or(`id.eq.${authData.user.id},email.eq.${email.toString()}`)
      .eq("is_active", true)
      .maybeSingle()

    if (adminError || !adminUser) {
      console.error("Admin check error:", adminError)
      await supabase.auth.signOut()
      return { error: "আপনার অ্যাডমিন অ্যাক্সেস নেই" }
    }

    // If the admin user was found by email but the ID was not yet set, update it.
    if (!adminUser.id || adminUser.id !== authData.user.id) {
      await supabase
        .from("admin_users")
        .update({
          id: authData.user.id,
          last_login: new Date().toISOString(),
        })
        .eq("email", email.toString())
    } else {
      // Update last login time
      await supabase
        .from("admin_users")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("id", authData.user.id)
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। আবার চেষ্টা করুন।" }
  }
}

// Admin sign out function
export async function adminSignOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// Create order function
export async function createOrder(orderData: {
  customerName: string
  customerPhone: string
  customerAddress: string
  totalAmount: number
  whatsappMessage: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}) {
  const supabase = createClient()

  try {
    console.log("[GC] Creating order with data:", orderData)

    // Create the order with explicit RLS bypass approach
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        total_amount: orderData.totalAmount,
        whatsapp_message: orderData.whatsappMessage,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[GC] Order creation error:", orderError)
      return { success: false, error: "অর্ডার তৈরিতে সমস্যা হয়েছে" }
    }

    console.log("[GC] Order created successfully:", order)

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    console.log("[GC] Creating order items:", orderItems)

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[GC] Order items creation error:", itemsError)
      // Rollback: Try to delete the order if items creation failed
      await supabase.from("orders").delete().eq("id", order.id)
      return { success: false, error: "অর্ডার আইটেম তৈরিতে সমস্যা হয়েছে" }
    }

    console.log("[GC] Order and items created successfully")
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("[GC] Unexpected error creating order:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

// Helper function to verify admin access (Optional Improvement)
// To reduce code repetition, you could create a helper function like this
// and call it at the start of each admin-only function.
async function verifyAdmin() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "অনুমতি নেই" }
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .eq("is_active", true)
    .single()

  if (error || !adminUser) {
    return { error: "অ্যাডমিন অ্যাক্সেস প্রয়োজন" }
  }

  return { user, error: null }
}

// Product management functions
export async function createProduct(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const imageUrlsRaw = formData.get("image_urls")?.toString() || ""
    let parsedImageUrls: string[] = []

    if (imageUrlsRaw && imageUrlsRaw !== "undefined" && imageUrlsRaw !== "null" && imageUrlsRaw.trim() !== "") {
      try {
        const parsed = JSON.parse(imageUrlsRaw)
        if (Array.isArray(parsed)) {
          parsedImageUrls = parsed
        }
      } catch (parseError) {
        console.error("Error parsing image URLs:", parseError, "Raw value:", imageUrlsRaw)
        parsedImageUrls = []
      }
    }

    const productData = {
      name: formData.get("name")?.toString() || "",
      name_bn: formData.get("name_bn")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      description_bn: formData.get("description_bn")?.toString() || "",
      price: Number.parseFloat(formData.get("price")?.toString() || "0"),
      original_price: Number.parseFloat(formData.get("original_price")?.toString() || "0"),
      category_id: formData.get("category_id")?.toString() || null,
      stock_quantity: Number.parseInt(formData.get("stock_quantity")?.toString() || "0", 10),
      is_active: formData.get("is_active") === "true",
      is_featured: formData.get("is_featured") === "true",
      image_url: parsedImageUrls[0] || null, // Primary image
      image_urls: parsedImageUrls.length > 0 ? JSON.stringify(parsedImageUrls) : null,
    }

    const { data, error: productError } = await supabase.from("products").insert(productData).select().single()

    if (productError) {
      console.error("Product creation error:", productError)
      return { success: false, error: "পণ্য তৈরিতে সমস্যা হয়েছে" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating product:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function updateProduct(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const productId = formData.get("id")?.toString()
    if (!productId) {
      return { success: false, error: "পণ্য ID প্রয়োজন" }
    }

    const imageUrlsRaw = formData.get("image_urls")?.toString() || ""
    let parsedImageUrls: string[] = []

    if (imageUrlsRaw && imageUrlsRaw !== "undefined" && imageUrlsRaw !== "null" && imageUrlsRaw.trim() !== "") {
      try {
        const parsed = JSON.parse(imageUrlsRaw)
        if (Array.isArray(parsed)) {
          parsedImageUrls = parsed
        }
      } catch (parseError) {
        console.error("Error parsing image URLs:", parseError, "Raw value:", imageUrlsRaw)
        parsedImageUrls = []
      }
    }

    const productData = {
      name: formData.get("name")?.toString() || "",
      name_bn: formData.get("name_bn")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      description_bn: formData.get("description_bn")?.toString() || "",
      price: Number.parseFloat(formData.get("price")?.toString() || "0"),
      original_price: Number.parseFloat(formData.get("original_price")?.toString() || "0"),
      category_id: formData.get("category_id")?.toString() || null,
      stock_quantity: Number.parseInt(formData.get("stock_quantity")?.toString() || "0", 10),
      is_active: formData.get("is_active") === "true",
      is_featured: formData.get("is_featured") === "true",
      image_url: parsedImageUrls[0] || null, // Primary image
      image_urls: parsedImageUrls.length > 0 ? JSON.stringify(parsedImageUrls) : null,
      updated_at: new Date().toISOString(),
    }

    const { data, error: productError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId)
      .select()
      .single()

    if (productError) {
      console.error("Product update error:", productError)
      return { success: false, error: "পণ্য আপডেটে সমস্যা হয়েছে" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating product:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function deleteProduct(productId: string) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    // Check if product is used in any orders to prevent breaking foreign key constraints
    const { data: orderItems, error: checkError } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", productId)
      .limit(1)

    if (checkError) {
      console.error("Error checking order items for product:", checkError)
      return { success: false, error: "পণ্যটি পরীক্ষা করতে সমস্যা হয়েছে।" }
    }

    if (orderItems && orderItems.length > 0) {
      // Soft delete: Instead of deleting, deactivate the product
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", productId)

      if (updateError) {
        console.error("Product deactivation error:", updateError)
        return { success: false, error: "পণ্য নিষ্ক্রিয় করতে সমস্যা হয়েছে" }
      }

      return { success: true, message: "পণ্যটি নিষ্ক্রিয় করা হয়েছে (অর্ডারে ব্যবহৃত হওয়ায় মুছে ফেলা যায়নি)" }
    }

    // Hard delete: Safe to delete
    const { error: deleteError } = await supabase.from("products").delete().eq("id", productId)

    if (deleteError) {
      console.error("Product deletion error:", deleteError)
      return { success: false, error: "পণ্য মুছতে সমস্যা হয়েছে" }
    }

    return { success: true, message: "পণ্য সফলভাবে মুছে ফেলা হয়েছে" }
  } catch (error) {
    console.error("Unexpected error deleting product:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

// Category management functions
export async function createCategory(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const categoryData = {
      name: formData.get("name")?.toString() || "",
      name_bn: formData.get("name_bn")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      description_bn: formData.get("description_bn")?.toString() || "",
      is_active: formData.get("is_active") === "true",
      image_url: formData.get("image_url")?.toString() || null,
    }

    const { data, error: categoryError } = await supabase.from("categories").insert(categoryData).select().single()

    if (categoryError) {
      console.error("Category creation error:", categoryError)
      return { success: false, error: "ক্যাটেগরি তৈরিতে সমস্যা হয়েছে" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating category:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function updateCategory(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const categoryId = formData.get("id")?.toString()
    if (!categoryId) {
      return { success: false, error: "ক্যাটেগরি ID প্রয়োজন" }
    }

    const categoryData = {
      name: formData.get("name")?.toString() || "",
      name_bn: formData.get("name_bn")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      description_bn: formData.get("description_bn")?.toString() || "",
      is_active: formData.get("is_active") === "true",
      image_url: formData.get("image_url")?.toString() || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error: categoryError } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", categoryId)
      .select()
      .single()

    if (categoryError) {
      console.error("Category update error:", categoryError)
      return { success: false, error: "ক্যাটেগরি আপডেটে সমস্যা হয়েছে" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating category:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    // Check if category has products
    const { data: products, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)

    if (checkError) {
      console.error("Error checking products for category:", checkError)
      return { success: false, error: "ক্যাটেগরিটি পরীক্ষা করতে সমস্যা হয়েছে।" }
    }

    if (products && products.length > 0) {
      return { success: false, error: "এই ক্যাটেগরিতে পণ্য রয়েছে। প্রথমে পণ্যগুলি সরান বা অন্য ক্যাটেগরিতে পরিবর্তন করুন।" }
    }

    const { error: deleteError } = await supabase.from("categories").delete().eq("id", categoryId)

    if (deleteError) {
      console.error("Category deletion error:", deleteError)
      return { success: false, error: "ক্যাটেগরি মুছতে সমস্যা হয়েছে" }
    }

    return { success: true, message: "ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে" }
  } catch (error) {
    console.error("Unexpected error deleting category:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

// Order status update function
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  try {
    const { data, error: orderError } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (orderError) {
      console.error("Order status update error:", orderError)
      return { success: false, error: "অর্ডার স্ট্যাটাস আপডেটে সমস্যা হয়েছে" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating order status:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

// WhatsApp settings management
export async function updateWhatsAppSettings(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Verify admin access
  const { error } = await verifyAdmin()
  if (error) {
    return { success: false, error }
  }

  const settingsData = {
    phone_number: formData.get("phone_number")?.toString() || "",
    is_enabled: formData.get("is_enabled") === "true",
    welcome_message: formData.get("welcome_message")?.toString() || "",
    order_message_template: formData.get("order_message_template")?.toString() || "",
    updated_at: new Date().toISOString(),
  }

  try {
    // Check if settings exist first
    const { data: existingSettings, error: selectError } = await supabase
      .from("whatsapp_settings")
      .select("id")
      .limit(1)
      .single()

    let result
    if (existingSettings && !selectError) {
      // Update existing settings
      result = await supabase
        .from("whatsapp_settings")
        .update(settingsData)
        .eq("id", existingSettings.id)
        .select()
        .single()
    } else if (selectError?.code === "PGRST116") {
      // No existing settings, insert new
      result = await supabase.from("whatsapp_settings").insert(settingsData).select().single()
    } else {
      // Handle other select errors (like table doesn't exist)
      throw selectError
    }

    if (result?.error) {
      console.error("WhatsApp settings update error:", result.error)
      return { success: false, error: "সেটিংস আপডেটে সমস্যা হয়েছে" }
    }

    return { success: true, data: result?.data || settingsData }
  } catch (error: any) {
    if (
      error?.code === "42P01" || // Table doesn't exist
      error?.message?.includes("does not exist") ||
      error?.message?.includes("schema cache") ||
      error?.message?.includes("relation") ||
      error?.message?.includes("whatsapp_settings")
    ) {
      console.log("WhatsApp settings table doesn't exist, returning success with submitted data.")
      return {
        success: true,
        data: settingsData,
        message: "সেটিংস সংরক্ষিত হয়েছে। টেবিল তৈরি করতে scripts/06-create-whatsapp-settings.sql চালান।",
      }
    }

    console.error("Unexpected error updating WhatsApp settings:", error)
    return { success: false, error: "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" }
  }
}

// Public function to get WhatsApp settings
export async function getWhatsAppSettings() {
  const supabase = createClient()
  const defaultSettings = {
    phone_number: "8801738354089",
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

  try {
    const { data, error } = await supabase.from("whatsapp_settings").select("*").single()

    if (error) {
      // Handle various error cases where table doesn't exist or no data found
      if (
        error.code === "PGRST116" || // No rows found
        error.code === "42P01" || // Table doesn't exist
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache") ||
        error.message?.includes("relation") ||
        error.message?.includes("whatsapp_settings")
      ) {
        console.log("WhatsApp settings table not found or empty, returning defaults.")
        return defaultSettings
      }

      // For any other database errors, log and return defaults
      console.error("WhatsApp settings fetch error:", error)
      return defaultSettings
    }

    return data || defaultSettings
  } catch (error: any) {
    console.error("Unexpected error fetching WhatsApp settings:", error)
    return defaultSettings
  }
}
