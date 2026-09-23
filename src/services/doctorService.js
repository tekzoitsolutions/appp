import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalDoctors, saveLocalDoctors, addLocalAuditLog } from './storageService';

export const fetchDoctors = async ({
  searchQuery = '',
  specialty = 'all',
  city = 'all',
  verifiedOnly = false,
  sortBy = 'featured', // 'featured', 'name-asc', 'name-desc', 'experience', 'recent'
} = {}) => {
  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('doctor_profiles')
        .select(`
          id,
          user_id,
          qualifications,
          specialty_id,
          subspecialty,
          registration_number,
          hospital,
          clinic_address,
          city,
          experience_years,
          bio,
          verification_status,
          verification_reason,
          verified_at,
          is_featured,
          is_online,
          phone_visible,
          email_visible,
          consultation_fee,
          available_timings,
          created_at,
          profiles:user_id (
            full_name,
            email,
            phone,
            avatar_url
          ),
          specialties:specialty_id (
            name,
            slug
          )
        `);

      if (verifiedOnly) {
        query = query.eq('verification_status', 'verified');
      }

      if (city && city !== 'all' && city !== 'All Cities') {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        // Flatten and map to consistent schema
        let mapped = data.map((d) => ({
          id: d.id,
          user_id: d.user_id,
          full_name: d.profiles?.full_name || 'Dr. Unknown',
          email: d.profiles?.email || '',
          phone: d.profiles?.phone || '',
          avatar_url: d.profiles?.avatar_url || '',
          qualifications: d.qualifications,
          specialty_id: d.specialty_id,
          specialty_name: d.specialties?.name || 'Specialist',
          subspecialty: d.subspecialty,
          registration_number: d.registration_number,
          hospital: d.hospital,
          clinic_address: d.clinic_address,
          city: d.city,
          experience_years: d.experience_years,
          bio: d.bio,
          verification_status: d.verification_status,
          verification_reason: d.verification_reason,
          verified_at: d.verified_at,
          is_featured: d.is_featured,
          is_online: d.is_online,
          phone_visible: d.phone_visible,
          email_visible: d.email_visible,
          consultation_fee: d.consultation_fee,
          available_timings: d.available_timings,
          created_at: d.created_at,
        }));

        // Apply in-memory search and sort
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          mapped = mapped.filter(
            (doc) =>
              doc.full_name?.toLowerCase().includes(q) ||
              doc.specialty_name?.toLowerCase().includes(q) ||
              doc.subspecialty?.toLowerCase().includes(q) ||
              doc.city?.toLowerCase().includes(q) ||
              doc.hospital?.toLowerCase().includes(q) ||
              doc.qualifications?.toLowerCase().includes(q)
          );
        }

        if (specialty && specialty !== 'all' && specialty !== 'All Doctors') {
          mapped = mapped.filter((doc) =>
            doc.specialty_name?.toLowerCase().includes(specialty.toLowerCase())
          );
        }

        return sortDoctorList(mapped, sortBy);
      }
    } catch (err) {
      console.warn('Supabase fetch doctors failed, falling back to local dataset', err);
    }
  }

  // Local fallback
  let doctors = getLocalDoctors();

  // Search filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    doctors = doctors.filter(
      (doc) =>
        doc.full_name?.toLowerCase().includes(q) ||
        doc.specialty_name?.toLowerCase().includes(q) ||
        doc.subspecialty?.toLowerCase().includes(q) ||
        doc.city?.toLowerCase().includes(q) ||
        doc.hospital?.toLowerCase().includes(q) ||
        doc.qualifications?.toLowerCase().includes(q)
    );
  }

  // Specialty filter
  if (specialty && specialty !== 'all' && specialty !== 'All Doctors') {
    doctors = doctors.filter(
      (doc) =>
        doc.specialty_name?.toLowerCase().includes(specialty.toLowerCase()) ||
        doc.specialty_id === specialty
    );
  }

  // City filter
  if (city && city !== 'all' && city !== 'All Cities') {
    doctors = doctors.filter((doc) =>
      doc.city?.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Verified only filter
  if (verifiedOnly) {
    doctors = doctors.filter((doc) => doc.verification_status === 'verified');
  }

  return sortDoctorList(doctors, sortBy);
};

const sortDoctorList = (list, sortBy) => {
  const sorted = [...list];
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    case 'name-desc':
      return sorted.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''));
    case 'experience':
      return sorted.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
  }
};

export const getDoctorById = async (id) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
          *,
          profiles:user_id (*),
          specialties:specialty_id (*)
        `)
        .eq('id', id)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          full_name: data.profiles?.full_name,
          email: data.profiles?.email,
          phone: data.profiles?.phone,
          avatar_url: data.profiles?.avatar_url,
          qualifications: data.qualifications,
          specialty_id: data.specialty_id,
          specialty_name: data.specialties?.name || 'Specialist',
          subspecialty: data.subspecialty,
          registration_number: data.registration_number,
          hospital: data.hospital,
          clinic_address: data.clinic_address,
          city: data.city,
          experience_years: data.experience_years,
          bio: data.bio,
          verification_status: data.verification_status,
          verification_reason: data.verification_reason,
          verified_at: data.verified_at,
          is_featured: data.is_featured,
          is_online: data.is_online,
          phone_visible: data.phone_visible,
          email_visible: data.email_visible,
          consultation_fee: data.consultation_fee,
          available_timings: data.available_timings,
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Supabase get doctor by id failed', e);
    }
  }

  const docs = getLocalDoctors();
  return docs.find((d) => d.id === id || d.user_id === id) || null;
};

export const updateDoctorProfile = async (doctorId, updates, actorName = 'Doctor') => {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Update doctor_profiles
      const { error: docError } = await supabase
        .from('doctor_profiles')
        .update({
          qualifications: updates.qualifications,
          subspecialty: updates.subspecialty,
          hospital: updates.hospital,
          clinic_address: updates.clinic_address,
          city: updates.city,
          experience_years: updates.experience_years,
          bio: updates.bio,
          phone_visible: updates.phone_visible,
          email_visible: updates.email_visible,
          consultation_fee: updates.consultation_fee,
          available_timings: updates.available_timings,
        })
        .eq('id', doctorId);

      if (docError) throw docError;

      if (updates.full_name || updates.avatar_url || updates.phone) {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.full_name,
            avatar_url: updates.avatar_url,
            phone: updates.phone,
          })
          .eq('id', updates.user_id);
      }
      return true;
    } catch (e) {
      console.warn('Supabase update failed, saving locally', e);
    }
  }

  const docs = getLocalDoctors();
  const index = docs.findIndex((d) => d.id === doctorId || d.user_id === doctorId);
  if (index !== -1) {
    docs[index] = {
      ...docs[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveLocalDoctors(docs);
    addLocalAuditLog('PROFILE_UPDATED', actorName, docs[index].full_name, 'Updated profile information');
    return docs[index];
  }
  return null;
};
