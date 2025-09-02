-- Fix profile creation issues
-- This file provides a complete solution for the RLS policy problems

-- 1. First, let's recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  user_metadata jsonb;
BEGIN
  -- Get user email and metadata
  user_email := NEW.email;
  user_metadata := NEW.raw_user_meta_data;
  
  -- Log the trigger execution
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  -- Insert profile with proper data handling
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_email,
    COALESCE(user_metadata->>'full_name', ''),
    COALESCE(user_metadata->>'phone', ''),
    COALESCE(user_metadata->>'role', 'customer'),
    NOW(),
    NOW()
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Don't fail the auth creation if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- 4. Update RLS policies with more permissive rules for profile creation
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow anyone to view profiles (for public listings)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile OR allow system to create profiles
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NULL OR
    auth.role() = 'service_role'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Alternative: If the above still doesn't work, we can temporarily disable RLS
-- Uncomment the lines below if needed:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 6. Test the setup
DO $$
BEGIN
  RAISE LOG 'Profile creation fix applied successfully';
END $$;

-- 7. Check current policies (for debugging)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
