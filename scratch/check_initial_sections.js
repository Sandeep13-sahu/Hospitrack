const { execSync } = require('child_process');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

const lines = initialCss.split('\n');
lines.forEach((l, i) => {
  if (l.startsWith('/* ==') || l.includes('PROFILE DROPDOWN') || l.includes('AUTH') || l.includes('LOGIN') || l.includes('MODAL') || l.includes('HEADER')) {
    console.log(i + 1, l);
  }
});

