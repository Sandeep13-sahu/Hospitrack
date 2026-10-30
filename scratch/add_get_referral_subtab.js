const fs = require('fs');
let content = fs.readFileSync('js/components/doctorDashboard.js', 'utf8');
content = content.replace(
  'window.setReferralSubtab = function (subtab) {',
  'window.getReferralSubtab = () => referralSubtab;\nwindow.setReferralSubtab = function (subtab) {'
);
fs.writeFileSync('js/components/doctorDashboard.js', content, 'utf8');
console.log('Added window.getReferralSubtab');

