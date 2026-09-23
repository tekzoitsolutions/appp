import React, { useState, useEffect } from 'react';

export const SplashLoader = ({ onFinish }) => {
  const [dots, setDots] = useState(1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Pulse loading dots
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 450);

    // Transition after 1.8 seconds for smooth snappy UX
    const timer = setTimeout(() => {
      setFading(true);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 400);
      return () => clearTimeout(finishTimer);
    }, 1800);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E3060B] text-white px-6 select-none transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        {/* Rounded square N Logo */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
          <span className="text-[#E3060B] font-extrabold text-6xl sm:text-7xl font-sans tracking-tight leading-none select-none">
            N
          </span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white mb-1.5 drop-shadow-sm">
          MY NSDA
        </h1>
        <h2 className="text-xs sm:text-sm font-bold tracking-[0.25em] text-white/95 uppercase mb-4">
          NSDA DOCTORS DIRECTORY
        </h2>

        {/* Tagline */}
        <p className="text-sm sm:text-base font-medium text-white/90 italic tracking-wide mb-12">
          Stay Connected Professionally &amp; Socially
        </p>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full bg-white transition-opacity duration-300 ${
                dots >= 1 ? 'opacity-100 scale-110' : 'opacity-30 scale-90'
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full bg-white transition-opacity duration-300 ${
                dots >= 2 ? 'opacity-100 scale-110' : 'opacity-30 scale-90'
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full bg-white transition-opacity duration-300 ${
                dots >= 3 ? 'opacity-100 scale-110' : 'opacity-30 scale-90'
              }`}
            />
          </div>
          <span className="text-xs font-semibold tracking-wider text-white/90">
            Loading directory...
          </span>
        </div>

        {/* Quick skip button for instant preview */}
        <button
          onClick={onFinish}
          className="mt-8 text-xs text-white/60 hover:text-white transition-colors underline underline-offset-4"
        >
          Skip loader
        </button>
      </div>
    </div>
  );
};
