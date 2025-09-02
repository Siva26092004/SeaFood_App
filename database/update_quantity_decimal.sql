-- ===========================================
-- UPDATE CART QUANTITY COLUMN TO SUPPORT DECIMALS
-- ===========================================
-- Run this script in your Supabase SQL Editor to support fractional weights

BEGIN;

-- Update cart_items table to support decimal quantities
ALTER TABLE public.cart_items 
ALTER COLUMN quantity TYPE DECIMAL(5,2);

-- Update order_items table to support decimal quantities  
ALTER TABLE public.order_items 
ALTER COLUMN quantity TYPE DECIMAL(5,2);

-- Update any existing integer quantities (if needed)
-- This ensures any existing data remains valid

COMMIT;

-- Verify the changes
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name IN ('cart_items', 'order_items') 
AND column_name = 'quantity';
