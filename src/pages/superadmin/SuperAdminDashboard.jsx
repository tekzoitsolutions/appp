import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Users,
  Settings,
  FileText,
  Bell,
  Clock,
  UserPlus,
  Lock,
  Save,
  Trash2,
  RefreshCw,
  LogOut,
  CheckCircle,
  Stethoscope,
  Search,
  Filter,
  AlertTriangle,
  X,
  Check,
  Star,
  ExternalLink,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  FileUp,
  Sliders,
  HelpCircle,
  Megaphone,
  Plus,
  Eye,
  Edit2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getAdminUsers,
  createAdminUser,
  toggleAdminStatus,
  updatePlatformSettings,
  broadcastNotification,
  deleteDoctorProfile,
  approveDoctorVerification,
  rejectDoctorVerification,
  toggleDoctorFeatured,
  bulkImportDoctorsFromExcel,
} from '../../services/adminService';
import {
  getLocalSettings,
  getLocalAuditLogs,
  getLocalDoctors,
  getLocalAds,
  addLocalAd,
  updateLocalAd,
  deleteLocalAd,
  toggleLocalAdStatus,
} from '../../services/storageService';
import {
  downloadSampleExcelTemplate,
  parseWorkbook,
  buildDoctorRecordsFromMapping,
  TARGET_FIELDS,
} from '../../lib/excelHelper';

