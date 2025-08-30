-- Create theme_settings table for storing customizable theme configurations
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_name VARCHAR(100) NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT false,
  
  -- Primary colors
  primary_color VARCHAR(7) NOT NULL DEFAULT '#0891b2', -- cyan-600
  primary_foreground VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  
  -- Secondary colors  
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#84cc16', -- lime-500
  secondary_foreground VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  
  -- Accent colors
  accent_color VARCHAR(7) NOT NULL DEFAULT '#f59e0b', -- amber-500
  accent_foreground VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  
  -- Background colors
  background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  foreground_color VARCHAR(7) NOT NULL DEFAULT '#0f172a', -- slate-900
  
  -- Muted colors
  muted_color VARCHAR(7) NOT NULL DEFAULT '#f1f5f9', -- slate-100
  muted_foreground VARCHAR(7) NOT NULL DEFAULT '#64748b', -- slate-500
  
  -- Border and input colors
  border_color VARCHAR(7) NOT NULL DEFAULT '#e2e8f0', -- slate-200
  input_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  
  -- Card colors
  card_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  card_foreground VARCHAR(7) NOT NULL DEFAULT '#0f172a',
  
  -- Destructive colors
  destructive_color VARCHAR(7) NOT NULL DEFAULT '#ef4444', -- red-500
  destructive_foreground VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  
  -- Ring color for focus states
  ring_color VARCHAR(7) NOT NULL DEFAULT '#0891b2',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_theme_settings_active ON theme_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_settings_name ON theme_settings(theme_name);

-- Insert default theme
INSERT INTO theme_settings (
  theme_name, 
  is_active,
  primary_color,
  secondary_color,
  accent_color
) VALUES (
  'ঘরকথা ডিফল্ট',
  true,
  '#0891b2', -- cyan-600
  '#84cc16', -- lime-500  
  '#f59e0b'  -- amber-500
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can view theme settings" ON theme_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert theme settings" ON theme_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update theme settings" ON theme_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete theme settings" ON theme_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_settings_updated_at();
