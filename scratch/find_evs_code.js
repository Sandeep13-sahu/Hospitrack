const fs = require('fs');
const hosp = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');
const lines = hosp.split('\n');
lines.forEach((l, i) => {
  if (l.includes("tab === 'ward-management'") || l.includes("tab === 'evs-turnover'") || l.includes("tab === 'bed-management'") || l.includes("tab === 'evs'")) {
    console.log(i + 1, l);
  }
});

