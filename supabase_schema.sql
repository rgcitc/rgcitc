-- ==============================================================================
-- RGCITC - Rangpur Govt. College Information & Technology Club
-- Fully Idempotent & Re-runnable Supabase Schema & Security
-- Drops tables cleanly using CASCADE or handles policies seamlessly
-- ==============================================================================

-- 1. Create tables if not exists
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Notice',
    badge_class TEXT NOT NULL DEFAULT 'badge-general',
    author TEXT NOT NULL DEFAULT 'Executive Committee',
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    roll TEXT NOT NULL,
    session TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    wings TEXT[] NOT NULL DEFAULT '{}',
    statement TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE PRIVILEGES
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.notices TO anon;
GRANT ALL ON public.notices TO authenticated;

GRANT INSERT ON public.registrations TO anon;
GRANT ALL ON public.registrations TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- DROP ALL EXISTING POLICIES FIRST (Guaranteed to avoid duplicate policy error)
-- ==============================================================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename IN ('notices', 'registrations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- RECREATE POLICIES CLEANLY
-- ==============================================================================

-- Notices Policies
CREATE POLICY "Public notices are viewable by everyone" 
ON public.notices 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated admins can insert notices" 
ON public.notices 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Only authenticated admins can update notices" 
ON public.notices 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated admins can delete notices" 
ON public.notices 
FOR DELETE 
TO authenticated 
USING (true);

-- Registrations Policies
CREATE POLICY "Public students can submit membership application" 
ON public.registrations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
    status = 'pending' 
    AND full_name <> '' 
    AND roll <> '' 
    AND email <> ''
    AND array_length(wings, 1) > 0
);

CREATE POLICY "Only authenticated admins can view registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated admins can update registrations" 
ON public.registrations 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated admins can delete registrations" 
ON public.registrations 
FOR DELETE 
TO authenticated 
USING (true);

-- ==============================================================================
-- Seed Data (Safe: Inserts only if title doesn't exist)
-- ==============================================================================
INSERT INTO public.notices (title, category, badge_class, author, content, is_pinned)
SELECT 
  'স্প্রিং ২০২৬ মেম্বারশিপ রিক্রুটমেন্ট ও ওরিয়েন্টেশন প্রোগ্রাম',
  'Recruitment',
  'badge-urgent',
  'Executive Committee',
  'রংপুর সরকারি কলেজ আইসিটি ক্লাবের ২০২৬ সেশনের সদস্য নিয়োগ কার্যক্রম শুরু হয়েছে। কলেজ প্রাঙ্গণে আধুনিক সফটওয়্যার ইঞ্জিনিয়ারিং, কম্পিটিティブ প্রোগ্রামিং, অ্যাপ ডেভেলপমেন্ট ও রোবোটিক্স উইংয়ে যুক্ত হতে আগ্রহী শিক্ষার্থীরা অনলাইনের মাধ্যমে ফর্ম পূরণ করতে পারবে। সফলভাবে নিবন্ধিত শিক্ষার্থীদের ইমেইল ও এসএমএস এর মাধ্যমে ওরিয়েন্টেশন সেশনের তারিখ জানানো হবে।',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.notices WHERE title = 'স্প্রিং ২০২৬ মেম্বারশিপ রিক্রুটমেন্ট ও ওরিয়েন্টেশন প্রোগ্রাম'
);

INSERT INTO public.notices (title, category, badge_class, author, content, is_pinned)
SELECT 
  'ইন্টার-কলেজ প্রোগ্রামিং ক্যাম্প ও বুটক্যাম্প ২০২৬',
  'Workshop',
  'badge-workshop',
  'CP Wing Lead',
  'সকল উইংয়ের শিক্ষার্থীদের জন্য ৩ দিনব্যাপী অ্যালগরিদম ও সি/সি++ প্রবলেম সলভিং বুটক্যাম্প অনুষ্ঠিত হতে যাচ্ছে আইসিটি ল্যাবে। ল্যাবের আসন সংখ্যা সীমিত হওয়ায় পূর্বে রেজিস্ট্রেশন সম্পন্ন করা আবশ্যক।',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.notices WHERE title = 'ইন্টার-কলেজ প্রোগ্রামিং ক্যাম্প ও বুটক্যাম্প ২০২৬'
);

INSERT INTO public.notices (title, category, badge_class, author, content, is_pinned)
SELECT 
  'রোবোটিক্স অ্যান্ড আইওটি ল্যাব হ্যান্ডস-অন সেশন শিডিউল',
  'Notice',
  'badge-general',
  'Robotics Wing',
  'Arduino Uno এবং ESP32 মাইক্রোকন্ট্রোলার নিয়ে আগামী শনিবার ক্লাবের রোবোটিক্স ল্যাবে প্র্যাকটিক্যাল সেশন অনুষ্ঠিত হবে। লাইন ফলোয়ার ও আইওটি হোম অটোমেশনের প্রাথমিক ধারণা প্রদান করা হবে।',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.notices WHERE title = 'রোবোটিক্স অ্যান্ড আইওটি ল্যাব হ্যান্ডস-অন সেশন শিডিউল'
);
