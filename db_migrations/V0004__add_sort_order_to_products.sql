ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
UPDATE products SET sort_order = id WHERE sort_order = 0;