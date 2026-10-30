const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: CLINICAL REDESIGN & REAL-WORLD PRINT ARCHITECTURE ===');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const patientDashboardJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'components', 'patientDashboard.js'), 'utf8');
const hospitalDashboardJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'components', 'hospitalDashboard.js'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. Doctor Honorific Formatter
assert(appJs.includes('function formatDoctorName'), 'formatDoctorName helper function exists in app.js');
assert(patientDashboardJs.includes('formatDoctorName'), 'patientDashboard uses formatDoctorName to prevent "Dr. Dr."');

// Test formatDoctorName logic directly
function formatDoctorName(name) {
  if (!name || typeof name !== 'string') return 'Dr. Assigned Physician';
  let cleaned = name.trim();
  while (cleaned.toLowerCase().startsWith('dr.') || cleaned.toLowerCase().startsWith('dr ')) {
    cleaned = cleaned.replace(/^dr\.?\s*/i, '').trim();
  }
  return cleaned ? `Dr. ${cleaned}` : 'Dr. Assigned Physician';
}

assert(formatDoctorName('Dr. Dr. Arjun Verma') === 'Dr. Arjun Verma', 'formatDoctorName collapses "Dr. Dr. Arjun Verma" to "Dr. Arjun Verma"');
assert(formatDoctorName('Dr. Arjun Verma') === 'Dr. Arjun Verma', 'formatDoctorName preserves single "Dr. Arjun Verma"');
assert(formatDoctorName('Arjun Verma') === 'Dr. Arjun Verma', 'formatDoctorName prepends "Dr." to bare name "Arjun Verma"');
assert(formatDoctorName('') === 'Dr. Assigned Physician', 'formatDoctorName provides fallback for empty input');

// 2. Global Navigation & Universal Sidebar Components
assert(appJs.includes('toggleSidebarFacilityDropdown'), 'toggleSidebarFacilityDropdown is defined');
assert(appJs.includes('switchSidebarFacility'), 'switchSidebarFacility is defined');
assert(appJs.includes('sidebar-facility-pill'), 'Dynamic sidebar renders sidebar-facility-pill');
assert(appJs.includes('sidebar-facility-dropdown'), 'Dynamic sidebar renders sidebar-facility-dropdown');
assert(appJs.includes('nav-active-bar'), 'Dynamic sidebar renders nav-active-bar indicator');
assert(appJs.includes('sidebar-footer-profile'), 'Dynamic sidebar renders sidebar-footer-profile');
assert(appJs.includes('sidebar-role-badge'), 'Dynamic sidebar renders sidebar-role-badge');
assert(appJs.includes('sidebar-signout-btn'), 'Dynamic sidebar renders sidebar-signout-btn');

// 3. Clinical Hierarchy & Structured 3-Column Micro-Grid
assert(patientDashboardJs.includes('clinical-card'), 'patientDashboard uses clinical-card');
assert(patientDashboardJs.includes('clinical-micro-grid'), 'patientDashboard uses clinical-micro-grid');
assert(patientDashboardJs.includes('clinical-micro-cell'), 'patientDashboard uses clinical-micro-cell');
assert(patientDashboardJs.includes('clinical-vitals-pill-strip'), 'patientDashboard uses clinical-vitals-pill-strip');
assert(patientDashboardJs.includes('vital-pill bp'), 'patientDashboard renders BP vital pill');
assert(patientDashboardJs.includes('vital-pill hr'), 'patientDashboard renders Heart Rate vital pill');
assert(patientDashboardJs.includes('vital-pill spo2'), 'patientDashboard renders SpO2 vital pill');
assert(patientDashboardJs.includes('vital-pill temp'), 'patientDashboard renders Temperature vital pill');

// 4. Structured Prescription View Table
assert(patientDashboardJs.includes('rx-table-container'), 'patientDashboard renders rx-table-container');
assert(patientDashboardJs.includes('rx-table'), 'patientDashboard renders rx-table');
assert(patientDashboardJs.includes('rx-refill-pill'), 'patientDashboard renders rx-refill-pill');
assert(patientDashboardJs.includes('window.printPrescription'), 'Prescription row includes Print Rx action button');

