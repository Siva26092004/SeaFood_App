# Database Update Required

## Issue
The cart quantity column is currently INTEGER, but we need to store decimal values like 0.25, 0.5, 1.0 for fish weights.

## Error
```
ERROR: invalid input syntax for type integer: "0.5"
```

## Solution
Run the following SQL script in your Supabase SQL Editor:

**File: `database/update_quantity_decimal.sql`**

This will:
1. Change `cart_items.quantity` from INTEGER to DECIMAL(5,2)
2. Change `order_items.quantity` from INTEGER to DECIMAL(5,2)
3. Allow storing values like 0.25 (250g), 0.5 (500g), 1.0 (1kg)

## After Running Migration
The app will support:
- **250g** (0.25 kg) - minimum order
- **500g** (0.5 kg) 
- **1kg** (1.0 kg)
- **Custom weights** using +/- buttons in 250g increments

## Test Steps
1. Run the SQL migration
2. Add fish to cart (starts with 250g)
3. Use weight dropdown to select 250g/500g/1kg
4. Use +/- buttons to adjust by 250g increments
5. Verify prices calculate correctly
