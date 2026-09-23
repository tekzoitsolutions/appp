import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';
import { getLocalSettings } from '../../services/storageService';

export const TermsPrivacy = () => {
  const settings = getLocalSettings();
  const content = settings.terms_privacy || {};
  const security = settings.security || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-2">
        <span className="text-[11px] font-bold text-[#008F8F] uppercase tracking-wider">
          Legal &amp; Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Terms of Use &amp; Privacy Policy
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Last revised: {content.last_updated || 'January 2026'}
        </p>
      </div>

      {/* Terms of Service */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 text-[#E3060B]">
          <FileText className="w-5 h-5" />
          <h2 className="text-base font-extrabold text-[#111827]">
            Professional Terms of Use
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#111827]/80 leading-relaxed">
          {content.terms ||
            'By accessing and using the MY NSDA Directory, users agree to respect medical ethics, protect doctor privacy, and use contact information strictly for authentic professional or healthcare consultation inquiries. Misuse of doctor contacts is strictly prohibited.'}
        </p>

        <ul className="text-xs text-[#111827]/80 space-y-2 pt-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-[#008F8F] shrink-0 mt-0.5" />
            <span>Information is provided for professional doctor verification and patient consultations only.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-[#008F8F] shrink-0 mt-0.5" />
            <span>Unauthorized harvesting, automated scraping, or bulk commercial solicitation is strictly prohibited.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-[#008F8F] shrink-0 mt-0.5" />
            <span>Doctor registration requires authentic State Medical Council (SMC) or NMC credentials.</span>
          </li>
        </ul>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 text-[#008F8F]">
          <Lock className="w-5 h-5" />
          <h2 className="text-base font-extrabold text-[#111827]">
            Doctor Confidentiality &amp; Privacy Policy
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#111827]/80 leading-relaxed">
          {content.privacy ||
            'Doctor contact privacy is respected. Doctors have full control over the public visibility of their personal contact numbers and email addresses. Verification documents are strictly encrypted and accessible solely by authorized NSDA verification committees.'}
        </p>

        <div className="bg-[#EFFAFA] p-4 rounded-2xl border border-[#008F8F]/20 text-xs text-[#008F8F] leading-relaxed">
          <strong>Privacy Controls:</strong> Every registered practitioner can toggle whether their mobile number and email are visible on public doctor cards at any time via their Doctor Dashboard.
        </div>
      </div>

      {/* Security Architecture */}
      <div id="security" className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 text-[#008F8F]">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-base font-extrabold text-[#111827]">
            Security Standards
          </h2>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-[#111827]/80 leading-relaxed">
          <p>
            <strong>Encryption:</strong> {security.encryption || '256-bit SSL/TLS Transport Layer Security across all data endpoints.'}
          </p>
          <p>
            <strong>Database Security:</strong> {security.rls || 'PostgreSQL Row Level Security (RLS) ensures that doctors can modify only their own profiles and documents.'}
          </p>
          <p>
            <strong>Compliance:</strong> {security.compliance || 'Compliant with Indian IT Act 2000 and Telemedicine Practice Guidelines.'}
          </p>
        </div>
      </div>
    </div>
  );
};
