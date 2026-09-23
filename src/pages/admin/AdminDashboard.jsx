import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Plus,
  Eye,
  LogOut,
  Sparkles,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchDashboardMetrics,
  approveDoctorVerification,
  rejectDoctorVerification,
  toggleDoctorFeatured,
  deleteDoctorProfile,
  addSpecialty,
  deleteSpecialty,
  addCity,
  deleteCity,
} from '../../services/adminService';
import {
  getLocalDoctors,
  getLocalSpecialties,
  getLocalCities,
  getLocalReports,
  saveLocalReports,
} from '../../services/storageService';

export const AdminDashboard = () => {
  const { user, logout, role } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'doctors', 'moderation', 'directory'
  const [metrics, setMetrics] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDoctorForReject, setSelectedDoctorForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Invalid or unverified Medical Council registration number');

  // New Specialty & City input states
  const [newSpecName, setNewSpecName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('');

  const loadAllAdminData = async () => {
    const m = await fetchDashboardMetrics();
    setMetrics(m);
    setDoctors(getLocalDoctors());
    setSpecialties(getLocalSpecialties().filter((s) => s.slug !== 'all'));
    setCities(getLocalCities().filter((c) => c.name !== 'All Cities'));
    setReports(getLocalReports());
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleApprove = async (docId) => {
    await approveDoctorVerification(docId, user.full_name);
    addToast('Doctor credentials verified successfully', 'success');
    loadAllAdminData();
  };

  const openRejectModal = (doc) => {
    setSelectedDoctorForReject(doc);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForReject) return;
    await rejectDoctorVerification(selectedDoctorForReject.id, rejectReason, user.full_name);
    addToast('Doctor verification rejected', 'info');
    setRejectModalOpen(false);
    setSelectedDoctorForReject(null);
    loadAllAdminData();
  };

  const handleToggleFeatured = async (docId) => {
    await toggleDoctorFeatured(docId, user.full_name);
    addToast('Featured status updated', 'success');
    loadAllAdminData();
  };

  const handleDeleteDoctor = async (docId) => {
    if (window.confirm('Are you sure you want to permanently remove this doctor from the directory?')) {
      await deleteDoctorProfile(docId, user.full_name);
      addToast('Doctor removed from directory', 'info');
      loadAllAdminData();
    }
  };

  const handleAddSpecialty = (e) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    const added = addSpecialty(newSpecName.trim());
    if (added) {
      addToast(`Added specialty: ${newSpecName}`, 'success');
      setNewSpecName('');
      loadAllAdminData();
    } else {
      addToast('Specialty already exists', 'error');
    }
  };

  const handleDeleteSpecialty = (id) => {
    deleteSpecialty(id);
    addToast('Specialty removed', 'info');
    loadAllAdminData();
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCityName.trim() || !newCityState.trim()) return;
    addCity(newCityName.trim(), newCityState.trim());
    addToast(`Added city: ${newCityName}`, 'success');
    setNewCityName('');
    setNewCityState('');
    loadAllAdminData();
  };

  const handleDeleteCity = (id) => {
    deleteCity(id);
    addToast('City removed', 'info');
    loadAllAdminData();
  };

  const handleDismissReport = (repId) => {
    const updated = reports.map((r) =>
      r.id === repId ? { ...r, status: 'dismissed' } : r
    );
    saveLocalReports(updated);
    setReports(updated);
    addToast('Report dismissed', 'info');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.full_name?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.registration_number?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.specialty_name?.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.city?.toLowerCase().includes(searchDoctor.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || doc.verification_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E0E6EF] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                Admin Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFFAFA] text-[#008F8F] text-[10px] font-bold uppercase tracking-wider border border-[#008F8F]/30">
                {role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Credential verification, doctor moderation and directory management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'super_admin' && (
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="px-3.5 py-2 rounded-xl bg-[#E3060B] text-white text-xs font-bold hover:bg-[#C20408] transition-colors"
            >
              Super Admin Console
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E0E6EF] text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E0E6EF] pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: Users },
          { key: 'doctors', label: 'Doctor Management', icon: Shield },
          { key: 'moderation', label: `Moderation & Reports (${reports.filter((r) => r.status === 'pending').length})`, icon: AlertTriangle },
          { key: 'directory', label: 'Directory (Specialties & Cities)', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#008F8F] text-white shadow-sm'
                  : 'bg-white text-[#111827] border border-[#E0E6EF] hover:bg-[#F7F9FC]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                Total Doctors
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                {metrics.totalDoctors || 0}
              </p>
              <p className="text-[10px] text-[#008F8F] font-semibold mt-1">
                Registered in directory
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                Verified Doctors
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#008F8F] mt-1">
                {metrics.verifiedDoctors || 0}
              </p>
              <p className="text-[10px] text-[#008F8F] font-semibold mt-1">
                Badge enabled
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                Pending Verification
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#E3060B] mt-1">
                {metrics.pendingDoctors || 0}
              </p>
              <p className="text-[10px] text-[#E3060B] font-semibold mt-1">
                Awaiting SMC check
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                Active / Online Now
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981] mt-1">
                {metrics.activeToday || 0}
              </p>
              <p className="text-[10px] text-[#10B981] font-semibold mt-1">
                Online status indicator
              </p>
            </div>
          </div>

          {/* Pending Verification Quick Queue */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E3060B]" />
                Recent Pending Verification Requests
              </h3>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-xs font-bold text-[#008F8F] hover:underline"
              >
                View all doctors
              </button>
            </div>

            {doctors.filter((d) => d.verification_status === 'pending').length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                All doctor profiles have been reviewed! No pending verification requests.
              </p>
            ) : (
              <div className="space-y-3">
                {doctors
                  .filter((d) => d.verification_status === 'pending')
                  .slice(0, 4)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar_url}
                          alt={doc.full_name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#111827]">
                            {doc.full_name}
                          </h4>
                          <p className="text-[11px] text-[#008F8F]">
                            {doc.specialty_name} • {doc.city}
                          </p>
                          <p className="text-[10px] text-[#94A3B8] font-mono">
                            Reg: {doc.registration_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(doc.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(doc)}
                          className="px-3 py-1.5 rounded-xl border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-[#111827]">
              Doctor Management ({filteredDoctors.length})
            </h3>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search doctor or reg no..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                  className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
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
                  <th className="py-3 px-3">Specialty &amp; City</th>
                  <th className="py-3 px-3">Reg. Number</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Featured</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E6EF]">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={doc.avatar_url}
                          alt={doc.full_name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#111827] truncate">
                            {doc.full_name}
                          </p>
                          <p className="text-[10px] text-[#94A3B8] truncate">{doc.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#111827]">
                      <p className="font-medium text-[#008F8F]">{doc.specialty_name}</p>
                      <p className="text-[10px] text-[#94A3B8]">{doc.city}</p>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-[#111827]">
                      {doc.registration_number}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        onClick={() => handleToggleFeatured(doc.id)}
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
                            onClick={() => handleApprove(doc.id)}
                            title="Approve Credentials"
                            className="p-1.5 rounded-lg bg-[#008F8F] text-white hover:bg-[#007C7C]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {doc.verification_status !== 'rejected' && (
                          <button
                            onClick={() => openRejectModal(doc)}
                            title="Reject Credentials"
                            className="p-1.5 rounded-lg border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteDoctor(doc.id)}
                          title="Remove Doctor"
                          className="p-1.5 rounded-lg border border-[#E0E6EF] text-[#94A3B8] hover:text-[#E3060B] hover:bg-[#FFF0F0]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION & REPORTS */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
          <h3 className="text-base font-extrabold text-[#111827]">
            Profile Moderation &amp; User Reports
          </h3>

          {reports.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">
              No reported profiles. The directory is clean and in order.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#E3060B]">
                      Reason: {rep.reason}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#111827]">
                    Reported Doctor:{' '}
                    <span className="font-semibold text-[#008F8F]">
                      {rep.doctor_name}
                    </span>{' '}
                    (Reg: {rep.doctor_registration})
                  </p>
                  {rep.details && (
                    <p className="text-[11px] text-[#94A3B8] italic bg-white p-2 rounded-xl border border-[#E0E6EF]">
                      "{rep.details}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="px-3 py-1 rounded-xl bg-white border border-[#E0E6EF] text-xs font-semibold text-[#111827] hover:bg-gray-100"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteDoctor(rep.doctor_id);
                        handleDismissReport(rep.id);
                      }}
                      className="px-3 py-1 rounded-xl bg-[#E3060B] text-white text-xs font-bold hover:bg-[#C20408]"
                    >
                      Remove Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DIRECTORY MANAGEMENT (Specialties & Cities) */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specialties Management */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-[#111827]">
              Medical Specialties ({specialties.length})
            </h3>

            <form onSubmit={handleAddSpecialty} className="flex gap-2">
              <input
                type="text"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                placeholder="New specialty name..."
                className="flex-1 bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {specialties.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E0E6EF] text-xs"
                >
                  <span className="font-semibold text-[#111827]">{s.name}</span>
                  <button
                    onClick={() => handleDeleteSpecialty(s.id)}
                    className="text-[#94A3B8] hover:text-[#E3060B] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cities Management */}
          <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-[#111827]">
              Directory Cities ({cities.length})
            </h3>

            <form onSubmit={handleAddCity} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="City name..."
                  className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
                <input
                  type="text"
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  placeholder="State..."
                  className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add City
              </button>
            </form>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {cities.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E0E6EF] text-xs"
                >
                  <span className="font-semibold text-[#111827]">
                    {c.name} {c.state ? `(${c.state})` : ''}
                  </span>
                  <button
                    onClick={() => handleDeleteCity(c.id)}
                    className="text-[#94A3B8] hover:text-[#E3060B] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reject Doctor Reason Modal */}
      {rejectModalOpen && selectedDoctorForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-bold text-[#E3060B]">
                Reject Verification
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Rejecting credentials for: <strong>{selectedDoctorForReject.full_name}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E0E6EF] text-xs font-bold text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#E3060B] text-white text-xs font-bold hover:bg-[#C20408]"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
