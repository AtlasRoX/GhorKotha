export interface Product {
  id: string
  name: string
  price: number
  image: string
  description?: string
  category_id?: string
  stock_quantity?: number
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  notes?: string
  total_amount: number
  status: "pending" | "confirmed" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}
