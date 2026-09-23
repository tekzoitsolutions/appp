import React from 'react';
import { ShieldCheck, Award, Users, HeartHandshake, Mail, Phone, MapPin } from 'lucide-react';
import { getLocalSettings } from '../../services/storageService';

export const AboutNSDA = () => {
  const settings = getLocalSettings();
  const about = settings.about_nsda || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#008F8F] text-white rounded-3xl p-6 sm:p-10 shadow-card relative overflow-hidden">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            Established {about.founded_year || '1998'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {about.title || 'About National Society for Doctors Association'}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            {about.description}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center">
          <Users className="w-8 h-8 text-[#008F8F] mx-auto mb-2" />
          <p className="text-xl font-extrabold text-[#111827]">
            {about.total_members || '12,500+'}
          </p>
          <p className="text-xs text-[#94A3B8]">Verified Medical Doctors</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center">
          <ShieldCheck className="w-8 h-8 text-[#E3060B] mx-auto mb-2" />
          <p className="text-xl font-extrabold text-[#111827]">100%</p>
          <p className="text-xs text-[#94A3B8]">Credential Verified</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center">
          <HeartHandshake className="w-8 h-8 text-[#008F8F] mx-auto mb-2" />
          <p className="text-xl font-extrabold text-[#111827]">28+ States</p>
          <p className="text-xs text-[#94A3B8]">Pan-India Coverage</p>
        </div>
      </div>

      {/* Mission & President Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E0E6EF] shadow-card space-y-3">
          <h3 className="text-base font-extrabold text-[#111827]">
            Our Mission &amp; Purpose
          </h3>
          <p className="text-xs sm:text-sm text-[#111827]/80 leading-relaxed">
            {about.mission ||
              'To uphold the highest standards of clinical excellence, medical ethics, physician solidarity, continuous education, and community healthcare access across all states and districts.'}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E0E6EF] shadow-card space-y-3">
          <h3 className="text-base font-extrabold text-[#111827]">
            President's Message
          </h3>
          <blockquote className="text-xs sm:text-sm text-[#111827]/80 italic leading-relaxed border-l-2 border-[#E3060B] pl-4">
            "{about.presidents_message ||
              'Welcome to MY NSDA. Together we form a stronger medical community connected professionally and socially.'}"
          </blockquote>
        </div>
      </div>

      {/* Association Contact Box */}
      <div className="bg-white p-6 rounded-3xl border border-[#E0E6EF] shadow-card space-y-3">
        <h4 className="text-sm font-extrabold text-[#111827]">
          NSDA National Headquarters
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="flex items-center gap-2.5 text-[#111827]">
            <MapPin className="w-4 h-4 text-[#008F8F] shrink-0" />
            <span className="text-[#94A3B8]">{about.address}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#111827]">
            <Phone className="w-4 h-4 text-[#008F8F] shrink-0" />
            <span className="text-[#94A3B8]">{about.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#111827]">
            <Mail className="w-4 h-4 text-[#008F8F] shrink-0" />
            <span className="text-[#94A3B8]">{about.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
