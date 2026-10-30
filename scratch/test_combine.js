const { execSync } = require('child_process');
const fs = require('fs');

const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

// Helper to extract named section from initial CSS
function getInitialSection(titlePattern) {
  const regex = /\/\* =+\s*([\s\S]*?)\s*=+ \*\//g;
  let m;
  const headings = [];
  while ((m = regex.exec(initialCss)) !== null) {
    headings.push({ index: m.index, title: m[1].trim() });
  }
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].title.includes(titlePattern)) {
      const next = headings[i + 1];
      return next ? initialCss.slice(headings[i].index, next.index) : initialCss.slice(headings[i].index);
    }
  }
  return '';
}

// Helper to extract named section from current CSS
function getCurrentSection(titlePattern) {
  const regex = /\/\* =+\s*([\s\S]*?)\s*=+ \*\//g;
  let m;
  const headings = [];
  while ((m = regex.exec(currentCss)) !== null) {
    headings.push({ index: m.index, title: m[1].trim() });
  }
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].title.includes(titlePattern)) {
      const next = headings[i + 1];
      return next ? currentCss.slice(headings[i].index, next.index) : currentCss.slice(headings[i].index);
    }
  }
  return '';
}

console.log('Testing section extractors...');
const initLogin = getInitialSection('SPLIT-PANE MODERN LOGIN VIEW');
console.log('Init login length:', initLogin.length);

const currEvs = getCurrentSection('ENVIRONMENTAL SERVICES (EVS)');
console.log('Current EVS length:', currEvs.length);

