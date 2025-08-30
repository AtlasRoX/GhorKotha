import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProductDetail from "@/components/product-detail"

interface Product {
  id: string
  name: string
  name_bn: string
  description?: string
  description_bn?: string
  price: number
  original_price?: number
  image_url?: string
  image_urls?: string[]
  stock_quantity: number
  category_id: string
  is_active: boolean
  is_featured: boolean
  categories?: {
    id: string
    name: string
    name_bn: string
  }
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        name_bn
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !product) {
    return null
  }

  return product
}

async function getRelatedProducts(categoryId: string, currentProductId: string): Promise<Product[]> {
  const supabase = createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        name_bn
      )
    `)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", currentProductId)
    .limit(4)

  if (error) {
    return []
  }

  return products || []
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id)

  return (
    <div className="min-h-screen bg-background">
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: "Product Not Found - ঘরকথা",
    }
  }

  return {
    title: `${product.name_bn || product.name} - ঘরকথা`,
    description:
      product.description_bn || product.description || `${product.name_bn || product.name} এর বিস্তারিত তথ্য এবং অর্ডার করুন`,
  }
}
