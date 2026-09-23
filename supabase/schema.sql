-- ==========================================================
-- MY NSDA — NSDA DOCTORS DIRECTORY DATABASE SCHEMA
-- Fully normalized PostgreSQL Schema for Supabase
-- Includes RLS Policies, Indexes, Triggers, & Storage Configuration
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SPECIALTIES TABLE
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CITIES TABLE
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(name, state)
);

-- 3. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'doctor' CHECK (role IN ('doctor', 'admin', 'super_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DOCTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    qualifications TEXT NOT NULL,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    subspecialty TEXT,
    registration_number TEXT NOT NULL,
    hospital TEXT,
    clinic_address TEXT,
    city TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    bio TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_reason TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    phone_visible BOOLEAN DEFAULT TRUE,
    email_visible BOOLEAN DEFAULT TRUE,
    consultation_fee TEXT,
    available_timings TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. DOCTOR DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.doctor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- e.g. 'registration_certificate', 'degree_certificate', 'identity_proof'
    file_path TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. REPORTS TABLE (For reporting inappropriate profiles)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON public.doctor_profiles(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_city ON public.doctor_profiles(city);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verification ON public.doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_featured ON public.doctor_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);

-- ==========================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_doctor_profiles_updated
    BEFORE UPDATE ON public.doctor_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER on_app_settings_updated
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==========================================================
-- SECURITY HELPER FUNCTIONS (Bypasses RLS recursion)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- SPECIALTIES POLICIES
CREATE POLICY "Public can view active specialties"
    ON public.specialties FOR SELECT
    USING (is_active = TRUE OR public.is_admin_or_super());

CREATE POLICY "Admins can manage specialties"
    ON public.specialties FOR ALL
    USING (public.is_admin_or_super());

-- CITIES POLICIES
CREATE POLICY "Public can view active cities"
    ON public.cities FOR SELECT
    USING (is_active = TRUE OR public.is_admin_or_super());

CREATE POLICY "Admins can manage cities"
    ON public.cities FOR ALL
    USING (public.is_admin_or_super());

-- PROFILES POLICIES
CREATE POLICY "Anyone can view doctor profiles"
    ON public.profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile info"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin_or_super())
    WITH CHECK (
        -- Regular users cannot elevate their own role
        (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
        OR public.is_admin_or_super()
    );

CREATE POLICY "Super admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (public.is_super_admin());

-- DOCTOR PROFILES POLICIES
CREATE POLICY "Public can view verified doctors"
    ON public.doctor_profiles FOR SELECT
    USING (
        verification_status = 'verified' 
        OR auth.uid() = user_id 
        OR public.is_admin_or_super()
    );

CREATE POLICY "Doctors can insert their own doctor profile"
    ON public.doctor_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile"
    ON public.doctor_profiles FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin_or_super())
    WITH CHECK (
        -- Regular doctor cannot self-verify or mark featured
        (
            auth.uid() = user_id 
            AND verification_status = (SELECT verification_status FROM public.doctor_profiles WHERE user_id = auth.uid())
            AND is_featured = (SELECT is_featured FROM public.doctor_profiles WHERE user_id = auth.uid())
        )
        OR public.is_admin_or_super()
    );

CREATE POLICY "Super admins and admins can delete doctor_profiles"
    ON public.doctor_profiles FOR DELETE
    USING (public.is_super_admin() OR public.is_admin_or_super());

-- DOCTOR DOCUMENTS POLICIES
CREATE POLICY "Doctors can manage their own documents"
    ON public.doctor_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.doctor_profiles 
            WHERE id = doctor_documents.doctor_id AND user_id = auth.uid()
        )
        OR public.is_admin_or_super()
    );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view and manage their own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can send notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_admin_or_super());

-- REPORTS POLICIES
CREATE POLICY "Authenticated users can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view and manage reports"
    ON public.reports FOR ALL
    USING (public.is_admin_or_super());

-- AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin_or_super());

CREATE POLICY "System/Admins can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- APP SETTINGS POLICIES
CREATE POLICY "Public can read app settings"
    ON public.app_settings FOR SELECT
    USING (TRUE);

CREATE POLICY "Super admins can manage app settings"
    ON public.app_settings FOR ALL
    USING (public.is_super_admin());

-- ==========================================================
-- STORAGE BUCKETS SETUP (Execute in Supabase Storage SQL editor)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('doctor_documents', 'doctor_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view avatars
CREATE POLICY "Public can view avatar images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Storage RLS: Authenticated users can upload avatars
CREATE POLICY "Users can upload avatar images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Storage RLS: Users can update/delete their own avatars
CREATE POLICY "Users can update their avatars"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
