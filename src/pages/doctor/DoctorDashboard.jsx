import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  Save,
  LogOut,
  ExternalLink,
  Building,
  MapPin,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDoctorById, updateDoctorProfile } from '../../services/doctorService';
import { getLocalSpecialties, getLocalCities } from '../../services/storageService';

export const DoctorDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form fields
  const [form, setForm] = useState({
    full_name: '',
    qualifications: '',
    subspecialty: '',
    hospital: '',
    clinic_address: '',
    city: '',
    experience_years: 0,
    bio: '',
    consultation_fee: '',
    available_timings: '',
    phone_visible: true,
    email_visible: true,
  });

  useEffect(() => {
    const loadDoctorData = async () => {
      setLoading(true);
      setSpecialties(getLocalSpecialties().filter((s) => s.slug !== 'all'));
      setCities(getLocalCities().filter((c) => c.name !== 'All Cities'));

      const targetId = user?.doctor_profile_id || user?.id || 'doc-1';
      const data = await getDoctorById(targetId);

      if (data) {
        setDoctor(data);
        setForm({
          full_name: data.full_name || user?.full_name || '',
          qualifications: data.qualifications || '',
          subspecialty: data.subspecialty || '',
          hospital: data.hospital || '',
          clinic_address: data.clinic_address || '',
          city: data.city || 'Mumbai',
          experience_years: data.experience_years || 0,
          bio: data.bio || '',
          consultation_fee: data.consultation_fee || '₹1,500',
          available_timings: data.available_timings || 'Mon - Fri: 10am - 4pm',
          phone_visible: data.phone_visible !== undefined ? data.phone_visible : true,
          email_visible: data.email_visible !== undefined ? data.email_visible : true,
        });
        setAvatarPreview(data.avatar_url);
      }
      setLoading(false);
    };

    loadDoctorData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        ...form,
        avatar_url: avatarPreview,
      };
      await updateDoctorProfile(doctor.id, updates, user.full_name);
      updateProfile({
        full_name: form.full_name,
        avatar_url: avatarPreview,
      });
      addToast('Profile changes saved successfully', 'success');
    } catch (err) {
      addToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!doctor) return 50;
    let score = 0;
    if (form.full_name) score += 15;
    if (form.qualifications) score += 15;
    if (form.hospital) score += 15;
    if (form.bio) score += 15;
    if (avatarPreview) score += 15;
    if (doctor.registration_number) score += 15;
    if (form.consultation_fee) score += 10;
    return Math.min(score, 100);
  };

  const completionPercent = calculateCompletion();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse bg-white rounded-3xl p-8 border border-[#E0E6EF] h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Banner with Doctor Info & Verification Status */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={
                avatarPreview ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'
              }
              alt="Avatar"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#008F8F]"
            />
            {doctor?.is_online && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                {form.full_name || 'Dr. Doctor'}
              </h1>
            </div>
            <p className="text-xs font-bold text-[#008F8F] mt-0.5">
              {doctor?.specialty_name || 'Specialist'} • Reg: {doctor?.registration_number || 'N/A'}
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          {doctor?.id && (
            <Link
              to={`/doctor/${doctor.id}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFFAFA] text-[#008F8F] hover:bg-[#008F8F] hover:text-white text-xs font-bold transition-colors border border-[#008F8F]/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Profile
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#E0E6EF] text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      {doctor?.verification_status === 'verified' && (
        <div className="bg-[#EFFAFA] border border-[#008F8F]/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-[#008F8F] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#008F8F]">
              Verified NSDA Practitioner
            </h4>
            <p className="text-[11px] text-[#111827]/80">
              Your Medical Council registration credentials have been verified by NSDA Credentialing Board. Your profile displays the official verified badge in the directory.
            </p>
          </div>
        </div>
      )}

      {doctor?.verification_status === 'pending' && (
        <div className="bg-[#FFF0F0] border border-[#E3060B]/30 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#E3060B] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#E3060B]">
              Verification Under Review
            </h4>
            <p className="text-[11px] text-[#111827]/80">
              Your profile is currently under review by NSDA administrators. We verify your registration ({doctor?.registration_number}) within 24-48 hours. You may continue to update your profile.
            </p>
          </div>
        </div>
      )}

      {doctor?.verification_status === 'rejected' && (
        <div className="bg-[#FFF0F0] border border-[#E3060B] rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-[#E3060B] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#E3060B]">
              Verification Needs Attention
            </h4>
            <p className="text-[11px] text-[#111827]/90 mt-0.5">
              Reason provided by Admin:{' '}
              <span className="font-semibold">{doctor?.verification_reason || 'Incomplete registration documents'}</span>. Please update your details and contact support.
            </p>
          </div>
        </div>
      )}

      {/* Profile Completion Meter */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-5 shadow-card space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#111827]">Profile Completion Status</span>
          <span className="text-[#008F8F]">{completionPercent}%</span>
        </div>
        <div className="w-full bg-[#E0E6EF] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#008F8F] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-[#94A3B8]">
          Complete profiles receive 4x more clinical referrals and peer inquiries.
        </p>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <User className="w-4 h-4 text-[#008F8F]" />
            Doctor Information &amp; Clinical Details
          </h3>

          {/* Photo update */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF]">
            <img
              src={avatarPreview || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
              alt="Current avatar"
              className="w-14 h-14 rounded-2xl object-cover border border-[#E0E6EF]"
            />
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Update Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="text-xs text-[#94A3B8] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#008F8F] file:text-white hover:file:bg-[#007C7C] cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Qualifications &amp; Degrees
              </label>
              <input
                type="text"
                name="qualifications"
                value={form.qualifications}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Subspecialty / Focus Area
              </label>
              <input
                type="text"
                name="subspecialty"
                value={form.subspecialty}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                name="experience_years"
                value={form.experience_years}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                name="hospital"
                value={form.hospital}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Practice City
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleInputChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Clinic Address
            </label>
            <input
              type="text"
              name="clinic_address"
              value={form.clinic_address}
              onChange={handleInputChange}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Consultation Fee
              </label>
              <input
                type="text"
                name="consultation_fee"
                value={form.consultation_fee}
                onChange={handleInputChange}
                placeholder="e.g. ₹1,500"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Available Timings
              </label>
              <input
                type="text"
                name="available_timings"
                value={form.available_timings}
                onChange={handleInputChange}
                placeholder="e.g. Mon - Fri: 10:00 AM - 4:00 PM"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Biography &amp; Clinical Focus
            </label>
            <textarea
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleInputChange}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F] resize-none"
            />
          </div>
        </div>

        {/* Contact Visibility Controls */}
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#008F8F]" />
            Doctor Contact Privacy Controls
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Configure which personal details are publicly visible on your doctor directory card
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] cursor-pointer hover:bg-[#EFFAFA]">
              <div className="flex items-center gap-3">
                {form.phone_visible ? (
                  <Eye className="w-4 h-4 text-[#008F8F]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#94A3B8]" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    Public Mobile Number Display
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    Allow patients and peers to view your direct phone number for calls
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                name="phone_visible"
                checked={form.phone_visible}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-[#008F8F]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF] cursor-pointer hover:bg-[#EFFAFA]">
              <div className="flex items-center gap-3">
                {form.email_visible ? (
                  <Eye className="w-4 h-4 text-[#008F8F]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#94A3B8]" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#111827] block">
                    Public Email Address Display
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    Show your registered contact email address on your profile page
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                name="email_visible"
                checked={form.email_visible}
                onChange={handleInputChange}
                className="w-4 h-4 rounded accent-[#008F8F]"
              />
            </label>
          </div>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
