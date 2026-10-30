const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');

const regex = /([^{}]+)\{([^}]+)\}/g;
let m;
while ((m = regex.exec(css)) !== null) {
  const sel = m[1].trim();
  const body = m[2].trim();
  if (body.split(';').length <= 2 && !sel.startsWith('@') && !sel.includes('::') && !sel.includes(':hover')) {
    if (sel.includes('pill') || sel.includes('btn') || sel.includes('nav') || sel.includes('tab') || sel.includes('card')) {
      console.log(`${sel} -> ${body}`);
    }
  }
}

