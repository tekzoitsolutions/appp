import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  Award,
  Stethoscope,
  Building,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getLocalSpecialties, getLocalCities } from '../../services/storageService';

export const RegisterDoctor = () => {
  const { registerDoctor } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    qualifications: '',
    specialtyId: '',
    specialtyName: '',
    subspecialty: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    hospital: '',
    clinicAddress: '',
    registrationNumber: '',
    experienceYears: '5',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const specs = getLocalSpecialties().filter((s) => s.slug !== 'all');
    setSpecialties(specs);
    if (specs.length > 0) {
      setFormData((prev) => ({
        ...prev,
        specialtyId: specs[0].id,
        specialtyName: specs[0].name,
      }));
    }
    const c = getLocalCities().filter((ci) => ci.name !== 'All Cities');
    setCities(c);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialtyId') {
      const selected = specialties.find((s) => s.id === value);
      setFormData((prev) => ({
        ...prev,
        specialtyId: value,
        specialtyName: selected ? selected.name : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.fullName.startsWith('Dr.')) {
      formData.fullName = `Dr. ${formData.fullName.trim()}`;
    }

    try {
      await registerDoctor(formData);
      addToast('Registration successful! Profile submitted for NSDA verification.', 'success');
      navigate('/doctor/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[#E3060B] text-white flex items-center justify-center mx-auto mb-3 shadow-md font-sans text-2xl font-extrabold">
          N
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Doctor Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Join the verified National Society for Doctors Association directory
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#FFF0F0] border border-[#E3060B]/30 flex items-center gap-2.5 text-xs text-[#E3060B]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice of Verification */}
        <div className="bg-[#EFFAFA] border border-[#008F8F]/20 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#008F8F] shrink-0 mt-0.5" />
          <div className="text-xs text-[#111827]/90 leading-relaxed">
            <strong className="text-[#008F8F]">Credential Verification:</strong> All doctor accounts are initially set to <em>Pending Verification</em>. After submitting, NSDA administrators verify your Medical Council Registration number before applying the Verified Badge.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF]">
            <div className="w-16 h-16 rounded-2xl bg-[#E0E6EF] overflow-hidden flex items-center justify-center shrink-0 border border-[#E0E6EF]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-6 h-6 text-[#94A3B8]" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Doctor Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-xs text-[#94A3B8] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#008F8F] file:text-white hover:file:bg-[#007C7C] cursor-pointer"
              />
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Full Name (with Dr. prefix) *
              </label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Dr. Rajesh Sharma"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98200 00000"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.org"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>
            </div>
          </div>

          {/* Qualifications & Medical Registration Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Medical Degrees &amp; Qualifications *
              </label>
              <input
                type="text"
                required
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="e.g. MBBS, MS (Orthopaedics), MCh"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Registration Number (SMC / NMC) *
              </label>
              <input
                type="text"
                required
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. MMC-2012/04/1820"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          {/* Specialty & Subspecialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Primary Specialty *
              </label>
              <select
                name="specialtyId"
                value={formData.specialtyId}
                onChange={handleChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              >
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Subspecialty / Focus Area
              </label>
              <input
                type="text"
                name="subspecialty"
                value={formData.subspecialty}
                onChange={handleChange}
                placeholder="e.g. Joint Replacement & Spine"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          {/* City & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                City / Practice Location *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.state ? `(${c.state})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Years of Clinical Experience
              </label>
              <input
                type="number"
                min="0"
                max="60"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
              />
            </div>
          </div>

          {/* Hospital / Clinic */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Affiliated Hospital or Clinic Name
            </label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              placeholder="e.g. Lilavati Hospital & Research Centre"
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Professional Biography
            </label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief overview of clinical background, achievements, and consulting hours..."
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Doctor Account...' : 'Complete Doctor Registration'}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#E0E6EF]">
          <p className="text-xs text-[#94A3B8]">
            Already have an NSDA account?{' '}
            <Link to="/login" className="font-bold text-[#008F8F] hover:underline">
              Doctor Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
