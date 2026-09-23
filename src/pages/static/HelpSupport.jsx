import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { getLocalSettings } from '../../services/storageService';

export const HelpSupport = () => {
  const settings = getLocalSettings();
  const help = settings.help_support || {};
  const faqs = help.faq || [];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#008F8F] text-white rounded-3xl p-6 sm:p-10 shadow-card">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Help &amp; Support Desk
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/90">
          Get assistance with verification, account issues, or directory navigation
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Helpline */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#111827]">Toll-Free Helpline</h4>
          <a
            href={`tel:${help.emergency_helpline || '+9118002004567'}`}
            className="block text-xs font-bold text-[#E3060B] hover:underline"
          >
            {help.emergency_helpline || '+91 1800 200 4567'}
          </a>
          <p className="text-[10px] text-[#94A3B8]">Mon-Sat 9am to 7pm</p>
        </div>

        {/* WhatsApp */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center mx-auto">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#111827]">WhatsApp Desk</h4>
          <a
            href={`https://wa.me/${(help.whatsapp_support || '919820012345').replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="block text-xs font-bold text-[#008F8F] hover:underline"
          >
            {help.whatsapp_support || '+91 98200 12345'}
          </a>
          <p className="text-[10px] text-[#94A3B8]">Quick chat support</p>
        </div>

        {/* Email */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E6EF] shadow-card text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#F7F9FC] text-[#111827] flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5 text-[#008F8F]" />
          </div>
          <h4 className="text-xs font-bold text-[#111827]">Email Support</h4>
          <a
            href={`mailto:${help.support_email || 'support@nsda.org.in'}`}
            className="block text-xs font-bold text-[#008F8F] hover:underline"
          >
            {help.support_email || 'support@nsda.org.in'}
          </a>
          <p className="text-[10px] text-[#94A3B8]">Responses within 24h</p>
        </div>
      </div>

      {/* Emergency Notice */}
      {help.emergency_notice && (
        <div className="bg-[#FFF0F0] border border-[#E3060B]/30 rounded-2xl p-4 text-xs text-[#E3060B] font-medium flex items-center gap-3">
          <Phone className="w-4 h-4 shrink-0" />
          <span>{help.emergency_notice}</span>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-6 sm:p-8 shadow-card space-y-4">
        <h3 className="text-base font-extrabold text-[#111827] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#008F8F]" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[#E0E6EF] rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left bg-[#F7F9FC] hover:bg-[#EFFAFA] transition-colors"
              >
                <span className="text-xs font-bold text-[#111827]">{faq.q}</span>
                {openIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#008F8F] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
                )}
              </button>
              {openIndex === idx && (
                <div className="p-4 bg-white text-xs text-[#111827]/80 leading-relaxed border-t border-[#E0E6EF]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
