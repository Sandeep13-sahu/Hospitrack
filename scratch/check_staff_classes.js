const fs = require('fs');
const hosp = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');
const staffCode = hosp.slice(hosp.indexOf('function renderMedicalStaffSection'));
const regex = /class=["']([^"'>]+)["']/g;
let m;
const staffClasses = new Set();
while ((m = regex.exec(staffCode)) !== null) {
  m[1].split(/\s+/).forEach(c => {
    if (c && !c.includes('${') && !c.includes('}')) staffClasses.add(c);
  });
}
console.log('Staff section classes:', Array.from(staffClasses).slice(0, 30));

