import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Users,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Activity,
  Heart,
  Sparkles,
} from 'lucide-react';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { fetchDoctors } from '../../services/doctorService';
import { getLocalSpecialties } from '../../services/storageService';

export const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Doctors');
  const [specialties, setSpecialties] = useState([]);
  const [qrOpen, setQrOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const specs = getLocalSpecialties();
      setSpecialties(specs);

      const docs = await fetchDoctors({
        searchQuery: '',
        specialty: selectedSpecialty === 'All Doctors' ? 'all' : selectedSpecialty,
        sortBy: 'featured',
      });
      setDoctors(docs);
      setLoading(false);
    };

    loadData();
  }, [selectedSpecialty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/directory');
    }
  };

  const handleChipClick = (specName) => {
    setSelectedSpecialty(specName);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Hero Banner (Teal Background matching Screenshot 1) */}
      <section className="bg-[#008F8F] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Medical Network
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              NSDA Doctors Directory
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90 font-medium">
              Connect with professional NSDA doctors. Stay connected professionally and socially.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/directory"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#008F8F] hover:bg-[#EFFAFA] text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Users className="w-4 h-4" />
              View Directory
            </Link>
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/25 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              Share App
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* 2. Search Section */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E0E6EF] shadow-card">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialty or location"
                className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#008F8F] focus:ring-1 focus:ring-[#008F8F] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-3 rounded-2xl bg-[#008F8F] hover:bg-[#007C7C] text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-colors shadow-sm shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </form>

          {/* Category Chips: Horizontal Scrollable */}
          <div className="mt-4 pt-3 border-t border-[#E0E6EF]/70 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {specialties.map((spec) => {
              const isActive = selectedSpecialty === spec.name;
              return (
                <button
                  key={spec.id}
                  onClick={() => handleChipClick(spec.name)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                    isActive
                      ? 'bg-[#E3060B] text-white border-[#E3060B] shadow-xs'
                      : 'bg-[#F7F9FC] text-[#111827] border-[#E0E6EF] hover:border-[#008F8F] hover:text-[#008F8F]'
                  }`}
                >
                  {spec.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Quick Action Cards */}
        <section className="grid grid-cols-2 gap-3 sm:gap-6">
          <Link
            to="/directory"
            className="flex items-center gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-[#E0E6EF] shadow-card hover:border-[#008F8F] transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111827] group-hover:text-[#008F8F] transition-colors">
                Browse Doctors
              </h3>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">
                Find verified specialists
              </p>
            </div>
          </Link>

          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center gap-3 p-4 sm:p-5 rounded-3xl bg-white border border-[#E0E6EF] shadow-card hover:border-[#008F8F] transition-all group text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EFFAFA] text-[#008F8F] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#111827] group-hover:text-[#008F8F] transition-colors">
                Share App (QR)
              </h3>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">
                Share directory with peers
              </p>
            </div>
          </button>
        </section>

        {/* 4. Featured Doctors Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] flex items-center gap-2">
                <span>Featured Doctors</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/20">
                  Verified
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Top rated and recommended specialists in NSDA network
              </p>
            </div>

            <Link
              to="/directory"
              className="flex items-center gap-1 text-xs font-bold text-[#008F8F] hover:text-[#007C7C] transition-colors"
            >
              See all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Doctor Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-5 border border-[#E0E6EF] h-64"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {doctors.slice(0, 8).map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          )}
        </section>
      </div>

      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Share MY NSDA App"
        subtitle="Scan with mobile camera to open directory"
        url={window.location.origin}
      />
    </div>
  );
};
