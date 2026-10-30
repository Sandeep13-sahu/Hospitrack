const fs = require('fs');
const js = fs.readFileSync('js/components/hospitalDashboard.js', 'utf8');
const css = fs.readFileSync('css/styles.css', 'utf8');

const classRegex = /class=["']([^"']+)["']/g;
let match;
const allClasses = new Set();
while ((match = classRegex.exec(js)) !== null) {
  const parts = match[1].split(/\s+/);
  for (const p of parts) {
    if (p && !p.includes('$') && !p.includes('{') && !p.includes('<') && !p.includes('>')) {
      allClasses.add(p);
    }
  }
}

const missing = [];
for (const c of allClasses) {
  if (!css.includes('.' + c)) {
    missing.push(c);
  }
}
console.log('Total classes in hospitalDashboard.js:', allClasses.size);
console.log('Missing from css/styles.css:', missing.length);
console.log('Missing list:', JSON.stringify(missing, null, 2));
