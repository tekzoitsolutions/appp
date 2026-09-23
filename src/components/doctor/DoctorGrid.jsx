import React from 'react';
import { DoctorCard } from './DoctorCard';
import { UserX, RefreshCw } from 'lucide-react';

export const DoctorGrid = ({ doctors, loading, onResetFilters }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="bg-white rounded-3xl p-5 border border-[#E0E6EF] h-72 flex flex-col justify-between"
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-[#E0E6EF] rounded-2xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-[#E0E6EF] rounded w-3/4" />
                <div className="h-3 bg-[#E0E6EF] rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-[#E0E6EF] rounded w-full" />
              <div className="h-3 bg-[#E0E6EF] rounded w-5/6" />
            </div>
            <div className="h-10 bg-[#E0E6EF] rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#E0E6EF] p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center mx-auto mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#111827] mb-2">No Doctors Found</h3>
        <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
          No registered NSDA doctors matched your search criteria or filters. Try adjusting your specialty, city, or search term.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008F8F] text-white text-xs font-bold hover:bg-[#007C7C] transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
};
