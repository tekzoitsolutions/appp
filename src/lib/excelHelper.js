import * as XLSX from 'xlsx';
import { getLocalDoctors } from '../services/storageService';

// Expected standardized target fields for doctors
export const TARGET_FIELDS = [
  { key: 'fullName', label: 'Doctor Full Name', required: true, description: 'Doctor full name (with or without Dr. prefix)' },
  { key: 'qualifications', label: 'Qualifications / Degrees', required: true, description: 'e.g. MBBS, MS, MD, DNB' },
  { key: 'registrationNumber', label: 'Medical Registration No.', required: true, description: 'SMC or NMC registration number' },
  { key: 'specialty', label: 'Specialty', required: false, description: 'e.g. Orthopaedic, Surgeon, Physician' },
  { key: 'subspecialty', label: 'Subspecialty', required: false, description: 'e.g. Joint Replacement, Laparoscopy' },
  { key: 'email', label: 'Email Address', required: false, description: 'Official or personal email' },
  { key: 'phone', label: 'Phone / Mobile', required: false, description: 'Mobile or clinic contact number' },
  { key: 'hospital', label: 'Hospital / Clinic Name', required: false, description: 'Primary hospital or private clinic' },
  { key: 'clinicAddress', label: 'Clinic Address', required: false, description: 'Street address or consulting chambers' },
  { key: 'city', label: 'City', required: false, description: 'Practice city (e.g. Mumbai, Delhi)' },
  { key: 'state', label: 'State', required: false, description: 'State (e.g. Maharashtra, Karnataka)' },
  { key: 'experienceYears', label: 'Years of Experience', required: false, description: 'Years of clinical practice' },
  { key: 'bio', label: 'Biography / About', required: false, description: 'Clinical background summary' },
  { key: 'consultationFee', label: 'Consultation Fee', required: false, description: 'Fee per consultation (e.g. ₹1,500)' },
  { key: 'availableTimings', label: 'Available Timings', required: false, description: 'Consulting days and hours' },
  { key: 'verificationStatus', label: 'Verification Status', required: false, description: 'verified or pending' },
];

export const TEMPLATE_COLUMNS = TARGET_FIELDS.map((f) => f.label);

