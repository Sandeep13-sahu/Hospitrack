const fs = require('fs');
const path = require('path');

const docPath = path.join(__dirname, '..', 'js', 'components', 'doctorDashboard.js');
let docContent = fs.readFileSync(docPath, 'utf8');

docContent = docContent.replace(
  "const rawReason = (reasonTextarea ? reasonTextarea.value : '') || activeReferralReason || '';",
  "const rawReason = reasonTextarea ? reasonTextarea.value : (activeReferralReason || '');"
);

fs.writeFileSync(docPath, docContent, 'utf8');
console.log('Successfully updated line 3470 with exact rawReason logic');

