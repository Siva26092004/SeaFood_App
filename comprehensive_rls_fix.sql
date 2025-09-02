-- Alternative Fix for Profile RLS Policy Issue
-- This completely removes RLS restrictions for profile creation

-- Option 1: Temporarily disable RLS for profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert during registration" ON profiles;

-- Create new comprehensive policies
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        -- Allow insert if it's the user's own profile OR if no auth context (for triggers)
        auth.uid() = id OR auth.uid() IS NULL
    );

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Alternative Option 2: Create a service role policy
-- Grant USAGE on schema to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE profiles TO service_role;

-- Option 3: Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Option 4: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