export const SuperAdminDashboard = () => {
  const { user, logout, role } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'excel_import', 'admins', 'settings', 'logs', 'broadcast'
  const [doctors, setDoctors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(getLocalSettings());

  // Doctor search & filter in Super Admin
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');

  // Delete doctor modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Excel Bulk Import States
  const [excelFile, setExcelFile] = useState(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [workbookInfo, setWorkbookInfo] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [parsedExcelResult, setParsedExcelResult] = useState(null);
  const [isImportingExcel, setIsImportingExcel] = useState(false);
  const [defaultVerified, setDefaultVerified] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [showMappingPanel, setShowMappingPanel] = useState(true);

  // Create admin modal / form
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Editable settings states
  const [aboutDesc, setAboutDesc] = useState('');
  const [termsText, setTermsText] = useState('');
  const [helpPhone, setHelpPhone] = useState('');
  const [helpEmail, setHelpEmail] = useState('');

  // Advertisement states
  const [ads, setAds] = useState([]);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adTitle, setAdTitle] = useState('');
  const [adSubtitle, setAdSubtitle] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adBadgeText, setAdBadgeText] = useState('Sponsored');
  const [adCtaText, setAdCtaText] = useState('Learn More');
  const [adIsActive, setAdIsActive] = useState(true);

  // Delete Ad modal state
  const [deleteAdModalOpen, setDeleteAdModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = () => {
    setDoctors(getLocalDoctors());
    setAdmins(getAdminUsers());
    setLogs(getLocalAuditLogs());
    setAds(getLocalAds());
    const s = getLocalSettings();
    setSettings(s);
    setAboutDesc(s.about_nsda?.description || '');
    setTermsText(s.terms_privacy?.terms || '');
    setHelpPhone(s.help_support?.emergency_helpline || '');
    setHelpEmail(s.help_support?.support_email || '');
  };

  // Doctor Management Actions by Super Admin
  const openDeleteModal = (doc) => {
    setDoctorToDelete(doc);
    setDeleteModalOpen(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      await deleteDoctorProfile(doctorToDelete.id, 'Super Admin');
      addToast(`Dr. ${doctorToDelete.full_name} was permanently removed from the directory`, 'success');
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
      loadSuperAdminData();
    } catch (err) {
      addToast('Failed to delete doctor profile', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveDoctor = async (docId) => {
    await approveDoctorVerification(docId, 'Super Admin');
    addToast('Doctor credentials verified by Super Admin', 'success');
    loadSuperAdminData();
  };

  const handleToggleFeaturedDoctor = async (docId) => {
    await toggleDoctorFeatured(docId, 'Super Admin');
    addToast('Doctor featured status updated', 'success');
    loadSuperAdminData();
  };

  // Excel Upload & Smart Mapping Handlers
  const handleExcelFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setIsParsingExcel(true);
    try {
      const wbData = await parseWorkbook(file);
      setWorkbookInfo(wbData);
      setColumnMapping(wbData.autoMapping);
      const records = buildDoctorRecordsFromMapping(
        wbData.dataRows,
        wbData.rawHeaders,
        wbData.autoMapping
      );
      setParsedExcelResult(records);
      addToast(`Detected ${wbData.dataRows.length} data rows & ${wbData.rawHeaders.length} columns from ${file.name}`, 'success');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to parse Excel file', 'error');
      setParsedExcelResult(null);
      setWorkbookInfo(null);
      setExcelFile(null);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleSheetChange = async (sheetName) => {
    if (!excelFile) return;
    setIsParsingExcel(true);
    try {
      const wbData = await parseWorkbook(excelFile, sheetName);
      setWorkbookInfo(wbData);
      setColumnMapping(wbData.autoMapping);
      const records = buildDoctorRecordsFromMapping(
        wbData.dataRows,
        wbData.rawHeaders,
        wbData.autoMapping
      );
      setParsedExcelResult(records);
      addToast(`Switched to worksheet "${sheetName}" (${wbData.dataRows.length} rows)`, 'info');
    } catch (err) {
      addToast(err.message || 'Failed to switch sheet', 'error');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleMappingChange = (fieldKey, selectedHeader) => {
    const newMapping = { ...columnMapping, [fieldKey]: selectedHeader };
    setColumnMapping(newMapping);
    if (workbookInfo) {
      const updatedRecords = buildDoctorRecordsFromMapping(
        workbookInfo.dataRows,
        workbookInfo.rawHeaders,
        newMapping
      );
      setParsedExcelResult(updatedRecords);
    }
  };

  const handleClearExcel = () => {
    setExcelFile(null);
    setWorkbookInfo(null);
    setColumnMapping({});
    setParsedExcelResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmExcelImport = async () => {
    if (!parsedExcelResult || !parsedExcelResult.rows.length) return;
    setIsImportingExcel(true);

    try {
      const res = await bulkImportDoctorsFromExcel(parsedExcelResult.rows, {
        actorName: 'Super Admin',
        defaultVerified,
        skipDuplicates,
      });

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      addToast(
        `Successfully imported ${res.importedCount} doctors into the NSDA directory!`,
        'success'
      );

      handleClearExcel();
      loadSuperAdminData();
      setActiveTab('doctors');
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error occurred while importing doctors', 'error');
    } finally {
      setIsImportingExcel(false);
    }
  };

  // Advertisement Actions by Super Admin
  const openCreateAdModal = () => {
    setEditingAd(null);
    setAdTitle('');
    setAdSubtitle('');
    setAdImageUrl('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80');
    setAdLinkUrl('https://www.apollohospitals.com');
    setAdBadgeText('Sponsored');
    setAdCtaText('Learn More');
    setAdIsActive(true);
    setAdModalOpen(true);
  };

  const openEditAdModal = (ad) => {
    setEditingAd(ad);
    setAdTitle(ad.title || '');
    setAdSubtitle(ad.subtitle || '');
    setAdImageUrl(ad.image_url || '');
    setAdLinkUrl(ad.link_url || '');
    setAdBadgeText(ad.badge_text || 'Sponsored');
    setAdCtaText(ad.cta_text || 'Learn More');
    setAdIsActive(ad.is_active !== undefined ? ad.is_active : true);
    setAdModalOpen(true);
  };

  const handleSaveAd = (e) => {
    e.preventDefault();
    if (!adTitle.trim()) {
      addToast('Please enter an advertisement title', 'error');
      return;
    }

    const payload = {
      title: adTitle.trim(),
      subtitle: adSubtitle.trim(),
      image_url:
        adImageUrl.trim() ||
        'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
      link_url: adLinkUrl.trim() || '#',
      badge_text: adBadgeText.trim() || 'Sponsored',
      cta_text: adCtaText.trim() || 'Learn More',
      is_active: adIsActive,
    };

    if (editingAd) {
      updateLocalAd(editingAd.id, payload, 'Super Admin');
      addToast('Advertisement updated successfully', 'success');
    } else {
      addLocalAd(payload, 'Super Admin');
      addToast('New advertisement banner published to Home page!', 'success');
    }

    setAdModalOpen(false);
    loadSuperAdminData();
  };

  const handleToggleAdStatus = (adId) => {
    const updated = toggleLocalAdStatus(adId, 'Super Admin');
    if (updated) {
      addToast(
        `Ad is now ${updated.is_active ? 'LIVE on Home page' : 'PAUSED (Hidden from Home page)'}`,
        'info'
      );
      loadSuperAdminData();
    }
  };

  const openDeleteAdModal = (ad) => {
    setAdToDelete(ad);
    setDeleteAdModalOpen(true);
  };

  const confirmDeleteAd = () => {
    if (!adToDelete) return;
    deleteLocalAd(adToDelete.id, 'Super Admin');
    addToast(`Advertisement "${adToDelete.title}" was removed`, 'success');
    setDeleteAdModalOpen(false);
    setAdToDelete(null);
    loadSuperAdminData();
  };

  // Admin Management Actions
  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    createAdminUser(newAdminName.trim(), newAdminEmail.trim());
    addToast(`Admin account created for ${newAdminName}`, 'success');
    setNewAdminName('');
    setNewAdminEmail('');
    loadSuperAdminData();
  };

  const handleToggleAdmin = (adminId) => {
    toggleAdminStatus(adminId);
    addToast('Admin account access updated', 'info');
    loadSuperAdminData();
  };

  // Content Settings Actions
  const handleSaveContent = (e) => {
    e.preventDefault();
    const updated = { ...settings };
    if (updated.about_nsda) updated.about_nsda.description = aboutDesc;
    if (updated.terms_privacy) updated.terms_privacy.terms = termsText;
    if (updated.help_support) {
      updated.help_support.emergency_helpline = helpPhone;
      updated.help_support.support_email = helpEmail;
    }
    updatePlatformSettings('about_nsda', updated.about_nsda);
    updatePlatformSettings('terms_privacy', updated.terms_privacy);
    updatePlatformSettings('help_support', updated.help_support);
    addToast('Platform content updated and published live', 'success');
  };

  // Broadcast Notification Action
  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    broadcastNotification(broadcastTitle.trim(), broadcastMessage.trim());
    addToast('Announcement broadcasted to all users and doctors', 'success');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filtered doctors list for Super Admin
  const filteredDoctors = doctors.filter((doc) => {
    const q = doctorSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      doc.full_name?.toLowerCase().includes(q) ||
      doc.registration_number?.toLowerCase().includes(q) ||
      doc.specialty_name?.toLowerCase().includes(q) ||
      doc.city?.toLowerCase().includes(q) ||
      doc.hospital?.toLowerCase().includes(q);

    const matchesFilter =
      doctorFilter === 'all' || doc.verification_status === doctorFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#E3060B] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#E3060B] flex items-center justify-center font-extrabold text-2xl font-sans shrink-0 shadow-md">
            N
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">
                Super Admin Console
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                Full Authority
              </span>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              Manage platform doctors (including smart Excel bulk import &amp; account deletion), administrators, audit trails, and global system policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 rounded-xl bg-white text-[#E3060B] text-xs font-bold hover:bg-[#FFF0F0] transition-colors"
          >
            Admin Portal
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#E0E6EF] pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'doctors', label: `Manage Doctors (${doctors.length})`, icon: Stethoscope },
          { key: 'excel_import', label: 'Upload Excel Data', icon: FileSpreadsheet },
          { key: 'ads', label: `Advertisements (${ads.length})`, icon: Megaphone },
          { key: 'admins', label: `Admin Management (${admins.length})`, icon: Shield },
          { key: 'settings', label: 'Platform Content & Settings', icon: Settings },
          { key: 'logs', label: 'Audit Trail Logs', icon: Clock },
          { key: 'broadcast', label: 'Broadcast Announcements', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#E3060B] text-white shadow-sm'
                  : 'bg-white text-[#111827] border border-[#E0E6EF] hover:bg-[#F7F9FC]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANAGE DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Total Doctors
              </span>
              <p className="text-xl font-extrabold text-[#111827] mt-0.5">
                {doctors.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Verified Doctors
              </span>
              <p className="text-xl font-extrabold text-[#008F8F] mt-0.5">
                {doctors.filter((d) => d.verification_status === 'verified').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Pending Approval
              </span>
              <p className="text-xl font-extrabold text-[#E3060B] mt-0.5">
                {doctors.filter((d) => d.verification_status === 'pending').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Super Admin Rights
              </span>
              <p className="text-xs font-bold text-[#E3060B] mt-1 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Permanent Deletion
              </p>
            </div>
          </div>

          {/* Doctors Table Card */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#E3060B]" />
                  Directory Doctors List ({filteredDoctors.length})
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Super Admin can inspect credentials, toggle verification, bulk import Excel records, and permanently delete doctor profiles.
                </p>
              </div>

              {/* Quick Actions (Upload Excel & Search) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('excel_import')}
                  className="px-3.5 py-2 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Upload Excel File
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search doctor, hospital, reg no..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B] w-48 sm:w-56"
                  />
                </div>

                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-1.5 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#E3060B]"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FC] text-[#94A3B8] font-bold uppercase tracking-wider border-y border-[#E0E6EF]">
                  <tr>
                    <th className="py-3 px-3">Doctor</th>
                    <th className="py-3 px-3">Specialty &amp; Location</th>
                    <th className="py-3 px-3">Reg. Number</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Featured</th>
                    <th className="py-3 px-3 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E6EF]">
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#94A3B8]">
                        No doctors matching the search criteria. You can upload an Excel sheet to bulk import doctors.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={doc.avatar_url}
                              alt={doc.full_name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#E0E6EF]"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/doctor/${doc.id}`}
                                className="font-bold text-[#111827] hover:text-[#008F8F] flex items-center gap-1"
                              >
                                {doc.full_name}
                                <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                              </Link>
                              <p className="text-[10px] text-[#94A3B8] truncate">{doc.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#008F8F]">{doc.specialty_name}</p>
                          <p className="text-[10px] text-[#94A3B8]">{doc.city}</p>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-[#111827]">
                          {doc.registration_number}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.verification_status === 'verified'
                                ? 'bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/30'
                                : doc.verification_status === 'pending'
                                ? 'bg-[#FFF0F0] text-[#E3060B] border border-[#E3060B]/30'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {doc.verification_status === 'verified' && <Check className="w-3 h-3" />}
                            {doc.verification_status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleFeaturedDoctor(doc.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              doc.is_featured
                                ? 'bg-amber-50 text-amber-500'
                                : 'text-[#94A3B8] hover:text-amber-500'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className={`w-4 h-4 ${doc.is_featured ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.verification_status !== 'verified' && (
                              <button
                                onClick={() => handleApproveDoctor(doc.id)}
                                title="Approve Doctor"
                                className="px-2.5 py-1.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-[11px] font-bold transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )}

                            {/* DELETE DOCTOR BUTTON */}
                            <button
                              onClick={() => openDeleteModal(doc)}
                              title="Permanently Delete Doctor Profile"
                              className="px-2.5 py-1.5 rounded-xl bg-[#FFF0F0] hover:bg-[#E3060B] text-[#E3060B] hover:text-white border border-[#E3060B]/20 text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD EXCEL DATA (SMART EXCEL BULK IMPORT & COLUMN MAPPER) */}
      {activeTab === 'excel_import' && (
        <div className="space-y-6">
          {/* Top Instructions & Template Card */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFFAFA] text-[#008F8F] text-xs font-bold border border-[#008F8F]/20">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Smart Excel &amp; CSV Bulk Import
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                Import Doctors Directory from Excel
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Upload any Excel spreadsheet (.xlsx, .xls, .csv). Our smart reader automatically finds the header row, normalizes column names, and allows you to customize the column mapping if your Excel file uses custom titles.
              </p>
            </div>

            <button
              onClick={downloadSampleExcelTemplate}
              className="px-5 py-3 rounded-2xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Sample Excel Template
            </button>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card">
            <div className="border-2 border-dashed border-[#E0E6EF] hover:border-[#008F8F] rounded-2xl p-8 text-center transition-colors bg-[#F7F9FC]/60">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileSelect}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Click to select or drag and drop your Excel file
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) up to 25 MB
                  </p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] transition-colors shadow-xs">
                  Choose File
                </span>
              </label>
            </div>

            {/* Currently Selected File & Worksheet Selector */}
            {workbookInfo && (
              <div className="mt-4 p-4 rounded-2xl bg-[#EFFAFA] border border-[#008F8F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#008F8F] text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">{workbookInfo.fileName}</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {(workbookInfo.fileSize / 1024).toFixed(1)} KB • Header row detected at line {workbookInfo.headerRowIndex + 1} • {workbookInfo.dataRows.length} data rows
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {workbookInfo.sheetNames.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#111827] font-semibold">Sheet:</span>
                      <select
                        value={workbookInfo.selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="bg-white border border-[#008F8F]/40 rounded-xl px-2.5 py-1 text-xs text-[#008F8F] font-bold"
                      >
                        {workbookInfo.sheetNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleClearExcel}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E3060B] hover:bg-white"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Parsing State */}
          {isParsingExcel && (
            <div className="bg-white rounded-3xl border border-[#E0E6EF] p-8 text-center space-y-3 shadow-card">
              <RefreshCw className="w-8 h-8 text-[#008F8F] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#111827]">Reading and analyzing spreadsheet structure...</p>
            </div>
          )}

          {/* Interactive Column Mapping Panel & Parsed Records */}
          {workbookInfo && parsedExcelResult && (
            <div className="space-y-6">
              {/* Column Mapping Section */}
              <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E0E6EF] pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111827] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#008F8F]" />
                      Column Mapping Assistant
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Verify that each doctor field is mapped to the correct column in your Excel spreadsheet.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMappingPanel(!showMappingPanel)}
                    className="text-xs font-bold text-[#008F8F] hover:underline self-start sm:self-auto"
                  >
                    {showMappingPanel ? 'Hide Column Mapping' : 'Show / Adjust Column Mapping'}
                  </button>
                </div>

                {showMappingPanel && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {TARGET_FIELDS.slice(0, 12).map((field) => {
                      const currentSelected = columnMapping[field.key] || '';
                      const isMapped = !!currentSelected;

                      return (
                        <div
                          key={field.key}
                          className={`p-3 rounded-2xl border transition-all ${
                            isMapped
                              ? 'bg-[#F7F9FC] border-[#E0E6EF]'
                              : field.required
                              ? 'bg-[#FFF0F0]/60 border-[#E3060B]/30'
                              : 'bg-white border-[#E0E6EF]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#111827] flex items-center gap-1">
                              {field.label}
                              {field.required && <span className="text-[#E3060B]">*</span>}
                            </span>
                            {isMapped ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#008F8F]" />
                            ) : (
                              <span className="text-[10px] text-[#94A3B8]">Not selected</span>
                            )}
                          </div>

                          <select
                            value={currentSelected}
                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            className="w-full bg-white border border-[#E0E6EF] rounded-xl px-2.5 py-1.5 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
                          >
                            <option value="">-- Not in file / Auto-generate --</option>
                            {workbookInfo.rawHeaders.map((header, hIdx) => (
                              <option key={hIdx} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E0E6EF] shadow-card">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Total Data Rows</span>
                  <p className="text-xl font-extrabold text-[#111827] mt-0.5">{parsedExcelResult.totalCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#EFFAFA] border border-[#008F8F]/20 shadow-card">
                  <span className="text-[10px] font-bold text-[#008F8F] uppercase">Valid Doctors Ready</span>
                  <p className="text-xl font-extrabold text-[#008F8F] mt-0.5">{parsedExcelResult.validCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#E3060B]/20 shadow-card">
                  <span className="text-[10px] font-bold text-[#E3060B] uppercase">Existing Duplicates</span>
                  <p className="text-xl font-extrabold text-[#E3060B] mt-0.5">{parsedExcelResult.duplicateCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E0E6EF] shadow-card">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Incomplete Rows</span>
                  <p className="text-xl font-extrabold text-[#94A3B8] mt-0.5">{parsedExcelResult.invalidCount}</p>
                </div>
              </div>

              {/* Import Options Bar */}
              <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#111827]">Import Settings</h4>
                  <p className="text-[11px] text-[#94A3B8]">Configure how the parsed doctor rows are committed to the directory</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#111827]">
                    <input
                      type="checkbox"
                      checked={defaultVerified}
                      onChange={(e) => setDefaultVerified(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#008F8F]"
                    />
                    Mark all as Verified
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#111827]">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#008F8F]"
                    />
                    Skip Duplicates
                  </label>
                </div>
              </div>

              {/* Parsed Rows Table Card */}
              <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[#111827]">
                    Preview Parsed Doctor Records ({parsedExcelResult.rows.length})
                  </h4>
                  <span className="text-xs text-[#94A3B8]">
                    Live preview updating with column mapping
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 border border-[#E0E6EF] rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F9FC] text-[#94A3B8] font-bold uppercase tracking-wider sticky top-0 border-b border-[#E0E6EF]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Doctor Name</th>
                        <th className="py-2.5 px-3">Email &amp; Phone</th>
                        <th className="py-2.5 px-3">Specialty</th>
                        <th className="py-2.5 px-3">Reg. Number</th>
                        <th className="py-2.5 px-3">City &amp; Hospital</th>
                        <th className="py-2.5 px-3">Experience</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E6EF]">
                      {parsedExcelResult.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-[#F7F9FC]/60 transition-colors ${
                            row.isDuplicate ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#94A3B8]">
                            {row.rowIndex}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#111827]">
                            {row.fullName}
                            <span className="block text-[10px] text-[#94A3B8] font-normal">
                              {row.qualifications}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="block text-[#111827]">{row.email}</span>
                            <span className="text-[10px] text-[#94A3B8]">{row.phone}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#008F8F] font-semibold">
                            {row.specialty}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#111827]">
                            {row.registrationNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="block text-[#111827]">{row.city}</span>
                            <span className="text-[10px] text-[#94A3B8]">{row.hospital}</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#111827]">
                            {row.experienceYears} yrs
                          </td>
                          <td className="py-2.5 px-3">
                            {row.isDuplicate ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Duplicate
                              </span>
                            ) : row.isValid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Ready
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                {row.issues.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commit Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClearExcel}
                    className="px-5 py-2.5 rounded-xl border border-[#E0E6EF] text-xs font-bold text-[#111827] hover:bg-[#F7F9FC]"
                  >
                    Cancel &amp; Clear
                  </button>

                  <button
                    type="button"
                    disabled={isImportingExcel || parsedExcelResult.validCount === 0}
                    onClick={handleConfirmExcelImport}
                    className="px-6 py-2.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isImportingExcel
                      ? 'Importing Doctors...'
                      : `Import ${parsedExcelResult.validCount} Doctors into Directory`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ADVERTISEMENTS & HOME BANNERS */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#008F8F]/10 text-[#008F8F] flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </span>
                <h3 className="text-base font-extrabold text-[#111827]">
                  Home Page Advertisements &amp; Banners
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Manually add, edit, or toggle promotional partner banners displayed at the bottom of the public Home page.
              </p>
            </div>

            <button
              onClick={openCreateAdModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Advertisement
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Total Ads
              </span>
              <p className="text-xl font-extrabold text-[#111827] mt-0.5">
                {ads.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Live on Home Page
              </span>
              <p className="text-xl font-extrabold text-[#008F8F] mt-0.5">
                {ads.filter((a) => a.is_active).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Total Clicks Tracked
              </span>
              <p className="text-xl font-extrabold text-[#E3060B] mt-0.5">
                {ads.reduce((acc, a) => acc + (a.clicks || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E0E6EF] shadow-card">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                Display Location
              </span>
              <p className="text-xs font-bold text-[#008F8F] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Bottom of Home
              </p>
            </div>
          </div>

          {/* Ads List */}
          {ads.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E0E6EF] p-12 text-center shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">No advertisements created yet</h4>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                Click below to create your first partner banner to display on the home page.
              </p>
              <button
                onClick={openCreateAdModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C]"
              >
                <Plus className="w-4 h-4" />
                Create First Ad
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 p-5 shadow-card flex flex-col justify-between ${
                    ad.is_active ? 'border-[#008F8F]/40 ring-1 ring-[#008F8F]/20' : 'border-[#E0E6EF] opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Badge, Status, Clicks */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/30">
                          {ad.badge_text || 'Sponsored'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ad.is_active
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {ad.is_active ? 'Live on Home' : 'Paused / Draft'}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#008F8F]" />
                        <span>{ad.clicks || 0} Clicks</span>
                      </div>
                    </div>

                    {/* Image & Title/Subtitle preview */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-24 h-20 rounded-xl object-cover shrink-0 border border-[#E0E6EF]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[#111827] line-clamp-1">
                          {ad.title}
                        </h4>
                        <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                          {ad.subtitle || 'No description provided'}
                        </p>
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#008F8F] hover:underline mt-1 truncate max-w-full"
                        >
                          <span className="truncate">{ad.link_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-[#E0E6EF] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleAdStatus(ad.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        ad.is_active
                          ? 'border border-[#E0E6EF] text-[#111827] hover:bg-[#F7F9FC]'
                          : 'bg-[#008F8F] text-white hover:bg-[#007C7C]'
                      }`}
                    >
                      {ad.is_active ? 'Pause Ad' : 'Activate on Home'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditAdModal(ad)}
                        className="p-2 rounded-xl border border-[#E0E6EF] text-[#111827] hover:bg-[#F7F9FC] transition-colors"
                        title="Edit advertisement"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteAdModal(ad)}
                        className="p-2 rounded-xl border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0] transition-colors"
                        title="Delete advertisement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADMIN MANAGEMENT */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Create new Admin form */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#008F8F]" />
              Assign New Administrator
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Grant staff or credentials board members access to verify doctors and moderate listings. Only Super Admins can assign roles.
            </p>

            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Dr. Rajesh Kulkarni)"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
              <input
                type="email"
                required
                placeholder="Official Email (admin@nsda.org.in)"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Create Admin Account
              </button>
            </form>
          </div>

          {/* Admin list */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-[#111827]">
              Current Platform Administrators ({admins.length})
            </h3>

            <div className="divide-y divide-[#E0E6EF]">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center font-bold text-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827] flex items-center gap-2">
                        {adm.name}
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            adm.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          {adm.status}
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#94A3B8]">{adm.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAdmin(adm.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        adm.status === 'active'
                          ? 'border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0]'
                          : 'bg-[#008F8F] text-white hover:bg-[#007C7C]'
                      }`}
                    >
                      {adm.status === 'active' ? 'Suspend Access' : 'Reactivate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM CONTENT & SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveContent} className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#008F8F]" />
            Manage Public Website Content
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              About NSDA Description
            </label>
            <textarea
              rows={3}
              value={aboutDesc}
              onChange={(e) => setAboutDesc(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Terms &amp; Ethics Policy Summary
            </label>
            <textarea
              rows={3}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Help &amp; Emergency Helpline
              </label>
              <input
                type="text"
                value={helpPhone}
                onChange={(e) => setHelpPhone(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={helpEmail}
                onChange={(e) => setHelpEmail(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save &amp; Update Live Content
          </button>
        </form>
      )}

      {/* TAB 5: AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#008F8F]" />
            Security Audit Trail
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111827]">{log.action}</span>
                    <span className="text-[10px] text-[#008F8F] font-semibold bg-[#EFFAFA] px-2 py-0.5 rounded-full">
                      Actor: {log.actor}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Target: {log.target} • {log.details}
                  </p>
                </div>
                <span className="text-[10px] text-[#94A3B8] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#E3060B]" />
            Broadcast Notification Announcement
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Send an instant notification bell alert to all registered doctors and users across the app.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. National Medical Conference 2026 Live"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your broadcast message to be delivered to all doctors..."
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Broadcast Notification
            </button>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE DOCTOR MODAL */}
      {deleteModalOpen && doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#111827]">
                  Delete Doctor Account?
                </h3>
                <p className="text-xs text-[#E3060B] font-semibold">
                  Permanent Super Admin Deletion
                </p>
              </div>
            </div>

            <div className="bg-[#F7F9FC] rounded-2xl p-4 border border-[#E0E6EF] space-y-2 mb-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={doctorToDelete.avatar_url}
                  alt={doctorToDelete.full_name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-[#111827] text-sm">
                    {doctorToDelete.full_name}
                  </p>
                  <p className="text-[#008F8F] font-medium">
                    {doctorToDelete.specialty_name} • {doctorToDelete.city}
                  </p>
                  <p className="text-[#94A3B8] font-mono text-[10px]">
                    Reg: {doctorToDelete.registration_number}
                  </p>
                </div>
              </div>
              <p className="text-[#111827]/80 text-[11px] pt-2 border-t border-[#E0E6EF]">
                This will irreversibly remove the doctor account, verified credentials, and public listings from the MY NSDA Directory. This event will be logged under the Super Admin audit trail.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E0E6EF] text-xs font-bold text-[#111827] hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteDoctor}
                className="flex-1 py-2.5 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ADVERTISEMENT MODAL */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E0E6EF] relative my-8">
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#008F8F]/10 text-[#008F8F] flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#111827]">
                  {editingAd ? 'Edit Advertisement' : 'Create Home Page Advertisement'}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  This banner will be featured at the bottom of the public Home page.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#111827] mb-1">
                  Ad Title / Headline <span className="text-[#E3060B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. Apollo Comprehensive Health Checkup"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111827] mb-1">
                  Short Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={adSubtitle}
                  onChange={(e) => setAdSubtitle(e.target.value)}
                  placeholder="e.g. 25% off comprehensive health checkup with home sample pickup."
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#111827] mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={adBadgeText}
                    onChange={(e) => setAdBadgeText(e.target.value)}
                    placeholder="e.g. Sponsored, Partner Offer"
                    className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#111827] mb-1">
                    Button CTA Label
                  </label>
                  <input
                    type="text"
                    value={adCtaText}
                    onChange={(e) => setAdCtaText(e.target.value)}
                    placeholder="e.g. Learn More, Book Test"
                    className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111827] mb-1">
                  Destination Link URL
                </label>
                <input
                  type="url"
                  value={adLinkUrl}
                  onChange={(e) => setAdLinkUrl(e.target.value)}
                  placeholder="https://example.com/promotion"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#111827]">
                    Banner Image URL
                  </label>
                  <span className="text-[10px] text-[#94A3B8]">Or pick a preset below:</span>
                </div>
                <input
                  type="url"
                  value={adImageUrl}
                  onChange={(e) => setAdImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />

                {/* Preset Image Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {[
                    { label: '🏥 Lab Checkup', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80' },
                    { label: '🎓 CME Summit', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80' },
                    { label: '🏨 Hospital', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80' },
                    { label: '💊 Pharmacy', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setAdImageUrl(preset.url)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all truncate text-left ${
                        adImageUrl === preset.url
                          ? 'border-[#008F8F] bg-[#EFFAFA] text-[#008F8F]'
                          : 'border-[#E0E6EF] bg-[#F7F9FC] text-[#111827] hover:bg-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adActiveCheck"
                  checked={adIsActive}
                  onChange={(e) => setAdIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#008F8F] rounded border-[#E0E6EF] focus:ring-[#008F8F]"
                />
                <label htmlFor="adActiveCheck" className="text-xs font-bold text-[#111827] cursor-pointer">
                  Activate &amp; display on Home Page immediately
                </label>
              </div>

              {/* Image Preview Box */}
              {adImageUrl && (
                <div className="p-3 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    Banner Preview
                  </span>
                  <div className="h-28 w-full rounded-xl overflow-hidden relative">
                    <img
                      src={adImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#008F8F] text-white text-[9px] font-bold uppercase">
                      {adBadgeText || 'Sponsored'}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E0E6EF] text-xs font-bold text-[#111827] hover:bg-[#F7F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {editingAd ? 'Save Changes' : 'Publish Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ADVERTISEMENT MODAL */}
      {deleteAdModalOpen && adToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
            <button
              onClick={() => setDeleteAdModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#111827]">
                  Delete Advertisement?
                </h3>
                <p className="text-xs text-[#E3060B] font-semibold">
                  Remove from Home page
                </p>
              </div>
            </div>

            <div className="bg-[#F7F9FC] rounded-2xl p-4 border border-[#E0E6EF] space-y-2 mb-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={adToDelete.image_url}
                  alt={adToDelete.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-[#111827] text-sm truncate">
                    {adToDelete.title}
                  </p>
                  <p className="text-[#94A3B8] text-[11px] truncate">
                    Target: {adToDelete.link_url}
                  </p>
                </div>
              </div>
              <p className="text-[#111827]/80 text-[11px] pt-2 border-t border-[#E0E6EF]">
                This will delete the advertisement banner from the platform and remove it from the home page.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteAdModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E0E6EF] text-xs font-bold text-[#111827] hover:bg-[#F7F9FC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAd}
                className="flex-1 py-2.5 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Advertisement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
