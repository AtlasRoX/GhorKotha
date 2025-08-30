-- Add missing image_urls column to products table
-- This script safely adds the column if it doesn't exist

DO $$
BEGIN
    -- Check if the column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'image_urls'
        AND table_schema = 'public'
    ) THEN
        -- Add the missing column
        ALTER TABLE products ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
        
        -- Update existing products to populate image_urls from image_url
        UPDATE products 
        SET image_urls = CASE 
            WHEN image_url IS NOT NULL AND image_url != '' 
            THEN jsonb_build_array(image_url)
            ELSE '[]'::jsonb
        END
        WHERE image_urls IS NULL OR image_urls = '[]'::jsonb;
        
        RAISE NOTICE 'Successfully added image_urls column to products table';
    ELSE
        RAISE NOTICE 'Column image_urls already exists in products table';
    END IF;
END $$;
