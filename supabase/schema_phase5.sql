-- CREATE FANTASY MAP — PHASE 5 DATABASE SCHEMA (WORLDBUILDING & LORE)

-- 1. WORLDS TABLE
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

-- 2. REGIONS TABLE
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

-- 3. WORLD KINGDOMS TABLE
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

-- 4. WORLD CITIES TABLE
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

-- 5. LOCATIONS TABLE
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

-- 6. FACTIONS TABLE
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

-- 7. FACTION RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.faction_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  source_faction_id UUID REFERENCES public.factions(id) ON DELETE CASCADE,
  target_faction_id UUID REFERENCES public.factions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'Neutral',
  notes TEXT,
  UNIQUE(source_faction_id, target_faction_id)
);

-- 8. CHARACTERS TABLE
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

-- 9. CHARACTER RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  source_character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  target_character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'Ally',
  notes TEXT,
  UNIQUE(source_character_id, target_character_id)
);

-- 10. LORE ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.lore_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Overview',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TIMELINE EVENTS TABLE
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

-- 12. QUESTS TABLE
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

-- ROW LEVEL SECURITY (RLS) POLICIES
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

CREATE POLICY "Public worlds viewable by everyone" ON public.worlds FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own worlds" ON public.worlds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own worlds" ON public.worlds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own worlds" ON public.worlds FOR DELETE USING (auth.uid() = user_id);
