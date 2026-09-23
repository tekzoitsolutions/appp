import React, { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, CheckCircle, ArrowRight } from 'lucide-react';
import { fetchDoctors } from '../../services/doctorService';
import { getLocalSpecialties, getLocalCities } from '../../services/storageService';
import { DoctorCard } from '../../components/doctor/DoctorCard';
import { DoctorGrid } from '../../components/doctor/DoctorGrid';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [city, setCity] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setSpecialties(getLocalSpecialties());
    setCities(getLocalCities());
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const results = await fetchDoctors({
      searchQuery: query,
      specialty,
      city,
      verifiedOnly,
      sortBy: 'featured',
    });
    setDoctors(results);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Find NSDA Doctors
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Instant search across certified specialists, hospitals and cities
        </p>
      </div>

      {/* Big Search Input & Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E0E6EF] shadow-card max-w-3xl mx-auto space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#008F8F]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type doctor name, condition, or hospital..."
            className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-2xl pl-11 pr-24 py-3.5 text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#008F8F] transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
          >
            <option value="all">Any Specialty</option>
            {specialties
              .filter((s) => s.slug !== 'all')
              .map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
          >
            <option value="all">Any City</option>
            {cities
              .filter((c) => c.name !== 'All Cities')
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-[#E0E6EF] text-xs font-semibold text-[#111827] cursor-pointer hover:bg-[#EFFAFA]">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded accent-[#008F8F] w-4 h-4"
            />
            Verified Only
          </label>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
            {doctors.length} Doctors Matched
          </span>
        </div>

        <DoctorGrid
          doctors={doctors}
          loading={loading}
          onResetFilters={() => {
            setQuery('');
            setSpecialty('all');
            setCity('all');
            setVerifiedOnly(false);
            handleSearch();
          }}
        />
      </div>
    </div>
  );
};
