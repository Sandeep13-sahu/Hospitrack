const fs = require('fs');
const assert = require('assert');

// Mock DOM environment
global.window = global;
global.window.location = { hostname: 'localhost', href: 'http://localhost:8000' };
global.window.showToast = () => {};
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    value: '',
    closest: () => null
  }),
  createElement: (tag) => ({
    tagName: tag,
    setAttribute: () => {},
    appendChild: () => {},
    removeChild: () => {},
    click: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};
global.escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

// Load core files
require('../js/config.js');
require('../js/store.js');
require('../js/components/hospitalDashboard.js');

console.log('Testing Specialist Referral Pipeline...');

// Mock data
const mockHospital = {
  id: 'HOSP-101',
  name: 'City General Hospital',
  code: 'CGH-01'
};

const mockReferrals = [
  {
    id: 'REF-400',
    patientId: 'PAT-300',
    fromHospitalId: 'HOSP-102',
    toHospitalId: 'HOSP-101',
    doctorId: 'DOC-202',
    reason: 'Specialist cardiac evaluation required.',
    priority: 'URGENT',
    status: 'TRANSFERRED',
    notes: 'Patient referred from Apex Care General Medicine to City General Cardiology.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'REF-401',
    patientId: 'PAT-301',
    fromHospitalId: 'HOSP-101',
    toHospitalId: 'HOSP-103',
    doctorId: 'DOC-201',
    reason: 'Advanced Coronary Angiography & Cath Lab Intervention',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    notes: 'Requires tertiary Cath Lab evaluation.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'REF-402',
    patientId: 'PAT-303',
    fromHospitalId: 'HOSP-102',
    toHospitalId: 'HOSP-101',
    doctorId: 'DOC-202',
    reason: 'Cardiothoracic surgical consult for persistent dyspnea',
    priority: 'ROUTINE',
    status: 'PENDING',
    notes: 'Second opinion requested.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'REF-403',
    patientId: 'PAT-300',
    fromHospitalId: 'HOSP-101',
    toHospitalId: 'HOSP-103',
    doctorId: 'DOC-201',
    reason: 'Tertiary Electrophysiology Study & 24hr Holter Monitoring',
    priority: 'ROUTINE',
    status: 'ACCEPTED',
    notes: 'Coordinated tertiary cardiology electrophysiology review.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const mockPatients = [
  { id: 'PAT-300', name: 'Rahul Sharma', age: 45, gender: 'M', bloodGroup: 'B+' },
  { id: 'PAT-301', name: 'John Doe', age: 42, gender: 'M', bloodGroup: 'O+' },
  { id: 'PAT-303', name: 'Ananya Iyer', age: 29, gender: 'F', bloodGroup: 'A+' }
];

const mockDoctors = [
  { id: 'DOC-201', name: 'Sarah Sharma', specialty: 'Cardiology' },
  { id: 'DOC-202', name: 'Arjun Verma', specialty: 'General Medicine' }
];

// Initialize store mocks
global.hospitrackStore = {
  getPatientById: (id) => mockPatients.find(p => p.id === id) || null,
  getDoctorById: (id) => mockDoctors.find(d => d.id === id) || null,
  getHospitalById: (id) => id === 'HOSP-101' ? mockHospital : { id, name: id === 'HOSP-102' ? 'Apex Care Medical Center' : 'MediLife Multispeciality Hospital' },
  getReferralById: (id) => mockReferrals.find(r => r.id === id) || null,
  getReferrals: () => mockReferrals,
  updateReferralStatus: async () => ({ success: true }),
  syncAllData: async () => ({ success: true })
};

// 1. Render Section HTML
const html = window.renderHospitalReferralPipelineSection({
  hospital: mockHospital,
  referrals: mockReferrals,
  patients: mockPatients,
  doctors: mockDoctors
});

console.log('✓ renderHospitalReferralPipelineSection executed, length:', html.length);

// Assert Section Header
assert(html.includes('Specialist Referrals'), 'Missing page title');
assert(html.includes('Export'), 'Missing Export button');
assert(html.includes('Refresh'), 'Missing Refresh button');
assert(html.includes('Create Referral'), 'Missing Create Referral button');
assert(html.includes('City General Hospital'), 'Missing hospital name in context');

// Assert 6 Summary KPI Cards
assert(html.includes('All Referrals'), 'Missing All Referrals card');
assert(html.includes('Awaiting Review'), 'Missing Awaiting Review card');
assert(html.includes('Accepted'), 'Missing Accepted card');
assert(html.includes('Transfer Pending'), 'Missing Transfer Pending card');
assert(html.includes('In Treatment'), 'Missing In Treatment card');
assert(html.includes('Completed'), 'Missing Completed card');

// Assert Stepper Stages
assert(html.includes('REFERRAL LIFECYCLE'), 'Missing referral lifecycle section');
assert(html.includes('01'), 'Missing stage 01');
assert(html.includes('02'), 'Missing stage 02');
assert(html.includes('03'), 'Missing stage 03');
assert(html.includes('04'), 'Missing stage 04');
assert(html.includes('05'), 'Missing stage 05');

// Assert Table Columns & Next Required Action
assert(html.includes('Next Required Action'), 'Missing Next Required Action column');
assert(html.includes('referral-next-action-pill'), 'Missing referral-next-action-pill in table rows');
assert(html.includes('Awaiting receiving triage review') || html.includes('Awaiting receiving facility review'), 'Missing pending action label');
assert(html.includes('Accepted — transfer coordination required'), 'Missing accepted action label');

// Assert Actions
assert(html.includes('Accept'), 'Missing Accept action');
assert(html.includes('Decline'), 'Missing Decline action');

// 2. Render Drawer Content
const drawerHtml = window.renderReferralDrawerContent('REF-402', mockHospital, global.hospitrackStore);
console.log('✓ renderReferralDrawerContent executed, length:', drawerHtml.length);
assert(drawerHtml.includes('PATIENT INFORMATION'), 'Missing Patient Info section in drawer');
assert(drawerHtml.includes('CARE CONNECTION PIPELINE'), 'Missing Care Flow section in drawer');
assert(drawerHtml.includes('CHRONOLOGICAL ACTIVITY TIMELINE'), 'Missing Timeline section in drawer');
assert(drawerHtml.includes('CLINICAL REFERRAL DETAILS'), 'Missing Clinical Dossier in drawer');
assert(drawerHtml.includes('Accept Referral'), 'Missing Accept button in drawer');
assert(drawerHtml.includes('Decline Referral'), 'Missing Decline button in drawer');

// 3. Check Global Handlers
assert(typeof window.openReferralDrawer === 'function', 'openReferralDrawer should be defined');
assert(typeof window.closeReferralDrawer === 'function', 'closeReferralDrawer should be defined');
assert(typeof window.handleAcceptReferralClick === 'function', 'handleAcceptReferralClick should be defined');
assert(typeof window.openRejectReferralModal === 'function', 'openRejectReferralModal should be defined');
assert(typeof window.openCompleteReferralModal === 'function', 'openCompleteReferralModal should be defined');
assert(typeof window.openCancelReferralModal === 'function', 'openCancelReferralModal should be defined');
assert(typeof window.exportReferralPipelineCsv === 'function', 'exportReferralPipelineCsv should be defined');

console.log('All Referral Pipeline Frontend assertions PASSED successfully!');
