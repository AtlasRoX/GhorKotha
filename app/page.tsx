import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button"

export default async function HomePage() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        name_bn
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").eq("is_active", true)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <ProductGrid products={products || []} categories={categories || []} />
      </main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  )
}
