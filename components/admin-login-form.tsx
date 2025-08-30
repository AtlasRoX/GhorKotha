"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { adminSignIn } from "@/lib/actions"
import { HelpPopup } from "@/components/help-popup"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          লগইন করা হচ্ছে...
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          নিরাপদ লগইন
        </>
      )}
    </Button>
  )
}

export function AdminLoginForm() {
  const router = useRouter()
  const [state, setState] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTimeLeft, setBlockTimeLeft] = useState(0)

  useEffect(() => {
    // Check for existing login attempts in localStorage
    const attempts = localStorage.getItem("loginAttempts")
    const lastAttempt = localStorage.getItem("lastLoginAttempt")

    if (attempts && lastAttempt) {
      const attemptsCount = Number.parseInt(attempts)
      const lastAttemptTime = Number.parseInt(lastAttempt)
      const timeDiff = Date.now() - lastAttemptTime

      // Block for 15 minutes after 5 failed attempts
      if (attemptsCount >= 5 && timeDiff < 15 * 60 * 1000) {
        setIsBlocked(true)
        setLoginAttempts(attemptsCount)
        setBlockTimeLeft(Math.ceil((15 * 60 * 1000 - timeDiff) / 1000))

        const timer = setInterval(() => {
          setBlockTimeLeft((prev) => {
            if (prev <= 1) {
              setIsBlocked(false)
              setLoginAttempts(0)
              localStorage.removeItem("loginAttempts")
              localStorage.removeItem("lastLoginAttempt")
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } else if (timeDiff >= 15 * 60 * 1000) {
        // Reset after 15 minutes
        localStorage.removeItem("loginAttempts")
        localStorage.removeItem("lastLoginAttempt")
        setLoginAttempts(0)
      } else {
        setLoginAttempts(attemptsCount)
      }
    }
  }, [])

  useEffect(() => {
    if (state?.success) {
      // Clear login attempts on successful login
      localStorage.removeItem("loginAttempts")
      localStorage.removeItem("lastLoginAttempt")

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberAdmin", "true")
      }

      router.replace("/admin")
    } else if (state?.error) {
      // Increment login attempts on failure
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      localStorage.setItem("loginAttempts", newAttempts.toString())
      localStorage.setItem("lastLoginAttempt", Date.now().toString())

      if (newAttempts >= 5) {
        setIsBlocked(true)
        setBlockTimeLeft(15 * 60) // 15 minutes in seconds
      }
    }
  }, [state, router, rememberMe, loginAttempts])

  const handleSubmit = async (formData: FormData) => {
    if (isBlocked) return

    // Add CSRF-like protection by adding timestamp
    formData.append("timestamp", Date.now().toString())

    const result = await adminSignIn(null, formData)
    setState(result)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-3xl">ঘ</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ঘরকথা অ্যাডমিন</h1>
          <p className="text-muted-foreground">নিরাপদ অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-card-foreground">লগইন করুন</CardTitle>
            {loginAttempts > 0 && !isBlocked && (
              <div className="flex items-center justify-center gap-2 text-sm text-accent">
                <AlertCircle className="h-4 w-4" />
                <span>ব্যর্থ প্রচেষ্টা: {loginAttempts}/5</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {isBlocked && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm text-center">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                নিরাপত্তার জন্য অ্যাকাউন্ট সাময়িকভাবে ব্লক করা হয়েছে
                <br />
                <span className="font-mono font-bold">{formatTime(blockTimeLeft)}</span> পরে আবার চেষ্টা করুন
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              {state?.error && !isBlocked && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              {state?.success && (
                <div className="bg-secondary/10 border border-secondary/50 text-secondary px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>সফলভাবে লগইন হয়েছে...</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                  ইমেইল ঠিকানা
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  required
                  disabled={isBlocked}
                  className="h-12 text-base bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    required
                    disabled={isBlocked}
                    className="h-12 text-base bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isBlocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isBlocked}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  আমাকে মনে রাখুন (৩০ দিন)
                </Label>
              </div>

              <SubmitButton />
            </form>

            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>🔒 এই সাইট SSL এনক্রিপশন দ্বারা সুরক্ষিত</p>
              <p>৫টি ব্যর্থ প্রচেষ্টার পর অ্যাকাউন্ট ১৫ মিনিটের জন্য ব্লক হবে</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            সমস্যা হচ্ছে?
            <HelpPopup />
          </p>
        </div>
      </div>
    </div>
  )
}
