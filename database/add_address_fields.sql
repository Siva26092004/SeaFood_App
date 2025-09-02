-- ===========================================
-- ADD ADDRESS FIELDS TO PROFILES TABLE
-- ===========================================
-- Run this script in your Supabase SQL Editor to add address management

BEGIN;

-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
ADD COLUMN IF NOT EXISTS landmark text,
ADD COLUMN IF NOT EXISTS address_type text DEFAULT 'home' CHECK (address_type = ANY (ARRAY['home'::text, 'work'::text, 'other'::text]));

-- Update the updated_at timestamp
UPDATE public.profiles SET updated_at = NOW();

COMMIT;

-- Verify the changes
\d public.profiles;
