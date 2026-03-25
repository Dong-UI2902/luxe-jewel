-- Migration: Add gender column to products table and update existing products with random gender values
-- Timestamp: 20260318052000

-- Step 1: Add gender column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Unisex' CHECK (gender IN ('Nam', 'Nữ', 'Unisex'));

-- Step 2: Update existing products with random gender values
DO $$
DECLARE
    genders TEXT[] := ARRAY['Nam', 'Nữ', 'Unisex'];
    prod RECORD;
BEGIN
    FOR prod IN SELECT id FROM public.products WHERE gender IS NULL OR gender = 'Unisex' LOOP
        UPDATE public.products
        SET gender = genders[1 + floor(random() * 3)::int]
        WHERE id = prod.id;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Gender update failed: %', SQLERRM;
END $$;

-- Step 3: Create index for gender filter performance
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
