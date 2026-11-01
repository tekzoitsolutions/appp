import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getLocalAds, recordAdClick } from '../../services/storageService';

export const HomeAdBanner = () => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadActiveAds();
  }, []);

  const loadActiveAds = () => {
    const allAds = getLocalAds();
    const active = allAds.filter((ad) => ad.is_active);
    setAds(active);
  };

  // Autoplay carousel if multiple ads
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads.length, isPaused]);

  if (!ads.length) return null;

  const currentAd = ads[currentIndex] || ads[0];

  const handleAdClick = (e, ad) => {
    e.stopPropagation();
    recordAdClick(ad.id);
    if (ad.link_url && ad.link_url !== '#') {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <section
      className="my-8 sm:my-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Label */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#008F8F] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-[#008F8F]" />
            Sponsored &amp; Partner Announcement
          </span>
        </div>

        {ads.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-6 h-6 rounded-full bg-white border border-[#E0E6EF] text-[#111827] flex items-center justify-center hover:bg-[#F7F9FC] transition-colors shadow-2xs"
              aria-label="Previous advertisement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-semibold text-[#94A3B8] px-1">
              {currentIndex + 1} / {ads.length}
            </span>
            <button
              onClick={handleNext}
              className="w-6 h-6 rounded-full bg-white border border-[#E0E6EF] text-[#111827] flex items-center justify-center hover:bg-[#F7F9FC] transition-colors shadow-2xs"
              aria-label="Next advertisement"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Banner Card */}
      <div
        onClick={(e) => handleAdClick(e, currentAd)}
        className="group relative bg-gradient-to-br from-white via-white to-[#F7F9FC] rounded-3xl border border-[#E0E6EF] shadow-card hover:shadow-card-hover hover:border-[#008F8F]/40 transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#EFFAFA] rounded-full blur-2xl pointer-events-none opacity-80" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FFF0F0] rounded-full blur-2xl pointer-events-none opacity-60" />

        <div className="relative p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left Text & CTA Content */}
          <div className="md:col-span-7 space-y-3.5 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/30 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#008F8F]" />
                {currentAd.badge_text || 'Sponsored'}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium">Verified Partner</span>
            </div>

            <div>
              <h3 className="text-base sm:text-xl font-extrabold text-[#111827] group-hover:text-[#008F8F] transition-colors leading-snug">
                {currentAd.title}
              </h3>
              {currentAd.subtitle && (
                <p className="text-xs sm:text-sm text-[#111827]/75 mt-1.5 leading-relaxed line-clamp-2">
                  {currentAd.subtitle}
                </p>
              )}
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => handleAdClick(e, currentAd)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#008F8F] hover:bg-[#007C7C] text-white text-xs font-bold transition-all shadow-md group-hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{currentAd.cta_text || 'Learn More'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] text-[#94A3B8] hidden sm:inline">
                Tap to visit official partner link
              </span>
            </div>
          </div>

          {/* Right Banner Image */}
          <div className="md:col-span-5 relative">
            <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden shadow-inner border border-[#E0E6EF]">
              <img
                src={currentAd.image_url}
                alt={currentAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                Ad
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots if multiple ads */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-4">
            {ads.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-[#008F8F]'
                    : 'w-1.5 bg-[#E0E6EF] hover:bg-[#94A3B8]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
