import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Search, User, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Determine profile link destination based on auth state & role
  const profileLink = !isAuthenticated
    ? '/login'
    : role === 'super_admin'
    ? '/superadmin/dashboard'
    : role === 'admin'
    ? '/admin/dashboard'
    : '/doctor/dashboard';

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Doctors', path: '/directory', icon: Users },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Profile', path: profileLink, icon: User },
    { label: 'More', path: '/more', icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E0E6EF] shadow-nav pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#FFF0F0] text-[#E3060B]'
                  : 'text-[#94A3B8] hover:text-[#111827]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 text-[#E3060B]' : 'text-[#94A3B8]'
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-semibold ${
                  isActive ? 'text-[#E3060B]' : 'text-[#94A3B8]'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
