-- Create WhatsApp settings table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    welcome_message TEXT DEFAULT 'আসসালামু আলাইকুম! আমি ঘরকথা থেকে পণ্য সম্পর্কে জানতে চাই।',
    order_message_template TEXT DEFAULT '🛒 *নতুন অর্ডার - ঘরকথা*

👤 *গ্রাহকের তথ্য:*
নাম: {customer_name}
ফোন: {customer_phone}
ঠিকানা: {customer_address}

📦 *অর্ডারের বিবরণ:*
{order_details}

💰 *মোট: ৳{total_amount}*

{notes}

ধন্যবাদ! 🙏',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO whatsapp_settings (phone_number, is_enabled, welcome_message, order_message_template)
VALUES (
    '8801902637437',
    true,
    'আসসালামু আলাইকুম! আমি ঘরকথা থেকে পণ্য সম্পর্কে জানতে চাই।',
    '🛒 *নতুন অর্ডার - ঘরকথা*

👤 *গ্রাহকের তথ্য:*
নাম: {customer_name}
ফোন: {customer_phone}
ঠিকানা: {customer_address}

📦 *অর্ডারের বিবরণ:*
{order_details}

💰 *মোট: ৳{total_amount}*

{notes}

ধন্যবাদ! 🙏'
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin can manage WhatsApp settings" ON whatsapp_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );
