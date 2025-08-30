-- Fix infinite recursion in admin_users RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admin users can manage admin accounts" ON admin_users;

-- Create a simpler policy that allows authenticated users to read admin_users for authentication checks
CREATE POLICY "Allow authenticated users to read admin_users for auth" ON admin_users 
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create a policy that allows admin users to manage admin accounts (but only super_admins can insert/update/delete)
CREATE POLICY "Super admins can manage admin accounts" ON admin_users 
FOR ALL USING (
  auth.uid() IN (
    SELECT au.id FROM admin_users au 
    WHERE au.role = 'super_admin' 
    AND au.is_active = true
  )
);

-- Update other policies to use a simpler approach
DROP POLICY IF EXISTS "Admin users can view all categories" ON categories;
DROP POLICY IF EXISTS "Admin users can view all products" ON products;
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin users can view all order items" ON order_items;

-- Recreate admin policies with simpler logic
CREATE POLICY "Admin users can manage categories" ON categories FOR ALL USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);

CREATE POLICY "Admin users can manage products" ON products FOR ALL USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);

CREATE POLICY "Admin users can manage orders" ON orders FOR ALL USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);

CREATE POLICY "Admin users can manage order items" ON order_items FOR ALL USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);
