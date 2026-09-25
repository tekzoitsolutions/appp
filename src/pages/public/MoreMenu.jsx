import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QrCode,
  Users,
  UserPlus,
  LogIn,
  Info,
  Star,
  FileText,
  HelpCircle,
  ShieldCheck,
  Share2,
  ChevronRight,
  LogOut,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QRCodeModal } from '../../components/common/QRCodeModal';

export const MoreMenu = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [qrOpen, setQrOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleShareApp = () => {
    setQrOpen(true);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MY NSDA — Doctors Directory',
          text: 'Explore verified doctors and stay connected professionally & socially.',
          url: window.location.origin,
        });
      } catch (err) {}
    } else {
      setQrOpen(true);
    }
  };

  const handleRateSubmit = (e) => {
    e.preventDefault();
    setRatingSubmitted(true);
    setTimeout(() => {
      addToast('Thank you for rating the MY NSDA App!', 'success');
      setRatingModalOpen(false);
      setRatingSubmitted(false);
    }, 600);
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* 1. Red Hero Section (Matching Screenshots 3 & 4) */}
      <div className="bg-[#E3060B] rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
          <span className="text-[#E3060B] font-extrabold text-3xl font-sans">
            N
          </span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-wide text-white">
          MY NSDA
        </h2>
        <p className="text-xs font-bold tracking-widest text-white/95 uppercase mt-0.5">
          NSDA DOCTORS DIRECTORY
        </p>
        <p className="text-xs sm:text-sm text-white/90 font-medium italic mt-2">
          Stay Connected Professionally &amp; Socially
        </p>

        {isAuthenticated && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <span>Signed in as {user.full_name}</span>
            <span className="uppercase text-[10px] bg-white text-[#E3060B] px-2 py-0.5 rounded-full">
              {role}
            </span>
          </div>
        )}
      </div>

      {/* 2. Menu Items Card List */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] shadow-card divide-y divide-[#E0E6EF] overflow-hidden">
        {/* Share App (QR) */}
        <button
          onClick={handleShareApp}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Share App (QR)
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Display QR code for quick scanning
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Doctors Directory */}
        <Link
          to="/directory"
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Doctors Directory
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Browse all verified NSDA doctors
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Doctor Dashboard (Only visible when authenticated) */}
        {isAuthenticated && (
          <Link
            to={
              role === 'super_admin'
                ? '/superadmin/dashboard'
                : role === 'admin'
                ? '/admin/dashboard'
                : '/doctor/dashboard'
            }
            className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                  {role === 'super_admin'
                    ? 'Super Admin Console'
                    : role === 'admin'
                    ? 'Admin Portal'
                    : 'Doctor Dashboard'}
                </h4>
                <p className="text-[11px] text-[#94A3B8]">
                  Manage profile, records &amp; credentials
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#E3060B] group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}

        {/* About NSDA */}
        <Link
          to="/about"
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F7F9FC] text-[#111827] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5 text-[#008F8F]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                About NSDA
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                History, vision and leadership board
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Rate the App */}
        <button
          onClick={() => setRatingModalOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Rate the App
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Share your feedback with NSDA developers
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#E3060B] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Terms & Privacy */}
        <Link
          to="/terms"
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F7F9FC] text-[#111827] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#008F8F]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Terms &amp; Privacy
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Medical ethics policy &amp; data privacy
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Help & Support */}
        <Link
          to="/help"
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Help &amp; Support
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Helpline, FAQs &amp; WhatsApp desk
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Security */}
        <Link
          to="/terms#security"
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F7F9FC] text-[#111827] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-[#008F8F]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Security
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Encryption standards &amp; doctor data safety
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#008F8F] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Share NSDA Directory */}
        <button
          onClick={handleNativeShare}
          className="w-full flex items-center justify-between p-4 hover:bg-[#F7F9FC] transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#111827]">
                Share NSDA Directory
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Invite colleagues and hospital networks
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#E3060B] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Staff & Doctor Portal Gateway (Discreet for authorized staff) */}
      {!isAuthenticated && (
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-[11px] text-[#94A3B8] hover:text-[#008F8F] transition-colors"
          >
            Doctor &amp; Staff Portal
          </Link>
        </div>
      )}

      {/* Logout option if logged in */}
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl bg-white border border-[#E3060B]/20 text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          Logout from Session
        </button>
      )}

      {/* QR Share Modal */}
      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Share MY NSDA Directory"
        subtitle="Scan with mobile camera to view app"
        url={window.location.origin}
      />

      {/* Rate App Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
            <button
              onClick={() => setRatingModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#FFF0F0] text-[#E3060B] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-[#111827]">Rate MY NSDA</h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                How has your experience been with the doctors directory?
              </p>
            </div>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              {/* Star Rating Selectors */}
              <div className="flex justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1.5 transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= selectedRating
                          ? 'text-[#E3060B] fill-current'
                          : 'text-[#E0E6EF]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Tell us what you like or what can be improved..."
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={ratingSubmitted}
                className="w-full py-2.5 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {ratingSubmitted ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
