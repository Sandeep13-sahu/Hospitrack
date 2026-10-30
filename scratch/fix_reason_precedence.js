const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

docContent = docContent.replace(
  "const rawReason = (reasonTextarea ? reasonTextarea.value : '') || activeReferralReason || '';",
  "const rawReason = (reasonTextarea && typeof reasonTextarea.value === 'string') ? reasonTextarea.value : (activeReferralReason || '');"
);

docContent = docContent.replace(
  "const rawNotes = (notesTextarea ? notesTextarea.value : '') || activeReferralNotes || '';",
  "const rawNotes = (notesTextarea && typeof notesTextarea.value === 'string') ? notesTextarea.value : (activeReferralNotes || '');"
);

fs.writeFileSync(docPath, docContent, 'utf8');
console.log('Fixed rawReason value precedence');

