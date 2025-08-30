import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/product-grid"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: category } = await supabase
    .from("categories")
    .select("name_bn, description_bn")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (!category) {
    return {
      title: "ক্যাটেগরি পাওয়া যায়নি - ঘরকথা",
    }
  }

  return {
    title: `${category.name_bn} - ঘরকথা`,
    description: category.description_bn || `${category.name_bn} ক্যাটেগরির সব পণ্য দেখুন`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createClient()

  // Fetch category details
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch products in this category
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        name_bn
      )
    `)
    .eq("category_id", params.id)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  // Fetch all categories for the filter dropdown
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, name_bn")
    .eq("is_active", true)
    .order("name_bn")

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button and breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/categories" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              সব ক্যাটেগরি
            </Link>
          </Button>

          <nav className="text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">
              হোম
            </Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-foreground">
              ক্যাটেগরি
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{category.name_bn}</span>
          </nav>
        </div>

        {/* Category header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{category.name_bn}</h1>
          {category.description_bn && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{category.description_bn}</p>
          )}
        </div>

        {/* Products */}
        {products && products.length > 0 ? (
          <ProductGrid products={products} categories={allCategories || []} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground mb-2">এই ক্যাটেগরিতে কোন পণ্য নেই</h2>
            <p className="text-muted-foreground mb-6">শীঘ্রই নতুন পণ্য যোগ করা হবে</p>
            <Button asChild>
              <Link href="/categories">অন্য ক্যাটেগরি দেখুন</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
