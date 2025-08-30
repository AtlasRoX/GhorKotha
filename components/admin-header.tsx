"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { adminSignOut } from "@/lib/actions"
import { ModeToggle } from "@/components/mode-toggle"

interface AdminHeaderProps {
  adminUser: any
}

export function AdminHeader({ adminUser }: AdminHeaderProps) {
  const handleSignOut = async () => {
    await adminSignOut()
    window.location.href = "/admin/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">ঘ</span>
            </div>
            <span className="text-xl font-bold text-foreground">ঘরকথা অ্যাডমিন</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{adminUser.full_name}</span>
            </div>

            <ModeToggle />

            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
