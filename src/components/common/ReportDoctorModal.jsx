import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getLocalReports, saveLocalReports, addLocalAuditLog } from '../../services/storageService';

export const ReportDoctorModal = ({ isOpen, onClose, doctor }) => {
  const [reason, setReason] = useState('Incorrect or Misleading Credentials');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !doctor) return null;

  const reasons = [
    'Incorrect or Misleading Credentials',
    'Fake Profile or Impersonation',
    'Invalid or Inactive Contact Information',
    'Unprofessional or Unethical Conduct',
    'Other Policy Violation',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const reports = getLocalReports();
    const newReport = {
      id: 'rep-' + Date.now(),
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      doctor_registration: doctor.registration_number,
      reason,
      details,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    reports.unshift(newReport);
    saveLocalReports(reports);
    addLocalAuditLog('REPORT_FILED', 'Anonymous / Patient', doctor.full_name, `Reported for: ${reason}`);

    setTimeout(() => {
      setSubmitting(false);
      addToast('Report submitted for administrative review', 'success');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E6EF] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F7F9FC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] text-[#E3060B] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Report Profile</h3>
            <p className="text-xs text-[#94A3B8]">
              Reporting: <span className="font-semibold text-[#111827]">{doctor.full_name}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              Select Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B]"
            >
              {reasons.map((r, idx) => (
                <option key={idx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context or proof for the NSDA moderation board..."
              className="w-full bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-[#E3060B] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E0E6EF] text-xs font-semibold text-[#111827] hover:bg-[#F7F9FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#E3060B] hover:bg-[#C20408] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
