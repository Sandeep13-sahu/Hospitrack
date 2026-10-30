const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

// Update handleReferralReasonChange and handleReferralNotesChange
const newCounters = `// Reactive referral form state holding live keystrokes
let activeReferralReason = '';
let activeReferralNotes = '';

// Real-time dynamic character counter and state synchronization handlers
window.handleReferralReasonChange = function (el) {
  const val = el ? (el.value || '') : (document.getElementById('refReason')?.value || activeReferralReason || '');
  activeReferralReason = val;
  const counter = document.getElementById('refReasonCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
  const err = document.getElementById('refReasonError');
  if (err && val.trim().length > 0) {
    if (err.classList && typeof err.classList.add === 'function') err.classList.add('hidden');
    const input = el || document.getElementById('refReason');
    if (input && input.classList && typeof input.classList.remove === 'function') input.classList.remove('input-error');
  }
};

window.handleReferralNotesChange = function (el) {
  const val = el ? (el.value || '') : (document.getElementById('refNotes')?.value || activeReferralNotes || '');
  activeReferralNotes = val;
  const counter = document.getElementById('refNotesCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
};`;

const counterStart = docContent.indexOf('// Reactive referral form state holding live keystrokes');
const modalStart = docContent.indexOf('window.openCreateReferralModal = function');

const isCRLF = docContent.includes('\r\n');
const formattedCounters = isCRLF ? newCounters.replace(/\n/g, '\r\n') : newCounters;
docContent = docContent.substring(0, counterStart) + formattedCounters + (isCRLF ? '\r\n\r\n' : '\n\n') + docContent.substring(modalStart);

// Update handlePreviewReferralLetter and handleReferralSubmit to use document.getElementById directly with optional chaining
docContent = docContent.replace(
  /const destSelect = \(form && typeof form\.querySelector === 'function' \? form\.querySelector\('#refDestHospital'\) : null\) \|\| document\.getElementById\('refDestHospital'\);/g,
  "const destSelect = document.getElementById('refDestHospital');"
);

docContent = docContent.replace(
  /const reasonTextarea = \(form && typeof form\.querySelector === 'function' \? form\.querySelector\('#refReason'\) : null\) \|\| document\.getElementById\('refReason'\);/g,
  "const reasonTextarea = document.getElementById('refReason');"
);

docContent = docContent.replace(
  /const notesTextarea = \(form && typeof form\.querySelector === 'function' \? form\.querySelector\('#refNotes'\) : null\) \|\| document\.getElementById\('refNotes'\);/g,
  "const notesTextarea = document.getElementById('refNotes');"
);

// Safe classList operations with optional chaining
docContent = docContent.replace(/([a-zA-Z0-9_]+)\.classList\.add\(/g, '$1?.classList?.add?.(');
docContent = docContent.replace(/([a-zA-Z0-9_]+)\.classList\.remove\(/g, '$1?.classList?.remove?.(');

fs.writeFileSync(docPath, docContent, 'utf8');
console.log('Successfully refined element lookups and optional chaining in doctorDashboard.js');

