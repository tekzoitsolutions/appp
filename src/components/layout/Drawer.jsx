import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Users,
  Search,
  QrCode,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Drawer = ({ isOpen, onClose, onOpenQR }) => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          {/* Top section */}
          <div>
            {/* Header */}
            <div className="p-5 bg-[#F7F9FC] border-b border-[#E0E6EF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E3060B] text-white flex items-center justify-center font-bold text-lg">
                  N
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#111827]">MY NSDA</h3>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Medical Platform
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User profile card or Directory Welcome */}
            <div className="p-4 border-b border-[#E0E6EF]">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF0F0]/60 border border-[#E3060B]/20">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                    alt={user.full_name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#E3060B]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#111827] truncate">
                      {user.full_name}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] truncate">{user.email}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E3060B] text-white">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#EFFAFA] border border-[#008F8F]/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#008F8F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">
                      NSDA Doctors Directory
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                      Connect with verified doctors &amp; specialists
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <div className="p-3 space-y-1">
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] transition-colors"
              >
                <Home className="w-4 h-4 text-[#94A3B8]" />
                Home
              </Link>
              <Link
                to="/directory"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] transition-colors"
              >
                <Users className="w-4 h-4 text-[#94A3B8]" />
                Doctors Directory
              </Link>
              <Link
                to="/search"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] transition-colors"
              >
                <Search className="w-4 h-4 text-[#94A3B8]" />
                Advanced Search
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onOpenQR();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] transition-colors text-left"
              >
                <QrCode className="w-4 h-4 text-[#94A3B8]" />
                Share App (QR)
              </button>

              {/* Role-based dashboard links (Only when authenticated) */}
              {isAuthenticated && role === 'doctor' && (
                <Link
                  to="/doctor/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#008F8F] bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Doctor Dashboard
                </Link>
              )}
              {isAuthenticated && role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#008F8F] bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && role === 'super_admin' && (
                <Link
                  to="/superadmin/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#E3060B] bg-[#FFF0F0] hover:bg-[#E3060B] hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Super Admin Console
                </Link>
              )}

              <div className="pt-2 border-t border-[#E0E6EF] my-2" />

              <Link
                to="/about"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#111827] hover:bg-[#F7F9FC]"
              >
                <FileText className="w-4 h-4 text-[#94A3B8]" />
                About NSDA
              </Link>
              <Link
                to="/terms"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#111827] hover:bg-[#F7F9FC]"
              >
                <Shield className="w-4 h-4 text-[#94A3B8]" />
                Terms &amp; Privacy
              </Link>
              <Link
                to="/help"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#111827] hover:bg-[#F7F9FC]"
              >
                <HelpCircle className="w-4 h-4 text-[#94A3B8]" />
                Help &amp; Support
              </Link>
            </div>
          </div>

          {/* Bottom Footer & Portal Gateway */}
          <div className="p-4 bg-[#F7F9FC] border-t border-[#E0E6EF] text-center">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="text-[11px] font-medium text-[#94A3B8] hover:text-[#008F8F] transition-colors"
              >
                Doctor &amp; Staff Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
