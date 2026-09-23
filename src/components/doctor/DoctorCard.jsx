import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  Share2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { ChatModal } from '../common/ChatModal';
import { QRCodeModal } from '../common/QRCodeModal';
import { ReportDoctorModal } from '../common/ReportDoctorModal';
import { useToast } from '../../context/ToastContext';

export const DoctorCard = ({ doctor }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { addToast } = useToast();

  const handleCall = () => {
    if (!doctor.phone_visible) {
      addToast('Doctor has chosen to keep their direct phone number private', 'info');
      return;
    }
    if (doctor.phone) {
      window.location.href = `tel:${doctor.phone.replace(/\s+/g, '')}`;
    } else {
      addToast('Phone number not listed', 'info');
    }
  };

  const doctorProfileUrl = `${window.location.origin}/doctor/${doctor.id}`;

  return (
    <>
      <div className="bg-white rounded-3xl border border-[#E0E6EF] shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between relative group">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar with Online Status */}
          <div className="relative shrink-0">
            <img
              src={
                doctor.avatar_url ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
              }
              alt={doctor.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#E0E6EF] group-hover:border-[#008F8F] transition-colors"
            />
            {doctor.is_online && (
              <span
                title="Active now"
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full shadow-xs"
              />
            )}
          </div>

          {/* Quick Icon Actions (Share & Report) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setQrOpen(true)}
              title="Share Doctor Profile"
              className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#008F8F] hover:bg-[#EFFAFA] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReportOpen(true)}
              title="Report Profile"
              className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#E3060B] hover:bg-[#FFF0F0] transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="flex-1 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/doctor/${doctor.id}`}
              className="text-base sm:text-lg font-bold text-[#111827] hover:text-[#008F8F] transition-colors line-clamp-1"
            >
              {doctor.full_name}
            </Link>
            {doctor.verification_status === 'verified' && (
              <span
                title="Verified NSDA Doctor"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#EFFAFA] text-[#008F8F] text-[10px] font-bold border border-[#008F8F]/30 shrink-0"
              >
                <CheckCircle className="w-3 h-3 text-[#008F8F]" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-[#008F8F] mt-0.5">
            {doctor.specialty_name || 'Specialist'}
          </p>

          <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-1 font-medium">
            {doctor.qualifications}
          </p>

          {/* Location & Experience */}
          <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-[#111827]">
            <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
              <MapPin className="w-3.5 h-3.5 text-[#008F8F] shrink-0" />
              <span className="truncate max-w-[130px]">{doctor.city}</span>
            </span>

            {doctor.experience_years > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                <Briefcase className="w-3.5 h-3.5 text-[#008F8F] shrink-0" />
                <span>{doctor.experience_years} yrs exp</span>
              </span>
            )}
          </div>

          {doctor.hospital && (
            <p className="text-[11px] text-[#94A3B8] mt-1.5 line-clamp-1">
              {doctor.hospital}
            </p>
          )}
        </div>

        {/* Action Buttons: View Profile, Call, Chat */}
        <div className="grid grid-cols-12 gap-2 pt-3 border-t border-[#E0E6EF]">
          <Link
            to={`/doctor/${doctor.id}`}
            className="col-span-6 flex items-center justify-center py-2 px-2.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-xs"
          >
            View Profile
          </Link>

          <button
            onClick={handleCall}
            title={doctor.phone_visible ? 'Call Doctor' : 'Phone private'}
            className="col-span-3 flex items-center justify-center py-2 px-2 rounded-xl border border-[#E0E6EF] text-[#111827] hover:bg-[#EFFAFA] hover:text-[#008F8F] hover:border-[#008F8F] transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setChatOpen(true)}
            title="Chat with Doctor"
            className="col-span-3 flex items-center justify-center py-2 px-2 rounded-xl border border-[#E0E6EF] text-[#111827] hover:bg-[#FFF0F0] hover:text-[#E3060B] hover:border-[#E3060B] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded Modals */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        doctor={doctor}
      />
      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title={doctor.full_name}
        subtitle="Scan to view verified doctor credentials & consult"
        url={doctorProfileUrl}
      />
      <ReportDoctorModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        doctor={doctor}
      />
    </>
  );
};
