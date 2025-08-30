import { createClient } from "@/lib/supabase/server"
import { CategoryGrid } from "@/components/category-grid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ক্যাটেগরি - ঘরকথা",
  description: "বিভিন্ন ধরনের ঘরোয়া পণ্যের বিস্তৃত সংগ্রহ থেকে আপনার পছন্দের জিনিস খুঁজে নিন",
}

export default async function CategoriesPage() {
  const supabase = createClient()

  // Fetch all active categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name_bn")

  if (error) {
    console.error("Error fetching categories:", error)
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">ক্যাটেগরি লোড করতে সমস্যা হয়েছে</h1>
          <p className="text-muted-foreground">পরে আবার চেষ্টা করুন</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">সব ক্যাটেগরি</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            আপনার পছন্দের পণ্যের ক্যাটেগরি বেছে নিন এবং কেনাকাটা শুরু করুন
          </p>
        </div>

        {categories && categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground mb-2">কোন ক্যাটেগরি পাওয়া যায়নি</h2>
            <p className="text-muted-foreground">শীঘ্রই নতুন ক্যাটেগরি যোগ করা হবে</p>
          </div>
        )}
      </div>
    </div>
  )
}
