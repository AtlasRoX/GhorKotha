import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">৪০৪</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">ক্যাটেগরি পাওয়া যায়নি</h2>
        <p className="text-muted-foreground mb-6">আপনি যে ক্যাটেগরিটি খুঁজছেন সেটি বিদ্যমান নেই বা সরানো হয়েছে।</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/categories">সব ক্যাটেগরি</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">হোমে ফিরুন</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
