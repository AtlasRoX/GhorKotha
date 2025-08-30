-- Create a new black-based theme for the admin to use
INSERT INTO theme_settings (
  theme_name, 
  is_active,
  primary_color,
  primary_foreground,
  secondary_color,
  secondary_foreground,
  accent_color,
  accent_foreground,
  background_color,
  foreground_color,
  muted_color,
  muted_foreground,
  border_color,
  input_color,
  card_color,
  card_foreground,
  destructive_color,
  destructive_foreground,
  ring_color
) VALUES (
  'কালো প্রাইমারি থিম',
  false, -- Set to false initially, admin can activate it
  '#000000', -- Black primary
  '#ffffff', -- White text on black
  '#e5e5e5', -- Light gray secondary
  '#000000', -- Black text on light secondary
  '#404040', -- Dark gray accent
  '#ffffff', -- White text on dark accent
  '#ffffff', -- White background
  '#4b5563', -- Dark gray text
  '#f5f5f5', -- Very light gray muted
  '#6b7280', -- Medium gray muted text
  '#e5e5e5', -- Light gray border
  '#ffffff', -- White input background
  '#f9fafb', -- Very light gray card background
  '#4b5563', -- Dark gray card text
  '#dc2626', -- Red destructive
  '#ffffff', -- White destructive text
  '#000000'  -- Black ring color
) ON CONFLICT DO NOTHING;
