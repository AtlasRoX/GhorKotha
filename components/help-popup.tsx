"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Phone, X, Info } from "lucide-react"

interface HelpPopupProps {
  trigger?: React.ReactNode
}

export function HelpPopup({ trigger }: HelpPopupProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <button className="text-secondary hover:text-secondary/80 ml-1 underline">সাহায্য নিন</button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />📌 Notice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-4">
            <h3 className="font-semibold text-foreground">Contact your system administrator:</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">📧 Email:</p>
                  <a href="mailto:ghostcache799@gmail.com" className="text-primary hover:text-primary/80 font-medium">
                    ghostcache799@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">📞 Phone:</p>
                  <a href="tel:+8801966570914" className="text-primary hover:text-primary/80 font-medium">
                    +8801966570914
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Developed by <span className="font-semibold text-foreground">GhostCache_</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Powered By <span className="font-semibold text-accent">Brigitte Studio</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
