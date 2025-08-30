-- Insert sample categories
INSERT INTO categories (name, name_bn, description, description_bn, image_url) VALUES
('Kitchen Appliances', 'রান্নাঘরের সামগ্রী', 'Essential kitchen tools and appliances', 'রান্নাঘরের প্রয়োজনীয় সরঞ্জাম ও যন্ত্রপাতি', '/placeholder.svg?height=200&width=200'),
('Home Decor', 'ঘর সাজানোর সামগ্রী', 'Beautiful items to decorate your home', 'আপনার ঘর সাজানোর জন্য সুন্দর জিনিসপত্র', '/placeholder.svg?height=200&width=200'),
('Furniture', 'আসবাবপত্র', 'Quality furniture for your home', 'আপনার ঘরের জন্য মানসম্পন্ন আসবাবপত্র', '/placeholder.svg?height=200&width=200'),
('Storage Solutions', 'সংরক্ষণের সামগ্রী', 'Organize your home with smart storage', 'স্মার্ট স্টোরেজ দিয়ে আপনার ঘর সংগঠিত করুন', '/placeholder.svg?height=200&width=200');

-- Insert sample products
INSERT INTO products (name, name_bn, description, description_bn, price, original_price, category_id, image_url, stock_quantity, is_featured) 
SELECT 
  'Non-Stick Frying Pan', 
  'নন-স্টিক ফ্রাইং প্যান', 
  'High-quality non-stick frying pan perfect for everyday cooking',
  'দৈনন্দিন রান্নার জন্য উপযুক্ত উচ্চমানের নন-স্টিক ফ্রাইং প্যান',
  1200.00,
  1500.00,
  c.id,
  '/placeholder.svg?height=300&width=300',
  25,
  true
FROM categories c WHERE c.name = 'Kitchen Appliances';

INSERT INTO products (name, name_bn, description, description_bn, price, original_price, category_id, image_url, stock_quantity, is_featured)
SELECT 
  'Decorative Wall Clock', 
  'সাজানোর দেয়াল ঘড়ি', 
  'Beautiful wall clock to enhance your home decor',
  'আপনার ঘরের সাজসজ্জা বাড়ানোর জন্য সুন্দর দেয়াল ঘড়ি',
  800.00,
  1000.00,
  c.id,
  '/placeholder.svg?height=300&width=300',
  15,
  true
FROM categories c WHERE c.name = 'Home Decor';

INSERT INTO products (name, name_bn, description, description_bn, price, original_price, category_id, image_url, stock_quantity)
SELECT 
  'Wooden Coffee Table', 
  'কাঠের কফি টেবিল', 
  'Elegant wooden coffee table for your living room',
  'আপনার বসার ঘরের জন্য মার্জিত কাঠের কফি টেবিল',
  5500.00,
  6500.00,
  c.id,
  '/placeholder.svg?height=300&width=300',
  8,
  false
FROM categories c WHERE c.name = 'Furniture';

INSERT INTO products (name, name_bn, description, description_bn, price, original_price, category_id, image_url, stock_quantity)
SELECT 
  'Storage Basket Set', 
  'স্টোরেজ ঝুড়ির সেট', 
  'Set of 3 woven storage baskets for organizing',
  'সংগঠিত রাখার জন্য ৩টি বোনা স্টোরেজ ঝুড়ির সেট',
  1800.00,
  2200.00,
  c.id,
  '/placeholder.svg?height=300&width=300',
  12,
  false
FROM categories c WHERE c.name = 'Storage Solutions';

-- Create a super admin user (this will be linked to auth.users when someone signs up with this email)
INSERT INTO admin_users (email, full_name, role) VALUES
('admin@ghorokotha.com', 'Super Admin', 'super_admin');
