const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

const targetStr = `window.handleReferralReasonChange = function (el) {`;
const idx = docContent.indexOf(targetStr);
if (idx === -1) {
  console.error('Target not found');
  process.exit(1);
}

const nextIdx = docContent.indexOf('window.openCreateReferralModal = function', idx);

const replacement = `// Real-time dynamic character counter and state synchronization handlers
window.handleReferralReasonChange = function (el) {
  const form = el && typeof el.closest === 'function' ? el.closest('form') : document.getElementById('clinicalReferralForm');
  const textarea = el || (form && typeof form.querySelector === 'function' ? form.querySelector('#refReason') : document.getElementById('refReason'));
  const val = textarea ? (textarea.value || '') : (el?.value || '');
  activeReferralReason = val;
  const counter = form && typeof form.querySelector === 'function' ? form.querySelector('#refReasonCount') : document.getElementById('refReasonCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
  const err = form && typeof form.querySelector === 'function' ? form.querySelector('#refReasonError') : document.getElementById('refReasonError');
  if (err && err.classList && typeof err.classList.add === 'function' && val.trim().length > 0) {
    err.classList.add('hidden');
    if (textarea && textarea.classList && typeof textarea.classList.remove === 'function') textarea.classList.remove('input-error');
  }
};

window.handleReferralNotesChange = function (el) {
  const form = el && typeof el.closest === 'function' ? el.closest('form') : document.getElementById('clinicalReferralForm');
  const textarea = el || (form && typeof form.querySelector === 'function' ? form.querySelector('#refNotes') : document.getElementById('refNotes'));
  const val = textarea ? (textarea.value || '') : (el?.value || '');
  activeReferralNotes = val;
  const counter = form && typeof form.querySelector === 'function' ? form.querySelector('#refNotesCount') : document.getElementById('refNotesCount');
  if (counter) counter.textContent = \`\${val.length} / 500\`;
};

`;

const isCRLF = docContent.includes('\r\n');
const formatted = isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement;

docContent = docContent.substring(0, idx) + formatted + docContent.substring(nextIdx);
fs.writeFileSync(docPath, docContent, 'utf8');
console.log('Successfully updated safe classList checks in doctorDashboard.js');
