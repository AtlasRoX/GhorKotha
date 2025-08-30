-- Remove the problematic recursive RLS policy on admin_users
DROP POLICY IF EXISTS "Admin users can manage admin accounts" ON admin_users;

-- Disable RLS on admin_users table to prevent recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Update other policies to use email-based admin check instead of ID
DROP POLICY IF EXISTS "Admin users can view all categories" ON categories;
DROP POLICY IF EXISTS "Admin users can view all products" ON products;
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;

-- Create new policies that check admin status by email from auth.users
CREATE POLICY "Admin users can view all categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admin users can view all products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admin users can view all orders" ON orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admin users can view all order items" ON order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
    AND admin_users.is_active = true
  )
);
