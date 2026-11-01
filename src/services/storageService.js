// Persistent local storage wrapper for offline / demo mode
import { INITIAL_DOCTORS, INITIAL_SPECIALTIES, INITIAL_CITIES, DEFAULT_APP_SETTINGS } from '../lib/constants';

const STORAGE_KEYS = {
  DOCTORS: 'my_nsda_doctors',
  SPECIALTIES: 'my_nsda_specialties',
  CITIES: 'my_nsda_cities',
  SETTINGS: 'my_nsda_settings',
  REPORTS: 'my_nsda_reports',
  AUDIT_LOGS: 'my_nsda_audit_logs',
  NOTIFICATIONS: 'my_nsda_notifications',
  USERS: 'my_nsda_users',
  ADS: 'my_nsda_ads',
};

export const DEFAULT_ADS = [
  {
    id: 'ad-1',
    title: 'Apollo Comprehensive Health Checkup Package',
    subtitle: 'Exclusive 25% discount for NSDA patients & families with verified home sample collection across 50+ cities.',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    link_url: 'https://www.apollohospitals.com',
    badge_text: 'Featured Partner',
    cta_text: 'Book Test Online',
    is_active: true,
    clicks: 142,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ad-2',
    title: 'NSDA National Medical Conclave & CME 2026',
    subtitle: 'Join leading medical specialists for 3 days of clinical masterclasses, certified CME credits & networking.',
    image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    link_url: 'https://nsda.org.in',
    badge_text: 'Official Event',
    cta_text: 'Register Attendance',
    is_active: true,
    clicks: 89,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// Initialize default seed data in localStorage if not already present
export const initLocalData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SPECIALTIES)) {
    localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(INITIAL_SPECIALTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CITIES)) {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([
      {
        id: 'log-1',
        action: 'DOCTOR_VERIFIED',
        actor: 'Admin (System)',
        target: 'Dr. Rajesh Sharma',
        details: 'Verified MMC Registration number MMC-2004/08/3120',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'log-2',
        action: 'SYSTEM_BOOTSTRAP',
        actor: 'Super Admin',
        target: 'Platform Settings',
        details: 'Initialized MY NSDA Doctors Directory database',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
      {
        id: 'notif-1',
        title: 'Welcome to MY NSDA',
        message: 'Welcome to the official NSDA Doctors Directory platform. Explore verified specialists and connect.',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Annual NSDA Medical Summit',
        message: 'Registration is now live for the upcoming 2026 National Medical Conference.',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADS)) {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(DEFAULT_ADS));
  }
};

export const getLocalDoctors = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS)) || [];
  } catch (e) {
    return INITIAL_DOCTORS;
  }
};

export const saveLocalDoctors = (doctors) => {
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
};

export const getLocalSpecialties = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SPECIALTIES)) || INITIAL_SPECIALTIES;
  } catch (e) {
    return INITIAL_SPECIALTIES;
  }
};

export const saveLocalSpecialties = (specs) => {
  localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(specs));
};

export const getLocalCities = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CITIES)) || INITIAL_CITIES;
  } catch (e) {
    return INITIAL_CITIES;
  }
};

export const saveLocalCities = (cities) => {
  localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
};

export const getLocalSettings = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_APP_SETTINGS;
  } catch (e) {
    return DEFAULT_APP_SETTINGS;
  }
};

export const saveLocalSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getLocalReports = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  } catch (e) {
    return [];
  }
};

export const saveLocalReports = (reports) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getLocalAuditLogs = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
  } catch (e) {
    return [];
  }
};

export const addLocalAuditLog = (action, actor, target, details) => {
  const logs = getLocalAuditLogs();
  const newLog = {
    id: 'log-' + Date.now(),
    action,
    actor,
    target,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
};

export const getLocalNotifications = () => {
  initLocalData();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
  } catch (e) {
    return [];
  }
};

export const saveLocalNotifications = (notifs) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};

// ==========================================
// ADVERTISEMENTS & PROMOTIONAL BANNERS
// ==========================================

export const getLocalAds = () => {
  initLocalData();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADS);
    return raw ? JSON.parse(raw) : DEFAULT_ADS;
  } catch (e) {
    return DEFAULT_ADS;
  }
};

export const saveLocalAds = (ads) => {
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
};

export const addLocalAd = (adData, actor = 'Super Admin') => {
  const ads = getLocalAds();
  const newAd = {
    id: 'ad-' + Date.now(),
    title: adData.title?.trim() || 'Featured Partner Announcement',
    subtitle: adData.subtitle?.trim() || '',
    image_url:
      adData.image_url?.trim() ||
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    link_url: adData.link_url?.trim() || '#',
    badge_text: adData.badge_text?.trim() || 'Sponsored',
    cta_text: adData.cta_text?.trim() || 'Learn More',
    is_active: adData.is_active !== undefined ? adData.is_active : true,
    clicks: 0,
    created_at: new Date().toISOString(),
  };

  ads.unshift(newAd);
  saveLocalAds(ads);
  addLocalAuditLog(
    'AD_CREATED',
    actor,
    newAd.title,
    `Added new advertisement banner with destination: ${newAd.link_url}`
  );
  return newAd;
};

export const updateLocalAd = (id, adData, actor = 'Super Admin') => {
  const ads = getLocalAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index] = {
    ...ads[index],
    ...adData,
    updated_at: new Date().toISOString(),
  };

  saveLocalAds(ads);
  addLocalAuditLog(
    'AD_UPDATED',
    actor,
    ads[index].title,
    `Updated advertisement banner details`
  );
  return ads[index];
};

export const deleteLocalAd = (id, actor = 'Super Admin') => {
  const ads = getLocalAds();
  const toDelete = ads.find((a) => a.id === id);
  const filtered = ads.filter((a) => a.id !== id);
  saveLocalAds(filtered);
  if (toDelete) {
    addLocalAuditLog(
      'AD_DELETED',
      actor,
      toDelete.title,
      `Removed advertisement banner from platform`
    );
  }
  return true;
};

export const toggleLocalAdStatus = (id, actor = 'Super Admin') => {
  const ads = getLocalAds();
  const index = ads.findIndex((a) => a.id === id);
  if (index === -1) return null;

  ads[index].is_active = !ads[index].is_active;
  saveLocalAds(ads);
  addLocalAuditLog(
    'AD_STATUS_TOGGLED',
    actor,
    ads[index].title,
    `Ad status set to: ${ads[index].is_active ? 'ACTIVE (LIVE)' : 'INACTIVE (PAUSED)'}`
  );
  return ads[index];
};

export const recordAdClick = (id) => {
  try {
    const ads = getLocalAds();
    const index = ads.findIndex((a) => a.id === id);
    if (index !== -1) {
      ads[index].clicks = (ads[index].clicks || 0) + 1;
      saveLocalAds(ads);
    }
  } catch (e) {
    console.warn('Error recording ad click', e);
  }
};

