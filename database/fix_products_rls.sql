-- Fix Products Table RLS Policies
-- This resolves the "new row violates row-level security policy" error

-- 1. Check current RLS status for products table
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'products' AND schemaname = 'public';

-- 2. Check existing policies on products table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 3. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- 4. Create comprehensive policies for products table

-- Allow everyone to view products (public catalog)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Allow admin users to insert products
CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to update products
CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admin users to delete products
CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Alternative: If you want to temporarily disable RLS for products (LESS SECURE)
-- Uncomment the line below if the above policies don't work:
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 6. Enable RLS on products table (in case it's not enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 7. Grant necessary permissions
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- 8. Verify the setup
SELECT 'Products table RLS setup completed' as status;

-- 9. Check final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';
