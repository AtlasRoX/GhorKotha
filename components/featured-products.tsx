import { ProductCard } from "@/components/product-card"

interface Product {
  id: string
  name: string
  name_bn: string
  description_bn?: string
  price: number
  original_price?: number
  image_url?: string
  stock_quantity: number
  categories?: {
    id: string
    name: string
    name_bn: string
  }
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">বিশেষ পণ্য</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">আমাদের সবচেয়ে জনপ্রিয় এবং মানসম্পন্ন পণ্যগুলো দেখুন</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">কোন বিশেষ পণ্য পাওয়া যায়নি।</p>
          </div>
        )}
      </div>
    </section>
  )
}
