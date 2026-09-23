import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { DoctorGrid } from '../../components/doctor/DoctorGrid';
import { fetchDoctors } from '../../services/doctorService';
import { getLocalSpecialties, getLocalCities } from '../../services/storageService';

export const Directory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSpecialty = searchParams.get('specialty') || 'all';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedCity, setSelectedCity] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setSpecialties(getLocalSpecialties());
    setCities(getLocalCities());
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    const data = await fetchDoctors({
      searchQuery,
      specialty: selectedSpecialty,
      city: selectedCity,
      verifiedOnly,
      sortBy,
    });
    setDoctors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, [searchQuery, selectedSpecialty, selectedCity, verifiedOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedCity('all');
    setVerifiedOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fade-in">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Doctors Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Browse verified medical practitioners and specialists across India
          </p>
        </div>

        {/* Counter Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EFFAFA] text-[#008F8F] border border-[#008F8F]/20 text-xs font-bold self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span>{loading ? 'Searching...' : `${doctors.length} Doctors found`}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0E6EF] shadow-card space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name, specialty, hospital or location..."
            className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#008F8F] transition-all"
          />
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Specialty selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
            >
              <option value="all">All Specialties</option>
              {specialties
                .filter((s) => s.slug !== 'all')
                .map((spec) => (
                  <option key={spec.id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
            </select>
          </div>

          {/* City selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              City / Location
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
            >
              <option value="all">All Cities</option>
              {cities
                .filter((c) => c.name !== 'All Cities')
                .map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name} {city.state ? `(${city.state})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3 py-2 text-xs text-[#111827] font-medium focus:outline-none focus:border-[#008F8F]"
            >
              <option value="featured">Featured First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="experience">Experience (High to Low)</option>
              <option value="recent">Recently Registered</option>
            </select>
          </div>

          {/* Verified toggle + Reset */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                verifiedOnly
                  ? 'bg-[#EFFAFA] text-[#008F8F] border-[#008F8F]'
                  : 'bg-[#F7F9FC] text-[#94A3B8] border-[#E0E6EF] hover:border-[#94A3B8]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Verified Only
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 rounded-xl border border-[#E0E6EF] text-[#94A3B8] hover:text-[#111827] hover:bg-[#F7F9FC] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <DoctorGrid
        doctors={doctors}
        loading={loading}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
