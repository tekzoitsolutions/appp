import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const QRCodeModal = ({ isOpen, onClose, title = 'Share MY NSDA', subtitle = 'Scan QR code with your mobile camera', url = window.location.href }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MY NSDA — Doctors Directory',
          text: 'Connect with verified NSDA doctors professionally & socially.',
          url: url,
        });
      } catch (err) {
        // Ignored or cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-[#FFF0F0] text-[#E3060B] rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            N
          </div>
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
          <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-[#E0E6EF] flex justify-center items-center mb-5 shadow-inner">
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#F7F9FC"
            fgColor="#111827"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Link Copy Input */}
        <div className="flex items-center gap-2 bg-[#F7F9FC] p-2 rounded-xl border border-[#E0E6EF] mb-4">
          <span className="text-xs text-[#94A3B8] truncate flex-1 px-2 select-all font-mono">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E3060B] text-white hover:bg-[#C20408] transition-colors shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#008F8F] text-[#008F8F] hover:bg-[#EFFAFA] text-xs font-bold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-[#008F8F] text-white hover:bg-[#007C7C] text-xs font-bold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
