import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Users,
  Search,
  UserPlus,
  LogIn,
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
  const { user, role, logout, switchRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleRoleSwitch = (newRole) => {
    switchRole(newRole);
    addToast(`Switched active session to: ${newRole.replace('_', ' ').toUpperCase()}`, 'info');
    onClose();
    if (newRole === 'super_admin') navigate('/superadmin/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
    else navigate('/doctor/dashboard');
  };

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

            {/* User profile card or login prompt */}
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
                <div className="text-center p-3 rounded-2xl bg-[#EFFAFA] border border-[#008F8F]/20">
                  <p className="text-xs font-semibold text-[#111827] mb-2">
                    Are you a medical doctor?
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="flex-1 py-1.5 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="flex-1 py-1.5 rounded-xl border border-[#008F8F] text-[#008F8F] text-xs font-bold hover:bg-white transition-colors"
                    >
                      Register
                    </Link>
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

              {/* Role-based dashboard links */}
              {role === 'doctor' && (
                <Link
                  to="/doctor/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#008F8F] bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Doctor Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#008F8F] bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {role === 'super_admin' && (
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

          {/* Bottom Switcher & Logout */}
          <div className="p-4 bg-[#F7F9FC] border-t border-[#E0E6EF] space-y-3">
            {/* Quick Role Switcher for Developer / Reviewer Testing */}
            <div className="bg-white p-2.5 rounded-xl border border-[#E0E6EF]">
              <span className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Quick Demo Switcher
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleRoleSwitch('doctor')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    role === 'doctor'
                      ? 'bg-[#008F8F] text-white'
                      : 'bg-[#F7F9FC] text-[#111827] hover:bg-[#EFFAFA]'
                  }`}
                >
                  Doctor
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    role === 'admin'
                      ? 'bg-[#008F8F] text-white'
                      : 'bg-[#F7F9FC] text-[#111827] hover:bg-[#EFFAFA]'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleSwitch('super_admin')}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    role === 'super_admin'
                      ? 'bg-[#E3060B] text-white'
                      : 'bg-[#F7F9FC] text-[#111827] hover:bg-[#FFF0F0]'
                  }`}
                >
                  Super
                </button>
              </div>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#E3060B]/30 text-[#E3060B] hover:bg-[#FFF0F0] text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
