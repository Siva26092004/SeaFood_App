-- Disable email confirmation requirement for development
-- This allows users to sign in immediately after registration

-- 1. First, let's check current auth settings
SELECT * FROM auth.config;

-- 2. Update the auth config to disable email confirmation
-- Note: This should be done in Supabase Dashboard > Authentication > Settings
-- But we can also do it via SQL if you have the right permissions

-- 3. For the existing user that was created, we need to confirm their email manually
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'sivahari56789@gmail.com' 
  AND email_confirmed_at IS NULL;

-- 4. Also ensure the user is not disabled
UPDATE auth.users 
SET banned_until = NULL
WHERE email = 'sivahari56789@gmail.com';

-- 5. Check the user status after update
SELECT id, email, email_confirmed_at, confirmed_at, banned_until, created_at
FROM auth.users 
WHERE email = 'sivahari56789@gmail.com';

-- 6. Now let's also create the missing profile for this user
-- First, get the user ID
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'sivahari56789@gmail.com';
    
    -- Only insert if profile doesn't exist
    INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
    SELECT user_id, 'sivahari56789@gmail.com', 'Test User', '', 'customer', NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id);
    
    RAISE LOG 'Profile created/verified for user: %', user_id;
END $$;

-- 7. Verify the profile was created
SELECT p.*, u.email as auth_email, u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'sivahari56789@gmail.com';
