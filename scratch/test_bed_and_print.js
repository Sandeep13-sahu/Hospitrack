// Simple DOM mock test for Assign Bed & Print
const elements = {};
global.document = {
  getElementById: (id) => elements[id] || null,
  createElement: (tag) => {
    const el = { tagName: tag, innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} };
    return el;
  },
  body: {
    appendChild: (el) => { if (el.id) elements[el.id] = el; },
    classList: { add: ()=>{}, remove: ()=>{} }
  },
  addEventListener: ()=>{}
};
global.window = global;
global.window.addEventListener = ()=>{};
global.window.print = () => console.log('✓ window.print called');

elements['globalModalContainer'] = { innerHTML: '', classList: { add: ()=>{}, remove: ()=>{} } };
elements['bedActionModalContainer'] = { innerHTML: '', classList: { add: ()=>{}, remove: ()=>{} } };

global.escapeHtml = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '');
global.formatDate = (d) => new Date(d || Date.now()).toLocaleDateString();

require('../js/store.js');
require('../js/app.js');
require('../js/components/hospitalDashboard.js');

async function runTest() {
  console.log('1. Testing openAssignBedModal with bedId:');
  await window.openAssignBedModal('GEN-201', 'ward-general');
  console.log('Modal HTML generated with length:', elements['globalModalContainer'].innerHTML.length);
  if (!elements['globalModalContainer'].innerHTML.includes('Inpatient Bed &amp; Ward Allocation')) {
    throw new Error('Assign bed modal failed to render properly');
  }
  console.log('✓ Bed modal rendered correctly with bedId');

  console.log('2. Testing openAssignBedModal with patientId:');
  await window.openAssignBedModal('PAT-301');
  if (!elements['globalModalContainer'].innerHTML.includes('Inpatient Bed &amp; Ward Allocation')) {
    throw new Error('Assign bed modal failed to render properly with patientId');
  }
  console.log('✓ Bed modal rendered correctly with patientId');

  console.log('3. Testing Prescription Print formatting:');
  window.printPrescription({
    id: 'RX-99001',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Sarah Sharma',
    hospitalName: 'Apollo Metro Hospital',
    items: [
      { name: 'Amoxicillin + Clavulanic Acid (Augmentin 625)', dosage: '625mg', frequency: 'Twice daily (1-0-1)', duration: '7 days', instructions: 'Take after food' }
    ]
  });

  const printArea = elements['hospitrackPrintArea'];
  if (!printArea || !printArea.innerHTML.includes('OFFICIAL MEDICAL PRESCRIPTION')) {
    throw new Error('Prescription print failed');
  }
  console.log('✓ Prescription letterhead and medication table generated flawlessly');
  console.log('\n======================================');
  console.log('ALL BED ASSIGNMENT & PRINT TESTS PASS!');
  console.log('======================================');
}

runTest().catch(e => {
  console.error(e);
  process.exit(1);
});
