-- ==========================================================
-- MY NSDA — SEED DATA SCRIPT
-- Seeds default Specialties, Cities, Content Settings, and Sample Doctors
-- ==========================================================

-- 1. SEED SPECIALTIES
INSERT INTO public.specialties (name, slug, is_active) VALUES
('Orthopaedic', 'orthopaedic', true),
('Surgeon', 'surgeon', true),
('Physician', 'physician', true),
('Cardiologist', 'cardiologist', true),
('Dermatologist', 'dermatologist', true),
('Pediatrician', 'pediatrician', true),
('Neurologist', 'neurologist', true),
('Gynecologist', 'gynecologist', true),
('Ophthalmologist', 'ophthalmologist', true),
('ENT Specialist', 'ent-specialist', true),
('Dentist', 'dentist', true),
('Psychiatrist', 'psychiatrist', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED CITIES
INSERT INTO public.cities (name, state, is_active) VALUES
('Mumbai', 'Maharashtra', true),
('Delhi', 'Delhi', true),
('Bangalore', 'Karnataka', true),
('Hyderabad', 'Telangana', true),
('Chennai', 'Tamil Nadu', true),
('Kolkata', 'West Bengal', true),
('Pune', 'Maharashtra', true),
('Ahmedabad', 'Gujarat', true),
('Jaipur', 'Rajasthan', true),
('Lucknow', 'Uttar Pradesh', true),
('Chandigarh', 'Punjab', true),
('Indore', 'Madhya Pradesh', true)
ON CONFLICT (name, state) DO NOTHING;

-- 3. SEED APP SETTINGS (Public Content)
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
('about_nsda', '{
    "title": "About National Society for Doctors Association (NSDA)",
    "description": "NSDA is a premier professional medical association dedicated to empowering medical practitioners, facilitating peer collaboration, providing healthcare networking, and offering patients verified access to trusted doctors across India.",
    "founded_year": "1998",
    "total_members": "12,500+",
    "email": "contact@nsda.org.in",
    "phone": "+91 22 2847 9000",
    "address": "NSDA Bhavan, Medical Enclave, Central Avenue, New Delhi, India"
}'::jsonb),
('terms_privacy', '{
    "terms": "By accessing the MY NSDA Directory, users agree to respect medical ethics, protect doctor privacy, and use contact information strictly for authentic professional or healthcare consultation inquiries. Misuse of doctor contacts is strictly prohibited and subject to legal action.",
    "privacy": "Doctor contact privacy is respected. Doctors have full control over the public visibility of their personal contact numbers and email addresses. Verification documents are strictly encrypted and accessible solely by authorized NSDA verification committees.",
    "last_updated": "2026-01-15"
}'::jsonb),
('help_support', '{
    "support_email": "support@nsda.org.in",
    "emergency_helpline": "+91 1800 200 4567",
    "whatsapp_support": "+91 98200 12345",
    "operating_hours": "Monday to Saturday: 9:00 AM - 7:00 PM IST",
    "faq": [
        {"q": "How does a doctor get verified?", "a": "Upload your State Medical Council registration certificate. Our verification board reviews it within 24-48 hours."},
        {"q": "Can I hide my phone number?", "a": "Yes, in your Doctor Dashboard under privacy settings, you can toggle public visibility for your phone and email."},
        {"q": "Who can register?", "a": "Any certified medical doctor holding an MBBS or recognized post-graduate degree in modern medicine."}
    ]
}'::jsonb)
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value;

-- ==========================================================
-- BOOTSTRAP INSTRUCTIONS FOR SUPER ADMIN:
-- 1. Create a user via Supabase Dashboard Auth > Users or via Signup.
-- 2. Run the query below with your user UUID:
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE email = 'your-admin-email@domain.com';
-- ==========================================================
