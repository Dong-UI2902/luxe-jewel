-- ============================================================
-- LuxeJewel - Initial Schema Migration
-- Tables: user_profiles, categories, products, orders, order_items
-- ============================================================

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'customer');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_vi TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_vi TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    description_vi TEXT,
    price DECIMAL(12, 0) NOT NULL DEFAULT 0,
    original_price DECIMAL(12, 0),
    image_url TEXT,
    image_alt TEXT,
    gallery_urls TEXT[],
    sku TEXT UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    material TEXT,
    weight_grams DECIMAL(8, 2),
    dimensions TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL UNIQUE,
    status public.order_status DEFAULT 'pending'::public.order_status,
    subtotal DECIMAL(12, 0) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(12, 0) DEFAULT 0,
    discount_amount DECIMAL(12, 0) DEFAULT 0,
    total_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_province TEXT,
    notes TEXT,
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 0) NOT NULL,
    total_price DECIMAL(12, 0) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON public.products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- categories: public read, admin write
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories"
ON public.categories FOR SELECT TO public USING (true);

-- products: public read, admin write
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products"
ON public.products FOR SELECT TO public USING (true);

-- orders: users manage their own orders
DROP POLICY IF EXISTS "users_manage_own_orders" ON public.orders;
CREATE POLICY "users_manage_own_orders"
ON public.orders FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- order_items: users can read their own order items
DROP POLICY IF EXISTS "users_read_own_order_items" ON public.order_items;
CREATE POLICY "users_read_own_order_items"
ON public.order_items FOR SELECT TO authenticated
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 8. SEED DATA: CATEGORIES
-- ============================================================

