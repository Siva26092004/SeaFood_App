-- Insert sample products into the products table
-- Make sure to run this after your database schema is set up

-- Fresh Fish Products
INSERT INTO products (name, description, price, category, image_url, available_quantity, unit, is_active) VALUES
('Atlantic Salmon Fillet', 'Fresh Norwegian Atlantic salmon, rich in omega-3 fatty acids. Perfect for grilling or baking.', 24.99, 'fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 15, 'lb', true),
('Red Snapper Whole', 'Whole red snapper, fresh caught. Ideal for steaming or roasting whole.', 18.50, 'fish', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 8, 'lb', true),
('Tuna Steaks', 'Premium yellowfin tuna steaks, sushi grade. Perfect for searing or grilling.', 32.00, 'fish', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400', 12, 'lb', true),
('Sea Bass Fillet', 'Mediterranean sea bass fillets, delicate flavor and flaky texture.', 28.75, 'fish', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', 10, 'lb', true),
('Cod Fillet', 'Fresh Atlantic cod fillets, mild flavor and firm texture. Great for fish and chips.', 19.99, 'fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 20, 'lb', true),

-- Seafood Products
('King Crab Legs', 'Alaskan king crab legs, sweet and succulent meat. Steam and serve with butter.', 45.99, 'seafood', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=400', 6, 'lb', true),
('Jumbo Shrimp', 'Large gulf shrimp, peeled and deveined. Perfect for grilling or sautéing.', 22.50, 'seafood', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', 25, 'lb', true),
('Fresh Oysters', 'East coast oysters, freshly shucked. Served on the half shell.', 16.99, 'seafood', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', 30, 'dozen', true),
('Lobster Tails', 'Canadian lobster tails, sweet and tender. Perfect for special occasions.', 38.00, 'seafood', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 8, 'lb', true),
('Sea Scallops', 'Large dry-packed sea scallops, perfect for searing. Restaurant quality.', 29.99, 'seafood', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 12, 'lb', true),
('Mussels', 'Fresh blue mussels from Prince Edward Island. Great for steaming in wine.', 8.99, 'seafood', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 40, 'lb', true),

-- Frozen Products
('Frozen Salmon Portions', 'Individual frozen salmon portions, vacuum sealed for freshness.', 19.99, 'frozen', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 50, 'pack', true),
('Frozen Fish Sticks', 'Breaded fish sticks made from wild-caught pollock. Kid-friendly favorite.', 9.99, 'frozen', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 35, 'box', true),
('Frozen Shrimp Ring', 'Cooked frozen shrimp ring with cocktail sauce. Ready to thaw and serve.', 12.99, 'frozen', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', 20, 'ring', true),
('Frozen Crab Cakes', 'Premium crab cakes made with jumbo lump crab meat. Just heat and serve.', 24.99, 'frozen', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=400', 18, 'pack', true),

-- Ready to Cook Products
('Herb-Crusted Salmon', 'Salmon fillet with herb and breadcrumb coating. Oven-ready in 20 minutes.', 16.99, 'ready', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 15, 'portion', true),
('Stuffed Flounder', 'Fresh flounder stuffed with crab meat dressing. Gourmet ready-to-bake meal.', 21.50, 'ready', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', 10, 'portion', true),
('Bacon-Wrapped Scallops', 'Large scallops wrapped in bacon, ready to bake. Perfect appetizer or main dish.', 26.99, 'ready', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 12, 'pack', true),
('Coconut Shrimp', 'Breaded coconut shrimp, ready to fry. Tropical flavor in every bite.', 18.99, 'ready', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', 22, 'pack', true),
('Fish Tacos Kit', 'Complete fish taco kit with seasoned fish, tortillas, and toppings.', 14.99, 'ready', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 25, 'kit', true);

-- Update the created_at and updated_at timestamps to current time
UPDATE products SET 
  created_at = NOW(),
  updated_at = NOW()
WHERE created_at IS NULL;
