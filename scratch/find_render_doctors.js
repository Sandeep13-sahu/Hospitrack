const fs = require('fs');
const hosp = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');
const lines = hosp.split('\n');
lines.forEach((l, i) => {
  if (l.includes("function renderDoctorsSection")) {
    console.log(i + 1, l);
  }
});

