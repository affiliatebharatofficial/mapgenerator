-- CREATE FANTASY MAP — PHASE 21 DATABASE SCHEMA (AI IMAGE STUDIO & ASSET LIBRARY)

-- 1. IMAGE ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.image_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'generated', -- 'generated' | 'uploaded'
  provider TEXT NOT NULL DEFAULT 'Runware AI',
  model TEXT NOT NULL DEFAULT 'runware:100@1',
  prompt TEXT NOT NULL,
  style TEXT,
  width INT NOT NULL DEFAULT 1024,
  height INT NOT NULL DEFAULT 1024,
  format TEXT NOT NULL DEFAULT 'WEBP',
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  credits_charged INT DEFAULT 5,
  provider_cost NUMERIC(10, 6) DEFAULT 0.0015,
  world_id UUID REFERENCES public.worlds(id) ON DELETE SET NULL,
  entity_type TEXT, -- 'world_cover' | 'artistic_map_render' | 'character' | 'location' | 'adventure' | 'campaign'
  entity_id TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSET USAGES TABLE (ENTITY ASSOCIATIONS)
CREATE TABLE IF NOT EXISTS public.asset_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.image_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'world' | 'map' | 'npc' | 'location' | 'adventure' | 'campaign'
  entity_id TEXT NOT NULL,
  usage_type TEXT NOT NULL DEFAULT 'artwork', -- 'cover' | 'portrait' | 'artwork' | 'lore' | 'map_banner'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, entity_type, entity_id, usage_type)
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_image_assets_user_id ON public.image_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_image_assets_favorite ON public.image_assets(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_image_assets_world ON public.image_assets(world_id);
CREATE INDEX IF NOT EXISTS idx_asset_usages_asset ON public.asset_usages(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usages_entity ON public.asset_usages(entity_type, entity_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.image_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usages ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES SAFELY
DROP POLICY IF EXISTS "Users view own assets or public world assets" ON public.image_assets;
DROP POLICY IF EXISTS "Users insert own assets" ON public.image_assets;
DROP POLICY IF EXISTS "Users update own assets" ON public.image_assets;
DROP POLICY IF EXISTS "Users delete own assets" ON public.image_assets;
DROP POLICY IF EXISTS "Users manage own asset usages" ON public.asset_usages;

-- RLS POLICIES
CREATE POLICY "Users view own assets or public world assets" ON public.image_assets
  FOR SELECT USING (auth.uid() = user_id OR is_archived = false);

CREATE POLICY "Users insert own assets" ON public.image_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own assets" ON public.image_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own assets" ON public.image_assets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own asset usages" ON public.asset_usages
  FOR ALL USING (auth.uid() = user_id);
