"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Phone, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface OrderManagementProps {
  orders: any[]
}

export function OrderManagement({ orders }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => statusFilter === "all" || order.status === statusFilter)

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "পেন্ডিং", variant: "secondary" as const },
      confirmed: { label: "নিশ্চিত", variant: "default" as const },
      processing: { label: "প্রক্রিয়াকরণ", variant: "default" as const },
      shipped: { label: "পাঠানো", variant: "default" as const },
      delivered: { label: "ডেলিভার", variant: "default" as const },
      cancelled: { label: "বাতিল", variant: "destructive" as const },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // This would be implemented with a server action
    toast({
      title: "স্ট্যাটাস আপডেট",
      description: "অর্ডার স্ট্যাটাস আপডেট করা হয়েছে।",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>অর্ডার ম্যানেজমেন্ট</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব অর্ডার</SelectItem>
                <SelectItem value="pending">পেন্ডিং</SelectItem>
                <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                <SelectItem value="processing">প্রক্রিয়াকরণ</SelectItem>
                <SelectItem value="shipped">পাঠানো</SelectItem>
                <SelectItem value="delivered">ডেলিভার</SelectItem>
                <SelectItem value="cancelled">বাতিল</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold">{order.customer_name}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.customer_address.substring(0, 50)}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-lg">৳{Number.parseFloat(order.total_amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          দেখুন
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>অর্ডার বিবরণ</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">গ্রাহকের তথ্য</h4>
                                <p>নাম: {selectedOrder.customer_name}</p>
                                <p>ফোন: {selectedOrder.customer_phone}</p>
                                <p>ঠিকানা: {selectedOrder.customer_address}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">অর্ডার তথ্য</h4>
                                <p>মোট: ৳{Number.parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                                <p>স্ট্যাটাস: {getStatusBadge(selectedOrder.status)}</p>
                                <p>তারিখ: {new Date(selectedOrder.created_at).toLocaleDateString("bn-BD")}</p>
                              </div>
                            </div>

                            {selectedOrder.whatsapp_message && (
                              <div>
                                <h4 className="font-semibold mb-2">WhatsApp বার্তা</h4>
                                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                  {selectedOrder.whatsapp_message}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Select
                                value={selectedOrder.status}
                                onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">পেন্ডিং</SelectItem>
                                  <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                                  <SelectItem value="processing">প্রক্রিয়াকরণ</SelectItem>
                                  <SelectItem value="shipped">পাঠানো</SelectItem>
                                  <SelectItem value="delivered">ডেলিভার</SelectItem>
                                  <SelectItem value="cancelled">বাতিল</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">কোন অর্ডার পাওয়া যায়নি।</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
