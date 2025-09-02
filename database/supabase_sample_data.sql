-- ===========================================
-- FISH MARKET APP - SAMPLE PRODUCTS DATA
-- ===========================================
-- Run this script in your Supabase SQL Editor
-- Make sure your products table exists first

BEGIN;

-- Clear existing sample data (optional - remove if you want to keep existing data)
-- DELETE FROM products WHERE name LIKE '%Sample%' OR description LIKE '%Perfect for%';

-- FRESH FISH CATEGORY
INSERT INTO products (name, description, price, category, image_url, available_quantity, unit, is_active) VALUES
-- Premium Fish
('Wild Atlantic Salmon', 'Premium wild-caught Atlantic salmon fillet. Rich in omega-3 fatty acids with a buttery texture. Perfect for grilling, baking, or pan-searing.', 28.99, 'fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 18, 'lb', true),

('Red Snapper Whole Fish', 'Fresh whole red snapper from the Gulf. Sweet, delicate flavor with firm texture. Excellent for whole roasting or filleting.', 22.50, 'fish', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop', 12, 'whole', true),

('Yellowfin Tuna Steaks', 'Sushi-grade yellowfin tuna steaks. Deep red color and meaty texture. Perfect for searing, grilling, or raw preparations.', 34.99, 'fish', 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=400&fit=crop', 8, 'lb', true),

('Chilean Sea Bass Fillet', 'Premium Chilean sea bass fillets. Buttery texture and mild flavor. Ideal for upscale dining experiences.', 42.00, 'fish', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 6, 'lb', true),

('Fresh Atlantic Cod', 'Fresh Atlantic cod fillets. Mild flavor and flaky texture. Classic choice for fish and chips or baking.', 19.99, 'fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 25, 'lb', true),

('Halibut Steaks', 'Fresh Pacific halibut steaks. Firm white meat with sweet flavor. Excellent for grilling or roasting.', 31.50, 'fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 10, 'lb', true),

-- SEAFOOD CATEGORY
('Alaskan King Crab Legs', 'Premium Alaskan king crab legs. Sweet, succulent meat in large, easy-to-crack shells. Steam and serve with drawn butter.', 49.99, 'seafood', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 8, 'lb', true),

('Gulf Jumbo Shrimp', 'Large Gulf Coast shrimp, 16-20 count. Peeled and deveined for convenience. Great for grilling, sautéing, or cocktail platters.', 24.99, 'seafood', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 30, 'lb', true),

('Fresh Blue Point Oysters', 'Fresh Blue Point oysters from Long Island Sound. Briny and sweet flavor. Perfect on the half shell or for cooking.', 18.99, 'seafood', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=400&fit=crop', 24, 'dozen', true),

('Maine Lobster Tails', 'Cold water Maine lobster tails. Sweet, tender meat perfect for special occasions. Easy to prepare and elegant presentation.', 39.99, 'seafood', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=400&fit=crop', 15, 'lb', true),

('Diver Sea Scallops', 'Hand-harvested diver scallops, U-10 size. Dry-packed for perfect searing. Sweet and tender with no chemical additives.', 32.99, 'seafood', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop', 12, 'lb', true),

('PEI Mussels', 'Fresh Prince Edward Island mussels. Clean, sweet flavor perfect for steaming in wine or garlic butter.', 9.99, 'seafood', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&h=400&fit=crop', 40, 'lb', true),

('Dungeness Crab Clusters', 'Fresh Dungeness crab clusters from the Pacific Northwest. Sweet meat and easy-to-crack shells.', 26.99, 'seafood', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 14, 'lb', true),

-- FROZEN CATEGORY
('Frozen Salmon Portions', 'Individual vacuum-sealed salmon portions. Sustainably sourced and frozen at peak freshness. Convenient 6oz portions.', 21.99, 'frozen', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 45, 'pack', true),

('Breaded Fish Sticks', 'Premium fish sticks made from wild Alaskan pollock. Golden breading and flaky interior. Kids love them!', 11.99, 'frozen', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', 35, 'box', true),

('Cooked Shrimp Ring', 'Pre-cooked frozen shrimp ring with cocktail sauce. Thaw and serve for easy entertaining. 31-40 count shrimp.', 14.99, 'frozen', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 28, 'ring', true),

('Frozen Crab Cakes', 'Gourmet crab cakes made with jumbo lump crab meat. Minimal filler, maximum crab. Heat and serve in minutes.', 27.99, 'frozen', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 20, 'pack', true),

('Frozen Mahi Mahi', 'Frozen mahi mahi fillets from sustainable fisheries. Firm texture and mild flavor. Great for grilling or blackening.', 18.99, 'frozen', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 32, 'lb', true),

-- READY TO COOK CATEGORY
('Herb-Crusted Salmon', 'Fresh salmon fillet topped with herb and parmesan crust. Oven-ready gourmet meal in just 18 minutes.', 17.99, 'ready', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 22, 'portion', true),

('Crab-Stuffed Flounder', 'Fresh flounder fillet stuffed with jumbo lump crab meat dressing. Restaurant-quality meal ready for your oven.', 23.99, 'ready', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 16, 'portion', true),

('Bacon-Wrapped Scallops', 'Large sea scallops wrapped in premium bacon. Perfect appetizer or elegant main course. Bake for 12 minutes.', 28.99, 'ready', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop', 18, 'pack', true),

('Coconut Crusted Shrimp', 'Jumbo shrimp with golden coconut breading. Tropical flavors meet comfort food. Bake or fry until golden.', 19.99, 'ready', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 26, 'pack', true),

('Fish Taco Kit', 'Complete meal kit with seasoned white fish, corn tortillas, cabbage slaw, and chipotle crema. Serves 4 people.', 16.99, 'ready', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', 20, 'kit', true),

('Teriyaki Glazed Salmon', 'Salmon fillet pre-marinated in house-made teriyaki glaze. Asian-inspired flavors ready for the grill or oven.', 19.50, 'ready', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 24, 'portion', true),

('Lobster Mac and Cheese', 'Gourmet mac and cheese loaded with fresh lobster meat and three cheeses. Comfort food elevated to luxury.', 32.99, 'ready', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=400&fit=crop', 12, 'tray', true);

-- Update timestamps
UPDATE products SET 
    created_at = NOW(),
    updated_at = NOW()
WHERE created_at IS NULL;

COMMIT;

-- Verify the data was inserted
SELECT 
    category,
    COUNT(*) as product_count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;
