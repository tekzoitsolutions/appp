import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalDoctors, saveLocalDoctors, addLocalAuditLog } from './storageService';

const LOCAL_AUTH_KEY = 'my_nsda_auth_session';

// Pre-seeded demo credentials for immediate testing
export const DEMO_USERS = {
  doctor: {
    id: 'user-doc-1',
    email: 'dr.sharma@nsda.org.in',
    full_name: 'Dr. Rajesh Sharma',
    role: 'doctor',
    phone: '+91 98201 44552',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
    doctor_profile_id: 'doc-1',
  },
  admin: {
    id: 'user-admin-1',
    email: 'admin@nsda.org.in',
    full_name: 'NSDA Admin Officer',
    role: 'admin',
    phone: '+91 22 2847 9001',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
  },
  super_admin: {
    id: 'user-super-1',
    email: 'superadmin@nsda.org.in',
    full_name: 'National Director (Super Admin)',
    role: 'super_admin',
    phone: '+91 22 2847 9000',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
  },
};

export const getStoredAuthSession = () => {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredAuthSession = (session) => {
  if (session) {
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(LOCAL_AUTH_KEY);
  }
};

export const loginWithCredentials = async (email, password) => {
  // If Supabase is configured, use real Supabase Auth
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Fetch user profile from public.profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      console.warn('Profile fetch error, using default role', profileErr);
    }

    const session = {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || 'Doctor',
        role: profile?.role || 'doctor',
        avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url || null,
        phone: profile?.phone || '',
      },
      token: data.session.access_token,
    };
    setStoredAuthSession(session);
    return session;
  }

  // Graceful offline/demo mode authentication
  const lower = email.toLowerCase().trim();
  let matchedUser = null;

  if (lower.includes('super')) {
    matchedUser = DEMO_USERS.super_admin;
  } else if (lower.includes('admin')) {
    matchedUser = DEMO_USERS.admin;
  } else {
    // Check if it's Dr. Sharma or another doctor in local storage
    const docs = getLocalDoctors();
    const foundDoc = docs.find((d) => d.email?.toLowerCase() === lower);
    if (foundDoc) {
      matchedUser = {
        id: foundDoc.user_id,
        email: foundDoc.email,
        full_name: foundDoc.full_name,
        role: 'doctor',
        phone: foundDoc.phone,
        avatar_url: foundDoc.avatar_url,
        doctor_profile_id: foundDoc.id,
        verification_status: foundDoc.verification_status,
      };
    } else {
      // Default to demo doctor
      matchedUser = {
        id: 'user-' + Date.now(),
        email: lower,
        full_name: lower.split('@')[0].replace('.', ' ').replace(/^./, (s) => s.toUpperCase()),
        role: 'doctor',
        phone: '+91 98000 00000',
        avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        verification_status: 'pending',
      };
    }
  }

  const session = {
    user: matchedUser,
    token: 'mock-token-' + Date.now(),
  };
  setStoredAuthSession(session);
  addLocalAuditLog('LOGIN', matchedUser.full_name, 'Auth System', `User logged in with role: ${matchedUser.role}`);
  return session;
};

export const registerDoctorAccount = async (doctorData) => {
  // If Supabase is configured
  if (isSupabaseConfigured() && supabase) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: doctorData.email,
      password: doctorData.password,
      options: {
        data: {
          full_name: doctorData.fullName,
          phone: doctorData.phone,
          role: 'doctor',
        },
      },
    });

    if (authError) throw authError;

    const userId = authData.user?.id;
    if (userId) {
      // Insert into public.profiles
      await supabase.from('profiles').insert([
        {
          id: userId,
          user_id: userId,
          full_name: doctorData.fullName,
          email: doctorData.email,
          phone: doctorData.phone,
          avatar_url: doctorData.avatarUrl || null,
          role: 'doctor',
          status: 'active',
        },
      ]);

      // Insert into public.doctor_profiles
      const { data: docProfile, error: docError } = await supabase
        .from('doctor_profiles')
        .insert([
          {
            user_id: userId,
            qualifications: doctorData.qualifications,
            specialty_id: doctorData.specialtyId || null,
            subspecialty: doctorData.subspecialty || '',
            registration_number: doctorData.registrationNumber,
            hospital: doctorData.hospital || '',
            clinic_address: doctorData.clinicAddress || '',
            city: doctorData.city,
            experience_years: parseInt(doctorData.experienceYears, 10) || 0,
            bio: doctorData.bio || '',
            verification_status: 'pending',
            is_featured: false,
            is_online: true,
            phone_visible: true,
            email_visible: true,
          },
        ])
        .select()
        .single();

      if (docError) {
        console.error('Error inserting doctor profile:', docError);
      }

      const session = {
        user: {
          id: userId,
          email: doctorData.email,
          full_name: doctorData.fullName,
          role: 'doctor',
          phone: doctorData.phone,
          avatar_url: doctorData.avatarUrl || null,
          doctor_profile_id: docProfile?.id,
          verification_status: 'pending',
        },
        token: authData.session?.access_token || 'temp-token',
      };
      setStoredAuthSession(session);
      return session;
    }
  }

  // Local storage demo fallback
  const newUserId = 'user-' + Date.now();
  const newDoctorId = 'doc-' + Date.now();
  const newDoctor = {
    id: newDoctorId,
    user_id: newUserId,
    full_name: doctorData.fullName,
    email: doctorData.email,
    phone: doctorData.phone,
    avatar_url: doctorData.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    qualifications: doctorData.qualifications,
    specialty_id: doctorData.specialtyId,
    specialty_name: doctorData.specialtyName || 'General Practitioner',
    subspecialty: doctorData.subspecialty || '',
    registration_number: doctorData.registrationNumber,
    hospital: doctorData.hospital,
    clinic_address: doctorData.clinicAddress,
    city: doctorData.city,
    state: doctorData.state || 'India',
    experience_years: parseInt(doctorData.experienceYears, 10) || 0,
    bio: doctorData.bio,
    verification_status: 'pending',
    verification_reason: null,
    verified_at: null,
    is_featured: false,
    is_online: true,
    phone_visible: true,
    email_visible: true,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  const doctors = getLocalDoctors();
  doctors.unshift(newDoctor);
  saveLocalDoctors(doctors);

  const session = {
    user: {
      id: newUserId,
      email: doctorData.email,
      full_name: doctorData.fullName,
      role: 'doctor',
      phone: doctorData.phone,
      avatar_url: newDoctor.avatar_url,
      doctor_profile_id: newDoctorId,
      verification_status: 'pending',
    },
    token: 'local-token-' + Date.now(),
  };

  setStoredAuthSession(session);
  addLocalAuditLog('DOCTOR_REGISTERED', doctorData.fullName, 'Self Registration', `Doctor registered with Registration Number: ${doctorData.registrationNumber}`);
  return session;
};

export const logoutSession = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout failed', e);
    }
  }
  setStoredAuthSession(null);
};

export const resetPasswordRequest = async (email) => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return true;
  }
  // Local simulation
  return true;
};
