import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, switchRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.full_name}!`, 'success');

      if (user.role === 'super_admin') {
        navigate('/superadmin/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (roleKey) => {
    const user = switchRole(roleKey);
    addToast(`Signed in as ${user.full_name} (${roleKey.toUpperCase()})`, 'success');
    if (roleKey === 'super_admin') {
      navigate('/superadmin/dashboard');
    } else if (roleKey === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/doctor/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-[#E3060B] text-white flex items-center justify-center mx-auto mb-3 shadow-md font-sans text-2xl font-extrabold">
          N
        </div>
        <h1 className="text-2xl font-extrabold text-[#111827]">
          Sign In to MY NSDA
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Access your Doctor Portal or Administrative Dashboard
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-5">
        {error && (
          <div className="p-3 rounded-2xl bg-[#FFF0F0] border border-[#E3060B]/30 flex items-center gap-2.5 text-xs text-[#E3060B]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@nsda.org.in"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#111827]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-[#008F8F] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E0E6EF]" />
          <span className="flex-shrink mx-3 text-[11px] font-bold text-[#94A3B8] uppercase">
            Quick Testing Demo Login
          </span>
          <div className="flex-grow border-t border-[#E0E6EF]" />
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('doctor')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#EFFAFA] hover:bg-[#008F8F] hover:text-white text-[#008F8F] border border-[#008F8F]/20 text-xs font-bold transition-all group"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Demo Doctor (Dr. Rajesh Sharma)
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F7F9FC] hover:bg-[#007C7C] hover:text-white text-[#111827] border border-[#E0E6EF] text-xs font-bold transition-all group"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#008F8F] group-hover:text-white" />
              Demo Admin (Moderator)
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('super_admin')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FFF0F0] hover:bg-[#E3060B] hover:text-white text-[#E3060B] border border-[#E3060B]/20 text-xs font-bold transition-all group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Demo Super Admin (Full Control)
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="pt-2 text-center border-t border-[#E0E6EF]">
          <p className="text-xs text-[#94A3B8]">
            Not registered as an NSDA Doctor yet?{' '}
            <Link
              to="/register"
              className="font-bold text-[#E3060B] hover:underline"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
