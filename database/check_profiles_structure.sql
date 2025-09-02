-- Test script to check profiles table structure
-- Run this in Supabase SQL Editor to see current table structure

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;
