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
    is_locked BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
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
    friend_code TEXT,
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

-- 6. NOTE_SHARES (Not Paylaşım ve Davet) Tablosunu Oluştur
CREATE TABLE IF NOT EXISTS public.note_shares (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    note_id TEXT NOT NULL,
    from_code TEXT NOT NULL,
    from_name TEXT,
    to_code TEXT NOT NULL,
    to_name TEXT,
    note_title TEXT DEFAULT '',
    note_blocks JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'revoked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_note_shares_to_code ON public.note_shares (to_code, status);
CREATE INDEX IF NOT EXISTS idx_note_shares_from_code ON public.note_shares (from_code);
CREATE INDEX IF NOT EXISTS idx_note_shares_note_id ON public.note_shares (note_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_shared ON public.notes (is_shared);

-- 7. Otomatik Kullanıcı Profili Oluşturma Trigger'ı (Google OAuth Sync)
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

-- 8. Önceden Giriş Yapmış Olan Mevcut Tüm Kullanıcıları Profillere Aktar
INSERT INTO public.profiles (id, email, name, photo_url, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url',
  created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 9. RLS Güvenlik Politikalarını Aktif Et ve Kuralları Tanımla
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "Public note_shares access" ON public.note_shares;

-- 1) FOLDERS
CREATE POLICY "Users can manage own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2) NOTES: Kullanıcı kendi notlarını yönetebilir; paylaşılan notları katılımcılar da okuyup güncelleyebilir
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id OR is_shared = true)
  WITH CHECK (auth.uid() = user_id OR is_shared = true);

-- 3) REMINDERS
CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5) FRIEND_REQUESTS
CREATE POLICY "Everyone can view friend requests" ON public.friend_requests FOR SELECT USING (true);
CREATE POLICY "Everyone can insert friend requests" ON public.friend_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update friend requests" ON public.friend_requests FOR UPDATE USING (true);
CREATE POLICY "Everyone can delete friend requests" ON public.friend_requests FOR DELETE USING (true);

-- 6) NOTE_SHARES
CREATE POLICY "Public note_shares access" ON public.note_shares FOR ALL USING (true) WITH CHECK (true);

-- 10. REALTIME YAYINI (Realtime Publication)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.note_shares;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
