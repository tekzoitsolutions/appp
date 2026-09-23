import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenMenu, onOpenNotifications, unreadCount = 0 }) => {
  const { user, role } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E0E6EF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Red circular N logo */}
          <div className="w-10 h-10 rounded-full bg-[#E3060B] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-white font-extrabold text-xl leading-none font-sans select-none">
              N
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-wide text-[#111827]">
                MY NSDA
              </span>
              {role !== 'guest' && role && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/30">
                  {role.replace('_', ' ')}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
              NSDA DOCTORS
            </span>
          </div>
        </Link>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full text-[#111827] hover:bg-[#F7F9FC] transition-colors border border-[#E0E6EF]"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-[#111827]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E3060B] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenMenu}
            className="p-2.5 rounded-full text-[#111827] hover:bg-[#F7F9FC] transition-colors border border-[#E0E6EF]"
            aria-label="Toggle menu drawer"
          >
            <Menu className="w-5 h-5 text-[#111827]" />
          </button>
        </div>
      </div>
    </header>
  );
};