export const cleanKey = (str) => {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Smart matching of an Excel column header to our target doctor field
export const matchHeaderToField = (header) => {
  const c = cleanKey(header);
  if (!c) return null;

  // Specific compound checks first
  if (c.includes('time') || c.includes('timing') || c.includes('hour') || c.includes('sched') || c.includes('avail')) return 'availableTimings';
  if (c.includes('address') || c.includes('street') || c.includes('chamber') || c.includes('addr')) return 'clinicAddress';
  if (c.includes('fee') || c.includes('charge') || c.includes('rate') || c.includes('cost') || c.includes('price')) return 'consultationFee';
  if (c.includes('subspec') || c.includes('subspecial')) return 'subspecialty';
  if (c.includes('special') || c.includes('depart') || c.includes('field') || c.includes('branch')) return 'specialty';
  if (c.includes('reg') || c.includes('mci') || c.includes('nmc') || c.includes('smc') || c.includes('licen') || c.includes('council')) return 'registrationNumber';
  if (c.includes('qual') || c.includes('degree') || c.includes('mbbs') || c.includes('cert') || c.includes('education')) return 'qualifications';
  if (c.includes('hosp') || c.includes('clinic') || c.includes('workplace') || c.includes('center') || c.includes('centre')) return 'hospital';
  if (c.includes('email') || c.includes('mail')) return 'email';
  if (c.includes('phone') || c.includes('mobile') || c.includes('contact') || c.includes('cell') || c.includes('tel')) return 'phone';
  if (c.includes('city') || c.includes('town') || c.includes('district') || c.includes('location')) return 'city';
  if (c.includes('state') || c.includes('province') || c.includes('region')) return 'state';
  if (c.includes('exp') || c.includes('year')) return 'experienceYears';
  if (c.includes('verif') || c.includes('status')) return 'verificationStatus';
  if (c.includes('bio') || c.includes('about') || c.includes('desc') || c.includes('summary') || c.includes('info')) return 'bio';
  if (c.includes('doctor') || c.includes('physician') || c.includes('drname') || c.includes('fullname') || c.includes('name')) return 'fullName';

  return null;
};

// Generates and downloads standard sample Excel template
export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      'Doctor Full Name': 'Dr. Ramesh Patel',
      'Email Address': 'dr.patel@nsda.org.in',
      'Phone / Mobile': '+91 98200 11223',
      'Qualifications / Degrees': 'MBBS, MS (Orthopaedics), MCh',
      'Specialty': 'Orthopaedic',
      'Subspecialty': 'Robotic Joint Replacement',
      'Medical Registration No.': 'MMC-2015/09/4412',
      'Hospital / Clinic Name': 'Apollo Hospital',
      'Clinic Address': 'Suite 102, Medical Chambers, Bandra',
      'City': 'Mumbai',
      'State': 'Maharashtra',
      'Years of Experience': 14,
      'Biography / About': 'Senior Orthopaedic Consultant specializing in robotic joint replacements, arthroscopy, and complex trauma care.',
      'Consultation Fee': '₹1,500',
      'Available Timings': 'Mon - Fri: 10:00 AM - 4:00 PM',
      'Verification Status': 'verified',
    },
    {
      'Doctor Full Name': 'Dr. Kavita Singhal',
      'Email Address': 'dr.kavita@nsda.org.in',
      'Phone / Mobile': '+91 98110 33445',
      'Qualifications / Degrees': 'MBBS, MD (Dermatology)',
      'Specialty': 'Dermatologist',
      'Subspecialty': 'Clinical & Aesthetic Laser',
      'Medical Registration No.': 'DMC-2018/04/8910',
      'Hospital / Clinic Name': 'Max Healthcare',
      'Clinic Address': 'Sector 15, Ring Road, Saket',
      'City': 'Delhi',
      'State': 'Delhi',
      'Years of Experience': 9,
      'Biography / About': 'Consultant Dermatologist focusing on clinical trichology, laser skin interventions, and pediatric skin conditions.',
      'Consultation Fee': '₹1,200',
      'Available Timings': 'Mon - Sat: 11:00 AM - 5:00 PM',
      'Verification Status': 'verified',
    },
    {
      'Doctor Full Name': 'Dr. Anandvardhan Rao',
      'Email Address': 'dr.rao@nsda.org.in',
      'Phone / Mobile': '+91 98490 55667',
      'Qualifications / Degrees': 'MBBS, MS (General Surgery), FMAS',
      'Specialty': 'Surgeon',
      'Subspecialty': 'Minimally Invasive GI Surgery',
      'Medical Registration No.': 'KMC-2012/08/3310',
      'Hospital / Clinic Name': 'Manipal Hospital',
      'Clinic Address': 'Old Airport Road',
      'City': 'Bangalore',
      'State': 'Karnataka',
      'Years of Experience': 16,
      'Biography / About': 'Consultant gastrointestinal laparoscopic surgeon with 16+ years of clinical surgical practice.',
      'Consultation Fee': '₹1,600',
      'Available Timings': 'Tue, Thu, Sat: 2:00 PM - 7:00 PM',
      'Verification Status': 'verified',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: TEMPLATE_COLUMNS });
  worksheet['!cols'] = [
    { wch: 22 }, // Doctor Full Name
    { wch: 26 }, // Qualifications / Degrees
    { wch: 24 }, // Medical Registration No.
    { wch: 18 }, // Specialty
    { wch: 25 }, // Subspecialty
    { wch: 26 }, // Email Address
    { wch: 18 }, // Phone / Mobile
    { wch: 24 }, // Hospital / Clinic Name
    { wch: 32 }, // Clinic Address
    { wch: 14 }, // City
    { wch: 16 }, // State
    { wch: 18 }, // Years of Experience
    { wch: 45 }, // Biography / About
    { wch: 16 }, // Consultation Fee
    { wch: 30 }, // Available Timings
    { wch: 18 }, // Verification Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctors_Directory');
  XLSX.writeFile(workbook, 'MY_NSDA_Doctors_Import_Template.xlsx');
};