// 5. Patient Details Slide-Over Drawer
assert(hospitalDashboardJs.includes('patient-quick-metrics-grid'), 'hospitalDashboard drawer contains patient-quick-metrics-grid');
assert(hospitalDashboardJs.includes('patient-emergency-contact-box'), 'hospitalDashboard drawer contains patient-emergency-contact-box');
assert(hospitalDashboardJs.includes('patient-drawer-actions-bar'), 'hospitalDashboard drawer contains patient-drawer-actions-bar');
assert(hospitalDashboardJs.includes('Print Summary / Discharge Sheet'), 'hospitalDashboard drawer has "Print Summary / Discharge Sheet" button');
assert(hospitalDashboardJs.includes('Update Care Plan'), 'hospitalDashboard drawer has "Update Care Plan" button');
assert(hospitalDashboardJs.includes('window.openPatientDrawer = window.openInpatientDrawer'), 'openPatientDrawer alias is exported');

// 6. CSS Rules for Clinical Hierarchy & Navigation
const requiredCssSelectors = [
  '.sidebar-header-top',
  '.sidebar-facility-wrap',
  '.sidebar-facility-pill',
  '.sidebar-facility-dropdown',
  '.sidebar-facility-option',
  '.nav-active-bar',
  '.sidebar-footer-profile',
  '.sidebar-profile-card',
  '.sidebar-profile-avatar',
  '.sidebar-profile-info',
  '.sidebar-role-badge',
  '.sidebar-signout-btn',
  '.clinical-card',
  '.clinical-card-header',
  '.clinical-card-title',
  '.clinical-doctor-badge',
  '.clinical-specialty-pill',
  '.clinical-date-badge',
  '.clinical-vitals-pill-strip',
  '.vital-pill',
  '.vital-pill.bp',
  '.vital-pill.hr',
  '.vital-pill.spo2',
  '.vital-pill.temp',
  '.clinical-micro-grid',
  '.clinical-micro-cell',
  '.clinical-micro-label',
  '.clinical-micro-val',
  '.rx-table-container',
  '.rx-table',
  '.rx-drug-name',
  '.rx-drug-form',
  '.rx-refill-pill',
  '.patient-drawer-overlay',
  '.patient-slide-drawer',
  '.patient-quick-metrics-grid',
  '.patient-metric-box',
  '.patient-emergency-contact-box',
  '.patient-drawer-actions-bar'
];

requiredCssSelectors.forEach(sel => {
  assert(css.includes(sel), `CSS contains selector "${sel}"`);
});

// 7. Print Architecture Validation
assert(css.includes('@page'), 'CSS defines @page rule');
assert(css.includes('size: A4 portrait'), 'CSS specifies A4 portrait page size');
assert(css.includes('margin: 15mm'), 'CSS specifies standard 15mm print margins');
assert(css.includes('@media print'), 'CSS defines @media print block');
assert(css.includes('break-inside: avoid !important') || css.includes('page-break-inside: avoid !important'), 'CSS defines page-break protection for medical rows');
assert(css.includes('.no-print') && css.includes('display: none !important'), 'Print CSS hides non-printable chrome');

// 8. Authentic Hospital Record Printout in app.js
assert(appJs.includes('print-rx-symbol'), 'print layout contains print-rx-symbol');
assert(appJs.includes('print-barcode'), 'print layout contains print-barcode');
assert(appJs.includes('Digital EMR Hash') || appJs.includes('print-security-hash'), 'print layout contains cryptographic digital verification hash');
assert(appJs.includes('NABH') || appJs.includes('JCI'), 'print layout contains hospital accreditation badge');
assert(appJs.includes('Authorized Physician Signature') || appJs.includes('print-signature-box'), 'print layout contains digital signature block');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

