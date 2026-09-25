import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Search, QrCode, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DesktopNav = ({ onOpenQR }) => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="hidden md:block bg-white border-b border-[#E0E6EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Main Navigation Links */}
          <div className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF0F0] text-[#E3060B]'
                    : 'text-[#111827] hover:bg-[#F7F9FC]'
                }`
              }
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </NavLink>

            <NavLink
              to="/directory"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF0F0] text-[#E3060B]'
                    : 'text-[#111827] hover:bg-[#F7F9FC]'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              Doctors Directory
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF0F0] text-[#E3060B]'
                    : 'text-[#111827] hover:bg-[#F7F9FC]'
                }`
              }
            >
              <Search className="w-3.5 h-3.5" />
              Advanced Search
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#FFF0F0] text-[#E3060B]'
                    : 'text-[#111827] hover:bg-[#F7F9FC]'
                }`
              }
            >
              About NSDA
            </NavLink>
          </div>

          {/* Quick Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQR}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#008F8F] bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white transition-colors border border-[#008F8F]/20"
            >
              <QrCode className="w-3.5 h-3.5" />
              Share App (QR)
            </button>

            {isAuthenticated && (
              <NavLink
                to={
                  role === 'super_admin'
                    ? '/superadmin/dashboard'
                    : role === 'admin'
                    ? '/admin/dashboard'
                    : '/doctor/dashboard'
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#008F8F] text-white hover:bg-[#007C7C] transition-colors shadow-xs"
              >
                {role === 'doctor' ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
                {role === 'super_admin'
                  ? 'Super Admin Console'
                  : role === 'admin'
                  ? 'Admin Portal'
                  : 'Doctor Dashboard'}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
