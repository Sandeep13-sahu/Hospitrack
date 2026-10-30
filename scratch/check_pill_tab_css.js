const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');

const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.pill-tabs-nav') || l.includes('.pill-tab')) {
    console.log(i + 1, l);
  }
});

