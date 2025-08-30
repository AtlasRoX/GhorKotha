import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminLoginForm } from "@/components/admin-login-form"

export default async function AdminLoginPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-3xl">ঘ</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Supabase সংযোগ করুন</h1>
          <p className="text-muted-foreground">অ্যাডমিন প্যানেল ব্যবহার করতে প্রথমে Supabase কনফিগার করুন</p>
        </div>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, check if they're admin and redirect
  if (session) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", session.user.id)
      .eq("is_active", true)
      .single()

    if (adminUser) {
      redirect("/admin")
    }
  }

  return <AdminLoginForm />
}
