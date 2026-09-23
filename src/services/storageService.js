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
};

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
