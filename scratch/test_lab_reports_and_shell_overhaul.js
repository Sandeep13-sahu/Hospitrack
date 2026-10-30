const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: SHELL, SIDEBAR & CLINICAL LAB REPORTS OVERHAUL ===');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const patientDashboardJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'components', 'patientDashboard.js'), 'utf8');

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

// 1. Unified Shell & Fixed Layout Architecture
assert(css.includes('.app-container') && css.includes('grid-template-columns: var(--sidebar-width'), 'CSS enforces two-column grid shell');
assert(css.includes('.app-header') && css.includes('position: sticky') && css.includes('top: 0'), 'CSS enforces sticky top app bar');
assert(css.includes('.main-content') && css.includes('overflow-y: auto'), 'CSS enforces independently scrollable main content area');
assert(css.includes('.sidebar-header-bar') && css.includes('flex-direction: column'), 'CSS eliminates header overlap via column stacking in sidebar-header-bar');

// 2. Vector Stroke Icons & Navigation Micro-Interactions
assert(appJs.includes('window.getLucideIcon'), 'getLucideIcon helper exists in app.js');
assert(appJs.includes('lucide-activity'), 'Lucide Activity icon defined');
assert(appJs.includes('lucide-pill'), 'Lucide Pill icon defined');
assert(appJs.includes('lucide-stethoscope'), 'Lucide Stethoscope icon defined');
assert(appJs.includes('lucide-flask-conical'), 'Lucide FlaskConical icon defined');
assert(appJs.includes('lucide-file-text'), 'Lucide FileText icon defined');
assert(appJs.includes('lucide-clipboard-list'), 'Lucide ClipboardList icon defined');
assert(appJs.includes('lucide-building-2'), 'Lucide Building2 icon defined');

// Active Route Indicator & Category Header CSS
assert(css.includes('.nav-item.active') && css.includes('border-left: 4px solid #0D9488'), 'CSS enforces crisp left teal border on active route');
assert(css.includes('.nav-item.active') && css.includes('rgba(240, 253, 250'), 'CSS enforces soft teal tint on active route');
assert(css.includes('.sidebar-category-label') && css.includes('text-transform: uppercase') && css.includes('letter-spacing'), 'CSS enforces small-caps tracking on category headers');

// 3. Modern Clinical Diagnostic & Lab Reports UI
assert(patientDashboardJs.includes('lab-card-refactored'), 'patientDashboard uses lab-card-refactored');
assert(patientDashboardJs.includes('lab-card-header'), 'patientDashboard uses lab-card-header');
assert(patientDashboardJs.includes('lab-specimen-badge'), 'patientDashboard displays specimen ID badge');
assert(patientDashboardJs.includes('FINAL REPORT'), 'patientDashboard displays FINAL REPORT status badge');
assert(patientDashboardJs.includes('lab-meta-grid-4col'), 'patientDashboard renders 4-column metadata grid');
assert(patientDashboardJs.includes('Ordering Physician'), 'Metadata grid includes Ordering Physician');
assert(patientDashboardJs.includes('Consulting Pathologist'), 'Metadata grid includes Consulting Pathologist');
assert(patientDashboardJs.includes('Facility Name'), 'Metadata grid includes Facility Name');
assert(patientDashboardJs.includes('Sample Collection'), 'Metadata grid includes Sample Collection');
assert(patientDashboardJs.includes('lab-findings-table'), 'patientDashboard renders standardized findings table');
assert(patientDashboardJs.includes('Parameter / Test Component'), 'Findings table contains Parameter header');
assert(patientDashboardJs.includes('Result Value'), 'Findings table contains Result Value header');
assert(patientDashboardJs.includes('Reference Range'), 'Findings table contains Reference Range header');
assert(patientDashboardJs.includes('Flag / Interpretation'), 'Findings table contains Flag header');
assert(patientDashboardJs.includes('clinical-narrative-box'), 'patientDashboard renders clinical-narrative-box for ECG / narratives');
assert(!patientDashboardJs.includes('Why can I see this? Diagnostic test processed and certified by'), 'Clutter removed: repetitive boilerplate sentence eliminated');

// 4. Real-World Diagnostic PDF & Print Engine (@media print)
assert(css.includes('@page') && css.includes('size: A4') && css.includes('margin: 12mm 15mm'), 'CSS specifies standard A4 page with 12mm 15mm margins');
assert(css.includes('.print-lab-patient-bar-2col'), 'CSS contains print-lab-patient-bar-2col');
assert(appJs.includes('print-lab-patient-bar-2col'), 'app.js print layout renders 2-column patient & sample bar');
assert(appJs.includes('PATIENT DEMOGRAPHICS &amp; IDENTIFICATION'), 'Patient bar includes demographics column');
assert(appJs.includes('SAMPLE CUSTODY &amp; CLINICAL REQUISITION'), 'Patient bar includes sample custody column');
assert(appJs.includes('DEPARTMENT OF BIOCHEMISTRY & CLINICAL PATHOLOGY') || appJs.includes('DEPARTMENT OF CLINICAL PATHOLOGY'), 'Print template includes clinical department section header');
assert(appJs.includes('TEST NAME') && appJs.includes('OBSERVED VALUE') && appJs.includes('BIOLOGICAL REF INTERVAL') && appJs.includes('METHOD / UNIT'), 'Print table has standard clinical headers');
assert(appJs.includes('*** END OF CLINICAL DIAGNOSTIC REPORT ***'), 'Print template includes End of Report line');
assert(appJs.includes('print-dual-signatures'), 'Print template renders dual signature blocks');
assert(appJs.includes('Medical Laboratory Technologist'), 'Dual signatures includes Laboratory Technologist');
assert(appJs.includes('Consultant Pathologist &amp; Laboratory Director') || appJs.includes('Consultant Pathologist'), 'Dual signatures includes Consultant Pathologist');
assert(appJs.includes('This is a computer-generated medical record verified under digital health standards'), 'Print template includes institutional disclaimer notice');
assert(css.includes('break-inside: avoid !important'), 'Print CSS avoids mid-row page cuts across clinical blocks');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
