-- Create an admin user in Supabase Auth and link it to admin_users table
-- Default credentials: admin@ghorokotha.com / admin123

-- Create the admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ghorokotha.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create identity record for the user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'admin@ghorokotha.com'),
  jsonb_build_object('sub', (SELECT id FROM auth.users WHERE email = 'admin@ghorokotha.com')::text, 'email', 'admin@ghorokotha.com'),
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, user_id) DO NOTHING;

-- Update admin_users table with the auth user id
UPDATE admin_users 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@ghorokotha.com')
WHERE email = 'admin@ghorokotha.com';

-- Verify the setup
SELECT 
  au.email as auth_email,
  au.email_confirmed_at,
  adu.email as admin_email,
  adu.name,
  adu.is_active
FROM auth.users au
JOIN admin_users adu ON au.id = adu.id
WHERE au.email = 'admin@ghorokotha.com';
