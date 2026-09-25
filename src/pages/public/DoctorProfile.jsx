import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Phone,
  Share2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Award,
  Clock,
  DollarSign,
  Mail,
  Shield,
  ArrowLeft,
  Building,
} from 'lucide-react';
import { getDoctorById } from '../../services/doctorService';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { openWhatsAppDirect } from '../../lib/whatsappHelper';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { ReportDoctorModal } from '../../components/common/ReportDoctorModal';
import { useToast } from '../../context/ToastContext';

export const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const loadDoctor = async () => {
      setLoading(true);
      const data = await getDoctorById(id);
      setDoctor(data);
      setLoading(false);
    };

    loadDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse bg-white rounded-3xl p-8 border border-[#E0E6EF] h-96" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#111827] mb-2">Doctor Profile Not Found</h2>
        <p className="text-xs text-[#94A3B8] mb-6">
          The requested doctor profile does not exist or may have been unlisted.
        </p>
        <button
          onClick={() => navigate('/directory')}
          className="px-5 py-2.5 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C]"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const handleCall = () => {
    if (!doctor.phone_visible) {
      addToast('Doctor has chosen to keep their direct phone number private', 'info');
      return;
    }
    if (doctor.phone) {
      window.location.href = `tel:${doctor.phone.replace(/\s+/g, '')}`;
    } else {
      addToast('Phone number not provided', 'info');
    }
  };

  const handleWhatsApp = () => {
    openWhatsAppDirect(doctor, addToast);
  };

  const currentUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Top background accent banner */}
        <div className="h-20 bg-gradient-to-r from-[#EFFAFA] to-[#FFF0F0] absolute top-0 left-0 right-0 border-b border-[#E0E6EF]" />

        <div className="relative pt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Online Status */}
          <div className="relative shrink-0">
            <img
              src={
                doctor.avatar_url ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
              }
              alt={doctor.full_name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-md"
            />
            {doctor.is_online && (
              <span
                title="Active now"
                className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-2 border-white rounded-full shadow-sm"
              />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                {doctor.full_name}
              </h1>
              {doctor.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFFAFA] text-[#008F8F] text-xs font-bold border border-[#008F8F]/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified NSDA Doctor
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-[#008F8F]">
              {doctor.specialty_name} {doctor.subspecialty ? `• ${doctor.subspecialty}` : ''}
            </p>

            <p className="text-xs text-[#94A3B8] font-medium">
              {doctor.qualifications}
            </p>

            {/* Quick meta badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-[#111827]">
                <MapPin className="w-4 h-4 text-[#008F8F]" />
                {doctor.city}, {doctor.state || 'India'}
              </span>

              {doctor.experience_years > 0 && (
                <span className="flex items-center gap-1.5 text-[#111827]">
                  <Briefcase className="w-4 h-4 text-[#008F8F]" />
                  {doctor.experience_years} Years Experience
                </span>
              )}

              <span className="flex items-center gap-1.5 text-[#111827]">
                <Award className="w-4 h-4 text-[#008F8F]" />
                Reg: {doctor.registration_number}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-8 pt-6 border-t border-[#E0E6EF] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#008F8F] text-white hover:bg-[#007C7C] text-xs font-bold transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            Call Doctor
          </button>

          <button
            onClick={handleWhatsApp}
            title={doctor.phone_visible ? 'Direct WhatsApp Message' : 'Contact number private'}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-bold transition-colors shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </button>

          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#E0E6EF] text-[#111827] hover:bg-[#F7F9FC] text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#008F8F]" />
            Share Profile
          </button>

          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#E0E6EF] text-[#111827] hover:bg-[#FFF0F0] hover:text-[#E3060B] text-xs font-bold transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-[#E3060B]" />
            Report
          </button>
        </div>
      </div>

      {/* Bio / About Section */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
        <h3 className="text-base font-extrabold text-[#111827]">
          About Dr. {doctor.full_name.replace('Dr. ', '')}
        </h3>
        <p className="text-xs sm:text-sm text-[#111827]/80 leading-relaxed whitespace-pre-line">
          {doctor.bio ||
            'Experienced specialist registered with the National Society for Doctors Association. Committed to ethical patient care, continuous clinical advancement, and peer collaboration.'}
        </p>
      </div>

      {/* Hospital / Clinic & Consultation Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Practice Location */}
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2.5 text-[#008F8F]">
            <Building className="w-5 h-5" />
            <h4 className="text-sm font-extrabold text-[#111827]">
              Practice Location
            </h4>
          </div>
          <div className="text-xs space-y-1.5 pt-1">
            <p className="font-bold text-[#111827]">{doctor.hospital || 'Private Clinic'}</p>
            <p className="text-[#94A3B8]">{doctor.clinic_address || 'Consulting Chambers'}</p>
            <p className="text-[#94A3B8]">
              {doctor.city}, {doctor.state || 'India'}
            </p>
          </div>
        </div>

        {/* Timings & Consultation */}
        <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2.5 text-[#008F8F]">
            <Clock className="w-5 h-5" />
            <h4 className="text-sm font-extrabold text-[#111827]">
              Consultation Hours &amp; Fees
            </h4>
          </div>
          <div className="text-xs space-y-2 pt-1">
            <div className="flex items-center justify-between py-1 border-b border-[#E0E6EF]">
              <span className="text-[#94A3B8]">Timings:</span>
              <span className="font-semibold text-[#111827]">
                {doctor.available_timings || 'Mon - Sat: 10:00 AM - 4:00 PM'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#94A3B8]">Consultation Fee:</span>
              <span className="font-bold text-[#008F8F]">
                {doctor.consultation_fee || '₹1,200'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Privacy Section */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 shadow-card space-y-4">
        <h4 className="text-sm font-extrabold text-[#111827] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#008F8F]" />
          Verified Contact Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF]">
            <Phone className="w-4 h-4 text-[#008F8F]" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#94A3B8] font-bold uppercase">Phone</p>
              <p className="text-xs font-semibold text-[#111827] truncate">
                {doctor.phone_visible ? doctor.phone : 'Hidden by Doctor (Private)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F7F9FC] border border-[#E0E6EF]">
            <Mail className="w-4 h-4 text-[#008F8F]" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#94A3B8] font-bold uppercase">Email</p>
              <p className="text-xs font-semibold text-[#111827] truncate">
                {doctor.email_visible ? doctor.email : 'Hidden by Doctor (Private)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title={doctor.full_name}
        subtitle="Scan with mobile camera to view credentials"
        url={currentUrl}
      />
      <ReportDoctorModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        doctor={doctor}
      />
    </div>
  );
};
