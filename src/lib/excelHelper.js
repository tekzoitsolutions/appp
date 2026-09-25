import * as XLSX from 'xlsx';
import { getLocalDoctors } from '../services/storageService';

// Expected standardized keys
export const TEMPLATE_COLUMNS = [
  'Full Name',
  'Email',
  'Phone',
  'Qualifications',
  'Specialty',
  'Subspecialty',
  'Registration Number',
  'Hospital',
  'Clinic Address',
  'City',
  'State',
  'Experience Years',
  'Bio',
  'Consultation Fee',
  'Available Timings',
  'Verification Status',
];

export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      'Full Name': 'Dr. Ramesh Patel',
      'Email': 'dr.patel@nsda.org.in',
      'Phone': '+91 98200 11223',
      'Qualifications': 'MBBS, MS (Orthopaedics), MCh',
      'Specialty': 'Orthopaedic',
      'Subspecialty': 'Robotic Joint Replacement',
      'Registration Number': 'MMC-2015/09/4412',
      'Hospital': 'Apollo Hospital',
      'Clinic Address': 'Suite 102, Medical Chambers, Bandra',
      'City': 'Mumbai',
      'State': 'Maharashtra',
      'Experience Years': 14,
      'Bio': 'Senior Orthopaedic Consultant specializing in robotic joint replacements, arthroscopy, and complex trauma care.',
      'Consultation Fee': '₹1,500',
      'Available Timings': 'Mon - Fri: 10:00 AM - 4:00 PM',
      'Verification Status': 'verified',
    },
    {
      'Full Name': 'Dr. Kavita Singhal',
      'Email': 'dr.kavita@nsda.org.in',
      'Phone': '+91 98110 33445',
      'Qualifications': 'MBBS, MD (Dermatology)',
      'Specialty': 'Dermatologist',
      'Subspecialty': 'Clinical & Aesthetic Laser',
      'Registration Number': 'DMC-2018/04/8910',
      'Hospital': 'Max Healthcare',
      'Clinic Address': 'Sector 15, Ring Road, Saket',
      'City': 'Delhi',
      'State': 'Delhi',
      'Experience Years': 9,
      'Bio': 'Consultant Dermatologist focusing on clinical trichology, laser skin interventions, and pediatric skin conditions.',
      'Consultation Fee': '₹1,200',
      'Available Timings': 'Mon - Sat: 11:00 AM - 5:00 PM',
      'Verification Status': 'verified',
    },
    {
      'Full Name': 'Dr. Anandvardhan Rao',
      'Email': 'dr.rao@nsda.org.in',
      'Phone': '+91 98490 55667',
      'Qualifications': 'MBBS, MS (General Surgery), FMAS',
      'Specialty': 'Surgeon',
      'Subspecialty': 'Minimally Invasive GI Surgery',
      'Registration Number': 'KMC-2012/08/3310',
      'Hospital': 'Manipal Hospital',
      'Clinic Address': 'Old Airport Road',
      'City': 'Bangalore',
      'State': 'Karnataka',
      'Experience Years': 16,
      'Bio': 'Consultant gastrointestinal laparoscopic surgeon with 16+ years of clinical surgical practice.',
      'Consultation Fee': '₹1,600',
      'Available Timings': 'Tue, Thu, Sat: 2:00 PM - 7:00 PM',
      'Verification Status': 'verified',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: TEMPLATE_COLUMNS });
  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 22 }, // Full Name
    { wch: 26 }, // Email
    { wch: 18 }, // Phone
    { wch: 28 }, // Qualifications
    { wch: 16 }, // Specialty
    { wch: 25 }, // Subspecialty
    { wch: 20 }, // Registration Number
    { wch: 24 }, // Hospital
    { wch: 32 }, // Clinic Address
    { wch: 14 }, // City
    { wch: 16 }, // State
    { wch: 16 }, // Experience Years
    { wch: 45 }, // Bio
    { wch: 16 }, // Consultation Fee
    { wch: 30 }, // Available Timings
    { wch: 18 }, // Verification Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctors_Directory');
  XLSX.writeFile(workbook, 'MY_NSDA_Doctors_Import_Template.xlsx');
};

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Excel file contains no worksheets');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Worksheet is empty. No doctor rows found.');
        }

        const existingDoctors = getLocalDoctors();
        const existingRegSet = new Set(
          existingDoctors.map((d) => (d.registration_number || '').trim().toLowerCase())
        );
        const existingEmailSet = new Set(
          existingDoctors.map((d) => (d.email || '').trim().toLowerCase())
        );

        const normalizedRows = [];
        let validCount = 0;
        let duplicateCount = 0;
        let invalidCount = 0;

        rawJson.forEach((row, index) => {
          // Normalize flexible header keys
          const fullName = (
            row['Full Name'] ||
            row['full_name'] ||
            row['Doctor Name'] ||
            row['Name'] ||
            row['name'] ||
            ''
          ).toString().trim();

          const email = (
            row['Email'] ||
            row['email'] ||
            row['Email Address'] ||
            ''
          ).toString().trim().toLowerCase();

          const phone = (
            row['Phone'] ||
            row['phone'] ||
            row['Mobile'] ||
            row['Contact'] ||
            ''
          ).toString().trim();

          const qualifications = (
            row['Qualifications'] ||
            row['qualifications'] ||
            row['Degree'] ||
            row['Degrees'] ||
            'MBBS'
          ).toString().trim();

          const specialty = (
            row['Specialty'] ||
            row['specialty'] ||
            row['Specialization'] ||
            'Physician'
          ).toString().trim();

          const subspecialty = (
            row['Subspecialty'] ||
            row['subspecialty'] ||
            ''
          ).toString().trim();

          const regNumber = (
            row['Registration Number'] ||
            row['registration_number'] ||
            row['Reg No'] ||
            row['reg_number'] ||
            row['Registration'] ||
            ''
          ).toString().trim();

          const hospital = (
            row['Hospital'] ||
            row['hospital'] ||
            row['Hospital / Clinic'] ||
            row['Clinic'] ||
            ''
          ).toString().trim();

          const clinicAddress = (
            row['Clinic Address'] ||
            row['clinic_address'] ||
            row['Address'] ||
            ''
          ).toString().trim();

          const city = (
            row['City'] ||
            row['city'] ||
            row['Location'] ||
            'Mumbai'
          ).toString().trim();

          const state = (
            row['State'] ||
            row['state'] ||
            'India'
          ).toString().trim();

          const experienceYears = parseInt(
            row['Experience Years'] ||
            row['experience_years'] ||
            row['Experience'] ||
            5,
            10
          ) || 0;

          const bio = (
            row['Bio'] ||
            row['bio'] ||
            row['About'] ||
            ''
          ).toString().trim();

          const fee = (
            row['Consultation Fee'] ||
            row['consultation_fee'] ||
            row['Fee'] ||
            '₹1,200'
          ).toString().trim();

          const timings = (
            row['Available Timings'] ||
            row['available_timings'] ||
            row['Timings'] ||
            'Mon - Fri: 10:00 AM - 4:00 PM'
          ).toString().trim();

          const verificationStatus = (
            row['Verification Status'] ||
            row['verification_status'] ||
            'verified'
          ).toString().trim().toLowerCase();

          // Validation flags
          const issues = [];
          if (!fullName) issues.push('Missing Full Name');
          if (!qualifications) issues.push('Missing Qualifications');

          const isDuplicate =
            (regNumber && existingRegSet.has(regNumber.toLowerCase())) ||
            (email && existingEmailSet.has(email));

          if (isDuplicate) {
            duplicateCount++;
          }

          const isValid = issues.length === 0;
          if (isValid) validCount++;
          else invalidCount++;

          normalizedRows.push({
            rowIndex: index + 1,
            fullName: fullName.startsWith('Dr.') ? fullName : (fullName ? `Dr. ${fullName}` : 'Unnamed Doctor'),
            email: email || `dr.${Date.now()}.${index}@nsda.org.in`,
            phone: phone || '+91 98000 00000',
            qualifications,
            specialty,
            subspecialty,
            registrationNumber: regNumber || `NSDA-IMP-${Math.floor(100000 + Math.random() * 900000)}`,
            hospital: hospital || 'Private Clinic',
            clinicAddress,
            city,
            state,
            experienceYears,
            bio: bio || `Senior ${specialty} specialist practicing in ${city}.`,
            consultationFee: fee,
            availableTimings: timings,
            verificationStatus: verificationStatus === 'pending' ? 'pending' : 'verified',
            isValid,
            isDuplicate,
            issues,
          });
        });

        resolve({
          fileName: file.name,
          fileSize: file.size,
          rows: normalizedRows,
          totalCount: normalizedRows.length,
          validCount,
          duplicateCount,
          invalidCount,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the selected file'));
    };

    reader.readAsArrayBuffer(file);
  });
};
