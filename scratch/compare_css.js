const { execSync } = require('child_process');
const fs = require('fs');

const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

console.log('Initial CSS length:', initialCss.length);
console.log('Current CSS length:', currentCss.length);

const checkClasses = [
  'profile-field-box',
  'referral-drawer-field',
  'modal-actions',
  'facility-info-item',
  'patient-header-v3',
  'table-responsive',
  'data-table',
  'auth-brand-logo-hero',
  'auth-card-pane',
  'profile-dropdown',
  'notif-dropdown'
];

checkClasses.forEach(c => {
  console.log(`Class .${c}: in initial? ${initialCss.includes('.' + c)}, in current? ${currentCss.includes('.' + c)}`);
});

