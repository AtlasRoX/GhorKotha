import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  name_bn: string
  description_bn?: string
  image_url?: string
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">আমাদের ক্যাটেগরি</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            বিভিন্ন ধরনের ঘরোয়া পণ্যের বিস্তৃত সংগ্রহ থেকে আপনার পছন্দের জিনিস খুঁজে নিন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="relative h-32 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20">
                    <Image
                      src={category.image_url || "/placeholder.svg?height=128&width=200"}
                      alt={category.name_bn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name_bn}
                  </h3>
                  {category.description_bn && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{category.description_bn}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
