-- ==========================================
-- NOTEUP COMPLETE SUPABASE DATABASE SETUP
-- ==========================================

-- 1. FOLDERS (Klasörler) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT
);

-- 2. NOTES (Notlar) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
    title TEXT DEFAULT '',
    blocks JSONB DEFAULT '[]'::jsonb,
    is_shared BOOLEAN DEFAULT false,
    deleted_at BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REMINDERS (Hatırlatıcılar) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.reminders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    note_id TEXT REFERENCES public.notes(id) ON DELETE CASCADE,
    time TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

-- 4. PROFILES (Kullanıcı Profilleri) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    photo_url TEXT,
    plan TEXT DEFAULT 'lite',
    status TEXT DEFAULT 'active',
    my_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FRIEND_REQUESTS (Arkadaşlık İstekleri) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    from_code TEXT NOT NULL,
    from_name TEXT,
    to_code TEXT NOT NULL,
    to_name TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Otomatik Kullanıcı Profili Oluşturma Trigger'ı (Google OAuth Sync)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, photo_url, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url),
    last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Önceden Giriş Yapmış Olan Mevcut Tüm Kullanıcıları Profillere Aktar
INSERT INTO public.profiles (id, email, name, photo_url, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 8. RLS Güvenlik Politikalarını Aktif Et ve Kuralları Tanımla
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Eski Politikaları Temizle (Çakışmayı önlemek için)
DROP POLICY IF EXISTS "Users can manage own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can manage own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Everyone can insert friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Everyone can update friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Everyone can delete friend requests" ON public.friend_requests;

-- 1) FOLDERS: Kullanıcı sadece kendi klasörlerini görebilir ve yönetebilir
CREATE POLICY "Users can manage own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2) NOTES: Kullanıcı kendi notlarını veya ortak paylaşılan notları görebilir
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id OR is_shared = true)
  WITH CHECK (auth.uid() = user_id);

-- 3) REMINDERS: Kullanıcı sadece kendi hatırlatıcılarını yönetebilir
CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) PROFILES: Arkadaş ekleme için herkes bir başkasının profilini arayabilir (SELECT), fakat sadece kendi profilini güncelleyebilir (UPDATE)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5) FRIEND_REQUESTS: Arkadaşlık istekleri yönetimi
CREATE POLICY "Everyone can view friend requests" ON public.friend_requests FOR SELECT USING (true);
CREATE POLICY "Everyone can insert friend requests" ON public.friend_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update friend requests" ON public.friend_requests FOR UPDATE USING (true);
CREATE POLICY "Everyone can delete friend requests" ON public.friend_requests FOR DELETE USING (true);

