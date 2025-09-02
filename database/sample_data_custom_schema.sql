-- ===========================================
-- FISH MARKET APP - SAMPLE DATA FOR YOUR SCHEMA
-- ===========================================
-- Run this script in your Supabase SQL Editor
-- This matches your exact database schema

BEGIN;

-- First, let's create some sample user profiles (customers and admin)
-- Note: These users need to exist in auth.users first, but for testing you can create them manually

-- Sample Products based on your categories
INSERT INTO public.products (name, description, price, category, image_url, stock_quantity, unit, is_available) VALUES

-- FRESH FISH CATEGORY
('King Fish (Surmai)', 'Premium king fish steaks, fresh catch of the day. Perfect for frying or grilling with spices.', 450.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 25, 'kg', true),

('Pomfret Silver', 'Fresh silver pomfret, whole fish. Ideal for steaming or curry preparations. Very popular in Indian cuisine.', 800.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop', 15, 'kg', true),

('Mackerel (Bangda)', 'Fresh mackerel fish, rich in omega-3. Great for curry or fried preparations. Local favorite.', 200.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=400&fit=crop', 30, 'kg', true),

('Red Snapper', 'Fresh red snapper, whole fish. Sweet meat perfect for grilling or tandoor preparations.', 650.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 18, 'kg', true),

('Tuna Steaks', 'Fresh tuna steaks, premium quality. Perfect for grilling or pan-searing with minimal spices.', 750.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 12, 'kg', true),

('Salmon Fillet', 'Imported salmon fillets, boneless. Rich texture perfect for continental dishes.', 1200.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 8, 'kg', true),

('Sea Bass', 'Fresh sea bass, whole fish. Delicate flavor ideal for steaming with ginger and soy.', 550.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 20, 'kg', true),

-- PRAWNS & SHRIMP CATEGORY
('Jumbo Prawns', 'Large sized fresh prawns, premium quality. Perfect for biryanis and curries.', 900.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 22, 'kg', true),

('Medium Prawns', 'Medium sized fresh prawns, cleaned and deveined. Great for everyday cooking.', 650.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 35, 'kg', true),

('Tiger Prawns', 'Premium tiger prawns, large size. Ideal for special occasions and parties.', 1100.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 15, 'kg', true),

('Small Prawns', 'Small fresh prawns, perfect for frying or making pickle. Budget-friendly option.', 400.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 40, 'kg', true),

('Prawn Pickle Cut', 'Small prawns specially cut for making traditional prawn pickle. Pre-cleaned and ready.', 450.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 25, 'kg', true),

-- CRABS CATEGORY
('Mud Crabs Large', 'Fresh large mud crabs, live and active. Perfect for crab curry or steamed preparations.', 800.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 12, 'kg', true),

('Blue Swimming Crabs', 'Fresh blue swimming crabs, medium size. Great for crab masala and coastal dishes.', 600.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 18, 'kg', true),

('Flower Crabs', 'Small flower crabs, perfect for making crab curry. Sweet meat and easy to cook.', 400.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 25, 'kg', true),

('Crab Meat (Extracted)', 'Fresh crab meat extracted from shells. Ready to cook, saves preparation time.', 1200.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 8, 'kg', true),

-- DRIED FISH CATEGORY
('Bombay Duck Dry', 'Traditional Bombay duck dried fish. Perfect for frying or making curry. Long shelf life.', 350.00, 'Dried Fish', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', 20, 'kg', true),

('Dry Prawns', 'Small dried prawns, concentrated flavor. Used for making sambar, chutneys and curries.', 800.00, 'Dried Fish', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 15, 'kg', true),

('Dry Mackerel', 'Sun-dried mackerel pieces. Traditional preservation method, rich in flavor.', 450.00, 'Dried Fish', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=400&fit=crop', 18, 'kg', true),

('Anchovy Dry', 'Dried anchovies, small size. Perfect for making traditional South Indian dishes and rasam.', 300.00, 'Dried Fish', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', 25, 'kg', true),

('Dry Fish Mix', 'Mixed variety of small dried fish. Great for making traditional coastal curries.', 400.00, 'Dried Fish', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', 22, 'kg', true),

-- FISH CURRY CUT CATEGORY
('Kingfish Curry Cut', 'King fish cut into curry-sized pieces. Perfect for fish curry, saves cutting time.', 460.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 28, 'kg', true),

('Pomfret Curry Cut', 'Silver pomfret cut into medium pieces. Ideal for Goan fish curry or coconut curry.', 820.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop', 15, 'kg', true),

('Mackerel Curry Cut', 'Fresh mackerel cut into curry pieces. Perfect for everyday fish curry preparations.', 210.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=400&fit=crop', 35, 'kg', true),

('Mixed Fish Curry Cut', 'Assorted fish pieces cut for curry. Good variety and value for money option.', 380.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 30, 'kg', true),

('Tuna Curry Cut', 'Fresh tuna cut into curry pieces. Meaty texture perfect for spicy fish curries.', 720.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=400&fit=crop', 20, 'kg', true),

-- ADDITIONAL SPECIALTY ITEMS BY PIECE
('Whole Pomfret Large', 'Large whole pomfret, premium size. Perfect for special occasions and family meals.', 180.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop', 25, 'piece', true),

('Whole Kingfish Medium', 'Medium sized whole kingfish. Good for family cooking, can be cut as needed.', 120.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 30, 'piece', true),

('Squid Fresh', 'Fresh squid, cleaned and ready to cook. Perfect for koliwada or curry preparations.', 45.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop', 40, 'piece', true);

-- Update timestamps for all products
UPDATE public.products SET 
    created_at = NOW(),
    updated_at = NOW()
WHERE created_at IS NULL;

COMMIT;

-- Verification query to check the inserted data
SELECT 
    category,
    COUNT(*) as product_count,
    MIN(price) as min_price_rs,
    MAX(price) as max_price_rs,
    AVG(price)::numeric(10,2) as avg_price_rs,
    SUM(stock_quantity) as total_stock
FROM public.products 
WHERE is_available = true 
GROUP BY category 
ORDER BY category;

-- Show sample of products
SELECT 
    name,
    category,
    price as price_rs,
    stock_quantity,
    unit
FROM public.products 
WHERE is_available = true 
ORDER BY category, price
LIMIT 10;
