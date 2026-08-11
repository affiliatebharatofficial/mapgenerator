-- ====================================================================
-- GRANT ADMIN ROLE TO affiliatebharatofficial@gmail.com
-- ====================================================================

-- 1. Update Profiles table if user exists
UPDATE public.profiles
SET bio = 'System Administrator & Master Cartographer'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'affiliatebharatofficial@gmail.com'
);

-- 2. Grant superuser / admin metadata in auth.users
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin", "is_admin": true}'::jsonb,
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "is_admin": true}'::jsonb
WHERE email = 'affiliatebharatofficial@gmail.com';