INSERT INTO public.categories (id, name, name_vi, slug, description, is_active, sort_order) VALUES
    (gen_random_uuid(), 'Rings', 'Nhẫn', 'rings', 'Elegant rings for every occasion', true, 1),
    (gen_random_uuid(), 'Necklaces', 'Dây chuyền', 'necklaces', 'Beautiful necklaces and pendants', true, 2),
    (gen_random_uuid(), 'Earrings', 'Bông tai', 'earrings', 'Stunning earrings collection', true, 3),
    (gen_random_uuid(), 'Bracelets', 'Vòng tay', 'bracelets', 'Luxurious bracelets and bangles', true, 4),
    (gen_random_uuid(), 'Gift Boxes', 'Hộp quà tặng', 'gift-boxes', 'Curated jewelry gift sets', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 9. SEED DATA: 10 SAMPLE JEWELRY PRODUCTS
-- ============================================================

DO $$
DECLARE
    cat_rings UUID;
    cat_necklaces UUID;
    cat_earrings UUID;
    cat_bracelets UUID;
    cat_giftboxes UUID;
BEGIN
    SELECT id INTO cat_rings FROM public.categories WHERE slug = 'rings' LIMIT 1;
    SELECT id INTO cat_necklaces FROM public.categories WHERE slug = 'necklaces' LIMIT 1;
    SELECT id INTO cat_earrings FROM public.categories WHERE slug = 'earrings' LIMIT 1;
    SELECT id INTO cat_bracelets FROM public.categories WHERE slug = 'bracelets' LIMIT 1;
    SELECT id INTO cat_giftboxes FROM public.categories WHERE slug = 'gift-boxes' LIMIT 1;

    INSERT INTO public.products (
        id, category_id, name, name_vi, slug, description, description_vi,
        price, original_price, image_url, image_alt, sku,
        stock_quantity, is_active, is_new, is_best_seller, is_featured,
        material, tags
    ) VALUES

    -- 1. Diamond Solitaire Ring
    (
        gen_random_uuid(), cat_rings,
        'Diamond Solitaire Ring', 'Nhẫn Kim Cương Solitaire',
        'diamond-solitaire-ring',
        'A timeless 0.5ct round brilliant diamond set in 18k white gold. The classic four-prong setting elevates the stone for maximum brilliance and fire.',
        'Nhẫn kim cương tròn 0.5ct được đặt trong vàng trắng 18k. Thiết kế bốn chấu cổ điển tôn lên vẻ đẹp rực rỡ của viên đá.',
        28500000, 32000000,
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
        'Diamond solitaire ring with round brilliant cut stone in 18k white gold setting',
        'SKU-RING-001',
        15, true, true, true, true,
        '18K White Gold, 0.5ct Diamond',
        ARRAY['diamond', 'ring', 'solitaire', 'white-gold', 'bestseller']
    ),

    -- 2. Gold Chain Necklace
    (
        gen_random_uuid(), cat_necklaces,
        'Classic Gold Chain Necklace', 'Dây Chuyền Vàng Cổ Điển',
        'classic-gold-chain-necklace',
        'A delicate 45cm 18k yellow gold chain necklace featuring a fine cable link design. Perfect for everyday wear or layering with pendants.',
        'Dây chuyền vàng vàng 18k dài 45cm với thiết kế mắt xích tinh tế. Hoàn hảo để đeo hàng ngày hoặc kết hợp với mặt dây.',
        12800000, NULL,
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        'Delicate 18k yellow gold cable chain necklace 45cm length',
        'SKU-NECK-001',
        30, true, false, true, false,
        '18K Yellow Gold',
        ARRAY['necklace', 'gold', 'chain', 'everyday', 'bestseller']
    ),

    -- 3. Pearl Drop Earrings
    (
        gen_random_uuid(), cat_earrings,
        'Freshwater Pearl Drop Earrings', 'Bông Tai Ngọc Trai Nước Ngọt',
        'freshwater-pearl-drop-earrings',
        'Elegant drop earrings featuring 8mm freshwater pearls suspended from 14k gold posts. A sophisticated choice for formal occasions.',
        'Bông tai thả sang trọng với ngọc trai nước ngọt 8mm treo từ chốt vàng 14k. Lựa chọn tinh tế cho các dịp trang trọng.',
        8400000, 9800000,
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
        'Elegant freshwater pearl drop earrings with 14k gold posts',
        'SKU-EARR-001',
        25, true, true, false, false,
        '14K Gold, Freshwater Pearl 8mm',
        ARRAY['earrings', 'pearl', 'drop', 'gold', 'new']
    ),

    -- 4. Rose Gold Tennis Bracelet
    (
        gen_random_uuid(), cat_bracelets,
        'Rose Gold Diamond Tennis Bracelet', 'Vòng Tay Kim Cương Vàng Hồng',
        'rose-gold-diamond-tennis-bracelet',
        'A stunning 18k rose gold tennis bracelet set with 2.0ct total weight of round brilliant diamonds. Secure box clasp with safety latch.',
        'Vòng tay tennis vàng hồng 18k được đính 2.0ct tổng trọng lượng kim cương tròn rực rỡ. Khóa hộp an toàn với chốt bảo hiểm.',
        45600000, 52000000,
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
        'Rose gold tennis bracelet with round brilliant diamonds and box clasp',
        'SKU-BRAC-001',
        8, true, false, true, true,
        '18K Rose Gold, 2.0ct Diamond',
        ARRAY['bracelet', 'diamond', 'tennis', 'rose-gold', 'bestseller', 'luxury']
    ),

    -- 5. Sapphire Halo Ring
    (
        gen_random_uuid(), cat_rings,
        'Blue Sapphire Halo Ring', 'Nhẫn Hào Quang Sapphire Xanh',
        'blue-sapphire-halo-ring',
        'A magnificent 1.0ct oval blue sapphire surrounded by a halo of 0.3ct total weight diamonds, set in 18k white gold. Inspired by royal elegance.',
        'Sapphire xanh hình bầu dục 1.0ct tuyệt đẹp được bao quanh bởi vầng hào quang kim cương 0.3ct, đặt trong vàng trắng 18k.',
        38900000, 44000000,
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
        'Blue sapphire halo ring with diamond surround in 18k white gold',
        'SKU-RING-002',
        10, true, true, false, true,
        '18K White Gold, 1.0ct Sapphire, 0.3ct Diamond',
        ARRAY['ring', 'sapphire', 'halo', 'white-gold', 'new', 'luxury']
    ),

    -- 6. Gold Pendant Necklace
    (
        gen_random_uuid(), cat_necklaces,
        'Diamond Heart Pendant Necklace', 'Dây Chuyền Mặt Trái Tim Kim Cương',
        'diamond-heart-pendant-necklace',
        'A romantic 18k yellow gold heart-shaped pendant set with 0.15ct pavé diamonds on a 42cm chain. The perfect gift for someone special.',
        'Mặt dây chuyền hình trái tim vàng vàng 18k được đính 0.15ct kim cương pavé trên dây chuyền 42cm. Món quà hoàn hảo cho người thân yêu.',
        16200000, 18500000,
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        'Heart shaped diamond pendant necklace in 18k yellow gold on 42cm chain',
        'SKU-NECK-002',
        20, true, false, true, false,
        '18K Yellow Gold, 0.15ct Diamond',
        ARRAY['necklace', 'pendant', 'heart', 'diamond', 'gold', 'gift', 'bestseller']
    ),

    -- 7. Emerald Stud Earrings
    (
        gen_random_uuid(), cat_earrings,
        'Colombian Emerald Stud Earrings', 'Bông Tai Ngọc Lục Bảo Colombia',
        'colombian-emerald-stud-earrings',
        'Vivid green Colombian emerald studs totaling 0.8ct, set in 18k yellow gold four-prong settings. A bold and luxurious statement piece.',
        'Bông tai ngọc lục bảo Colombia xanh tươi tổng cộng 0.8ct, được đặt trong chấu vàng vàng 18k. Món trang sức táo bạo và sang trọng.',
        22400000, 26000000,
        'https://images.unsplash.com/photo-1573408301185-9519f94815b1?w=600&q=80',
        'Colombian emerald stud earrings in 18k yellow gold four-prong settings',
        'SKU-EARR-002',
        12, true, true, false, false,
        '18K Yellow Gold, 0.8ct Colombian Emerald',
        ARRAY['earrings', 'emerald', 'studs', 'gold', 'new', 'luxury']
    ),

    -- 8. Gold Bangle Bracelet
    (
        gen_random_uuid(), cat_bracelets,
        'Engraved Gold Bangle Bracelet', 'Vòng Tay Vàng Khắc Hoa Văn',
        'engraved-gold-bangle-bracelet',
        'A solid 18k yellow gold bangle bracelet with intricate floral engraving. Width 6mm, inner diameter 58mm. A timeless heirloom piece.',
        'Vòng tay vàng vàng 18k đặc với hoa văn hoa lá tinh xảo. Rộng 6mm, đường kính trong 58mm. Món trang sức truyền đời vượt thời gian.',
        19800000, NULL,
        'https://images.unsplash.com/photo-1573408301185-9519f94815b1?w=600&q=80',
        'Solid 18k yellow gold bangle bracelet with intricate floral engraving',
        'SKU-BRAC-002',
        18, true, false, false, false,
        '18K Yellow Gold',
        ARRAY['bracelet', 'bangle', 'gold', 'engraved', 'classic']
    ),

    -- 9. Ruby Cluster Ring
    (
        gen_random_uuid(), cat_rings,
        'Ruby and Diamond Cluster Ring', 'Nhẫn Cụm Ruby và Kim Cương',
        'ruby-diamond-cluster-ring',
        'A vibrant cluster ring featuring a 0.6ct Burmese ruby surrounded by 0.4ct total weight of brilliant-cut diamonds in 18k white gold.',
        'Nhẫn cụm rực rỡ với ruby Miến Điện 0.6ct được bao quanh bởi 0.4ct kim cương cắt rực rỡ trong vàng trắng 18k.',
        34200000, 38000000,
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
        'Ruby and diamond cluster ring with Burmese ruby center stone in 18k white gold',
        'SKU-RING-003',
        7, true, true, false, true,
        '18K White Gold, 0.6ct Ruby, 0.4ct Diamond',
        ARRAY['ring', 'ruby', 'diamond', 'cluster', 'white-gold', 'new', 'luxury']
    ),

    -- 10. Luxury Gift Box Set
    (
        gen_random_uuid(), cat_giftboxes,
        'Bridal Jewelry Gift Set', 'Bộ Trang Sức Cô Dâu Hộp Quà',
        'bridal-jewelry-gift-set',
        'A complete bridal jewelry set including a diamond pendant necklace, matching stud earrings, and a delicate bracelet, all in 18k white gold. Presented in a luxury velvet gift box.',
        'Bộ trang sức cô dâu hoàn chỉnh gồm dây chuyền mặt kim cương, bông tai đôi và vòng tay tinh tế, tất cả bằng vàng trắng 18k. Được đựng trong hộp nhung sang trọng.',
        68000000, 78000000,
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        'Complete bridal jewelry gift set with necklace earrings and bracelet in luxury velvet box',
        'SKU-GIFT-001',
        5, true, true, true, true,
        '18K White Gold, Diamond',
        ARRAY['gift-box', 'bridal', 'set', 'diamond', 'white-gold', 'new', 'bestseller', 'luxury']
    )

    ON CONFLICT (slug) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Seed data insertion failed: %', SQLERRM;
END $$;
