const fs = require('fs');
const { execSync } = require('child_process');

console.log('Reading baseline CSS sources...');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

// Helper to extract sections from CSS
function getSection(css, headerMarker, nextHeaderMarker) {
  const start = css.indexOf(headerMarker);
  if (start === -1) return '';
  if (!nextHeaderMarker) return css.slice(start);
  const end = css.indexOf(nextHeaderMarker, start + headerMarker.length);
  if (end === -1) return css.slice(start);
  return css.slice(start, end);
}

// Let's see all sections in initialCss and currentCss
console.log('Extracting and assembling sections...');

