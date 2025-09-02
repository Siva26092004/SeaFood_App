-- Sample data for Fish Market App
-- This script will populate the products table with sample fish and seafood products

-- Insert sample products
INSERT INTO public.products (
  name, description, price, category, available_quantity, image_url
) VALUES 
-- Fresh Fish
(
  'Fresh Atlantic Salmon',
  'Premium Atlantic salmon, fresh daily. Rich in omega-3 fatty acids and perfect for grilling, baking, or making sashimi.',
  25.99,
  'fish',
  50,
  'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Atlantic+Salmon'
),
(
  'Fresh Yellowfin Tuna',
  'Yellowfin tuna, sashimi grade. The deep red flesh has a clean, meaty flavor and firm texture. Perfect for searing or enjoying raw.',
  28.75,
  'fish',
  25,
  'https://via.placeholder.com/400x300/F5A623/FFFFFF?text=Yellowfin+Tuna'
),
(
  'Fresh Red Snapper',
  'Whole red snapper, caught locally. Sweet, mild flavor with firm white meat. Perfect for whole fish preparations.',
  22.50,
  'fish',
  30,
  'https://via.placeholder.com/400x300/E74C3C/FFFFFF?text=Red+Snapper'
),
(
  'Fresh Sea Bass',
  'European sea bass with delicate, flaky white meat. Mild flavor makes it perfect for various cooking methods.',
  32.00,
  'fish',
  20,
  'https://via.placeholder.com/400x300/3498DB/FFFFFF?text=Sea+Bass'
),

-- Seafood
(
  'King Tiger Prawns',
  'Jumbo tiger prawns, 15-20cm each. Sweet, delicate flavor perfect for barbecuing, stir-frying, or pasta dishes.',
  35.50,
  'seafood',
  40,
  'https://via.placeholder.com/400x300/7ED321/FFFFFF?text=Tiger+Prawns'
),
(
  'Fresh Maine Lobster Tails',
  'Premium lobster tails from Maine. Sweet, succulent meat perfect for special occasions.',
  45.00,
  'seafood',
  15,
  'https://via.placeholder.com/400x300/D0021B/FFFFFF?text=Lobster+Tails'
),
(
  'Fresh Scallops',
  'Large sea scallops, perfect for searing. Sweet and tender with a delicate ocean flavor.',
  38.99,
  'seafood',
  25,
  'https://via.placeholder.com/400x300/9013FE/FFFFFF?text=Scallops'
),
(
  'Fresh Blue Mussels',
  'Farm-raised blue mussels, cleaned and debearded. Perfect for steaming with wine and garlic.',
  12.99,
  'seafood',
  60,
  'https://via.placeholder.com/400x300/50E3C2/FFFFFF?text=Blue+Mussels'
),

-- Frozen
(
  'Frozen Cod Fillets',
  'Premium frozen cod fillets, sustainably caught. Mild white fish perfect for fish and chips or baking.',
  18.50,
  'frozen',
  80,
  'https://via.placeholder.com/400x300/95A5A6/FFFFFF?text=Cod+Fillets'
),
(
  'Frozen Shrimp Ring',
  'Pre-cooked frozen shrimp ring, tail-on. Perfect for cocktail parties and quick appetizers.',
  24.99,
  'frozen',
  35,
  'https://via.placeholder.com/400x300/E67E22/FFFFFF?text=Shrimp+Ring'
),
(
  'Frozen Salmon Steaks',
  'Individual frozen salmon steaks, perfect portion size. Great for quick weeknight dinners.',
  21.50,
  'frozen',
  45,
  'https://via.placeholder.com/400x300/34495E/FFFFFF?text=Salmon+Steaks'
),

-- Ready to Cook
(
  'Beer Battered Fish & Chips',
  'Premium cod in beer batter with seasoned potato chips. Just heat and serve for authentic pub-style meal.',
  12.99,
  'ready',
  40,
  'https://via.placeholder.com/400x300/F39C12/FFFFFF?text=Fish+%26+Chips'
),
(
  'Garlic Butter Prawns',
  'Prawns marinated in garlic butter, ready to cook. Just pan-fry for 3-4 minutes.',
  19.99,
  'ready',
  30,
  'https://via.placeholder.com/400x300/27AE60/FFFFFF?text=Garlic+Prawns'
),
(
  'Stuffed Salmon Fillets',
  'Salmon fillets stuffed with herbs and breadcrumbs. Oven-ready gourmet meal.',
  24.50,
  'ready',
  20,
  'https://via.placeholder.com/400x300/8E44AD/FFFFFF?text=Stuffed+Salmon'
),
(
  'Fisherman\'s Pie Mix',
  'Mixed seafood and fish in creamy sauce, topped with mashed potatoes. Family-sized portion.',
  16.75,
  'ready',
  25,
  'https://via.placeholder.com/400x300/2C3E50/FFFFFF?text=Fisherman+Pie'
);

-- Verify the data was inserted
SELECT 
  id,
  name,
  category,
  price,
  available_quantity
FROM public.products
ORDER BY category, name;
