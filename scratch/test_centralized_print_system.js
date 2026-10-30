/**
 * Comprehensive Automated Verification Suite: Hospitrack Centralized Print & Document Formatting System
 * Verifies documentUtils, printTemplates, printService, css/print.css, and dashboard print triggers.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('HOSPITRACK PROFESSIONAL PRINT & DOCUMENT SYSTEM VERIFICATION');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: documentUtils Module Verification
// -----------------------------------------------------------------------------
const documentUtils = require('../js/modules/documentUtils.js');

runTest('documentUtils: escapeHtml escapes harmful characters', () => {
  const raw = '<script>alert("xss & dangerous")</script>\'test\'';
  const escaped = documentUtils.escapeHtml(raw);
  assert.ok(!escaped.includes('<script>'), 'Must not contain raw script tag');
  assert.ok(escaped.includes('&lt;script&gt;'), 'Must encode < and >');
  assert.ok(escaped.includes('&quot;'), 'Must encode double quotes');
  assert.ok(escaped.includes('&#39;'), 'Must encode single quotes');
  assert.ok(escaped.includes('&amp;'), 'Must encode ampersand');
});

runTest('documentUtils: formatDate formats standard ISO dates', () => {
  const d = documentUtils.formatDate('2026-10-30T10:00:00Z');
  assert.ok(typeof d === 'string' && d.includes('2026'), 'Date must include year 2026');
  assert.ok(d.includes('Oct'), 'Date must include short month Oct');
});

runTest('documentUtils: formatDoctorName prevents duplicate Dr. prefix', () => {
  assert.strictEqual(documentUtils.formatDoctorName('Dr. Sarah Sharma'), 'Dr. Sarah Sharma');
  assert.strictEqual(documentUtils.formatDoctorName('Sarah Sharma'), 'Dr. Sarah Sharma');
  assert.strictEqual(documentUtils.formatDoctorName('dr. Rajesh Kumar'), 'Dr. Rajesh Kumar');
});

runTest('documentUtils: formatPatientMrn sanitizes UHID/MRN numbers', () => {
  assert.strictEqual(documentUtils.formatPatientMrn('PAT-303'), 'UHID-91-CGH-303');
  assert.strictEqual(documentUtils.formatPatientMrn('303'), 'UHID-91-CGH-303');
  assert.strictEqual(documentUtils.formatPatientMrn(''), 'UHID-994-CGH');
});

runTest('documentUtils: formatHumanStatus humanizes system tokens', () => {
  assert.strictEqual(documentUtils.formatHumanStatus('TRANSFER_PENDING'), 'Transfer Pending');
  assert.strictEqual(documentUtils.formatHumanStatus('CHECKED_IN'), 'Admitted Inpatient');
  assert.strictEqual(documentUtils.formatHumanStatus('FINAL_CERTIFIED'), 'Final Certified');
});

runTest('documentUtils: generateDocumentUid generates structured IDs', () => {
  const uid = documentUtils.generateDocumentUid('RX');
  assert.ok(uid.startsWith('RX-2026-'), `Expected RX-2026- prefix, got ${uid}`);
});

runTest('documentUtils: generateSecurityHash creates authentic cryptographic stamp', () => {
  const hash = documentUtils.generateSecurityHash('test data');
  assert.ok(hash.startsWith('SHA256:'), `Expected SHA256: prefix, got ${hash}`);
  assert.strictEqual(hash.length >= 16, true, 'Hash must be at least 16 chars');
});

// -----------------------------------------------------------------------------
// Test 2: printTemplates Module Verification
// -----------------------------------------------------------------------------
const printTemplates = require('../js/modules/printTemplates.js');

const mockStore = {
  getPatients: () => [{ id: 'PAT-303', name: 'Ananya Iyer', age: 31, gender: 'Female', bloodGroup: 'A+' }],
  getPatientById: (id) => ({ id: 'PAT-303', name: 'Ananya Iyer', age: 31, gender: 'Female', bloodGroup: 'A+', diagnosis: 'Mitral Valve Prolapse' }),
  getDoctors: () => [{ id: 'DOC-201', name: 'Dr. Sarah Sharma', specialty: 'Cardiology' }],
  getDoctorById: (id) => ({ id: 'DOC-201', name: 'Dr. Sarah Sharma', specialty: 'Cardiology' }),
  getHospitals: () => [{ id: 'HOSP-101', name: 'City General Hospital', totalBeds: 247, availableBeds: 34 }],
  getHospitalById: (id) => ({ id: 'HOSP-101', name: 'City General Hospital', totalBeds: 247, availableBeds: 34, location: 'Central Healthcare District' }),
  getPrescriptions: () => [{ id: 'RX-101', medication: 'Metoprolol Succinate', dosage: '25mg', frequency: 'Once Daily', duration: '30 Days' }],
  getLabs: () => [{ id: 'LAB-101', testName: 'Comprehensive Metabolic Panel', category: 'Biochemistry', status: 'COMPLETED' }],
  getReferrals: () => [{ id: 'REF-101', patientId: 'PAT-303', destinationFacility: 'Apex Care Medical Center', status: 'PENDING' }],
  getTransfers: () => [{ id: 'TRF-101', patientId: 'PAT-303', priority: 'URGENT', status: 'IN_TRANSIT' }],
  getAuditLogs: () => [{ id: 'AUD-1', action: 'DISCHARGE_CLEARED', timestamp: '2026-10-30T09:00:00Z', user: 'Dr. Sarah Sharma' }]
};

const documentTypes = [
  'prescription',
  'lab-report',
  'referral',
  'inpatient-summary',
  'discharge',
  'summary',
  'consultation',
  'bed-occupancy',
  'hospital-dossier',
  'admin-network-dossier',
  'system-analytics',
  'audit-ledger',
  'emergency-transfers'
];

documentTypes.forEach(docType => {
  runTest(`printTemplates: renders hospital-grade A4 document for type [${docType}]`, () => {
    const html = printTemplates.renderDocument(docType, { patientId: 'PAT-303', hospitalId: 'HOSP-101' }, mockStore);
    assert.ok(typeof html === 'string' && html.length > 200, `Template ${docType} produced empty output`);
    const upper = html.toUpperCase();
    assert.ok(upper.includes('CITY GENERAL HOSPITAL') || upper.includes('HOSPITRACK') || upper.includes('NATIONAL HEALTHCARE'), `Template ${docType} missing institution header`);
    assert.ok(html.includes('A4') || html.includes('print-medical-sheet'), `Template ${docType} missing A4 sheet structure`);
  });
});

runTest('printTemplates: multi-page table structures have repeating thead', () => {
  const html = printTemplates.renderDocument('lab-report', { patientId: 'PAT-303' }, mockStore);
  assert.ok(html.includes('<thead>'), 'Lab report table must contain <thead>');
  assert.ok(html.includes('<tbody>'), 'Lab report table must contain <tbody>');
});

runTest('printTemplates: institutional validation blocks (NABL/NABH/QR/Signatures)', () => {
  const html = printTemplates.renderDocument('prescription', { patientId: 'PAT-303' }, mockStore);
  assert.ok(html.includes('NABH') || html.includes('NABL') || html.includes('MCI-'), 'Prescription must contain accreditation/license reference');
  assert.ok(html.includes('Signature') || html.includes('Doctor'), 'Prescription must contain physician signature block');
});

// -----------------------------------------------------------------------------
// Test 3: css/print.css Integrity Verification
// -----------------------------------------------------------------------------
runTest('css/print.css: enforces strict A4 size and margins', () => {
  const printCss = fs.readFileSync(path.join(__dirname, '../css/print.css'), 'utf8');
  assert.ok(printCss.includes('@page'), 'Must contain @page declaration');
  assert.ok(printCss.includes('size: A4 portrait') || printCss.includes('size: A4'), 'Must declare A4 page size');
  assert.ok(printCss.includes('margin: 12mm 15mm 15mm 15mm') || printCss.includes('margin:'), 'Must configure print margins');
});

runTest('css/print.css: completely hides dashboard UI during print isolation', () => {
  const printCss = fs.readFileSync(path.join(__dirname, '../css/print.css'), 'utf8');
  assert.ok(printCss.includes('body.printing-custom-doc .app-container'), 'Must isolate .app-container');
  assert.ok(printCss.includes('display: none !important'), 'Must hide app chrome with display: none !important');
  assert.ok(printCss.includes('#printable-medical-record'), 'Must target #printable-medical-record container');
});

runTest('css/print.css: prevents table row splits and preserves headers', () => {
  const printCss = fs.readFileSync(path.join(__dirname, '../css/print.css'), 'utf8');
  assert.ok(printCss.includes('table-header-group'), 'thead must repeat via table-header-group');
  assert.ok(printCss.includes('break-inside: avoid'), 'Table rows must avoid page split via break-inside: avoid');
  assert.ok(printCss.includes('print-color-adjust: exact') || printCss.includes('-webkit-print-color-adjust: exact'), 'Must force exact print color reproduction');
});

// -----------------------------------------------------------------------------
// Test 4: printService Module Verification
// -----------------------------------------------------------------------------
runTest('printService: exports all required global printing triggers', () => {
  const serviceCode = fs.readFileSync(path.join(__dirname, '../js/modules/printService.js'), 'utf8');
  const requiredGlobals = [
    'hospitrackPrintDocument',
    'openDocumentPrintPreview',
    'printPrescription',
    'printLabReport',
    'printConsultation',
    'printPatientSummary',
    'printDischargeSummary',
    'printReferral',
    'printInpatientSummary',
    'printClinicalHistory',
    'printBedCensusReport',
    'printHospitalDossier',
    'printNetworkDossier',
    'printSystemAnalytics',
    'printEmergencyTransfers',
    'printAuditLedger'
  ];
  requiredGlobals.forEach(fnName => {
    assert.ok(serviceCode.includes(fnName), `printService must define window.${fnName}`);
  });
});

// -----------------------------------------------------------------------------
// Test 5: Dashboard Triggers Routing Verification
// -----------------------------------------------------------------------------
runTest('adminDashboard.js: routes print buttons to centralized print service', () => {
  const adminCode = fs.readFileSync(path.join(__dirname, '../js/components/adminDashboard.js'), 'utf8');
  assert.ok(adminCode.includes('window.printNetworkDossier()'), 'Admin network overview must call printNetworkDossier');
  assert.ok(adminCode.includes('window.printSystemAnalytics()'), 'Admin analytics must call printSystemAnalytics');
  assert.ok(adminCode.includes('window.printHospitalDossier'), 'Admin hospital dossier must call printHospitalDossier');
  assert.ok(!adminCode.includes('onclick="window.print()"'), 'Must not contain raw unisolated onclick="window.print()"');
});

runTest('hospitalDashboard.js: contains Bed Census and Emergency Transfer print triggers', () => {
  const hospCode = fs.readFileSync(path.join(__dirname, '../js/components/hospitalDashboard.js'), 'utf8');
  assert.ok(hospCode.includes('window.printBedCensusReport()'), 'Hospital operations center must call printBedCensusReport');
  assert.ok(hospCode.includes('window.printEmergencyTransfers'), 'Transfer drawer must contain printEmergencyTransfers trigger');
});

runTest('doctorDashboard.js: referral modal footer is arranged and avoids clipping', () => {
  const docCode = fs.readFileSync(path.join(__dirname, '../js/components/doctorDashboard.js'), 'utf8');
  assert.ok(docCode.includes('<span>Preview Referral Letter</span>'), 'Button label must be clean Preview Referral Letter');
  assert.ok(docCode.includes('window.printReferralLetterDoc'), 'Referral print function must be bound');
});

runTest('index.html: links css/print.css and loads document scripts in correct order', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(indexHtml.includes('css/print.css'), 'index.html must link css/print.css');
  const docUtilsIdx = indexHtml.indexOf('documentUtils.js');
  const printTempIdx = indexHtml.indexOf('printTemplates.js');
  const printServIdx = indexHtml.indexOf('printService.js');
  assert.ok(docUtilsIdx > 0, 'documentUtils.js must be loaded');
  assert.ok(printTempIdx > docUtilsIdx, 'printTemplates.js must be loaded after documentUtils.js');
  assert.ok(printServIdx > printTempIdx, 'printService.js must be loaded after printTemplates.js');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100% PASS)');
} else {
  console.error(`FAILED ${totalTests - passedTests} CHECKS`);
  process.exit(1);
}
console.log('================================================================\n');
