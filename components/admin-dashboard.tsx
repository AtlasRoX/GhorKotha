"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "@/components/admin-header"
import { ProductManagement } from "@/components/product-management"
import { CategoryManagement } from "@/components/category-management"
import { WhatsAppSettings } from "@/components/whatsapp-settings"
import { ThemeManagement } from "@/components/theme-management"
import { Package, FolderOpen, MessageCircle } from "lucide-react"

interface AdminDashboardProps {
  adminUser: any
  products: any[]
  categories: any[]
  whatsappSettings: any
  themes: any[]
}

export function AdminDashboard({ adminUser, products, categories, whatsappSettings, themes }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const totalProducts = products.length
  const activeProducts = products.filter((product) => product.is_active).length
  const totalCategories = categories.length

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader adminUser={adminUser} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">ঘরকথা অ্যাডমিন প্যানেলে স্বাগতম</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">সারাংশ</TabsTrigger>
            <TabsTrigger value="products">পণ্য</TabsTrigger>
            <TabsTrigger value="categories">ক্যাটেগরি</TabsTrigger>
            <TabsTrigger value="settings">সেটিংস</TabsTrigger>
            <TabsTrigger value="theme">থিম</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{activeProducts} টি সক্রিয়</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ক্যাটেগরি</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCategories}</div>
                  <p className="text-xs text-muted-foreground">সব ক্যাটেগরি</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">WhatsApp অর্ডার</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">সক্রিয়</div>
                  <p className="text-xs text-muted-foreground">সরাসরি WhatsApp এ</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>দ্রুত অ্যাকশন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">পণ্য ব্যবস্থাপনা</h3>
                    <p className="text-sm text-muted-foreground mb-3">নতুন পণ্য যোগ করুন বা বিদ্যমান পণ্য সম্পাদনা করুন</p>
                    <button onClick={() => setActiveTab("products")} className="text-sm text-primary hover:underline">
                      পণ্য পরিচালনা করুন →
                    </button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">ক্যাটেগরি ব্যবস্থাপনা</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      নতুন ক্যাটেগরি তৈরি করুন বা বিদ্যমান ক্যাটেগরি সম্পাদনা করুন
                    </p>
                    <button onClick={() => setActiveTab("categories")} className="text-sm text-primary hover:underline">
                      ক্যাটেগরি পরিচালনা করুন →
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement products={products} categories={categories} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement categories={categories} />
          </TabsContent>

          <TabsContent value="settings">
            <WhatsAppSettings settings={whatsappSettings} />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeManagement themes={themes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
