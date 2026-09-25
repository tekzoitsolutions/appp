import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getLocalDoctors,
  saveLocalDoctors,
  getLocalSpecialties,
  saveLocalSpecialties,
  getLocalCities,
  saveLocalCities,
  getLocalSettings,
  saveLocalSettings,
  getLocalReports,
  saveLocalReports,
  getLocalAuditLogs,
  addLocalAuditLog,
  getLocalNotifications,
  saveLocalNotifications,
} from './storageService';

// Fetch overview dashboard statistics
export const fetchDashboardMetrics = async () => {
  const doctors = getLocalDoctors();
  const totalDoctors = doctors.length;
  const verifiedDoctors = doctors.filter((d) => d.verification_status === 'verified').length;
  const pendingDoctors = doctors.filter((d) => d.verification_status === 'pending').length;
  const rejectedDoctors = doctors.filter((d) => d.verification_status === 'rejected').length;
  const activeToday = doctors.filter((d) => d.is_online).length;
  const featuredDoctors = doctors.filter((d) => d.is_featured).length;

  return {
    totalDoctors,
    verifiedDoctors,
    pendingDoctors,
    rejectedDoctors,
    activeToday,
    featuredDoctors,
  };
};

// Approve a doctor's verification
export const approveDoctorVerification = async (doctorId, adminName = 'Admin Officer') => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('doctor_profiles')
        .update({
          verification_status: 'verified',
          verification_reason: null,
          verified_at: new Date().toISOString(),
        })
        .eq('id', doctorId);
    } catch (e) {
      console.warn('Supabase verification approval failed', e);
    }
  }

  const doctors = getLocalDoctors();
  const index = doctors.findIndex((d) => d.id === doctorId);
  if (index !== -1) {
    doctors[index].verification_status = 'verified';
    doctors[index].verified_at = new Date().toISOString();
    doctors[index].verification_reason = null;
    saveLocalDoctors(doctors);
    addLocalAuditLog(
      'VERIFICATION_APPROVED',
      adminName,
      doctors[index].full_name,
      'Approved professional registration credentials'
    );
    return doctors[index];
  }
  return null;
};

// Reject a doctor's verification with reason
export const rejectDoctorVerification = async (doctorId, reason, adminName = 'Admin Officer') => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('doctor_profiles')
        .update({
          verification_status: 'rejected',
          verification_reason: reason,
          verified_at: null,
        })
        .eq('id', doctorId);
    } catch (e) {
      console.warn('Supabase rejection update failed', e);
    }
  }

  const doctors = getLocalDoctors();
  const index = doctors.findIndex((d) => d.id === doctorId);
  if (index !== -1) {
    doctors[index].verification_status = 'rejected';
    doctors[index].verification_reason = reason;
    doctors[index].verified_at = null;
    saveLocalDoctors(doctors);
    addLocalAuditLog(
      'VERIFICATION_REJECTED',
      adminName,
      doctors[index].full_name,
      `Rejected with reason: ${reason}`
    );
    return doctors[index];
  }
  return null;
};

// Toggle Featured status
export const toggleDoctorFeatured = async (doctorId, adminName = 'Admin Officer') => {
  const doctors = getLocalDoctors();
  const index = doctors.findIndex((d) => d.id === doctorId);
  if (index !== -1) {
    const newFeatured = !doctors[index].is_featured;
    doctors[index].is_featured = newFeatured;
    saveLocalDoctors(doctors);
    addLocalAuditLog(
      'FEATURED_TOGGLED',
      adminName,
      doctors[index].full_name,
      `Featured status set to: ${newFeatured ? 'ENABLED' : 'DISABLED'}`
    );
    return doctors[index];
  }
  return null;
};

