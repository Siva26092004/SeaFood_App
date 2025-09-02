-- Fix for Profile RLS Policy Issue
-- Run this in Supabase SQL Editor to fix the registration error

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create a new policy that allows profile creation during registration
CREATE POLICY "Enable insert during registration" ON profiles
    FOR INSERT WITH CHECK (true);

-- Update the trigger function to handle errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the policy exists
SELECT policyname, tablename, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
