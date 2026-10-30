const fs = require('fs');

const content = fs.readFileSync('js/components/patientDashboard.js', 'utf8');
const lines = content.split('\n');
const actions = [];

lines.forEach((l, i) => {
  const matches = [...l.matchAll(/onclick="([^"]+)"/g), ...l.matchAll(/onclick='([^']+)'/g)];
  for (const m of matches) {
    actions.push({ line: i + 1, code: m[1].trim() });
  }
});

console.log('Total onclick actions found in patientDashboard.js:', actions.length);
console.log('--- Non-navigation onclick actions ---');
actions.forEach(a => {
  if (!a.code.startsWith('setPatientView(')) {
    console.log(`${a.line}: ${a.code}`);
  }
});