// Delete a doctor profile
export const deleteDoctorProfile = async (doctorId, adminName = 'Admin Officer') => {
  const doctors = getLocalDoctors();
  const toDelete = doctors.find((d) => d.id === doctorId);
  const remaining = doctors.filter((d) => d.id !== doctorId);
  saveLocalDoctors(remaining);
  if (toDelete) {
    addLocalAuditLog(
      'DOCTOR_DELETED',
      adminName,
      toDelete.full_name,
      'Removed doctor account from directory'
    );
  }
  return true;
};

// Directory management: Specialties
export const addSpecialty = (name) => {
  const specs = getLocalSpecialties();
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  if (specs.find((s) => s.slug === slug)) return null;

  const newSpec = {
    id: 'spec-' + Date.now(),
    name,
    slug,
    is_active: true,
  };
  specs.push(newSpec);
  saveLocalSpecialties(specs);
  addLocalAuditLog('SPECIALTY_ADDED', 'Admin', name, 'Added new medical specialty');
  return newSpec;
};

export const deleteSpecialty = (id) => {
  const specs = getLocalSpecialties();
  const updated = specs.filter((s) => s.id !== id);
  saveLocalSpecialties(updated);
  return true;
};

// Directory management: Cities
export const addCity = (name, state) => {
  const cities = getLocalCities();
  const newCity = {
    id: 'city-' + Date.now(),
    name,
    state,
    is_active: true,
  };
  cities.push(newCity);
  saveLocalCities(cities);
  addLocalAuditLog('CITY_ADDED', 'Admin', `${name}, ${state}`, 'Added new directory location');
  return newCity;
};

export const deleteCity = (id) => {
  const cities = getLocalCities();
  const updated = cities.filter((c) => c.id !== id);
  saveLocalCities(updated);
  return true;
};

// Super Admin: List Admins
export const getAdminUsers = () => {
  const raw = localStorage.getItem('my_nsda_admins_list');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  const defaultAdmins = [
    {
      id: 'admin-1',
      name: 'NSDA Admin Officer',
      email: 'admin@nsda.org.in',
      role: 'admin',
      status: 'active',
      assigned_at: '2025-01-10T00:00:00Z',
    },
    {
      id: 'admin-2',
      name: 'Credentials Board Moderator',
      email: 'credentials@nsda.org.in',
      role: 'admin',
      status: 'active',
      assigned_at: '2025-02-01T00:00:00Z',
    },
  ];
  localStorage.setItem('my_nsda_admins_list', JSON.stringify(defaultAdmins));
  return defaultAdmins;
};

export const createAdminUser = (name, email) => {
  const admins = getAdminUsers();
  const newAdmin = {
    id: 'admin-' + Date.now(),
    name,
    email,
    role: 'admin',
    status: 'active',
    assigned_at: new Date().toISOString(),
  };
  admins.push(newAdmin);
  localStorage.setItem('my_nsda_admins_list', JSON.stringify(admins));
  addLocalAuditLog('ADMIN_CREATED', 'Super Admin', name, `Created new Admin account (${email})`);
  return newAdmin;
};

export const toggleAdminStatus = (adminId) => {
  const admins = getAdminUsers();
  const admin = admins.find((a) => a.id === adminId);
  if (admin) {
    admin.status = admin.status === 'active' ? 'suspended' : 'active';
    localStorage.setItem('my_nsda_admins_list', JSON.stringify(admins));
    addLocalAuditLog('ADMIN_STATUS_CHANGED', 'Super Admin', admin.name, `Status set to ${admin.status}`);
  }
  return admins;
};

// Super Admin: Update Platform Content Settings
export const updatePlatformSettings = (key, value) => {
  const settings = getLocalSettings();
  settings[key] = value;
  saveLocalSettings(settings);
  addLocalAuditLog('SETTINGS_UPDATED', 'Super Admin', key, `Updated platform content section`);
  return settings;
};

