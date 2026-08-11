-- CREATE FANTASY MAP — SUPABASE DATABASE SCHEMA & RLS POLICIES

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON public.maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_is_public ON public.maps(is_public);
CREATE INDEX IF NOT EXISTS idx_maps_slug ON public.maps(slug);
CREATE INDEX IF NOT EXISTS idx_maps_created_at ON public.maps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maps_view_count ON public.maps(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_map_likes_map_user ON public.map_likes(map_id, user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Public readable, update own only
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Maps: Public maps viewable by anyone, Private viewable by owner only
CREATE POLICY "Public maps are viewable by anyone" ON public.maps FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own maps" ON public.maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maps" ON public.maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own maps" ON public.maps FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Likes viewable by everyone" ON public.map_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.map_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.map_likes FOR DELETE USING (auth.uid() = user_id);

-- Remixes
CREATE POLICY "Remixes viewable by everyone" ON public.map_remixes FOR SELECT USING (true);
CREATE POLICY "Users can insert own remixes" ON public.map_remixes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
