const fs = require('fs');
const path = require('path');

const css = fs.readFileSync('css/styles.css', 'utf8');

const files = [
  'index.html',
  'js/app.js',
  'js/workspaceRenderer.js',
  'js/components/hospitalDashboard.js',
  'js/components/doctorDashboard.js',
  'js/components/patientDashboard.js',
  'js/components/adminDashboard.js',
  'js/components/departmentWorkspace.js',
  'js/modules/evsBedManager.js',
  'js/modules/clinicalSafety.js'
];

const classCounts = new Map();

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const regex = /class=["']([^"'>]+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1];
    raw.split(/\s+/).forEach(c => {
      c = c.trim();
      if (!c || c.includes('${') || c.includes('}') || c.includes('<') || c.includes('>') || c.includes('?') || c.includes(':')) return;
      classCounts.set(c, (classCounts.get(c) || 0) + 1);
    });
  }
});

const missing = [];
for (const [cls, count] of classCounts.entries()) {
  // Regex match .classname with word boundary or pseudo
  const escaped = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const classRegex = new RegExp('\\.' + escaped + '(?=[\\s.:,{>\\[~+*-]|$)', 'm');
  if (!classRegex.test(css)) {
    missing.push({ cls, count });
  }
}

missing.sort((a, b) => b.count - a.count);
console.log('Total unique classes scanned:', classCounts.size);
console.log('Total missing classes:', missing.length);
console.log('Top 40 missing classes by frequency:');
missing.slice(0, 40).forEach(m => console.log(`  .${m.cls} (${m.count} occurrences)`));

