const { execSync } = require('child_process');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

const lines = initialCss.split('\n');
lines.forEach((l, i) => {
  if (l.includes('header-profile') || l.includes('profile-dropdown') || l.includes('notification-btn') || l.includes('notif-dropdown') || l.includes('auth-identity-pill')) {
    console.log(i + 1, l);
  }
});

