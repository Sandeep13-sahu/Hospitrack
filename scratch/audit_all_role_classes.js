const fs = require('fs');

const css = fs.readFileSync('css/styles.css', 'utf8');

const roleFiles = [
  { name: 'Hospital Dashboard', path: 'js/components/hospitalDashboard.js' },
  { name: 'Doctor Dashboard', path: 'js/components/doctorDashboard.js' },
  { name: 'Patient Dashboard', path: 'js/components/patientDashboard.js' },
  { name: 'Admin Dashboard', path: 'js/components/adminDashboard.js' },
  { name: 'Department Workspace', path: 'js/components/departmentWorkspace.js' },
  { name: 'Workspace Renderer', path: 'js/workspaceRenderer.js' }
];

roleFiles.forEach(rf => {
  const code = fs.readFileSync(rf.path, 'utf8');
  const regex = /class=["']([^"'>]+)["']/g;
  let m;
  const classes = new Set();
  while ((m = regex.exec(code)) !== null) {
    m[1].split(/\s+/).forEach(c => {
      c = c.trim();
      if (c && !c.includes('${') && !c.includes('}') && !c.includes('<') && !c.includes('>') && !c.includes('?') && !c.includes(':') && !c.includes('===')) {
        classes.add(c);
      }
    });
  }
  const missing = [];
  classes.forEach(c => {
    const escaped = c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const classRegex = new RegExp('\\.' + escaped + '(?=[\\s.:,{>\\[~+*-]|$)', 'm');
    if (!classRegex.test(css)) {
      missing.push(c);
    }
  });
  console.log(`[${rf.name}] Total Classes: ${classes.size}, Present: ${classes.size - missing.length}, Missing: ${missing.length}`);
  if (missing.length > 0) {
    console.log(`   Sample missing: ${missing.slice(0, 15).join(', ')}`);
  }
});

