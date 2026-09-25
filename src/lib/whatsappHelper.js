/**
 * Cleans phone number digits and formats into an international phone string for WhatsApp wa.me link.
 */
export const formatWhatsAppDigits = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/[^0-9]/g, '');
  if (!digits) return null;

  // If 10 digits (standard Indian mobile format without country prefix), prefix with 91
  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }

  return digits;
};

/**
 * Triggers direct WhatsApp messaging link for a doctor
 */
export const openWhatsAppDirect = (doctor, addToast) => {
  if (!doctor) return;

  if (doctor.phone_visible === false) {
    if (addToast) {
      addToast('Doctor has chosen to keep their contact number private', 'info');
    }
    return;
  }

  if (!doctor.phone) {
    if (addToast) {
      addToast('WhatsApp contact number not listed for this doctor', 'info');
    }
    return;
  }

  const phoneDigits = formatWhatsAppDigits(doctor.phone);
  if (!phoneDigits) {
    if (addToast) {
      addToast('Invalid contact number for WhatsApp messaging', 'error');
    }
    return;
  }

  const docName = (doctor.full_name || 'Doctor').replace(/^Dr\.\s*/i, '');
  const message = encodeURIComponent(
    `Hello Dr. ${docName}, I found your verified profile on the MY NSDA Doctors Directory and would like to connect.`
  );

  const url = `https://wa.me/${phoneDigits}?text=${message}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