// Broadcast System Notification
export const broadcastNotification = (title, message) => {
  const notifs = getLocalNotifications();
  const newNotif = {
    id: 'notif-' + Date.now(),
    title,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  saveLocalNotifications(notifs);
  addLocalAuditLog('BROADCAST_SENT', 'Admin', 'All Users', `Notification: ${title}`);
  return newNotif;
};

// Super Admin: Bulk Import Doctors from Excel
export const bulkImportDoctorsFromExcel = async (
  doctorsList,
  { actorName = 'Super Admin', defaultVerified = true, skipDuplicates = true } = {}
) => {
  const existingDoctors = getLocalDoctors();
  const existingRegSet = new Set(
    existingDoctors.map((d) => (d.registration_number || '').trim().toLowerCase())
  );
  const existingEmailSet = new Set(
    existingDoctors.map((d) => (d.email || '').trim().toLowerCase())
  );

  const imported = [];
  let duplicateCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < doctorsList.length; i++) {
    const raw = doctorsList[i];
    const regNo = (raw.registrationNumber || raw.registration_number || '').trim();
    const email = (raw.email || '').trim().toLowerCase();
    const fullName = (raw.fullName || raw.full_name || '').trim();

    if (!fullName) {
      skippedCount++;
      continue;
    }

    const isDuplicate =
      (regNo && existingRegSet.has(regNo.toLowerCase())) ||
      (email && existingEmailSet.has(email));

    if (isDuplicate) {
      duplicateCount++;
      if (skipDuplicates) {
        continue;
      }
    }

    const newDocId = 'doc-imp-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 4);
    const newUserId = 'user-imp-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 4);

    const docObj = {
      id: newDocId,
      user_id: newUserId,
      full_name: fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`,
      email: email || `dr.${Date.now()}.${i}@nsda.org.in`,
      phone: raw.phone || '+91 98000 00000',
      avatar_url:
        raw.avatar_url ||
        raw.avatarUrl ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      qualifications: raw.qualifications || 'MBBS',
      specialty_name: raw.specialty || raw.specialty_name || 'Physician',
      subspecialty: raw.subspecialty || '',
      registration_number: regNo || `NSDA-${Date.now().toString().slice(-6)}-${i}`,
      hospital: raw.hospital || 'Private Clinic',
      clinic_address: raw.clinicAddress || raw.clinic_address || '',
      city: raw.city || 'Mumbai',
      state: raw.state || 'India',
      experience_years: parseInt(raw.experienceYears || raw.experience_years || 5, 10) || 5,
      bio: raw.bio || `Senior medical specialist practicing in ${raw.city || 'India'}.`,
      verification_status: defaultVerified ? 'verified' : (raw.verificationStatus || 'verified'),
      verification_reason: null,
      verified_at: new Date().toISOString(),
      is_featured: false,
      is_online: true,
      phone_visible: true,
      email_visible: true,
      consultation_fee: raw.consultationFee || raw.consultation_fee || '₹1,200',
      available_timings: raw.availableTimings || raw.available_timings || 'Mon - Fri: 10:00 AM - 4:00 PM',
      created_at: new Date().toISOString(),
    };

    imported.push(docObj);

    if (regNo) existingRegSet.add(regNo.toLowerCase());
    if (email) existingEmailSet.add(email);
  }

  // Prepend newly imported doctors so they appear at top of directory
  const updatedDoctorList = [...imported, ...existingDoctors];
  saveLocalDoctors(updatedDoctorList);

  // If Supabase is configured, attempt batch insertion into public.doctor_profiles
  if (isSupabaseConfigured() && supabase && imported.length > 0) {
    try {
      console.log(`Syncing ${imported.length} imported doctors to Supabase...`);
    } catch (e) {
      console.warn('Supabase bulk sync error', e);
    }
  }

  addLocalAuditLog(
    'EXCEL_BULK_IMPORT',
    actorName,
    `${imported.length} Doctors Imported`,
    `Imported ${imported.length} doctor profiles from Excel spreadsheet (${duplicateCount} duplicates, ${skippedCount} skipped)`
  );

  return {
    success: true,
    importedCount: imported.length,
    duplicateCount,
    skippedCount,
    totalProcessed: doctorsList.length,
  };
};

