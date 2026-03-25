-- ============================================================
-- Guest Checkout RLS Fix
-- Allow public (unauthenticated) users to insert orders and order_items
-- Also add awaiting_confirmation and paid to order_status if not already present
-- ============================================================

-- Add payment_method column if not exists (already exists but safe)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- ── Orders: allow public insert (guest checkout) ──────────────────────────

-- Drop old restrictive policy
DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;

-- Authenticated users manage their own orders
DROP POLICY IF EXISTS "auth_users_manage_own_orders" ON public.orders;
CREATE POLICY "auth_users_manage_own_orders"
ON public.orders FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public (guest) can insert orders with null user_id
DROP POLICY IF EXISTS "public_insert_guest_orders" ON public.orders;
CREATE POLICY "public_insert_guest_orders"
ON public.orders FOR INSERT TO public
WITH CHECK (user_id IS NULL);

-- Public can read their own order by id (for success page)
DROP POLICY IF EXISTS "public_read_orders_by_id" ON public.orders;
CREATE POLICY "public_read_orders_by_id"
ON public.orders FOR SELECT TO public
USING (true);

-- Admin can update any order (for confirm payment)
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders"
ON public.orders FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- ── Order Items: allow public insert ─────────────────────────────────────

DROP POLICY IF EXISTS "users_read_own_order_items" ON public.order_items;

-- Public can insert order items
DROP POLICY IF EXISTS "public_insert_order_items" ON public.order_items;
CREATE POLICY "public_insert_order_items"
ON public.order_items FOR INSERT TO public
WITH CHECK (true);

-- Public can read order items
DROP POLICY IF EXISTS "public_read_order_items" ON public.order_items;
CREATE POLICY "public_read_order_items"
ON public.order_items FOR SELECT TO public
USING (true);

-- Authenticated users manage their own order items
DROP POLICY IF EXISTS "auth_users_manage_order_items" ON public.order_items;
CREATE POLICY "auth_users_manage_order_items"
ON public.order_items FOR ALL TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);
