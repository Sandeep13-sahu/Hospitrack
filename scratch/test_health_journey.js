const fs = require('fs');
const assert = require('assert');

// Mock DOM
global.window = global;
global.window.location = { hostname: 'localhost', href: 'http://localhost:8000/#patient/journey' };
global.window.showToast = () => {};
let containerHtml = '';
global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => {
    return {
      id,
      classList: { add: () => {}, remove: () => {} },
      innerHTML: '',
      set innerHTML(val) { containerHtml = val; },
      get innerHTML() { return containerHtml; },
      value: '',
      closest: () => null
    };
  },
  createElement: (tag) => ({ tagName: tag, setAttribute: () => {}, appendChild: () => {}, removeChild: () => {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};
global.escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

require('../js/config.js');
require('../js/store.js');
require('../js/components/patientDashboard.js');

console.log('Testing Real-World Longitudinal Health Journey Subsystem...');

// Mock data
const mockData = {
  patient: {
    id: 'PAT-301',
    name: 'John Doe',
    age: 42,
    gender: 'Male',
    hospitalName: 'City General Hospital'
  },
  careJourney: [
    {
      id: 'VIS-101',
      eventType: 'CONSULTATION',
      title: 'Doctor Consultation — Cardiology',
      subtitle: 'Dr. Robert Smith • City General Hospital',
      description: 'Diagnosis: Essential Hypertension. Treatment: ACE inhibitor started. Symptoms: Mild dizziness.',
      eventDate: '2026-10-24T10:30:00Z',
      hospitalName: 'City General Hospital',
      doctorName: 'Dr. Robert Smith',
      status: 'COMPLETED',
      badgeClass: 'badge-primary',
      sourceAttribution: 'City General Hospital EMR',
      whyCanISeeThis: 'Documented during your consultation encounter.'
    },
    {
      id: 'RX-201',
      eventType: 'PRESCRIPTION',
      title: 'Prescription Regimen (2 items)',
      subtitle: 'City General Hospital • Dr. Robert Smith',
      description: 'Prescribed medications: Lisinopril (10mg), Atorvastatin (20mg)',
      eventDate: '2026-10-24T11:00:00Z',
      hospitalName: 'City General Hospital',
      doctorName: 'Dr. Robert Smith',
      status: 'ACTIVE',
      badgeClass: 'badge-success',
      sourceAttribution: 'Prescribed by Dr. Robert Smith',
      whyCanISeeThis: 'Active medication regimen for ongoing clinical treatment.'
    },
    {
      id: 'LAB-301',
      eventType: 'LAB_REPORT',
      title: 'Diagnostic Lab: Comprehensive Metabolic Panel',
      subtitle: 'Biochemistry • City General Pathology',
      description: 'Electrolytes within normal range. Serum creatinine 0.9 mg/dL. eGFR > 90.',
      eventDate: '2026-10-22T08:15:00Z',
      hospitalName: 'City General Hospital',
      doctorName: 'Dr. Robert Smith',
      status: 'FINAL',
      badgeClass: 'badge-success',
      sourceAttribution: 'City General Pathology Laboratory',
      whyCanISeeThis: 'Diagnostic investigation completed under provider order.'
    },
    {
      id: 'REF-401',
      eventType: 'REFERRAL',
      title: 'Specialist Referral: City General ➔ Apex Care',
      subtitle: 'Priority: URGENT • Echocardiography evaluation',
      description: 'Referred for transthoracic echocardiogram and structural cardiology assessment.',
      eventDate: '2026-10-20T14:00:00Z',
      hospitalName: 'City General Hospital',
      doctorName: 'Dr. Robert Smith',
      status: 'ACCEPTED',
      badgeClass: 'badge-info',
      sourceAttribution: 'Network Coordination Desk',
      whyCanISeeThis: 'Authorized inter-facility specialist referral.'
    }
  ]
};

// 1. Test Rendering Full Journey
window._patientNormalizedData = mockData;
const html = renderCareJourney(mockData);

assert(html.includes('journey-hero-card'), 'Must contain journey-hero-card');
assert(html.includes('journey-stats-strip'), 'Must contain journey-stats-strip');
assert(html.includes('journey-toolbar'), 'Must contain journey-toolbar');
assert(html.includes('journey-filter-dock'), 'Must contain journey-filter-dock');
assert(html.includes('journey-timeline-stream'), 'Must contain journey-timeline-stream');
assert(html.includes('journey-event-card'), 'Must contain journey-event-card');
assert(html.includes('journey-event-marker'), 'Must contain journey-event-marker');
assert(html.includes('journey-month-divider'), 'Must contain journey-month-divider');
console.log('✓ PASS: renderCareJourney generates full longitudinal timeline with hero deck, stats strip, toolbar, and month dividers');

// 2. Test Category Filtering
window.setJourneyFilter('PRESCRIPTION');
const rxFilteredHtml = renderCareJourney(mockData);
assert(rxFilteredHtml.includes('Prescription Regimen'), 'Must include prescription event');
assert(!rxFilteredHtml.includes('Doctor Consultation — Cardiology'), 'Must filter out consultation');
console.log('✓ PASS: setJourneyFilter correctly filters to specific clinical category');

// 3. Test Search Query Filtering
window.setJourneyFilter('ALL');
window.handleJourneySearchInput('Metabolic');
const searchHtml = renderCareJourney(mockData);
assert(searchHtml.includes('Comprehensive Metabolic Panel'), 'Must match search query in title/description');
assert(!searchHtml.includes('Echocardiography'), 'Must filter out non-matching records');
console.log('✓ PASS: handleJourneySearchInput successfully matches keyword queries');

// 4. Test Sorting Order
window.handleJourneySearchInput('');
window.toggleJourneySortOrder(); // Switch to ASC (oldest first)
const sortedHtml = renderCareJourney(mockData);
const firstRefIndex = sortedHtml.indexOf('REF-401');
const firstVisIndex = sortedHtml.indexOf('VIS-101');
assert(firstRefIndex < firstVisIndex, 'In ASC order, Oct 20 referral must precede Oct 24 consultation');
console.log('✓ PASS: toggleJourneySortOrder correctly flips chronological order');

// 5. Test Event Detail Modal
let modalHtml = '';
global.document.getElementById = (id) => {
  if (id === 'globalModalContainer') {
    return {
      innerHTML: '',
      set innerHTML(val) { modalHtml = val; },
      get innerHTML() { return modalHtml; }
    };
  }
  return { id, innerHTML: '', value: '' };
};

window.openJourneyEventDetailModal('VIS-101');
assert(modalHtml.includes('journeyDetailModal'), 'Modal must be opened');
assert(modalHtml.includes('Doctor Consultation — Cardiology'), 'Modal must show event title');
assert(modalHtml.includes('Essential Hypertension'), 'Modal must show clinical findings');
assert(modalHtml.includes('Institutional Trust'), 'Modal must show institutional provenance');
console.log('✓ PASS: openJourneyEventDetailModal opens complete clinical encounter dossier');

console.log('\n======================================================');
console.log('🎉 ALL 5 HEALTH JOURNEY VERIFICATION TESTS PASSED 100%!');
console.log('======================================================');

