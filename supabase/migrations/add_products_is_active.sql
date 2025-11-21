-- Add is_active column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mark all existing products as active
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
