-- ====================================================================
-- CREATE FANTASY MAP — ULTIMATE MASTER SUPABASE DATABASE SCHEMA
-- Execute this script in Supabase Dashboard -> SQL Editor
-- Includes all 32 Tables, Foreign Keys, Indexes, and RLS Security Policies
-- ORDER: 1. Tables -> 2. Indexes -> 3. RLS Enable -> 4. Drop Policies -> 5. Create Policies
-- ====================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MAPS TABLE
CREATE TABLE IF NOT EXISTS public.maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  map_data JSONB NOT NULL,
  map_type TEXT NOT NULL,
  map_style TEXT NOT NULL,
  seed BIGINT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  remix_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MAP VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.map_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  map_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MAP LIKES TABLE
CREATE TABLE IF NOT EXISTS public.map_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(map_id, user_id)
);

-- 5. MAP REMIXES TABLE
CREATE TABLE IF NOT EXISTS public.map_remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_map_id UUID REFERENCES public.maps(id) ON DELETE SET NULL,
  remixed_map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLANS TABLE (SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly NUMERIC NOT NULL,
  price_annual NUMERIC NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'month',
  description TEXT,
  credits_per_month INT NOT NULL DEFAULT 5,
  max_saved_maps INT NOT NULL DEFAULT 10,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'lemon_squeezy',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  plan_id TEXT REFERENCES public.plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 9. USAGE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CREDIT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WORLDS TABLE
CREATE TABLE IF NOT EXISTS public.worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  style TEXT NOT NULL DEFAULT 'classic',
  cover_image TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REGIONS TABLE
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  map_id UUID REFERENCES public.maps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  region_type TEXT NOT NULL,
  climate TEXT,
  terrain TEXT,
  population INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WORLD KINGDOMS TABLE
CREATE TABLE IF NOT EXISTS public.world_kingdoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  ruler TEXT,
  government TEXT NOT NULL DEFAULT 'Monarchy',
  capital_city_id UUID,
  culture TEXT,
  economy TEXT,
  military_strength TEXT,
  color TEXT DEFAULT '#d4af37',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. WORLD CITIES TABLE
CREATE TABLE IF NOT EXISTS public.world_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  kingdom_id UUID REFERENCES public.world_kingdoms(id) ON DELETE SET NULL,
  map_id UUID REFERENCES public.maps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city_type TEXT NOT NULL DEFAULT 'Major City',
  description TEXT,
  population INT DEFAULT 10000,
  government TEXT,
  economy TEXT,
  culture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  map_id UUID REFERENCES public.maps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  danger_level TEXT DEFAULT 'Moderate',
  secrets TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.factions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  goals TEXT,
  ideology TEXT,
  headquarters TEXT,
  leader TEXT,
  resources TEXT,
  influence TEXT DEFAULT 'Regional',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CHARACTERS TABLE
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  role TEXT NOT NULL,
  description TEXT,
  age INT DEFAULT 30,
  personality TEXT,
  appearance TEXT,
  background TEXT,
  goals TEXT,
  fears TEXT,
  faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
  kingdom_id UUID REFERENCES public.world_kingdoms(id) ON DELETE SET NULL,
  city_id UUID REFERENCES public.world_cities(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Alive',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ENTITY RELATIONSHIPS TABLE (WORLD BIBLE KNOWLEDGE GRAPH)
CREATE TABLE IF NOT EXISTS public.entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  source_entity_id UUID NOT NULL,
  source_entity_type TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  target_entity_id UUID NOT NULL,
  target_entity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  canon_status TEXT DEFAULT 'canon',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. LORE ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.lore_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Overview',
  content TEXT NOT NULL,
  canon_status TEXT DEFAULT 'canon',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  year_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Discovery',
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL DEFAULT 'Main Quest',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open',
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  rewards TEXT,
  consequences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  system TEXT DEFAULT 'D&D 5e',
  genre TEXT DEFAULT 'Epic Fantasy',
  status TEXT DEFAULT 'Planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. CAMPAIGN MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- 24. CAMPAIGN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  summary TEXT,
  status TEXT DEFAULT 'Planned',
  elapsed_time_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. SESSION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.campaign_sessions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  is_gm_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. PLAYER DECISIONS TABLE
CREATE TABLE IF NOT EXISTS public.player_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  character_name TEXT NOT NULL,
  decision_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  gm_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. FACTION REPUTATION TABLE
CREATE TABLE IF NOT EXISTS public.faction_reputations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  faction_id UUID REFERENCES public.factions(id) ON DELETE CASCADE,
  reputation_score INT DEFAULT 0,
  standing TEXT DEFAULT 'Neutral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, faction_id)
);

-- 28. STORY THREADS TABLE
CREATE TABLE IF NOT EXISTS public.story_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'unresolved',
  resolved_in_session INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. CAMPAIGN HANDOUTS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_handouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'letter',
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. AI PROVIDER CONFIGS TABLE (ADMIN)
CREATE TABLE IF NOT EXISTS public.ai_provider_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  masked_api_key TEXT,
  default_model TEXT,
  fast_model TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. FEATURE FLAGS TABLE (ADMIN)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT TRUE,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. AUDIT LOGS TABLE (ADMIN)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON public.maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_is_public ON public.maps(is_public);
CREATE INDEX IF NOT EXISTS idx_maps_slug ON public.maps(slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_worlds_user_id ON public.worlds(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user ON public.campaign_members(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_world ON public.entity_relationships(world_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_kingdoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SAFE DROP EXISTING POLICIES AFTER TABLES EXIST (PREVENTS 42P01 ERRORS)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public maps viewable by anyone" ON public.maps;
DROP POLICY IF EXISTS "Users insert own maps" ON public.maps;
DROP POLICY IF EXISTS "Users update own maps" ON public.maps;
DROP POLICY IF EXISTS "Users delete own maps" ON public.maps;
DROP POLICY IF EXISTS "Public plans readable by everyone" ON public.plans;
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Public worlds viewable by everyone" ON public.worlds;
DROP POLICY IF EXISTS "Users insert own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users update own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Campaign members view campaigns" ON public.campaigns;

-- RLS POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public maps viewable by anyone" ON public.maps FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own maps" ON public.maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own maps" ON public.maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own maps" ON public.maps FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public plans readable by everyone" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public worlds viewable by everyone" ON public.worlds FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own worlds" ON public.worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own worlds" ON public.worlds FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Campaign members view campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
