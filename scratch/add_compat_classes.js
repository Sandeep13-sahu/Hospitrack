const fs = require('fs');
let code = fs.readFileSync('js/components/patientDashboard.js', 'utf8');

code = code.replace(
  '<div style="margin-top: 12px; overflow-x: auto;">',
  '<div class="rx-table-container" style="margin-top: 12px; overflow-x: auto;">'
);

code = code.replace(
  '<table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">',
  '<table class="rx-table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">'
);

code = code.replace(
  "${escapeHtml(item.refillStatus || 'Refills Available')}</div>",
  "${escapeHtml(item.refillStatus || 'Refills Available')}</div><span class=\"rx-refill-pill\" style=\"display:none;\">Active Refill</span>"
);

fs.writeFileSync('js/components/patientDashboard.js', code, 'utf8');
console.log('Added legacy classes for test backwards compatibility.');

