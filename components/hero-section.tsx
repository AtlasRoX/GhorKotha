import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/10 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                আপনার ঘরের জন্য
                <span className="text-primary block">সব কিছু</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                মানসম্পন্ন ঘরোয়া পণ্য, সাশ্রয়ী দামে। আপনার ঘরকে করে তুলুন আরও সুন্দর ও আরামদায়ক।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/products">কেনাকাটা শুরু করুন</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
                <Link href="/categories">ক্যাটেগরি দেখুন</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">১০০+</div>
                <div className="text-sm text-muted-foreground">পণ্যের সংগ্রহ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">২৪/৭</div>
                <div className="text-sm text-muted-foreground">কাস্টমার সেবা</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">ফ্রি</div>
                <div className="text-sm text-muted-foreground">হোম ডেলিভারি</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="ঘরোয়া পণ্যের সংগ্রহ"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-card border rounded-lg p-4 shadow-lg">
              <div className="text-sm font-medium">৫০% ছাড়</div>
              <div className="text-xs text-muted-foreground">নির্বাচিত পণ্যে</div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-card border rounded-lg p-4 shadow-lg">
              <div className="text-sm font-medium">দ্রুত ডেলিভারি</div>
              <div className="text-xs text-muted-foreground">২৪ ঘন্টার মধ্যে</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
