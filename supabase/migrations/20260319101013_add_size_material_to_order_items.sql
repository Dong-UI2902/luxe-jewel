-- ============================================================
-- Add size and material columns to order_items
-- ============================================================

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS material TEXT;