// Reads the uploaded Excel workbook and detects sheets & headers
export const parseWorkbook = (file, targetSheetName = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel workbook has no sheets.');
        }

        const sheetNames = workbook.SheetNames;
        // Pick requested sheet or find the sheet with the most data rows
        let selectedSheetName = targetSheetName && sheetNames.includes(targetSheetName)
          ? targetSheetName
          : sheetNames[0];

        let bestSheetData = null;
        let bestNonEmptyCount = -1;

        for (const sName of sheetNames) {
          const sheet = workbook.Sheets[sName];
          const rows2D = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
          const nonEmpty = rows2D.filter((r) => r.some((c) => String(c).trim() !== '')).length;
          if (nonEmpty > bestNonEmptyCount) {
            bestNonEmptyCount = nonEmpty;
            if (!targetSheetName) {
              selectedSheetName = sName;
              bestSheetData = rows2D;
            }
          }
        }

        const currentSheet = workbook.Sheets[selectedSheetName];
        const rawRows2D = XLSX.utils.sheet_to_json(currentSheet, { header: 1, raw: false, defval: '' });

        // Filter out completely blank rows
        const cleanRows = rawRows2D.filter((r) => r.some((c) => String(c).trim() !== ''));

        if (cleanRows.length === 0) {
          throw new Error(`Sheet "${selectedSheetName}" contains no data rows.`);
        }

        // Smart header row detection: scan up to the first 15 rows to find the row with the most matching keywords
        const headerKeywords = [
          'name', 'doctor', 'dr', 'special', 'email', 'mail', 'phone', 'mobile',
          'contact', 'qual', 'degree', 'reg', 'mci', 'nmc', 'smc', 'city', 'hosp', 'exp'
        ];

        let bestHeaderIndex = 0;
        let maxScore = -1;

        for (let i = 0; i < Math.min(cleanRows.length, 15); i++) {
          const row = cleanRows[i];
          let score = 0;
          row.forEach((cell) => {
            const cellClean = cleanKey(cell);
            if (headerKeywords.some((k) => cellClean.includes(k))) {
              score += 2;
            }
          });
          if (score > maxScore) {
            maxScore = score;
            bestHeaderIndex = i;
          }
        }

        const rawHeaders = cleanRows[bestHeaderIndex].map((h, i) => {
          const trimmed = String(h || '').trim();
          return trimmed || `Column ${i + 1}`;
        });

        const dataRows = cleanRows.slice(bestHeaderIndex + 1);

        // Build automatic field mapping from detected headers
        const autoMapping = {};
        rawHeaders.forEach((header) => {
          const matchedField = matchHeaderToField(header);
          if (matchedField && !autoMapping[matchedField]) {
            autoMapping[matchedField] = header;
          }
        });

        resolve({
          fileName: file.name,
          fileSize: file.size,
          sheetNames,
          selectedSheet: selectedSheetName,
          headerRowIndex: bestHeaderIndex,
          rawHeaders,
          dataRows,
          autoMapping,
          workbook,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file. Please verify file permissions.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Builds doctor objects by applying column mappings onto the 2D data rows
export const buildDoctorRecordsFromMapping = (dataRows, rawHeaders, columnMapping) => {
  const existingDoctors = getLocalDoctors();
  const existingRegSet = new Set(
    existingDoctors.map((d) => (d.registration_number || '').trim().toLowerCase())
  );
  const existingEmailSet = new Set(
    existingDoctors.map((d) => (d.email || '').trim().toLowerCase())
  );

  // Map header name to column index in rawHeaders
  const headerIndexMap = {};
  rawHeaders.forEach((h, idx) => {
    headerIndexMap[h] = idx;
  });

  const getRowValue = (row, fieldKey) => {
    const headerName = columnMapping[fieldKey];
    if (!headerName || headerIndexMap[headerName] === undefined) return '';
    const idx = headerIndexMap[headerName];
    return String(row[idx] !== undefined && row[idx] !== null ? row[idx] : '').trim();
  };

  const parsedDoctors = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  dataRows.forEach((row, index) => {
    // Skip empty row
    if (!row || !row.some((c) => String(c).trim() !== '')) {
      return;
    }

    const rawFullName = getRowValue(row, 'fullName');
    const rawEmail = getRowValue(row, 'email').toLowerCase();
    const rawPhone = getRowValue(row, 'phone');
    const rawQualifications = getRowValue(row, 'qualifications') || 'MBBS';
    const rawSpecialty = getRowValue(row, 'specialty') || 'Physician';
    const rawSubspecialty = getRowValue(row, 'subspecialty');
    const rawRegNo = getRowValue(row, 'registrationNumber');
    const rawHospital = getRowValue(row, 'hospital') || 'Private Clinic';
    const rawAddress = getRowValue(row, 'clinicAddress');
    const rawCity = getRowValue(row, 'city') || 'Mumbai';
    const rawState = getRowValue(row, 'state') || 'India';
    const rawExp = parseInt(getRowValue(row, 'experienceYears'), 10) || 5;
    const rawBio = getRowValue(row, 'bio');
    const rawFee = getRowValue(row, 'consultationFee') || '₹1,200';
    const rawTimings = getRowValue(row, 'availableTimings') || 'Mon - Fri: 10:00 AM - 4:00 PM';
    const rawStatus = (getRowValue(row, 'verificationStatus') || 'verified').toLowerCase();

    // Check validity
    const issues = [];
    if (!rawFullName) issues.push('Missing Name');
    if (!rawQualifications) issues.push('Missing Qualifications');

    // Duplicate check
    const isDuplicate =
      (rawRegNo && existingRegSet.has(rawRegNo.toLowerCase())) ||
      (rawEmail && existingEmailSet.has(rawEmail));

    if (isDuplicate) duplicateCount++;

    const isValid = issues.length === 0;
    if (isValid) validCount++;
    else invalidCount++;

    const formattedName = rawFullName.startsWith('Dr.')
      ? rawFullName
      : rawFullName
      ? `Dr. ${rawFullName}`
      : 'Unnamed Doctor';

    parsedDoctors.push({
      rowIndex: index + 1,
      fullName: formattedName,
      email: rawEmail || `dr.${Date.now()}.${index}@nsda.org.in`,
      phone: rawPhone || '+91 98000 00000',
      qualifications: rawQualifications,
      specialty: rawSpecialty,
      subspecialty: rawSubspecialty,
      registrationNumber: rawRegNo || `NSDA-IMP-${Math.floor(100000 + Math.random() * 900000)}`,
      hospital: rawHospital,
      clinicAddress: rawAddress,
      city: rawCity,
      state: rawState,
      experienceYears: rawExp,
      bio: rawBio || `Senior ${rawSpecialty} specialist practicing in ${rawCity}.`,
      consultationFee: rawFee,
      availableTimings: rawTimings,
      verificationStatus: rawStatus === 'pending' ? 'pending' : 'verified',
      isValid,
      isDuplicate,
      issues,
    });
  });

  return {
    rows: parsedDoctors,
    totalCount: parsedDoctors.length,
    validCount,
    duplicateCount,
    invalidCount,
  };
};
