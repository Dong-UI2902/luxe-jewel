-- ============================================================
-- Remove role column from user_profiles
-- Admin role is now managed via Supabase app_metadata
-- ============================================================

-- 1. Drop the role column from user_profiles
ALTER TABLE public.user_profiles
DROP COLUMN IF EXISTS role;

-- 2. Drop the user_role enum type (no longer needed)
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 3. Update handle_new_user trigger function to not insert role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
