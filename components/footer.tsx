export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">ঘ</span>
            </div>
            <span className="text-xl font-bold">ঘরকথা</span>
          </div>
          <p className="text-center text-muted-foreground">&copy; ২০২৫ ঘরকথা। সকল অধিকার সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  )
}
