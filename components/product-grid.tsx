"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/product-card"

interface Product {
  id: string
  name: string
  name_bn: string
  description?: string
  description_bn?: string
  price: number
  image_url?: string
  stock_quantity: number
  category_id: string
  categories?: {
    id: string
    name: string
    name_bn: string
  }
}

interface Category {
  id: string
  name: string
  name_bn: string
}

interface ProductGridProps {
  products: Product[]
  categories: Category[]
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description_bn && product.description_bn.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 sm:h-10 text-base sm:text-sm">
            <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name_bn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* No products found */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground text-base sm:text-lg">কোন পণ্য পাওয়া যায়নি</p>
          <p className="text-sm text-muted-foreground mt-2">অন্য কিছু খুঁজে দেখুন</p>
        </div>
      )}
    </div>
  )
}
