import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPasswordRequest } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPasswordRequest(email);
      setSubmitted(true);
      addToast('Password reset link sent to your registered email', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94A3B8] hover:text-[#111827] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#111827]">
            Reset Password
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Enter your registered doctor email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#EFFAFA] border border-[#008F8F]/20 rounded-2xl p-5 text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-[#008F8F] mx-auto" />
            <p className="text-xs font-bold text-[#111827]">
              Check your inbox
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              We have dispatched a password reset link to <strong>{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 text-xs font-bold text-[#008F8F] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@nsda.org.in"
                  className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#008F8F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
