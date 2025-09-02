-- Diagnostic script to check RLS and admin permissions for products
-- Run this in your Supabase SQL editor or database console

-- 1. Check if RLS is enabled on products table
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- 2. Check existing policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 3. Check your current admin users
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';

-- 4. Check auth.users table to see current session
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST
LIMIT 5;

-- 5. Test if current user context is working (this will show who is currently authenticated)
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_auth_role,
  p.email,
  p.full_name,
  p.role as profile_role
FROM profiles p
WHERE p.id = auth.uid();

-- 6. Temporary fix: Disable RLS on products table if needed
-- Uncomment the line below if you want to quickly fix the issue:
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
