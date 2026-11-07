-- ==============================================================================
-- RGCITC - Rangpur Govt. College Information & Technology Club
-- Supabase Schema & Security (PostgreSQL + Row Level Security)
-- ==============================================================================

-- 1. Create table for Club Notices & Circulars
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Notice', -- 'Recruitment', 'Workshop', 'Contest', 'Notice'
    badge_class TEXT NOT NULL DEFAULT 'badge-general',
    author TEXT NOT NULL DEFAULT 'Executive Committee',
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create table for Student Registrations / Membership Applications
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
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on both tables
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Notices Policies:
-- 1. Anyone (public anonymous or authenticated) can view published notices.
-- 2. Only authenticated users (club executives / admins) can insert, update, or delete.
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- Registrations Policies:
-- 1. Any student (public / anon) can INSERT an application with status = 'pending'.
-- 2. Strictly ONLY authenticated executives can SELECT, UPDATE, or DELETE student applications.
-- ------------------------------------------------------------------------------
CREATE POLICY "Public students can submit membership application" 
ON public.registrations 
FOR INSERT 
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
-- Initial Seed Data for Notices
-- ==============================================================================
INSERT INTO public.notices (title, category, badge_class, author, content, is_pinned)
VALUES 
(
  'স্প্রিং ২০২৬ মেম্বারশিপ রিক্রুটমেন্ট ও ওরিয়েন্টেশন প্রোগ্রাম',
  'Recruitment',
  'badge-urgent',
  'Executive Committee',
  'রংপুর সরকারি কলেজ আইসিটি ক্লাবের ২০২৬ সেশনের সদস্য নিয়োগ কার্যক্রম শুরু হয়েছে। কলেজ প্রাঙ্গণে আধুনিক সফটওয়্যার ইঞ্জিনিয়ারিং, কম্পিটিটিভ প্রোগ্রামিং, অ্যাপ ডেভেলপমেন্ট ও রোবোটিক্স উইংয়ে যুক্ত হতে আগ্রহী শিক্ষার্থীরা অনলাইনের মাধ্যমে ফর্ম পূরণ করতে পারবে। সফলভাবে নিবন্ধিত শিক্ষার্থীদের ইমেইল ও এসএমএস এর মাধ্যমে ওরিয়েন্টেশন সেশনের তারিখ জানানো হবে।',
  true
),
(
  'ইন্টার-কলেজ প্রোগ্রামিং ক্যাম্প ও বুটক্যাম্প ২০২৬',
  'Workshop',
  'badge-workshop',
  'CP Wing Lead',
  'সকল উইংয়ের শিক্ষার্থীদের জন্য ৩ দিনব্যাপী অ্যালগরিদম ও সি/সি++ প্রবলেম সলভিং বুটক্যাম্প অনুষ্ঠিত হতে যাচ্ছে আইসিটি ল্যাবে। ল্যাবের আসন সংখ্যা সীমিত হওয়ায় পূর্বে রেজিস্ট্রেশন সম্পন্ন করা আবশ্যক।',
  false
),
(
  'রোবোটিক্স অ্যান্ড আইওটি ল্যাব হ্যান্ডস-অন সেশন শিডিউল',
  'Notice',
  'badge-general',
  'Robotics Wing',
  'Arduino Uno এবং ESP32 মাইক্রোকন্ট্রোলার নিয়ে আগামী শনিবার ক্লাবের রোবোটিক্স ল্যাবে প্র্যাকটিক্যাল সেশন অনুষ্ঠিত হবে। লাইন ফলোয়ার ও আইওটি হোম অটোমেশনের প্রাথমিক ধারণা প্রদান করা হবে।',
  false
)
ON CONFLICT DO NOTHING;
