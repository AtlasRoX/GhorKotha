-- Fix Row Level Security policies for orders to allow public order creation

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Create separate policies for different operations to avoid conflicts

-- Public policies for order creation (customers can create orders)
CREATE POLICY "Public can insert orders" ON orders 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public can insert order items" ON order_items 
  FOR INSERT 
  WITH CHECK (true);

-- Admin policies for full access (admins can do everything)
CREATE POLICY "Admin can select orders" ON orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can update orders" ON orders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can delete orders" ON orders 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can insert orders" ON orders 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Order items policies
CREATE POLICY "Admin can select order items" ON order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can update order items" ON order_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can delete order items" ON order_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin can insert order items" ON order_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
